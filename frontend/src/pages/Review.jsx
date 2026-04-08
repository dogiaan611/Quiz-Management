import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw, 
  Home, 
  Clock, 
  ChevronLeft, 
  HelpCircle,
  AlertCircle,
  Loader
} from "lucide-react";
import { getAttemptReview } from "@/services/quizService";

export default function Review() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const res = await getAttemptReview(attemptId);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching review:", err);
        setError("Không thể tải thông tin review bài làm.");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchReview();
    }
  }, [attemptId]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <Card className="max-w-md w-full p-10 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-4">{error || "Không tìm thấy dữ liệu"}</h2>
        <Button onClick={() => navigate("/")} className="w-full">
          Quay lại trang chủ
        </Button>
      </Card>
    </div>
  );

  const { overview, questions } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/result")}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={20} className="mr-2" />
            Quay lại
          </Button>
          <div className="text-center">
            <h1 className="font-black text-xl tracking-tight line-clamp-1">{overview.quiz_title}</h1>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Chi tiết đáp án</p>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        {/* SUMMARY HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="md:col-span-2 rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <Trophy size={140} />
            </div>
            <CardContent className="p-8 relative z-10">
              <p className="text-indigo-100 font-bold mb-1 uppercase tracking-widest text-xs">Điểm số của bạn</p>
              <h2 className="text-6xl font-black mb-4">
                {overview.score}<span className="text-2xl text-indigo-200">/100</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm text-sm font-bold">
                  {overview.correct_answers} đúng
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm text-sm font-bold">
                  {overview.wrong_answers} sai
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] shadow-lg border-none bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
              <Clock className="text-indigo-500 mb-3" size={32} />
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Thời gian</p>
              <p className="text-2xl font-black">{formatTime(overview.time_spent)}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] shadow-lg border-none bg-white dark:bg-slate-900">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
              <HelpCircle className="text-emerald-500 mb-3" size={32} />
              <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Số câu hỏi</p>
              <p className="text-2xl font-black">{overview.total_questions}</p>
            </CardContent>
          </Card>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black mb-6">Phân tích câu hỏi</h3>
          
          {questions.map((q, idx) => {
            const isCorrect = q.user_selection.is_correct;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
              >
                <Card className={`rounded-[2.5rem] shadow-lg border-2 transition-all ${isCorrect ? "border-emerald-100 dark:border-emerald-900/30 shadow-emerald-50" : "border-red-100 dark:border-red-900/30 shadow-red-50"}`}>
                  <CardContent className="p-8 lg:p-10">
                    {/* STATUS BADGE */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                          Câu {idx + 1}
                        </span>
                        <span className={`text-xs font-bold ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                          {isCorrect ? "CHÍNH XÁC" : "BỊ SAI"}
                        </span>
                      </div>
                      {isCorrect ? <CheckCircle2 className="text-emerald-500" size={28} /> : <XCircle className="text-red-500" size={28} />}
                    </div>

                    <h4 className="text-xl lg:text-2xl font-bold mb-10 leading-snug">
                      {q.content}
                    </h4>

                    {/* CHOICES */}
                    <div className="grid gap-3">
                      {q.choices.map((choice, cIdx) => {
                        const isUserSelected = choice._id === q.user_selection.answer_id;
                        const isCorrectAnswer = choice.is_correct;
                        
                        let bgColor = "bg-slate-50 dark:bg-slate-800/50 border-transparent";
                        let textColor = "text-slate-700 dark:text-slate-300";
                        let borderStyle = "border-2";

                        if (isCorrectAnswer) {
                          bgColor = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500";
                          textColor = "text-emerald-700 dark:text-emerald-300";
                        } else if (isUserSelected && !isCorrectAnswer) {
                          bgColor = "bg-red-50 dark:bg-red-900/20 border-red-500";
                          textColor = "text-red-700 dark:text-red-300";
                        }

                        return (
                          <div
                            key={cIdx}
                            className={`p-6 rounded-2xl ${borderStyle} ${bgColor} flex items-center justify-between transition-all`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${isCorrectAnswer ? "bg-emerald-500 text-white" : (isUserSelected ? "bg-red-500 text-white" : "bg-white dark:bg-slate-700")}`}>
                                {String.fromCharCode(65 + cIdx)}
                              </div>
                              <span className={`font-semibold ${textColor}`}>{choice.content}</span>
                            </div>

                            <div className="flex gap-2">
                              {isUserSelected && (
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                  Lựa chọn của bạn
                                </span>
                              )}
                              {isCorrectAnswer && !isCorrect && (
                                <span className="px-3 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-700 animate-pulse">
                                  Đáp án đúng
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* BOTTOM NAV */}
        <div className="mt-16 flex flex-col md:flex-row gap-4 items-center justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const loggedInUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
                if (loggedInUser) {
                  navigate(loggedInUser.role === "admin" || loggedInUser.role === "teacher" ? "/admin" : "/user");
                } else {
                  navigate("/join");
                }
              }}
              className="w-full md:w-56 h-14 rounded-2xl font-bold shadow-sm bg-white dark:bg-slate-800"
            >
              <Home size={20} className="mr-2" />
              Trang chủ
            </Button>
            <Button
              size="lg"
              onClick={() => {
                sessionStorage.removeItem("quizResult");
                if (overview.quiz_id) {
                  navigate(`/quiz/${overview.quiz_id}`);
                } else {
                  const loggedInUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
                  if (loggedInUser) {
                    navigate(loggedInUser.role === "admin" || loggedInUser.role === "teacher" ? "/admin" : "/user");
                  } else {
                    navigate("/join");
                  }
                }
              }}
              className="w-full md:w-64 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-100"
            >
              <RotateCcw size={20} className="mr-2" />
              Làm lại bài thi
            </Button>
        </div>
      </main>
    </div>
  );
}
