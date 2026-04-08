import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, BookOpen, Star, Clock, ArrowRight, Heart } from "lucide-react";
import api from "../../services/axios";

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, meRes] = await Promise.all([
          api.get("/auth/stats"),
          api.get("/auth/me")
        ]);
        setData({ stats: statsRes.data, user: meRes.data });
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const stats = [
    {
      label: "Bài thi đã làm",
      value: data?.stats?.totalAttempts || 0,
      icon: <BookOpen className="text-blue-600" />,
      bg: "bg-blue-100"
    },
    {
      label: "Điểm trung bình",
      value: data?.stats?.avgScore || 0,
      icon: <Trophy className="text-amber-600" />,
      bg: "bg-amber-100"
    },
    {
      label: "Thứ hạng",
      value: "Vàng",
      icon: <Star className="text-purple-600" />,
      bg: "bg-purple-100"
    }
  ];

  const username = data?.user?.username || data?.user?.Username || "Học sinh";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 lg:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl text-center md:text-left">
          <h1 className="text-4xl lg:text-5xl font-black mb-4 capitalize">
            Chào mừng, {username}! 👋
          </h1>
          <p className="text-indigo-100 text-lg mb-8 opacity-90">
            Hôm nay bạn muốn chinh phục kiến thức nào? Hãy lựa chọn một bài Quiz và bắt đầu ngay thôi!
          </p>
          <button 
            onClick={() => navigate("/user/quizzes")}
            className="group flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition shadow-xl"
          >
            Làm bài ngay
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} p-4 rounded-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <Clock size={20} className="text-indigo-600" />
            Lần làm bài gần nhất
          </h3>
          <div className="space-y-4">
            {data?.stats?.recentAttempts?.map((attempt) => (
              <div key={attempt._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 transition group">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{attempt.quiz_id?.title || "Quiz đã xóa"}</span>
                  <span className="text-xs text-slate-500">{new Date(attempt.submitted_at).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${attempt.score >= 8 ? "text-green-600" : attempt.score >= 5 ? "text-amber-600" : "text-red-600"}`}>
                    {attempt.score}/10
                  </span>
                </div>
              </div>
            ))}
            {(!data?.stats?.recentAttempts || data.stats.recentAttempts.length === 0) && (
              <div className="text-center py-10 opacity-50">
                <Heart size={40} className="mx-auto mb-2" />
                <p>Bạn chưa làm bài Quiz nào cả.</p>
              </div>
            )}
          </div>
        </div>

        {/* Motivation Card */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-[2rem] p-8 border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-3xl flex items-center justify-center mb-6">
            <Trophy size={40} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold mb-4 dark:text-white">Kiến thức là sức mạnh!</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
            "Sự đầu tư vào kiến thức luôn mang lại lãi suất cao nhất." - Benjamin Franklin
          </p>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
}