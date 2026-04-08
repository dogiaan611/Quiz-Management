import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../services/quizService";
import { 
  ChevronLeft, Sparkles, Layout, Clock, 
  Users, Save, ArrowRight, HelpCircle 
} from "lucide-react";

export default function AdminCreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_limit: 30,
    max_attempts: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createQuiz(formData);
      alert("Tạo bài thi thành công! Bây giờ hãy thêm câu hỏi cho nó nhé.");
      navigate(`/admin/quizzes/${res.data.quiz._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tạo bài thi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/admin/quizzes")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-bold"
        >
          <ChevronLeft size={20} />
          Quay lại
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase tracking-tighter border border-amber-100">
          <Sparkles size={14} />
          Chế độ soạn thảo chuyên nghiệp
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Thiết kế bài thi mới</h1>
        <p className="text-slate-500 text-lg">Xây dựng cấu trúc bài thi của bạn chỉ trong vài phút.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Info */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Layout size={20} />
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600">Thông tin cơ bản</span>
          </div>
          
          <div className="space-y-6">
            <div className="group">
              <label className="block text-sm font-black text-slate-700 mb-3 ml-1 group-focus-within:text-indigo-600 transition">
                Tiêu đề bài thi <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                placeholder="Ví dụ: Kiểm tra Cuối kỳ môn Toán Giải tích"
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-xl font-bold placeholder:text-slate-300"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-black text-slate-700 mb-3 ml-1 group-focus-within:text-indigo-600 transition">
                Mô tả chi tiết
              </label>
              <textarea 
                placeholder="Mô tả mục tiêu, đối tượng hoặc nội dung chính của bài thi..."
                className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 min-h-[150px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <Clock size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Thời gian làm bài</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number"
                min="1"
                className="w-24 px-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition font-bold text-center text-xl"
                value={formData.time_limit}
                onChange={(e) => setFormData({...formData, time_limit: e.target.value})}
              />
              <span className="text-slate-500 font-bold">Phút</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Hệ thống sẽ tự động nộp bài khi hết thời gian.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <Users size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Số lần thử tối đa</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number"
                min="1"
                className="w-24 px-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition font-bold text-center text-xl"
                value={formData.max_attempts}
                onChange={(e) => setFormData({...formData, max_attempts: e.target.value})}
              />
              <span className="text-slate-500 font-bold">Lần</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Giới hạn số lần học sinh được phép tham gia bài thi này.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center pt-6">
          <button 
            type="submit"
            disabled={loading}
            className="group relative flex items-center gap-3 bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-600 transition-all duration-500 shadow-2xl shadow-slate-300 hover:shadow-indigo-300 disabled:opacity-50 active:scale-95 overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang khởi tạo...
              </div>
            ) : (
              <>
                Tạo bài thi ngay
                <ArrowRight size={24} className="group-hover:translate-x-2 transition" />
              </>
            )}
            
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition" />
          </button>
        </div>
      </form>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-8 text-slate-400">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
           <Save size={14} />
           Tự động lưu nháp
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
           <HelpCircle size={14} />
           Cần trợ giúp?
        </div>
      </div>
    </div>
  );
}
