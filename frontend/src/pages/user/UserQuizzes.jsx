import { useEffect, useState } from "react";
import { 
  FileText, 
  Clock, 
  ArrowRight, 
  Search,
  Loader2,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQuizzes } from "@/services/quizService";

export default function UserQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await getQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Trophy className="text-amber-500" />
            Khám phá Quiz
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Chọn một bài thi để thử thách bản thân ngay bây giờ</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm tên bài thi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-6 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none font-semibold transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
          <p className="text-slate-400 font-bold tracking-widest uppercase">Đang tải danh sách...</p>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredQuizzes.map((quiz, idx) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    <div className="h-px flex-1 bg-slate-50" />
                  </div>

                  <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
                    {quiz.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm mb-8 line-clamp-2 min-h-[2.5rem]">
                    {quiz.description || "Hãy bắt đầu thử thách kiến thức của bạn với bài thi này."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                      <Clock size={16} />
                      <span>{quiz.time_limit} Phút</span>
                    </div>

                    <Link to={`/quiz/${quiz._id}`}>
                      <Button className="rounded-xl px-6 bg-slate-900 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all">
                        Làm bài <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400">
           <p className="text-xl font-bold">Không tìm thấy bài thi nào phù hợp</p>
        </div>
      )}
    </div>
  );
}