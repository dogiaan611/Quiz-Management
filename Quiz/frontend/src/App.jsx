import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthSuccess from './pages/AuthSuccess';
import CreateQuiz from './pages/CreateQuiz';
import QuizDetail from './pages/QuizDetail';
import QuizList from './pages/QuizList';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import useAuthStore from './store/useAuthStore';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chào mừng, {user?.username}! 👋</h2>
        <p className="text-gray-400 text-sm mb-8">Quản lý bộ câu hỏi của bạn từ đây.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => window.location.href = '/quizzes'}
            className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-all">
              <span className="text-xl">📚</span>
            </div>
            <h3 className="font-bold text-gray-800">Thư viện Quiz</h3>
            <p className="text-sm text-gray-400 mt-1">Xem tất cả bộ câu hỏi đã tạo</p>
          </div>
          <div
            onClick={() => window.location.href = '/create-quiz'}
            className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-all">
              <span className="text-xl">✏️</span>
            </div>
            <h3 className="font-bold text-gray-800">Tạo Quiz mới</h3>
            <p className="text-sm text-gray-400 mt-1">Soạn bộ câu hỏi mới từ đầu</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">👤</span>
            </div>
            <h3 className="font-bold text-gray-800">Tài khoản</h3>
            <p className="text-sm text-gray-400 mt-1">Email: {user?.email}</p>
            <p className="text-sm text-gray-400">Vai trò: {user?.role}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <CreateQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:quizId"
          element={
            <ProtectedRoute>
              <QuizDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
