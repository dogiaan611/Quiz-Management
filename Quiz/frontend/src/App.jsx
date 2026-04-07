import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import CreateQuiz from './pages/CreateQuiz';
import QuizDetail from './pages/QuizDetail';
import QuizList from './pages/QuizList';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import useAuthStore from './store/useAuthStore';
import quizService from './services/quizService';
import {
  BookOpen,
  PlusSquare,
  HelpCircle,
  Clock,
  ArrowRight,
  Loader2,
  TrendingUp,
  Zap,
} from 'lucide-react';

/* ── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, bgColor, delay = 0 }) => (
  <div
    className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
      <TrendingUp size={14} className="text-slate-300" />
    </div>
    <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
    <p className="text-sm font-medium text-slate-500 mt-1.5">{label}</p>
  </div>
);

/* ── Quick Action ──────────────────────────────────────────── */
const QuickAction = ({ icon: Icon, title, desc, gradient, onClick, delay = 0 }) => (
  <button
    onClick={onClick}
    className="group text-left p-6 rounded-2xl border border-slate-200/60 bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-250 animate-slide-up w-full"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
      style={{ background: gradient }}
    >
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{desc}</p>
    <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
      Bắt đầu <ArrowRight size={13} />
    </div>
  </button>
);

/* ── Recent Quiz Row ───────────────────────────────────────── */
const RecentQuizRow = ({ quiz, onClick, index }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-150 group animate-slide-up"
    style={{ animationDelay: `${200 + index * 60}ms` }}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
        <BookOpen size={17} className="text-blue-500" />
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
          {quiz.title}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <HelpCircle size={11} /> {quiz.questions?.length || 0} câu
          </span>
          {quiz.time_limit && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock size={11} /> {quiz.time_limit} phút
            </span>
          )}
        </div>
      </div>
    </div>
    <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
  </div>
);

/* ── Dashboard Page ────────────────────────────────────────── */
const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    quizService.getAll()
      .then((data) => setQuizzes(data.quizzes || []))
      .catch(() => {})
      .finally(() => setLoadingQuizzes(false));
  }, []);

  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0);
  const avgTime = quizzes.filter(q => q.time_limit).length > 0
    ? Math.round(quizzes.filter(q => q.time_limit).reduce((s, q) => s + q.time_limit, 0) / quizzes.filter(q => q.time_limit).length)
    : 0;
  const recentQuizzes = [...quizzes].slice(-5).reverse();

  return (
    <DashboardLayout>
      {/* ── Welcome banner ─────────────────────────────────── */}
      <div
        className="relative rounded-2xl p-7 mb-6 overflow-hidden animate-fade-in"
        style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #0EA5E9 100%)' }}
      >
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-4 w-64 h-64 rounded-full bg-white/5" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-3">
            <Zap size={11} /> Xin chào!
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Chào mừng trở lại,<br />{user?.username} 👋
          </h2>
          <p className="text-blue-200 text-sm mt-2 font-medium">
            Quản lý toàn bộ bộ câu hỏi của bạn ngay tại đây.
          </p>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <StatCard icon={BookOpen}  label="Tổng Quiz"        value={loadingQuizzes ? '—' : quizzes.length}   color="text-blue-500"    bgColor="bg-blue-50"    delay={0}   />
        <StatCard icon={HelpCircle} label="Tổng câu hỏi"   value={loadingQuizzes ? '—' : totalQuestions}   color="text-emerald-500" bgColor="bg-emerald-50" delay={60}  />
        <StatCard icon={Clock}     label="Thời gian TB (phút)" value={loadingQuizzes ? '—' : avgTime || '—'} color="text-amber-500"   bgColor="bg-amber-50"   delay={120} />
        <StatCard icon={TrendingUp} label="Tài khoản"       value={user?.role || 'User'}                     color="text-sky-500"    bgColor="bg-sky-50"    delay={180} />
      </div>

      {/* ── Quick Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <QuickAction
          icon={PlusSquare}
          title="Tạo Quiz mới"
          desc="Soạn bộ câu hỏi từ đầu với wizard 3 bước đơn giản."
          gradient="linear-gradient(135deg, #2563EB, #0EA5E9)"
          onClick={() => navigate('/create-quiz')}
          delay={220}
        />
        <QuickAction
          icon={BookOpen}
          title="Thư viện Quiz"
          desc="Xem, tìm kiếm và quản lý tất cả bộ câu hỏi đã tạo."
          gradient="linear-gradient(135deg, #10B981, #059669)"
          onClick={() => navigate('/quizzes')}
          delay={280}
        />
      </div>

      {/* ── Recent Quizzes ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-slide-up" style={{ animationDelay: '320ms' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Quiz gần đây</h3>
          <button
            onClick={() => navigate('/quizzes')}
            className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ArrowRight size={12} />
          </button>
        </div>
        <div className="p-3">
          {loadingQuizzes ? (
            <div className="flex flex-col gap-3 p-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-3/4" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                <BookOpen size={26} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-400">Chưa có Quiz nào</p>
              <button
                onClick={() => navigate('/create-quiz')}
                className="mt-1 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors"
              >
                Tạo Quiz đầu tiên →
              </button>
            </div>
          ) : (
            recentQuizzes.map((quiz, i) => (
              <RecentQuizRow
                key={quiz._id}
                quiz={quiz}
                index={i}
                onClick={() => navigate(`/quiz/${quiz._id}`)}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

/* ── App Router ────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-quiz" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
        <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizDetail /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
