import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/useAuthStore';

// Temporary Dashboard component until we create pages/Dashboard.jsx
const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Quiz Management
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              clearAuth();
            }}
            className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/50 rounded-lg hover:bg-red-500 hover:text-white transition-all"
          >
            Đăng xuất
          </button>
        </header>

        <main className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">Chào mừng, {user?.username}!</h2>
          <p className="text-gray-400">
            Đây là trang Dashboard của bạn. Bạn đã đăng nhập thành công vào hệ thống quản lý Quiz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 bg-gray-700/50 rounded-xl border border-gray-600 hover:border-blue-500/50 transition-colors">
              <h3 className="font-bold mb-2">Thông tin tài khoản</h3>
              <p className="text-sm text-gray-400">Email: {user?.email}</p>
              <p className="text-sm text-gray-400">Vai trò: {user?.role}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
