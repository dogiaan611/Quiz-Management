import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusSquare,
  LogOut,
  GraduationCap,
  ChevronRight,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/quizzes', icon: BookOpen, label: 'Thư viện Quiz' },
  { to: '/create-quiz', icon: PlusSquare, label: 'Tạo Quiz mới' },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearAuth();
    navigate('/login');
    onClose?.();
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col
          w-[240px] transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F2040 100%)' }}
      >
        {/* ── Brand ─────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
          >
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base leading-none">QuizApp</span>
            <p className="text-[#475569] text-[10px] font-medium mt-0.5 uppercase tracking-widest">Dashboard</p>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
          <p className="text-[#475569] text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
            Điều hướng
          </p>
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3">
                    <Icon
                      size={17}
                      className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                    />
                    {label}
                  </span>
                  {isActive && <ChevronRight size={14} className="text-white/50" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User profile + Logout ─────────────────── */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
            >
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate leading-none">
                {user?.username || 'User'}
              </p>
              <p className="text-slate-500 text-xs truncate mt-0.5">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
