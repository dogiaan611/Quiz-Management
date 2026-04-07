import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Hash,
  Clock,
  User,
  Loader2,
  AlertCircle,
  Search,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import quizService from '../services/quizService';
import DashboardLayout from '../components/DashboardLayout';

/* ── Category badge colors ───────────────────────────────── */
const CATEGORY_COLORS = {
  'Toán học':  { bg: 'bg-blue-50',    text: 'text-blue-600' },
  'Vật lý':    { bg: 'bg-cyan-50',    text: 'text-cyan-600' },
  'Hóa học':   { bg: 'bg-green-50',   text: 'text-green-600' },
  'Sinh học':  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  'Tiếng Anh': { bg: 'bg-violet-50',  text: 'text-violet-600' },
  'CNTT':      { bg: 'bg-sky-50',    text: 'text-sky-600' },
  'Lịch sử':  { bg: 'bg-amber-50',   text: 'text-amber-600' },
  'Địa lý':   { bg: 'bg-orange-50',  text: 'text-orange-600' },
};

const getCategoryStyle = (cat) =>
  CATEGORY_COLORS[cat] || { bg: 'bg-slate-50', text: 'text-slate-600' };

/* ── Quiz Card ───────────────────────────────────────────── */
const QuizCard = ({ quiz, onClick, index }) => {
  const catStyle = getCategoryStyle(quiz.category);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-250 cursor-pointer overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top accent bar */}
      <div
        className="h-1.5 w-full opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(90deg, #2563EB, #0EA5E9)' }}
      />

      <div className="p-5">
        {/* Icon + category */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <BookOpen size={19} className="text-blue-500" />
          </div>
          {quiz.category && (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${catStyle.bg} ${catStyle.text}`}>
              {quiz.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-bold text-slate-800 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1.5">
          {quiz.title}
        </h2>

        {/* Description */}
        {quiz.description && (
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {quiz.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <HelpCircle size={12} className="text-blue-400" />
            {quiz.questions?.length || 0} câu hỏi
          </span>
          {quiz.time_limit && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Clock size={12} className="text-amber-400" />
              {quiz.time_limit} phút
            </span>
          )}
          {quiz.access_code && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Hash size={12} className="text-slate-400" />
              {quiz.access_code}
            </span>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between group-hover:bg-blue-50/60 transition-colors">
        {quiz.created_by ? (
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <User size={11} />
            {quiz.created_by.username || quiz.created_by.email}
          </span>
        ) : <span />}
        <span className="text-xs font-bold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Xem chi tiết <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
};

/* ── QuizList Page ───────────────────────────────────────── */
const QuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizService.getAll();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const filtered = quizzes.filter((q) =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Thư viện Quiz"
      subtitle={`${quizzes.length} bộ câu hỏi đã tạo`}
      actions={
        <button
          id="create-quiz-btn"
          onClick={() => navigate('/create-quiz')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
        >
          <Plus size={16} />
          Tạo Quiz mới
        </button>
      }
    >
      {/* Search bar */}
      <div className="relative mb-6 animate-slide-up">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="quiz-search-input"
          type="text"
          placeholder="Tìm kiếm quiz theo tên hoặc danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 transition-all shadow-sm"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={36} className="text-blue-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Đang tải...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-600">Có lỗi xảy ra</p>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 gap-5 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
            <BookOpen size={32} className="text-blue-300" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-600 text-lg">
              {search ? 'Không tìm thấy kết quả' : 'Chưa có Quiz nào'}
            </p>
            <p className="text-sm text-slate-400 mt-1.5">
              {search
                ? 'Thử từ khóa khác hoặc xóa bộ lọc'
                : 'Tạo bộ câu hỏi đầu tiên để bắt đầu'}
            </p>
          </div>
          {!search && (
            <button
              onClick={() => navigate('/create-quiz')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
            >
              <Plus size={16} />
              Tạo Quiz ngay
            </button>
          )}
        </div>
      )}

      {/* Card Grid */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 animate-fade-in">
            {search ? `${filtered.length} kết quả tìm kiếm` : `Tất cả — ${filtered.length} quiz`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
            {filtered.map((quiz, i) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                index={i}
                onClick={() => navigate(`/quiz/${quiz._id}`)}
              />
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default QuizList;
