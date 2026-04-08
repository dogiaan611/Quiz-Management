import { useEffect, useState } from "react";
import { getQuizzes } from "../../services/quizService";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Users, Play } from "lucide-react";

export default function UserQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await getQuizzes();
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error("Lỗi khi tải quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải danh sách bài thi...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Danh sách bài thi
        </h2>
        <p className="text-gray-500 mt-2">Chọn một bài thi để bắt đầu thử thách kiến thức của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="group relative bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                  <Play size={20} fill="currentColor" />
               </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                <BookOpen size={14} />
                Quiz
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {quiz.title}
                </h3>
                <p className="text-gray-500 mt-2 line-clamp-2 text-sm leading-relaxed">
                  {quiz.description || "Không có mô tả cho bài thi này."}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>{quiz.time_limit} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span>{quiz.max_attempts} lần thử</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/quiz/${quiz._id}`)}
                className="w-full mt-6 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-indigo-200"
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">Hiện tại chưa có bài thi nào khả dụng.</p>
        </div>
      )}
    </div>
  );
}