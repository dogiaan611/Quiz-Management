import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Flag, AlertCircle, Loader } from "lucide-react";
import {
  getQuizById,
  startAttempt,
  submitAnswer,
  submitAttempt,
} from "@/services/quizService";

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  /* =============================
        LOAD USER
  ============================== */
  useEffect(() => {
    const storedUser = sessionStorage.getItem("quizUser");

    if (!storedUser) {
      navigate("/join");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  /* =============================
        FETCH QUIZ DATA FROM API
  ============================== */
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        setError(null);

        // Lấy dữ liệu quiz từ API
        const { data } = await getQuizById(id);
        setQuiz(data.quiz);

        // Bắt đầu lần làm quiz
        const attemptRes = await startAttempt(id);
        setAttemptId(attemptRes.data.attempt_id);
        setTimeLeft(attemptRes.data.time_limit || data.quiz.time_limit || 900);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError(
          err.response?.data?.message ||
            "Không thể tải quiz. Vui lòng thử lại."
        );
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [user, id]);

  /* =============================
        RESTORE TIMER + ANSWERS FROM LOCALSTORAGE
  ============================== */
  useEffect(() => {
    if (!quiz) return;

    const savedTime = localStorage.getItem(`quizTime_${id}`);
    const savedAnswers = localStorage.getItem(`quizAnswers_${id}`);

    if (savedTime) setTimeLeft(Number(savedTime));
    else setTimeLeft(quiz.time_limit || 900);

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
  }, [quiz, id]);

  /* =============================
        TIMER
  ============================== */
  useEffect(() => {
    if (!user || !quiz) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // auto submit
          return 0;
        }

        localStorage.setItem(`quizTime_${id}`, prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [user, quiz, id]);

  /* =============================
        AUTO SAVE ANSWERS
  ============================== */
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quizAnswers_${id}`, JSON.stringify(answers));
    }
  }, [answers, id]);

  /* =============================
        WARNING WHEN EXIT
  ============================== */
  useEffect(() => {
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader className="mx-auto mb-4 animate-spin" size={40} />
            <p className="text-muted-foreground">Đang tải quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quiz.questions.length) * 100;
  const timeProgress = (timeLeft / (quiz.time_limit || 900)) * 100;

  /* =============================
        SELECT ANSWER - GỬI ĐẾN API
  ============================== */
  const selectAnswer = async (answerIndex) => {
    // Update local state immediately for better UX
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answerIndex,
    }));

    // Gửi câu trả lời của user đến server
    if (attemptId && question) {
      try {
        setIsSavingAnswer(true);
        const selectedAnswerId = question.answers[answerIndex]._id;

        await submitAnswer(attemptId, question._id, selectedAnswerId);
      } catch (err) {
        console.error("Error submitting answer:", err);
        // Có thể hiển thị toast notification nếu muốn
      } finally {
        setIsSavingAnswer(false);
      }
    }
  };

  /* =============================
        SUBMIT QUIZ - NỘP BÀI
  ============================== */
  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);

    try {
      if (attemptId) {
        // Nộp bài lên server
        const { data } = await submitAttempt(attemptId);

        // Xóa dữ liệu tạm thời
        localStorage.removeItem(`quizAnswers_${id}`);
        localStorage.removeItem(`quizTime_${id}`);

        // Lưu kết quả vào sessionStorage
        sessionStorage.setItem(
          "quizResult",
          JSON.stringify({
            attemptId: attemptId,
            correct: data.results.correct_answers,
            wrong:
              data.results.total_questions -
              data.results.correct_answers,
            total: data.results.total_questions,
            percent: Math.round(
              (data.results.correct_answers /
                data.results.total_questions) *
                100
            ),
            timeSpent: quiz.time_limit - timeLeft,
            autoSubmitted: auto,
            score: data.results.score,
          })
        );

        navigate("/result");
      }
    } catch (err) {
      console.error("Error submitting attempt:", err);
      alert(
        err.response?.data?.message ||
          "Lỗi khi nộp bài. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900">
      {/* SIDEBAR */}
      <div className="hidden lg:flex flex-col w-80 border-r bg-background p-5">
        {/* USER */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="font-bold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs">PIN: <b>{user.pin}</b></p>
          </CardContent>
        </Card>

        {/* TIMER */}
        <Card className="mb-4">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              Thời gian còn lại
            </div>

            <h1
              className={`text-3xl font-bold ${
                timeLeft < 60 ? "text-red-500 animate-pulse" : "text-indigo-600"
              }`}
            >
              {formatTime()}
            </h1>

            <Progress value={timeProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* PROGRESS */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {answeredCount}/{quiz.questions.length} câu
            <Progress value={progress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* GRID */}
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((_, index) => {
            const answered = answers[index] !== undefined;

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`h-10 rounded-lg font-semibold
                  ${
                    currentQuestion === index
                      ? "bg-indigo-600 text-white"
                      : answered
                        ? "bg-green-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700"
                  }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <Button
          className="mt-auto"
          onClick={() => setConfirmSubmit(true)}
          disabled={isSavingAnswer}
        >
          <Flag size={16} className="mr-2" />
          Nộp bài
        </Button>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex justify-center items-center p-6">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <Card className="shadow-xl rounded-2xl">
            <CardContent className="p-8">
              <h2 className="font-bold text-xl mb-4">
                Câu {currentQuestion + 1}
              </h2>

              <p className="text-lg font-semibold mb-6">
                {question.content}
              </p>

              <div className="grid gap-3">
                {question.answers.map((ans, i) => {
                  const selected = answers[currentQuestion] === i;

                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={i}
                      onClick={() => selectAnswer(i)}
                      disabled={isSavingAnswer}
                      className={`p-4 rounded-xl border text-left transition-all
                        ${
                          selected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-slate-800 hover:border-indigo-400"
                        }
                        ${isSavingAnswer ? "opacity-70 cursor-wait" : ""}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{ans.content}</span>
                        {selected && isSavingAnswer && (
                          <Loader size={16} className="animate-spin" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={
                    currentQuestion === 0 || isSavingAnswer
                  }
                  onClick={() => setCurrentQuestion((q) => q - 1)}
                >
                  Câu trước
                </Button>

                <Button
                  disabled={
                    currentQuestion === quiz.questions.length - 1 ||
                    isSavingAnswer
                  }
                  onClick={() => setCurrentQuestion((q) => q + 1)}
                >
                  Câu tiếp
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SUBMIT MODAL */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="w-[400px]">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-2">
                  Xác nhận nộp bài?
                </h2>

                <p className="text-muted-foreground mb-4">
                  Bạn đã làm {answeredCount}/{quiz.questions.length} câu.
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmSubmit(false)}
                    disabled={isSavingAnswer}
                  >
                    Hủy
                  </Button>

                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSavingAnswer}
                  >
                    {isSavingAnswer ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Đang nộp...
                      </>
                    ) : (
                      "Nộp bài"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900">

      {/* SIDEBAR */}
      <div className="hidden lg:flex flex-col w-80 border-r bg-background p-5">

        {/* USER */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="font-bold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs">PIN: <b>{user.pin}</b></p>
          </CardContent>
        </Card>


        {/* TIMER */}
        <Card className="mb-4">
          <CardContent className="p-4 text-center">

            <div className="flex justify-center gap-2 text-sm text-muted-foreground">
              <Clock size={16}/>
              Thời gian còn lại
            </div>

            <h1 className={`text-3xl font-bold ${
              timeLeft < 60 ? "text-red-500 animate-pulse" : "text-indigo-600"
            }`}>
              {formatTime()}
            </h1>

            <Progress value={timeProgress} className="h-2 mt-2"/>
          </CardContent>
        </Card>


        {/* PROGRESS */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {answeredCount}/{quiz.questions.length} câu
            <Progress value={progress} className="h-2 mt-2"/>
          </CardContent>
        </Card>


        {/* GRID */}
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((_, index) => {

            const answered = answers[index] !== undefined;

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`h-10 rounded-lg font-semibold
                  ${currentQuestion === index
                    ? "bg-indigo-600 text-white"
                    : answered
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700"}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <Button
          className="mt-auto"
          onClick={() => setConfirmSubmit(true)}
        >
          <Flag size={16} className="mr-2"/>
          Nộp bài
        </Button>

      </div>



      {/* MAIN */}
      <div className="flex-1 flex justify-center items-center p-6">

        <motion.div
          key={currentQuestion}
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          className="w-full max-w-3xl"
        >
          <Card className="shadow-xl rounded-2xl">
            <CardContent className="p-8">

              <h2 className="font-bold text-xl mb-4">
                Câu {currentQuestion + 1}
              </h2>

              <p className="text-lg font-semibold mb-6">
                {question.text}
              </p>

              <div className="grid gap-3">
                {question.answers.map((ans, i) => {

                  const selected = answers[currentQuestion] === i;

                  return (
                    <motion.button
                      whileHover={{scale:1.02}}
                      whileTap={{scale:0.98}}
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`p-4 rounded-xl border text-left
                        ${selected
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-800 hover:border-indigo-400"}`}
                    >
                      {ans}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion(q => q-1)}
                >
                  Câu trước
                </Button>

                <Button
                  disabled={currentQuestion === quiz.questions.length-1}
                  onClick={() => setCurrentQuestion(q => q+1)}
                >
                  Câu tiếp
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>



      {/* SUBMIT MODAL */}
      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center"
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
          >
            <Card className="w-[400px]">
              <CardContent className="p-6">

                <h2 className="font-bold text-lg mb-2">
                  Xác nhận nộp bài?
                </h2>

                <p className="text-muted-foreground mb-4">
                  Bạn đã làm {answeredCount}/{quiz.questions.length} câu.
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmSubmit(false)}
                  >
                    Hủy
                  </Button>

                  <Button onClick={() => handleSubmit(false)}>
                    Nộp bài
                  </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
