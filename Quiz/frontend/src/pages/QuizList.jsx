import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Hash,
  Clock,
  User,
  ChevronRight,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import quizService from '../services/quizService';
import Navbar from '../components/Navbar';

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
    q.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thư viện Quiz</h1>
            <p className="text-sm text-gray-400 mt-1">{quizzes.length} bộ câu hỏi đã tạo</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all w-56"
            />
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={36} className="text-blue-500 animate-spin" />
            <p className="text-gray-400 text-sm font-medium">Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle size={40} className="text-red-400" />
            <p className="text-gray-500 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <BookOpen size={28} className="text-blue-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-600">
                {search ? 'Không tìm thấy quiz nào' : 'Chưa có Quiz nào'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {search ? 'Thử tìm với từ khóa khác' : 'Nhấn nút bên trên để tạo bộ câu hỏi đầu tiên của bạn'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => navigate('/create-quiz')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all outline-none"
              >
                <Plus size={15} />
                Tạo Quiz mới
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((quiz) => (
              <div
                key={quiz._id}
                onClick={() => navigate(`/quiz/${quiz._id}`)}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all duration-200">
                    <BookOpen size={20} className="text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {quiz.title}
                    </h2>
                    {quiz.description && (
                      <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{quiz.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <BookOpen size={12} />
                        {quiz.questions?.length || 0} câu hỏi
                      </span>
                      {quiz.access_code && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Hash size={12} />
                          {quiz.access_code}
                        </span>
                      )}
                      {quiz.time_limit && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Clock size={12} />
                          {quiz.time_limit} phút
                        </span>
                      )}
                      {quiz.created_by && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <User size={12} />
                          {quiz.created_by.username || quiz.created_by.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizList;
