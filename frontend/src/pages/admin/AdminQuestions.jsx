import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Plus, 
  FileUp, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileSpreadsheet,
  Save,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
  import { 
  createManualQuestion, 
  importQuestionsFromFile, 
  downloadTemplate,
  getQuizQuestions,
  deleteQuestion,
  getAllQuestions
} from "@/services/questionService";
import { getQuizById } from "@/services/quizService";

export default function AdminQuestions() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("quizId");

  const [activeTab, setActiveTab] = useState("manual"); // 'manual' | 'import'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    content: "",
    quiz_id: quizId || "",
    answers: [
      { content: "", is_correct: true },
      { content: "", is_correct: false },
      { content: "", is_correct: false },
      { content: "", is_correct: false },
    ]
  });

  // Import State
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (quizId) {
      getQuizById(quizId).then(res => setQuizInfo(res.data.quiz));
    }
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      let res;
      if (quizId) {
        res = await getQuizQuestions(quizId, true);
      } else {
        res = await getAllQuestions();
      }
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách câu hỏi:", err);
    }
  };

  // --- Handlers ---
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.content) return setMessage({ type: "error", text: "Vui lòng nhập câu hỏi" });
    
    try {
      setLoading(true);
      await createManualQuestion({ ...manualForm, quiz_id: quizId });
      setMessage({ type: "success", text: "Thêm câu hỏi thành công!" });
      setManualForm({
        content: "",
        quiz_id: quizId || "",
        answers: [
          { content: "", is_correct: true },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ]
      });
      fetchQuestions();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi khi thêm câu hỏi" });
    } finally {
      setLoading(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage({ type: "error", text: "Vui lòng chọn file" });

    const formData = new FormData();
    formData.append("file", file);
    if (quizId) formData.append("quiz_id", quizId);

    try {
      setLoading(true);
      const { data } = await importQuestionsFromFile(formData);
      setMessage({ 
        type: "success", 
        text: `Import thành công! Đã thêm ${data.stats.valid} câu hỏi.` 
      });
      setFile(null);
      fetchQuestions();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Lỗi khi import file" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá câu hỏi này?")) return;
    try {
      await deleteQuestion(qId);
      setQuestions(questions.filter(q => q._id !== qId));
    } catch (err) {
      alert("Lỗi khi xoá câu hỏi");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_cau_hoi.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Lỗi khi tải template");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {quizInfo ? quizInfo.title : "Tất cả câu hỏi"}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cấu hình ngân hàng câu hỏi</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
              ${activeTab === "manual" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Plus size={16} />
            Nhập thủ công
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all
              ${activeTab === "import" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <FileSpreadsheet size={16} />
            Import Excel
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border-2 
              ${message.type === "success" 
                ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                : "bg-rose-50 border-rose-100 text-rose-700"}`}
          >
            {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-semibold">{message.text}</span>
            <button className="ml-auto hover:opacity-70" onClick={() => setMessage({ type: "", text: "" })}>
              <Trash2 size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100">
        {activeTab === "manual" ? (
          <motion.form 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleManualSubmit}
            className="space-y-8"
          >
            <div className="space-y-4">
              <label className="text-sm font-black uppercase tracking-wider text-slate-400">Nội dung câu hỏi</label>
              <textarea
                value={manualForm.content}
                onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
                placeholder="Nhập câu hỏi của bạn tại đây..."
                className="w-full min-h-[140px] p-8 text-xl font-medium rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {manualForm.answers.map((ans, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-xs font-black uppercase text-slate-400">Đáp án {String.fromCharCode(65 + idx)}</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className={`text-[10px] font-black uppercase transition-colors ${ans.is_correct ? "text-emerald-500" : "text-slate-300 group-hover:text-slate-400"}`}>Đúng</span>
                      <input
                        type="radio"
                        name="correct-choice"
                        checked={ans.is_correct}
                        onChange={() => {
                          const newAnswers = manualForm.answers.map((a, i) => ({
                            ...a, is_correct: i === idx
                          }));
                          setManualForm({ ...manualForm, answers: newAnswers });
                        }}
                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>
                  <Input
                    value={ans.content}
                    onChange={(e) => {
                      const newAnswers = [...manualForm.answers];
                      newAnswers[idx].content = e.target.value;
                      setManualForm({ ...manualForm, answers: newAnswers });
                    }}
                    placeholder={`Nội dung đáp án ${String.fromCharCode(65 + idx)}`}
                    className={`h-14 rounded-xl border-2 transition-all px-6 font-semibold
                      ${ans.is_correct ? "border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/5 text-emerald-900" : "border-slate-50 focus:border-indigo-500"}`}
                  />
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-50">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-12 py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
                Lưu câu hỏi
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-center py-12 px-6"
          >
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 shadow-inner">
              <FileUp size={48} />
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-2">Tải lên từ Excel</h3>
            <p className="text-slate-500 mb-10 text-center max-w-sm">
              Sử dụng file Excel mẫu để chuẩn bị câu hỏi nhanh chóng và chính xác.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="h-16 px-8 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 text-indigo-600 font-bold transition-all"
              >
                <Download className="mr-2" size={20} />
                Tải Excel Mẫu
              </Button>

              <div className="relative flex-1">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current.click()}
                  className={`w-full h-16 px-8 rounded-2xl font-bold transition-all
                    ${file ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-900"}`}
                >
                  <FileSpreadsheet className="mr-2" size={20} />
                  {file ? file.name : "Chọn file Excel"}
                </Button>
              </div>
            </div>

            {file && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 w-full max-w-lg"
              >
                <Button
                  onClick={handleImportSubmit}
                  disabled={loading}
                  className="w-full py-8 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-black italic shadow-2xl shadow-indigo-200"
                >
                  {loading ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3" />}
                  BẮT ĐẦU IMPORT NGAY
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* QUESTION LIST SECTION */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Danh sách câu hỏi ({questions.length})</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Quản lý nội dung đã tạo</p>
          </div>
        </div>

        {questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <motion.div
                key={q._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] overflow-hidden bg-white">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-6">
                          <span className="w-10 h-10 bg-slate-50 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 italic">
                            #{idx + 1}
                          </span>
                          <h4 className="text-xl font-bold text-slate-800 leading-tight">{q.content}</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-14">
                          {q.answers.map((ans, aIdx) => (
                            <div 
                              key={aIdx} 
                              className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all
                                ${ans.is_correct 
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-bold" 
                                  : "bg-slate-50 border-slate-50 text-slate-500"}`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm
                                ${ans.is_correct ? "bg-emerald-500 text-white" : "bg-white text-slate-400"}`}>
                                {String.fromCharCode(65 + aIdx)}
                              </div>
                              <span className="text-sm font-semibold">{ans.content}</span>
                              {ans.is_correct && <CheckCircle2 size={16} className="ml-auto text-emerald-600" />}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleDeleteQuestion(q._id)}
                        variant="ghost" 
                        size="icon" 
                        className="w-12 h-12 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chưa có dữ liệu câu hỏi</p>
          </div>
        )}
      </div>
    </div>
  );
}