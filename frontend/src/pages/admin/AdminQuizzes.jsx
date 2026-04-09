import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Clock, 
  FileText, 
  Users, 
  LayoutGrid, 
  List,
  Loader2,
  Trophy,
  RotateCcw,
  Play,
  UserCheck,
  Zap,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getQuizzes, createQuiz, deleteQuiz, updateQuiz } from "@/services/quizService";
import socket from "@/services/socket";

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [hostingQuiz, setHostingQuiz] = useState(null);
  const [lobbyParticipants, setLobbyParticipants] = useState([]);

  const [newQuizData, setNewQuizData] = useState({
    title: "",
    description: "",
    time_limit: 30,
    max_attempts: 1
  });

  const [editQuizData, setEditQuizData] = useState({
    title: "",
    description: "",
    time_limit: 30,
    max_attempts: 1
  });

  useEffect(() => {
    fetchQuizzes();

    // Kết nối socket khi vào trang admin
    socket.connect();

    // Socket listener cho host để cập nhật danh sách lobby
    socket.on("lobbyUpdate", (participants) => {
      setLobbyParticipants(participants);
    });

    return () => {
      socket.off("lobbyUpdate");
      socket.disconnect(); // Ngắt khi rời trang để tiết kiệm tài khoản
    };
  }, []);

  const openHostModal = (quiz) => {
    setHostingQuiz(quiz);
    setLobbyParticipants([]);
    setShowHostModal(true);
    
    // Join lobby room với tư cách host để xem danh sách
    socket.emit("joinLobby", { 
      quizId: quiz._id, 
      user: { id: "host", name: "Giáo viên (Host)" } 
    });
  };

  const handleStartQuiz = () => {
    if (lobbyParticipants.length === 0) {
      if (!window.confirm("Chưa có học sinh nào trong phòng chờ. Bạn vẫn muốn bắt đầu?")) return;
    }
    
    socket.emit("startQuizByHost", { quizId: hostingQuiz._id });
    alert("Bài thi đã bắt đầu cho tất cả mọi người!");
    setShowHostModal(false);
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await getQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error("Fetch quizzes error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await createQuiz(newQuizData);
      setQuizzes([...quizzes, data.quiz]);
      setShowCreateModal(false);
      setNewQuizData({ title: "", description: "", time_limit: 30, max_attempts: 1 });
    } catch (err) {
      alert("Lỗi khi tạo Quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await updateQuiz(editingQuiz._id, editQuizData);
      setQuizzes(quizzes.map(q => q._id === editingQuiz._id ? data.quiz : q));
      setShowEditModal(false);
      setEditingQuiz(null);
    } catch (err) {
      alert("Lỗi khi cập nhật Quiz");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (quiz) => {
    setEditingQuiz(quiz);
    setEditQuizData({
      title: quiz.title,
      description: quiz.description,
      time_limit: quiz.time_limit,
      max_attempts: quiz.max_attempts
    });
    setShowEditModal(true);
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá Quiz này không? Toàn bộ câu hỏi liên quan sẽ bị ảnh hưởng.")) return;
    
    try {
      setLoading(true);
      await deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      alert("Lỗi khi xoá Quiz");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <LayoutGrid size={16} />
            Lưới
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <List size={16} />
            Danh sách
          </button>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm bài thi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none font-semibold transition-all shadow-sm"
            />
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-200 flex gap-2 active:scale-95 transition-all"
          >
            <Plus size={20} />
            Tạo Quiz mới
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-tighter">Đang tải dữ liệu...</p>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
          {filteredQuizzes.map((quiz, idx) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group relative overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-white">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText size={28} />
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                    {quiz.title}
                  </h3>
                  
                  <p className="text-slate-500 font-medium mb-6 line-clamp-2 min-h-[3rem]">
                    {quiz.description || "Không có mô tả cho bài thi này."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={16} /></div>
                      <span className="text-sm font-bold text-slate-600">{quiz.time_limit} Phút</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Key size={16} /></div>
                      <span className="text-sm font-black text-indigo-600 tracking-wider">#{quiz.access_code}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => openHostModal(quiz)}
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-100"
                    >
                      <Play size={16} className="mr-2" />
                      Tổ chức
                    </Button>
                    <Button 
                      onClick={() => window.location.href=`/admin/questions?quizId=${quiz._id}`}
                      variant="outline" 
                      className="flex-1 rounded-xl font-bold text-xs"
                    >
                      Câu hỏi
                    </Button>
                    <Button 
                      onClick={() => openEditModal(quiz)}
                      variant="ghost" 
                      className="rounded-xl text-indigo-600 hover:bg-indigo-50 font-bold p-2"
                    >
                      Sửa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-white shadow-sm rounded-3xl mx-auto mb-6 flex items-center justify-center text-slate-300">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800">Không tìm thấy quiz nào</h3>
          <p className="text-slate-400 mt-2">Hãy thử đổi từ khóa tìm kiếm hoặc tạo một quiz mới.</p>
        </div>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10">
                  <h2 className="text-3xl font-black mb-6 text-slate-800">Tạo Quiz mới</h2>
                  <form onSubmit={handleCreateQuiz} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500">Tiêu đề Quiz</label>
                      <Input 
                        placeholder="Nhập tiêu đề..." 
                        value={newQuizData.title}
                        onChange={(e) => setNewQuizData({...newQuizData, title: e.target.value})}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500">Mô tả</label>
                      <textarea 
                        placeholder="Nhập mô tả..." 
                        value={newQuizData.description}
                        onChange={(e) => setNewQuizData({...newQuizData, description: e.target.value})}
                        className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                        rows="3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500">Thời gian (phút)</label>
                        <Input 
                          type="number"
                          value={newQuizData.time_limit}
                          onChange={(e) => setNewQuizData({...newQuizData, time_limit: parseInt(e.target.value)})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500">Số lần làm (tối đa)</label>
                        <Input 
                          type="number"
                          value={newQuizData.max_attempts}
                          onChange={(e) => setNewQuizData({...newQuizData, max_attempts: parseInt(e.target.value)})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6 flex gap-3">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">
                        Xác nhận tạo
                      </Button>
                      <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl" onClick={() => setShowCreateModal(false)}>
                        Hủy
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10">
                  <h2 className="text-3xl font-black mb-6 text-slate-800">Chỉnh sửa Quiz</h2>
                  <form onSubmit={handleUpdateQuiz} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500">Tiêu đề Quiz</label>
                      <Input 
                        placeholder="Nhập tiêu đề..." 
                        value={editQuizData.title}
                        onChange={(e) => setEditQuizData({...editQuizData, title: e.target.value})}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500">Mô tả</label>
                      <textarea 
                        placeholder="Nhập mô tả..." 
                        value={editQuizData.description}
                        onChange={(e) => setEditQuizData({...editQuizData, description: e.target.value})}
                        className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                        rows="3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500">Thời gian (phút)</label>
                        <Input 
                          type="number"
                          value={editQuizData.time_limit}
                          onChange={(e) => setEditQuizData({...editQuizData, time_limit: parseInt(e.target.value)})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500">Số lần làm (tối đa)</label>
                        <Input 
                          type="number"
                          value={editQuizData.max_attempts}
                          onChange={(e) => setEditQuizData({...editQuizData, max_attempts: parseInt(e.target.value)})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6 flex gap-3">
                      <Button type="submit" className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100">
                        Cập nhật
                      </Button>
                      <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl" onClick={() => { setShowEditModal(false); setEditingQuiz(null); }}>
                        Hủy
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* HOST MODAL */}
      <AnimatePresence>
        {showHostModal && hostingQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-indigo-600 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                  <Zap size={140} />
                </div>
                <h2 className="text-3xl font-black mb-1 leading-tight">{hostingQuiz.title}</h2>
                <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs opacity-80">Phòng chờ trực tuyến</p>
                
                <div className="mt-8 flex items-center gap-6">
                  <div className="px-6 py-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-indigo-100">Mã tham gia</p>
                    <p className="text-3xl font-black tracking-[0.2em]">{hostingQuiz.access_code}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-white/20" />
                  <div>
                    <p className="text-4xl font-black">{lobbyParticipants.filter(p => p.id !== "host").length}</p>
                    <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Học sinh đã vào</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-10">
                <div className="mb-8 overflow-y-auto max-h-60 pr-2">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Users size={16} />
                    Danh sách chờ ({lobbyParticipants.filter(p => p.id !== "host").length})
                  </h3>
                  
                  {lobbyParticipants.filter(p => p.id !== "host").length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      <AnimatePresence>
                        {lobbyParticipants.filter(p => p.id !== "host").map((p, idx) => (
                          <motion.div
                            key={p.socketId || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                          >
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <UserCheck size={20} />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{p.name}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Đang chờ người tham gia...</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleStartQuiz}
                    className="h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                  >
                    <Zap size={20} className="mr-2" />
                    BẮT ĐẦU NGAY
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                        setShowHostModal(false);
                        setHostingQuiz(null);
                    }}
                    className="h-16 rounded-[1.5rem] font-black text-lg border-2"
                  >
                    ĐÓNG PHÒNG
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}