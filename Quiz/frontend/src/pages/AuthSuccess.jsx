import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const token = searchParams.get("token");
        const userStr = searchParams.get("user");

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                setAuth(user, token);
                navigate("/");
            } catch (error) {
                console.error("Error parsing user data:", error);
                navigate("/login?error=invalid_data");
            }
        } else {
            navigate("/login?error=missing_credentials");
        }
    }, [searchParams, setAuth, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFD]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#2D5BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800">Đang đăng nhập...</h2>
                <p className="text-gray-500">Vui lòng chờ trong giây lát.</p>
            </div>
        </div>
    );
};

export default AuthSuccess;
