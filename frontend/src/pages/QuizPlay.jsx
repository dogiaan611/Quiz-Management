import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Flag, AlertCircle, Loader, HelpCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
import socket from "@/services/socket"; // Import socket
import {
  getQuizById,
  submitQuiz,
} from "@/services/quizService";

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false); // Task 75: Kiểm tra hết giờ

  /* =============================
        1. LOAD USER & AUTH
  ============================== */
  useEffect(() => {
    // Ưu tiên lấy quizUser (dành cho học sinh vào bằng mã PIN) trước, sau đó mới đến user (tài khoản đã đăng nhập)
    const guestUser = sessionStorage.getItem("quizUser");
    const loggedInUser = sessionStorage.getItem("user") || localStorage.getItem("user");
    
    const storedUser = guestUser || loggedInUser;

    if (!storedUser) {
      navigate("/join"); // Nếu không có thông tin người dùng, về trang nhập mã
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  /* =============================
        2. CONNECT SOCKET & JOIN ROOM
  ============================== */
  useEffect(() => {
    if (!id || !user) return;

    // Tạo định danh duy nhất cho user (ID nếu đã login, hoặc dùng PIN + Tên nếu là guest)
    const userId = user.id || user._id || `${user.pin}_${user.name}`;

    socket.connect();
    socket.emit("joinQuiz", { quizId: id, userId });
    socket.emit("startQuiz", { quizId: id, userId });

    // Lắng nghe cập nhật thời gian từ server
    socket.on("timerUpdate", (time) => {
      setTimeLeft(time);
      if (time > 0) setIsTimeUp(false);
    });

    // Task 75: Lắng nghe tín hiệu kết thúc
    socket.on("timerFinished", () => {
      setTimeLeft(0);
      setIsTimeUp(true);
      handleSubmit(true); 
    });

    return () => {
      socket.off("timerUpdate");
      socket.off("timerFinished");
      socket.disconnect();
    };
  }, [id, user]);

  /* =============================
        3. FETCH QUIZ DATA
  ============================== */
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        setError(null);

        const { data } = await getQuizById(id);
        setQuiz(data.quiz);

        // Khôi phục câu trả lời cũ nếu có
        const savedAnswers = localStorage.getItem(`quizAnswers_${id}`);
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Không thể tải bài thi. Vui lòng kiểm tra lại kết nối.");
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [user, id]);

  /* =============================
        4. SELECT ANSWER
  ============================== */
  const selectAnswer = (answerIndex) => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: answerIndex,
    };
    setAnswers(newAnswers);
    localStorage.setItem(`quizAnswers_${id}`, JSON.stringify(newAnswers));
  };

  /* =============================
        5. SUBMIT HANDLER
  ============================== */
  const handleSubmit = async (auto = false) => {
    if (isSubmitting) return; // Tránh nộp 2 lần
    
    setIsSubmitting(true);
    setConfirmSubmit(false);

    try {
      const formattedAnswers = quiz.questions.map((q, index) => {
        const selectedIndex = answers[index];
        return {
          question_id: q._id,
          answer_id: selectedIndex !== undefined ? q.answers[selectedIndex]._id : null
        };
      }).filter(ans => ans.answer_id !== null);

      const { data } = await submitQuiz(id, formattedAnswers);

      // Dọn dẹp cache
      localStorage.removeItem(`quizAnswers_${id}`);
      localStorage.removeItem(`quizTime_${id}`);

      // Đảm bảo trang Kết quả có thông tin user để hiển thị (tránh bị đá về trang join)
      if (!sessionStorage.getItem("quizUser")) {
        sessionStorage.setItem("quizUser", JSON.stringify({
          name: user.name || user.username || "Người dùng",
          pin: quiz.access_code || "N/A",
          email: user.email || ""
        }));
      }

      sessionStorage.setItem("quizResult", JSON.stringify({
        quizId: id,
        attemptId: data.attempt._id || data.attempt.id,
        percent: Math.round((data.attempt.correct_answers / data.attempt.total_questions) * 100) || 0,
        correct: data.attempt.correct_answers,
        wrong: data.attempt.total_questions - data.attempt.correct_answers,
        score: data.attempt.score,
        timeSpent: quiz.time_limit * 60 - timeLeft,
        totalQuestions: data.attempt.total_questions,
        autoSubmitted: auto
      }));

      navigate("/result");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Lỗi khi nộp bài. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
      <Loader className="animate-spin text-indigo-500" size={48} />
      <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Đang chuẩn bị bài thi...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border border-slate-100">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Lỗi tải bài thi</h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
        <Button onClick={() => navigate("/join")} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 font-bold shadow-lg">Quay lại</Button>
      </div>
    </div>
  );

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md w-full border border-slate-100">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 -rotate-3">
            <HelpCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Bài thi chưa sẵn sàng</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Hiện tại bài thi này chưa có câu hỏi nào. Bạn vui lòng quay lại sau hoặc liên hệ giáo viên.
          </p>
          <Button onClick={() => navigate("/join")} className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 text-white">
            Trở về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* SIDEBAR */}
      <div className="hidden lg:flex flex-col w-80 border-r bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h2 className="font-bold text-xl mb-6 text-indigo-600 truncate">{quiz.title}</h2>
        
        <Card className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/50">
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500 mb-2">
              <Clock size={16} />
              <span className="text-sm font-medium">Thời gian còn lại</span>
            </div>
            <h1 className={`text-4xl font-mono font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-slate-800 dark:text-white"}`}>
              {formatTime()}
            </h1>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold mb-2 text-slate-500">
            <span>Tiến độ: {answeredCount}/{quiz.questions.length} câu</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-slate-100 dark:bg-slate-700" />
        </div>

        <div className="grid grid-cols-5 gap-2.5 overflow-y-auto max-h-[40vh] p-1">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`h-11 rounded-xl text-sm font-bold transition-all duration-200
                ${currentQuestion === index ? "ring-2 ring-indigo-500 ring-offset-2 scale-110 z-10" : ""}
                ${answers[index] !== undefined 
                  ? "bg-green-500 text-white shadow-sm shadow-green-200" 
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <Button 
          className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none"
          onClick={() => setConfirmSubmit(true)}
          disabled={isSubmitting}
        >
          <Flag size={20} className="mr-2" />
          Nộp bài ngay
        </Button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 lg:p-12 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-none rounded-3xl overflow-hidden">
                <CardContent className="p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-black tracking-widest uppercase">
                      Câu {currentQuestion + 1}
                    </span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-10 leading-snug">
                    {question.content}
                  </h2>

                  <div className="grid gap-4">
                    {question.answers.map((ans, i) => {
                      const isSelected = answers[currentQuestion] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => selectAnswer(i)}
                          disabled={isSubmitting || isTimeUp}
                          className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center group
                            ${isSelected 
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-md ring-1 ring-indigo-500" 
                              : "border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:border-indigo-200 hover:bg-white dark:hover:bg-slate-800"}
                            ${(isSubmitting || isTimeUp) ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center mr-5 font-black text-lg transition-transform group-active:scale-95
                            ${isSelected ? "bg-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 shadow-sm"}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-xl font-semibold flex-1">{ans.content}</span>
                          {isSelected && <CheckCircle2 className="ml-4 text-indigo-600" size={28} />}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <footer className="flex justify-between mt-10 w-full">
            <Button
              variant="ghost"
              size="lg"
              disabled={currentQuestion === 0 || isTimeUp}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="px-10 h-14 rounded-2xl hover:bg-white shadow-sm"
            >
              Quay lại
            </Button>
            
            <div className="flex gap-4">
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button 
                  size="lg" 
                  className="px-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100 dark:shadow-none" 
                  onClick={() => setConfirmSubmit(true)}
                  disabled={isSubmitting || isTimeUp}
                >
                  {isSubmitting ? <Loader className="animate-spin" /> : "Gửi kết quả"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={isTimeUp}
                  className="px-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  Tiếp theo
                </Button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {confirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 text-center">
                  <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-sm border border-amber-100">
                    <Flag size={48} />
                  </div>
                  <h2 className="text-3xl font-black mb-3 text-slate-800 dark:text-white">Nộp bài thi?</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">
                    Đã trả lời <span className="text-indigo-600 font-bold">{answeredCount}/{quiz.questions.length}</span> câu hỏi. Bạn chắc chắn muốn kết thúc?
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full py-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold shadow-xl shadow-indigo-100" onClick={() => handleSubmit(false)}>
                      Xác nhận nộp bài
                    </Button>
                    <Button variant="ghost" className="w-full py-8 rounded-2xl text-slate-500 font-semibold" onClick={() => setConfirmSubmit(false)}>
                      Kiểm tra lại bài làm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
