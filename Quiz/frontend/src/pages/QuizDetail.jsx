import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Hash,
  Tag,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import quizService from '../services/quizService';
import Navbar from '../components/Navbar';

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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="text-xl font-bold text-gray-700">Có lỗi xảy ra</h2>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const totalQuestions = quiz.questions?.length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />

      <main className="max-w-[1000px] mx-auto px-6 py-10 space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-gray-500 text-lg mb-6">{quiz.description}</p>
          )}

          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-50">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
              <BookOpen size={16} className="text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">{totalQuestions} câu hỏi</span>
            </div>
            {quiz.access_code && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl">
                <Hash size={16} className="text-purple-500" />
                <span className="text-sm font-semibold text-purple-700">Mã: {quiz.access_code}</span>
              </div>
            )}
            {quiz.time_limit && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
                <Clock size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-700">{quiz.time_limit} phút</span>
              </div>
            )}
            {quiz.created_by && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                <User size={16} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-600">
                  {quiz.created_by.username || quiz.created_by.email}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-500" />
            Danh sách câu hỏi
          </h3>

          {totalQuestions === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Chưa có câu hỏi nào</p>
            </div>
          ) : (
            quiz.questions.map((question, index) => (
              <div
                key={question._id || index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-md shadow-blue-100">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-800 leading-relaxed">
                      {question.content}
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                      {question.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Đúng / Sai'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(question.answers || []).map((answer, aIdx) => (
                    <div
                      key={answer._id || aIdx}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        answer.is_correct
                          ? 'border-green-500 bg-green-50/50'
                          : 'border-gray-100 bg-gray-50/30'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        answer.is_correct
                          ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                          : 'bg-white border-2 border-gray-200'
                      }`}>
                        {answer.is_correct && <CheckCircle size={14} strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-medium ${
                        answer.is_correct ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        {answer.content}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizDetail;
