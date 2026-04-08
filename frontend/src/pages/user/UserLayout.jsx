import { Link, Outlet, useLocation } from "react-router-dom";
import { LogOut, BookOpen, LayoutDashboard, History, Trophy, User, Bell, Settings } from "lucide-react";

export default function UserLayout() {
  const location = useLocation();

  const menu = [
    { name: "Bảng điều khiển", path: "/user/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Danh sách Quiz", path: "/user/quizzes", icon: <BookOpen size={18} /> },
    { name: "Lịch sử làm bài", path: "/user/history", icon: <History size={18} /> },
    { name: "Bảng xếp hạng", path: "/user/leaderboard", icon: <Trophy size={18} /> },
    { name: "Trang cá nhân", path: "/user/profile", icon: <User size={18} /> },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 shadow-xl border-r border-slate-100 dark:border-slate-700 p-6 flex flex-col justify-between fixed h-screen overflow-y-auto z-20">
        <div>
          <div className="flex items-center gap-3 mb-10 px-2 mt-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
              S
            </div>
            <h2 className="text-xl font-black dark:text-white tracking-tight">
              STUDENT <span className="text-indigo-600">PRO</span>
            </h2>
          </div>

          <nav className="space-y-1.5">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all duration-300
                    ${isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none" 
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600"}
                  `}
                >
                  <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <button className="flex items-center gap-3 w-full p-3.5 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300 font-bold text-sm">
            <Settings size={18} />
            Cài đặt
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-3.5 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300 font-bold text-sm"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Content wrapper with fixed sidebar padding */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header ẩn/hiện hoặc thông tin nhanh */}
        <header className="h-20 flex items-center justify-end px-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/20">
           <div className="flex items-center gap-5">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition relative">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden group cursor-pointer">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="avatar" />
              </div>
           </div>
        </header>

        <main className="p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}