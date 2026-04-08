import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Flag, AlertCircle, Loader } from "lucide-react";
import {
  getQuizById,
  submitQuiz, // Đã đổi sang hàm nộp bài một lần
} from "@/services/quizService";

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: answerIndex }
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =============================
        LOAD USER
  ============================== */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  /* =============================
        FETCH QUIZ DATA
  ============================== */
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        setError(null);

        const { data } = await getQuizById(id);
        setQuiz(data.quiz);

        // Khôi phục thời gian hoặc lấy mặc định
        const savedTime = localStorage.getItem(`quizTime_${id}`);
        if (savedTime) {
          setTimeLeft(Number(savedTime));
        } else {
          setTimeLeft(data.quiz.time_limit * 60 || 900); // Mặc định phút sang giây
        }

        // Khôi phục câu trả lời
        const savedAnswers = localStorage.getItem(`quizAnswers_${id}`);
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Không thể tải quiz. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [user, id]);

  /* =============================
        TIMER
  ============================== */
  useEffect(() => {
    if (!user || !quiz || loading) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // Auto submit khi hết giờ
          return 0;
        }
        localStorage.setItem(`quizTime_${id}`, prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [user, quiz, loading, id]);

  /* =============================
        SELECT ANSWER (LOCAL ONLY)
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
        HANDLE SUBMIT (ONE TIME)
  ============================== */
  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    setIsSubmitting(true);

    try {
      // 1. Chuẩn bị mảng answers theo format Backend: [{ question_id, answer_id }]
      const formattedAnswers = quiz.questions.map((q, index) => {
        const selectedIndex = answers[index];
        return {
          question_id: q._id,
          answer_id: selectedIndex !== undefined ? q.answers[selectedIndex]._id : null
        };
      }).filter(ans => ans.answer_id !== null); // Chỉ gửi những câu đã làm hoặc gửi null tùy logic backend

      // 2. Gọi API nộp bài một lần
      const { data } = await submitQuiz(id, formattedAnswers);

      // 3. Xóa cache local
      localStorage.removeItem(`quizAnswers_${id}`);
      localStorage.removeItem(`quizTime_${id}`);

      // 4. Lưu kết quả để hiển thị ở trang Result (khớp với field Result.jsx cần)
      sessionStorage.setItem("quizResult", JSON.stringify({
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
      alert("Có lỗi khi nộp bài. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;
  if (error) return <div className="text-red-500 p-10 text-center">{error}</div>;

  const question = quiz.questions[currentQuestion];
  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* SIDEBAR */}
      <div className="hidden lg:flex flex-col w-80 border-r bg-white dark:bg-slate-800 p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4 text-indigo-600 truncate">{quiz.title}</h2>
        
        <Card className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500 mb-1">Thời gian còn lại</p>
            <h1 className={`text-3xl font-mono font-bold ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-slate-800 dark:text-white"}`}>
              {formatTime()}
            </h1>
          </CardContent>
        </Card>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Tiến độ: {Object.keys(answers).length}/{quiz.questions.length} câu</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[40vh] p-1">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`h-10 rounded-lg text-sm font-medium transition-all
                ${currentQuestion === index ? "ring-2 ring-indigo-500 ring-offset-2" : ""}
                ${answers[index] !== undefined ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <Button 
          className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => setConfirmSubmit(true)}
          disabled={isSubmitting}
        >
          <Flag size={18} className="mr-2" />
          Nộp bài bài thi
        </Button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 lg:p-10 flex flex-col">
        <div className="max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="shadow-lg border-none">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Câu hỏi {currentQuestion + 1}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 leading-tight">
                    {question.content}
                  </h2>

                  <div className="space-y-4">
                    {question.answers.map((ans, i) => {
                      const isSelected = answers[currentQuestion] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => selectAnswer(i)}
                          className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center group
                            ${isSelected 
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-md" 
                              : "border-slate-100 dark:border-slate-700 hover:border-indigo-200 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-bold transition-colors
                            ${isSelected ? "bg-indigo-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-lg font-medium">{ans.content}</span>
                          {isSelected && <CheckCircle2 className="ml-auto text-indigo-500" size={24} />}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="px-8"
            >
              Câu trước
            </Button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button size="lg" className="px-10 bg-green-600 hover:bg-green-700" onClick={() => setConfirmSubmit(true)}>
                Hoàn tất
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="px-8 bg-indigo-600 hover:bg-indigo-700"
              >
                Câu tiếp theo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {confirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="w-full max-w-md border-none shadow-2xl">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Flag size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Bạn muốn nộp bài?</h2>
                  <p className="text-slate-500 mb-8">
                    Bạn đã hoàn thành {Object.keys(answers).length} trên tổng số {quiz.questions.length} câu hỏi.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 py-6" onClick={() => setConfirmSubmit(false)}>
                      Làm tiếp
                    </Button>
                    <Button className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                      {isSubmitting ? <Loader className="animate-spin" /> : "Nộp bài ngay"}
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
