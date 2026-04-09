import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/services/axios"; // Dùng axios đã cấu hình

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      // Lưu trữ thông tin
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Điều hướng theo role
      if (data.user.role === "admin" || data.user.role === "teacher") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý đăng nhập Google
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-400">Đăng nhập để tiếp tục chinh phục Quiz!</p>
        </div>

        {/* Nút Google Login đã được kích hoạt */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mb-6 flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white text-slate-800 font-bold shadow-xl hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.8-.2-3.5-.4-5.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 5 24 5c-7.7 0-14.3 4.3-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 47c5.2 0 9.9-2 13.2-5.2l-6.1-5c-2 1.5-4.6 2.2-7.1 2.2-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.5 42.5 16.2 47 24 47z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.3 5.5-6.1 7l6.1 5C39.9 36.7 45 30.8 45 24c0-1.8-.2-3.5-.4-5.5z"/>
          </svg>
          Đăng nhập với Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs font-bold">HOẶC</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="email"
              required
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="password"
              required
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold">
            Tạo tài khoản ngay
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
