import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { BookOpen, Plus, LogOut, LogIn, UserPlus, Menu, X, Home } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearAuth();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">QuizApp</span>
        </div>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Home size={14} />
                Home
              </span>
            </NavLink>
            <NavLink to="/quizzes" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} />
                Thư viện
              </span>
            </NavLink>
            <NavLink to="/create-quiz" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Plus size={14} />
                Tạo Quiz
              </span>
            </NavLink>
          </nav>
        )}

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-gray-700">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all outline-none"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all outline-none"
              >
                <LogIn size={15} />
                Đăng nhập
              </button>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all outline-none"
              >
                <UserPlus size={15} />
                Đăng ký
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          {isAuthenticated && (
            <>
              <button onClick={() => { navigate('/'); setMenuOpen(false); }} className="flex items-center gap-2 w-full py-2 text-sm font-semibold text-gray-600 hover:text-blue-600">
                <Home size={15} /> Home
              </button>
              <button onClick={() => { navigate('/quizzes'); setMenuOpen(false); }} className="flex items-center gap-2 w-full py-2 text-sm font-semibold text-gray-600 hover:text-blue-600">
                <BookOpen size={15} /> Thư viện
              </button>
              <button onClick={() => { navigate('/create-quiz'); setMenuOpen(false); }} className="flex items-center gap-2 w-full py-2 text-sm font-semibold text-gray-600 hover:text-blue-600">
                <Plus size={15} /> Tạo Quiz
              </button>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">{user?.username}</span>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-red-500">
                  <LogOut size={15} /> Đăng xuất
                </button>
              </div>
            </>
          )}
          {!isAuthenticated && (
            <>
              <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="flex items-center gap-2 w-full py-2 text-sm font-semibold text-gray-600 hover:text-blue-600">
                <LogIn size={15} /> Đăng nhập
              </button>
              <button onClick={() => { navigate('/register'); setMenuOpen(false); }} className="flex items-center gap-2 w-full py-2 text-sm font-semibold text-gray-600 hover:text-blue-600">
                <UserPlus size={15} /> Đăng ký
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
