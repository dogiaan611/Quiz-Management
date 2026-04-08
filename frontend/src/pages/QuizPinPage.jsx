import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/axios";
import { motion } from "framer-motion";
import { KeyRound, Loader2, User, Mail, Home } from "lucide-react";

export default function QuizPinPage() {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const nameRef = useRef(null);

  const isValidEmail = (email) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleJoinQuiz = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!pin.trim()) return setError("Vui lòng nhập mã PIN");
    if (!name.trim()) return setError("Vui lòng nhập họ tên");
    if (!isValidEmail(email)) return setError("Email không hợp lệ");

    try {
      setLoading(true);
      setError("");

      // Gọi API thực tế để kiểm tra mã PIN
      const res = await api.post("/quizzes/check-code", { code: pin.toUpperCase() });
      
      const quizData = res.data.quiz;

      // Lưu thông tin người dùng tạm thời (Guest session)
      sessionStorage.setItem(
        "guestUser",
        JSON.stringify({
          name,
          email,
          quizId: quizData.id || quizData._id,
          isGuest: true
        })
      );

      // Đi tới trang làm bài với ID thực tế của Quiz
      navigate(`/quiz/${quizData.id || quizData._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Mã PIN không đúng hoặc bài thi không tồn tại");
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPin(value);
    setError("");
    if (value.length === 6) {
      nameRef.current?.focus();
    }
  };

  const goHome = () => navigate("/");

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <button onClick={goHome} className="absolute top-6 left-6 p-3 rounded-full hover:bg-white/10 text-white transition">
        <Home size={24} />
      </button>

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="rounded-3xl shadow-2xl border bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20">
                <KeyRound size={40} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold dark:text-white">Tham gia Quiz</h1>
            <p className="text-gray-500 mt-2 text-sm text-black">Nhập thông tin để bắt đầu làm bài</p>
          </div>

          <form onSubmit={handleJoinQuiz} className="space-y-4">
            <input
              placeholder="MÃ PIN (Ví dụ: ABCD12)"
              value={pin}
              onChange={handlePinChange}
              className="w-full h-14 text-center text-2xl tracking-[0.2em] font-black rounded-2xl bg-gray-100 border-none outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              maxLength={8}
              autoFocus
            />

            <div className="relative">
              <User size={18} className="absolute left-4 top-4 text-gray-400" />
              <input
                ref={nameRef}
                placeholder="Họ và tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 h-12 rounded-xl bg-gray-100 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
              <input
                placeholder="Email (không bắt buộc)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 h-12 rounded-xl bg-gray-100 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                type="email"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Bắt đầu làm bài"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

