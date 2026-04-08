import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById, updateQuiz, deleteQuiz } from "../../services/quizService";
import { 
  ChevronLeft, Edit3, Trash2, Calendar, Clock, 
  Users, Key, FileText, Plus, ChevronRight 
} from "lucide-react";

export default function AdminQuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_limit: 30,
    max_attempts: 1
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getQuizById(id);
        const q = res.data.quiz;
        setQuiz(q);
        setFormData({
          title: q.title,
          description: q.description || "",
          time_limit: q.time_limit || 30,
          max_attempts: q.max_attempts || 1
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateQuiz(id, formData);
      setQuiz({ ...quiz, ...formData });
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài thi này không? Hành động này không thể hoàn tác.")) {
      try {
        await deleteQuiz(id);
        navigate("/admin/quizzes");
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải thông tin bài thi...</div>;
  if (!quiz) return <div className="p-10 text-center">Không tìm thấy bài thi.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/admin/quizzes")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <ChevronLeft size={20} />
          Quay lại danh sách
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-semibold"
          >
            <Edit3 size={18} />
            {isEditing ? "Hủy chỉnh sửa" : "Sửa thông tin"}
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold"
          >
            <Trash2 size={18} />
            Xóa bài thi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tiêu đề bài thi</label>
                  <input 
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-bold"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mô tả bài thi</label>
                  <textarea 
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Thời gian (phút)</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.time_limit}
                      onChange={(e) => setFormData({...formData, time_limit: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số lần làm tối đa</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.max_attempts}
                      onChange={(e) => setFormData({...formData, max_attempts: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition"
                >
                  Lưu thay đổi
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                    {quiz.title}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                    {quiz.description || "Chưa có mô tả cho bài thi này."}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian</span>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold italic">
                      <Clock size={16} className="text-indigo-500" />
                      {quiz.time_limit} phút
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã truy cập</span>
                    <div className="flex items-center gap-2 text-indigo-600 font-mono font-black italic">
                      <Key size={16} />
                      {quiz.access_code}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số câu hỏi</span>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold italic">
                      <FileText size={16} className="text-emerald-500" />
                      {quiz.questions?.length || 0} câu
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Preview Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" />
                Nội dung đề thi
              </h3>
              <button 
                onClick={() => navigate(`/admin/questions?quizId=${id}`)}
                className="flex items-center gap-1 text-indigo-600 font-bold text-sm hover:underline transition"
              >
                Quản lý câu hỏi 
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {quiz.questions?.map((q, idx) => (
                <div key={q._id} className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{q.content}</p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white text-[10px] font-bold text-slate-400 rounded-full border border-slate-100 uppercase tracking-tighter">
                        {q.type}
                      </span>
                      <span className="px-3 py-1 bg-white text-[10px] font-bold text-slate-400 rounded-full border border-slate-100 uppercase tracking-tighter">
                        {q.answers?.length} lựa chọn
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {(!quiz.questions || quiz.questions.length === 0) && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium mb-4">Bài thi chưa có câu hỏi nào</p>
                  <button 
                    onClick={() => navigate(`/admin/questions?quizId=${id}`)}
                    className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold shadow-sm border border-indigo-100 hover:bg-indigo-50 transition"
                  >
                    Thêm câu hỏi ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Thông tin chung</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold">Ngày tạo</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold">Người tạo</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {quiz.created_by?.username}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
            <h4 className="text-sm font-bold opacity-70 uppercase tracking-wider mb-4">Hành động nhanh</h4>
            <div className="space-y-3">
              <button 
                onClick={() => navigate(`/quiz/${quiz._id}`)}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                Xem trước bài thi
                <ChevronRight size={18} />
              </button>
              <button 
                onClick={() => navigate(`/admin/questions?quizId=${id}`)}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                Quản lý câu hỏi
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
