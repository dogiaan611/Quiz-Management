import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyQuizzes, createQuiz, updateQuiz, deleteQuiz } from "../../services/quizService";
import { Plus, Edit2, Trash2, BookOpen, ExternalLink } from "lucide-react";

export default function AdminQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time_limit: 30,
    max_attempts: 1,
  });

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await getMyQuizzes();
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      setError("Không thể tải danh sách quiz của bạn");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleOpenModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        description: quiz.description || "",
        time_limit: quiz.time_limit || 30,
        max_attempts: quiz.max_attempts || 1,
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: "",
        description: "",
        time_limit: 30,
        max_attempts: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuiz(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        await updateQuiz(editingQuiz._id, formData);
        alert("Cập nhật thành công!");
      } else {
        await createQuiz(formData);
        alert("Tạo quiz thành công!");
      }
      handleCloseModal();
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa quiz này?")) {
      try {
        await deleteQuiz(id);
        alert("Xóa thành công!");
        fetchQuizzes();
      } catch (err) {
        alert("Không thể xóa quiz");
      }
    }
  };

  if (loading && quizzes.length === 0) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Quiz của tôi</h2>
          <p className="text-gray-500 text-sm mt-1">Nơi bạn tạo, sửa và quản lý các nội dung bài thi của mình.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate("/admin/discovery")}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition"
          >
            <ExternalLink size={18} />
            Xem tất cả bài thi
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold transition shadow-xl shadow-indigo-100"
          >
            <Plus size={20} />
            Tạo đề mới
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600">Tiêu đề</th>
              <th className="p-4 font-semibold text-gray-600">Mã Code</th>
              <th className="p-4 font-semibold text-gray-600">Thời gian</th>
              <th className="p-4 font-semibold text-gray-600">Người tạo</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="p-4">
                  <div 
                    onClick={() => navigate(`/admin/quizzes/${quiz._id}`)}
                    className="font-bold text-indigo-600 hover:underline cursor-pointer text-lg"
                  >
                    {quiz.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{quiz.description}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-mono text-sm font-bold">
                    {quiz.access_code}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{quiz.time_limit} phút</td>
                <td className="p-4 text-gray-600">{quiz.created_by?.username || "N/A"}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/admin/questions?quizId=${quiz._id}`)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Quản lý câu hỏi"
                    >
                      <BookOpen size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(quiz)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {quizzes.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Chưa có bài quiz nào. Hãy tạo mới ngay!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingQuiz ? "Chỉnh sửa Quiz" : "Tạo Quiz Mới"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    name="time_limit"
                    value={formData.time_limit}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lần làm tối đa</label>
                  <input
                    type="number"
                    name="max_attempts"
                    value={formData.max_attempts}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-md shadow-indigo-100"
                >
                  {editingQuiz ? "Cập nhật" : "Lưu lại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}