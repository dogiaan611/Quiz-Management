import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getQuizQuestions, createManualQuestion, importQuestions, downloadTemplate } from "../../services/questionService";
import { Plus, Upload, Download, ArrowLeft, Trash2, CheckCircle2, Circle } from "lucide-react";

export default function AdminQuestions() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quizId");
  const navigate = useNavigate();

  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    content: "",
    type: "multiple_choice",
    answers: [
      { content: "", is_correct: true },
      { content: "", is_correct: false },
      { content: "", is_correct: false },
      { content: "", is_correct: false },
    ],
  });

  const [importFile, setImportFile] = useState(null);

  const fetchQuestions = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      const res = await getQuizQuestions(quizId);
      setQuizInfo(res.data.quiz);
      setQuestions(res.data.questions || []);
    } catch (err) {
      setError("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const handleCreateManual = async (e) => {
    e.preventDefault();
    try {
      await createManualQuestion({ ...formData, quiz_id: quizId });
      alert("Thêm câu hỏi thành công!");
      setIsManualModalOpen(false);
      setFormData({
        content: "",
        type: "multiple_choice",
        answers: [
          { content: "", is_correct: true },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ],
      });
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    try {
      await importQuestions(quizId, importFile);
      alert("Import thành công!");
      setIsImportModalOpen(false);
      setImportFile(null);
      fetchQuestions();
    } catch (err) {
        alert(err.response?.data?.message || "Có lỗi khi import");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_quiz.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Không thể tải template");
    }
  };

  if (!quizId) return <div className="p-8">Không tìm thấy mã Quiz</div>;
  if (loading && questions.length === 0) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/admin/quizzes")}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Câu hỏi</h2>
          <p className="text-gray-500 text-sm">Quiz: {quizInfo?.title}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
        >
          <Plus size={18} />
          Thêm thủ công
        </button>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
        >
          <Upload size={18} />
          Import Excel
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q._id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-800 text-lg">{q.content}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.answers?.map((ans) => (
                      <div 
                        key={ans._id} 
                        className={`flex items-center gap-2 p-3 rounded-xl border ${ans.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                      >
                        {ans.is_correct ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        <span className="text-sm">{ans.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={18} />
              </button> */}
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">
            Chưa có câu hỏi nào. Hãy thêm mới hoặc import từ Excel!
          </div>
        )}
      </div>

      {/* MANUAL MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Thêm Câu Hỏi Thủ Công</h3>
            </div>
            <form onSubmit={handleCreateManual} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nhập câu hỏi..."
                ></textarea>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Các phương án trả lời</label>
                {formData.answers.map((ans, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={ans.is_correct}
                      onChange={() => {
                        const newAnswers = formData.answers.map((a, i) => ({
                          ...a,
                          is_correct: i === idx
                        }));
                        setFormData({ ...formData, answers: newAnswers });
                      }}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <input
                      type="text"
                      value={ans.content}
                      onChange={(e) => {
                        const newAnswers = [...formData.answers];
                        newAnswers[idx].content = e.target.value;
                        setFormData({ ...formData, answers: newAnswers });
                      }}
                      required
                      placeholder={`Đáp án ${idx + 1}`}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium"
                >
                  Lưu Câu Hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">Import từ Excel</h3>
            </div>
            <form onSubmit={handleImport} className="p-6 space-y-6">
              <div 
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-indigo-300 transition cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
              >
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600">
                  {importFile ? importFile.name : "Nhấn để chọn file .xlsx"}
                </p>
                <input 
                  id="fileInput"
                  type="file" 
                  accept=".xlsx" 
                  hidden 
                  onChange={(e) => setImportFile(e.target.files[0])}
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 w-full py-2 text-indigo-600 bg-indigo-50 rounded-xl text-sm font-medium"
              >
                <Download size={16} />
                Tải file mẫu (Template)
              </button>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!importFile}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium text-white ${importFile ? 'bg-indigo-600' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  Bắt đầu Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}