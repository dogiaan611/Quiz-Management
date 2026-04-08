import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function GoogleAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const userData = searchParams.get("user"); // Backend có thể gửi kèm user JSON

        if (token) {
            // Lưu token vào localStorage
            localStorage.setItem("token", token);
            
            if (userData) {
                const user = JSON.parse(decodeURIComponent(userData));
                localStorage.setItem("user", JSON.stringify(user));
                
                // Điều hướng theo role
                if (user.role === "admin" || user.role === "teacher") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/user/dashboard");
                }
            } else {
                // Nếu chỉ có token, quay về login để lấy thông tin hoặc về trang chủ
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <Loader2 className="animate-spin mb-4" size={48} />
            <h2 className="text-xl font-bold">Đang xác thực tài khoản Google...</h2>
            <p className="text-slate-400 mt-2">Vui lòng chờ trong giây lát.</p>
        </div>
    );
}
