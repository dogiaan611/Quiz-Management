import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import authService from "../services/authService";
import useAuthStore from "../store/useAuthStore";
import loginStudyImg from "../assets/login_study.png";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:5001/api/auth/google";
    };

    const setAuth = useAuthStore((state) => state.setAuth);
    const isLoading = useAuthStore((state) => state.isLoading);
    const setLoading = useAuthStore((state) => state.setLoading);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authService.login(email, password);
            setAuth(res.user, res.token);
            navigate('/');
        } catch (error) {
            setError(error.message || 'Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFD] flex flex-col font-sans text-[#1A1A1A]">


            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="max-w-6xl w-full bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[700px]">


                    <div className="md:w-1/2 relative bg-[#4475FF]">

                        <div className="absolute inset-0 bg-linear-to-br from-[#4475FF] via-[#2D5BFF] to-[#0041FF] opacity-10"></div>


                        <div className="absolute inset-0 mix-blend-multiply opacity-40">
                            <img
                                src={loginStudyImg}
                                alt="Student searching"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="relative h-full flex flex-col justify-end p-8 md:p-16 text-white pb-24">
                            <div className="mb-6 inline-block">
                                <span className="bg-[#B6FF40] text-[#000000] text-[10px] md:text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                                    Thử thách kiến thức
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                                Chinh phục đỉnh cao <br /> tri thức cùng Quiz.
                            </h1>
                            <p className="text-white/80 text-base md:text-lg max-w-sm font-medium leading-relaxed">
                                Tham gia hàng nghìn bài trắc nghiệm đa dạng. Kiểm tra trình độ và bứt phá giới hạn bản thân ngay hôm nay.
                            </p>

                        </div>
                    </div>


                    <div className="md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center">
                        <div className="w-full max-w-md">
                            <h2 className="text-3xl md:text-4xl font-black mb-2">Sẵn sàng thử thách?</h2>
                            <p className="text-gray-500 mb-10 font-medium">Đăng nhập tài khoản để bắt đầu các bài kiểm tra của bạn.</p>


                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center space-x-3 py-4 border border-gray-100 bg-[#F5F8FF] rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-700 mb-8"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none">
                                    <path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z"/>
                                    <path fill="#34A853" d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z"/>
                                    <path fill="#FBBC04" d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z"/>
                                    <path fill="#EA4335" d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z"/>
                                </svg>
                                <span>Tiếp tục với Google</span>
                            </button>

                            <div className="flex items-center my-8">
                                <div className="flex-1 border-t border-gray-100"></div>
                                <span className="px-4 text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Hoặc dùng email của bạn</span>
                                <div className="flex-1 border-t border-gray-100"></div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Email hoặc Tên người dùng
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail className="w-5 h-5" strokeWidth={2.5} />
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4 bg-[#F5F8FF] border border-transparent focus:border-[#2D5BFF] rounded-2xl text-gray-700 outline-none transition-all placeholder:text-gray-400 font-medium"
                                            placeholder="nhập email của bạn..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-semibold  text-gray-800">
                                            Mật khẩu
                                        </label>
                                        <Link to="/forgot-password" title="Quên mật khẩu?" className="text-xs font-bold text-[#2D5BFF] hover:underline transition-all">
                                            Quên mật khẩu?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="w-5 h-5" strokeWidth={2.5} />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-12 py-4 bg-[#F5F8FF] border border-transparent focus:border-[#2D5BFF] rounded-2xl text-gray-700 outline-none transition-all placeholder:text-gray-400 font-medium"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D5BFF] transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" strokeWidth={2} />
                                            ) : (
                                                <Eye className="w-5 h-5" strokeWidth={2} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 py-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-[#2D5BFF] focus:ring-[#2D5BFF]"
                                    />
                                    <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer select-none">
                                        Ghi nhớ tôi trên thiết bị này
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-[#5985FF] text-white font-black rounded-3xl shadow-[0_12px_24px_-8px_rgba(89,133,255,0.4)] hover:bg-[#4475FF] active:scale-95 disabled:opacity-50 transition-all text-sm tracking-wide"
                                >
                                    {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                                </button>
                            </form>

                            <div className="mt-10 text-center">
                                <p className="text-sm font-medium text-gray-500">
                                    Chưa có tài khoản?{" "}
                                    <Link to="/register" className="text-[#2D5BFF] font-black hover:underline underline-offset-4">
                                        Đăng ký
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;