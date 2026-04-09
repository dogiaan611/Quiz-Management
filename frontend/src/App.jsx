import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import QuizPinPage from "./pages/QuizPinPage";
import QuizPlay from "./pages/QuizPlay";
import Result from "./pages/Result";
import Review from "./pages/Review";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import UserLayout from "./pages/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserQuizzes from "./pages/user/UserQuizzes";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {

  // ✅ lấy theme đã lưu hoặc theo hệ thống
  const [dark, setDark] = useState(() => {

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    // fallback theo OS
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // ✅ apply class vào <html>
  useEffect(() => {

    const root = document.documentElement;

    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

  }, [dark]);

  // toggle function
  const toggleTheme = () => setDark(prev => !prev);

  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* AUTH */}
        <Route
          path="/login"
          element={<Login toggleTheme={toggleTheme} dark={dark} />}
        />

        <Route
          path="/auth/success"
          element={<GoogleAuthCallback />}
        />
        
      {/* REGISTER */}
        <Route
          path="/register"
          element={<Register toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* JOIN QUIZ */}
        <Route
          path="/join"
          element={<QuizPinPage toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* QUIZ */}
        <Route
          path="/quiz/:id"
          element={<QuizPlay toggleTheme={toggleTheme} dark={dark} />}
        />

        {/* USER ROUTES */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserQuizzes />} />
          <Route path="quizzes" element={<UserQuizzes />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminQuizzes />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="questions" element={<AdminQuestions />} />
        </Route>

        {/* RESULTS */}
        <Route
          path="/result"
          element={<Result toggleTheme={toggleTheme} dark={dark} />}
        />

        <Route
          path="/review/:attemptId"
          element={<Review />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
