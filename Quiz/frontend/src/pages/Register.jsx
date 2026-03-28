import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import authService from "../services/authService";
import useAuthStore from "../store/useAuthStore";
import loginStudyImg from "../assets/login_study.png";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const isLoading = useAuthStore((state) => state.isLoading);
    const setLoading = useAuthStore((state) => state.setLoading);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }

        setLoading(true);
        try {
            const res = await authService.register(username, email, password);
            setAuth(res.user, res.token);
            navigate('/');
        } catch (error) {
            setError(error.message || 'Email hoặc tên người dùng đã được sử dụng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFD] flex flex-col font-sans text-[#1A1A1A]">
            <main className="flex-1 flex items-center justify-center p-4 md:p-8">
                <div className="max-w-6xl w-full bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[750px]">

                    {/* Left Side - Info Section */}
                    <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-[#F8FAFF]">
                        <div className="mb-10">
                            <h1 className="text-4xl font-black text-[#2D5BFF] mb-6 tracking-tight">Quiz Master</h1>
                            <p className="text-gray-600 text-lg font-medium max-w-md leading-relaxed">
                                Biến quá trình học tập thành một hành trình khám phá thú vị. Tham gia cùng hàng ngàn học giả để chinh phục tri thức.
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
                                <img
                                    src={loginStudyImg}
                                    alt="Registration illustration"
                                    className="w-full h-auto rounded-2xl object-cover aspect-[4/3]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form Section */}
                    <div className="md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center">
                        <div className="w-full max-w-md">
                            <h2 className="text-3xl md:text-4xl font-black mb-2">Tạo tài khoản</h2>
                            <p className="text-gray-500 mb-8 font-medium">Bắt đầu hành trình chinh phục tri thức ngay hôm nay.</p>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Tên người dùng</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                                <User className="w-5 h-5" strokeWidth={2.5} />
                                            </span>
                                            <input
                                                type="text"
                                                required
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-14 pr-5 py-4 bg-[#F5F8FF] border border-transparent focus:border-[#2D5BFF] rounded-2xl text-gray-700 outline-none transition-all placeholder:text-gray-300 font-medium"
                                                placeholder="quizer24"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">Địa chỉ Email</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Mail className="w-5 h-5" strokeWidth={2.5} />
                                            </span>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-14 pr-5 py-4 bg-[#F5F8FF] border border-transparent focus:border-[#2D5BFF] rounded-2xl text-gray-700 outline-none transition-all placeholder:text-gray-300 font-medium"
                                                placeholder="alex@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Mật khẩu</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="w-5 h-5" strokeWidth={2.5} />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-12 py-4 bg-[#F5F8FF] border border-transparent focus:border-[#2D5BFF] rounded-2xl text-gray-700 outline-none transition-all placeholder:text-gray-300 font-medium"
                                            placeholder="••••••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D5BFF] transition-all"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
                                        </span>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4 bg-[#F5F8FF] border border-transparent focus:border-[#2D5BFF] rounded-2xl text-gray-700 outline-none transition-all placeholder:text-gray-300 font-medium"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-[#5985FF] text-white font-black rounded-3xl shadow-[0_12px_24px_-8px_rgba(45,91,255,0.4)] hover:bg-[#1C46E0] active:scale-95 disabled:opacity-50 transition-all text-sm tracking-wide mt-4"
                                >
                                    {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
                                </button>
                            </form>

                            <div className="mt-8 text-center text-sm">
                                <p className="font-medium text-gray-500">
                                    Đã có tài khoản?{" "}
                                    <Link to="/login" className="text-[#2D5BFF] font-black hover:underline underline-offset-4">
                                        Đăng nhập ngay
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

export default Register;