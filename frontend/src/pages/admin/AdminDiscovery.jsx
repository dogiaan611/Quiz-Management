import { useEffect, useState } from "react";
import { getQuizzes } from "../../services/quizService";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Users, Play, Search, Filter } from "lucide-react";

export default function AdminDiscovery() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">Đang đồng bộ danh sách bài thi...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Khám phá Quiz</h2>
          <p className="text-slate-500 mt-2 font-medium">Xem và trải nghiệm tất cả các bài thi trên hệ thống.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-72">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên bài thi..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-600/5 transition-colors duration-500" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
                  {quiz.questions?.length || 0} Questions
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                   PIN: {quiz.access_code}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {quiz.title}
                </h3>
                <p className="text-slate-500 mt-2 line-clamp-2 text-sm font-medium leading-relaxed h-10">
                  {quiz.description || "Bài thi này chưa có mô tả chi tiết."}
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={16} className="text-indigo-400" />
                  <span className="text-sm font-bold">{quiz.time_limit} Phút</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={16} className="text-indigo-400" />
                  <span className="text-sm font-bold">Quản trị viên</span>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95"
                >
                  <Play size={18} fill="currentColor" />
                  Bắt đầu làm bài
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-lg">Không tìm thấy bài thi nào phù hợp.</p>
        </div>
      )}
    </div>
  );
}
