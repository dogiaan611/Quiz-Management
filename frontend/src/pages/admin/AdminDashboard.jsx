import { useEffect, useState } from "react";
import { Users, FileText, Award, Activity, Plus, BookOpen, Send, TrendingUp, ChevronRight } from "lucide-react";
import api from "../../services/axios";
import { useNavigate } from "react-router-dom";

// Helper để hiển thị thời gian tương đối
const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return new Date(date).toLocaleDateString("vi-VN");
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setData(res.data);
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const stats = [
    { title: "Người dùng", value: data?.stats?.totalUsers || 0, icon: <Users size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Lượt làm bài", value: data?.stats?.totalAttempts || 0, icon: <Send size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Điểm trung bình", value: data?.stats?.averageScore || 0, icon: <Award size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Hôm nay", value: data?.stats?.todayAttempts || 0, icon: <TrendingUp size={20} />, color: "text-rose-600", bg: "bg-rose-50" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 lg:p-14 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">
              Quản lý hệ thống <br /> 
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Quiz 5AT Pro</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8">
              Chào mừng trở lại! Bạn có {data?.stats?.todayAttempts || 0} hoạt động mới trong ngày hôm nay. 
              Hãy bắt đầu bằng việc tạo một nội dung mới!
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => navigate("/admin/quizzes/create")}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20 active:scale-95"
              >
                <Plus size={22} />
                Tạo bài thi mới
              </button>
              <button 
                onClick={() => navigate("/admin/quizzes")}
                className="flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition backdrop-blur-sm active:scale-95"
              >
                <FileText size={20} />
                Quản lý kho đề
              </button>
            </div>
          </div>
          
          <div className="hidden lg:block">
             <div className="w-64 h-64 bg-indigo-500/10 rounded-full flex items-center justify-center border border-white/5 animate-pulse">
                <div className="w-48 h-48 bg-indigo-500/20 rounded-full flex items-center justify-center border border-white/5">
                   <Award size={80} className="text-indigo-400" />
                </div>
             </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-col gap-4">
              <div className={`${item.bg} w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.title}</p>
                <h2 className="text-3xl font-black mt-1 text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {item.value}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 p-10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Activity size={24} className="text-indigo-600" />
              Hoạt động gần đây
            </h2>
            <button className="text-sm font-bold text-indigo-600 hover:underline">Xem tất cả</button>
          </div>
          
          <div className="space-y-6">
            {data?.recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 transition group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {activity.username.charAt(0).toUpperCase()}
                   </div>
                   <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{activity.username}</span>
                    <p className="text-slate-500 text-xs">
                      Đã nộp bài: <span className="text-indigo-600 font-bold">{activity.quizTitle}</span>
                    </p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                    {formatRelativeTime(activity.time)}
                  </p>
                  <ChevronRight size={16} className="text-slate-300 ml-auto group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
            {(!data?.recentActivities || data.recentActivities.length === 0) && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Chưa có hoạt động nào được ghi lại.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h3 className="text-xl font-black mb-2 italic">Mẹo Quản Trị</h3>
              <p className="text-indigo-100 text-sm opacity-80 mb-6">
                Bạn có thể nhập danh sách câu hỏi hàng loạt từ file Excel trong trang quản lý đề thi để tiết kiệm thời gian!
              </p>
              <button 
                onClick={() => navigate("/admin/questions")}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition text-sm flex items-center justify-center gap-2"
              >
                Đi tới kho câu hỏi
                <ChevronRight size={16} />
              </button>
           </div>

           <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4">Trạng thái hệ thống</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Database</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full font-black text-[10px]">CONNECTED</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">API Server</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full font-black text-[10px]">ACTIVE</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Storage</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full font-black text-[10px]">85% FREE</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}