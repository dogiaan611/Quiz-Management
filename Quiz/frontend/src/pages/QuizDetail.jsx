import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Hash,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import quizService from '../services/quizService';
import DashboardLayout from '../components/DashboardLayout';

/* ── Stat Pill ─────────────────────────────────────────────── */
const StatPill = ({ icon: Icon, label, color, bg }) => (
  <div className={`flex items-center gap-2 px-4 py-2.5 ${bg} rounded-xl`}>
    <Icon size={15} className={color} />
    <span className={`text-sm font-bold ${color}`}>{label}</span>
  </div>
);

/* ── Copy button ──────────────────────────────────────────── */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1 p-1 rounded-lg hover:bg-blue-100 transition-colors"
      title="Sao chép mã"
    >
      {copied
        ? <Check size={13} className="text-green-500" />
        : <Copy size={13} className="text-blue-400" />
      }
    </button>
  );
};

/* ── QuizDetail Page ──────────────────────────────────────── */
const QuizDetail = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await quizService.getById(quizId);
        setQuiz(data.quiz);
      } catch (err) {
        setError(err.message || 'Không thể tải dữ liệu quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 size={40} className="text-blue-400 animate-spin" />
          <p className="text-slate-400 font-medium">Đang tải...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-40 gap-5 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={36} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-700">Có lỗi xảy ra</h2>
            <p className="text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all"
          >
            <ArrowLeft size={15} /> Quay lại
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) return null;

  const totalQuestions = quiz.questions?.length || 0;

  return (
    <DashboardLayout>
      {/* ── Back link ─────────────────────────────────────── */}
      <button
        onClick={() => navigate('/quizzes')}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors mb-6 animate-fade-in"
      >
        <ArrowLeft size={15} />
        Quay lại thư viện
      </button>

      {/* ── Hero Header ───────────────────────────────────── */}
      <div
        className="relative rounded-2xl p-8 mb-6 overflow-hidden animate-slide-up"
        style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #0EA5E9 100%)' }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10">
          {/* Category badge */}
          {quiz.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-3">
              {quiz.category}
            </span>
          )}

          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="text-blue-200 text-base leading-relaxed max-w-2xl">
              {quiz.description}
            </p>
          )}

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 mt-5">
            <StatPill icon={HelpCircle} label={`${totalQuestions} câu hỏi`}  color="text-white" bg="bg-white/15" />
            {quiz.time_limit && (
              <StatPill icon={Clock} label={`${quiz.time_limit} phút`} color="text-white" bg="bg-white/15" />
            )}
            {quiz.created_by && (
              <StatPill icon={User}  label={quiz.created_by.username || quiz.created_by.email} color="text-white" bg="bg-white/15" />
            )}
          </div>
        </div>
      </div>

      {/* ── Access code card (if exists) ──────────────────── */}
      {quiz.access_code && (
        <div className="bg-white rounded-2xl border border-blue-100 p-5 mb-6 flex items-center justify-between animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mã truy cập</p>
            <div className="flex items-center gap-1">
              <Hash size={16} className="text-blue-400" />
              <span className="text-lg font-black text-blue-600 tracking-widest">{quiz.access_code}</span>
              <CopyButton text={quiz.access_code} />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Hash size={20} className="text-blue-400" />
          </div>
        </div>
      )}

      {/* ── Questions list ────────────────────────────────── */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-blue-500" />
          <h2 className="font-bold text-slate-700 text-lg">Danh sách câu hỏi</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
            {totalQuestions}
          </span>
        </div>

        {totalQuestions === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-semibold">Chưa có câu hỏi nào</p>
          </div>
        ) : (
          <div className="space-y-4 stagger">
            {quiz.questions.map((question, index) => (
              <div
                key={question._id || index}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  {/* Question header */}
                  <div className="flex items-start gap-4 mb-5">
                    <span
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-md"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-slate-800 leading-relaxed">
                        {question.content}
                      </p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider">
                        {question.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Đúng / Sai'}
                      </span>
                    </div>
                  </div>

                  {/* Answers grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {(question.answers || []).map((answer, aIdx) => (
                      <div
                        key={answer._id || aIdx}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          answer.is_correct
                            ? 'border-emerald-400 bg-emerald-50/60'
                            : 'border-slate-100 bg-slate-50/40'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            answer.is_correct
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                              : 'bg-white border-2 border-slate-200'
                          }`}
                        >
                          {answer.is_correct && <CheckCircle size={13} strokeWidth={3} />}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            answer.is_correct ? 'text-emerald-800' : 'text-slate-600'
                          }`}
                        >
                          {answer.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizDetail;
