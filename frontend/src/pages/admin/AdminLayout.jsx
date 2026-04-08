import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LogOut,
  FileText,
  HelpCircle,
  ChevronDown
} from "lucide-react";

export default function AdminLayout() {

  const location = useLocation();
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);

  const menu = [
    { name: "Quiz", path: "/admin/quizzes", icon: <FileText size={18} /> },
    { name: "Câu hỏi", path: "/admin/questions", icon: <HelpCircle size={18} /> },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]"> {/* Slate-50 background for premium look */}

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col justify-between shadow-2xl z-20">

        <div>
          <div className="p-8 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <FileText size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">Quiz Admin</span>
            </div>
          </div>

          <nav className="px-4 space-y-2">
            {menu.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-200
                  ${isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 translate-x-1"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 font-bold transition-all duration-200"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>

      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-12 flex justify-between items-center z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Hệ thống quản trị</p>
            <h1 className="text-xl font-black text-slate-900">
              {menu.find(m => location.pathname.startsWith(m.path))?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">A</div>
              <span className="text-sm font-bold text-slate-700">Admin</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}