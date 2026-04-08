# Frontend — Quiz Management System

> **Stack:** React 18 · Vite · TailwindCSS · Zustand · React Router v6 · Axios · Lucide React

---

## Cấu trúc thư mục

```
src/
├── assets/             # Static assets (hình ảnh)
├── components/
│   ├── Navbar.jsx      # Navigation bar responsive, hiển thị theo auth state
│   └── ProtectedRoute.jsx  # HOC bảo vệ route yêu cầu đăng nhập
├── pages/
│   ├── Login.jsx       # Trang đăng nhập (email + Google OAuth)
│   ├── Register.jsx    # Trang đăng ký tài khoản
│   ├── AuthSuccess.jsx # Callback handler sau Google OAuth
│   ├── CreateQuiz.jsx  # Trang tạo quiz (3-step wizard)
│   ├── QuizList.jsx    # Danh sách quiz + tìm kiếm
│   └── QuizDetail.jsx  # Chi tiết quiz + câu hỏi
├── services/
│   ├── api.js          # Axios instance + interceptors
│   ├── authService.js  # Gọi API auth (login, register, logout)
│   └── quizService.js  # Gọi API quiz & questions
├── store/
│   ├── useAuthStore.js # Zustand store — auth state
│   └── useQuizStore.js # Zustand store — quiz creation state (có persist)
└── App.jsx             # Router + route definitions
```

---

## Những gì đã làm

### 1. Thiết lập Axios Instance (`services/api.js`)

Tạo một Axios instance tập trung thay vì dùng `fetch` hoặc gọi axios trực tiếp trong component.

**Request Interceptor:** Tự động đính kèm JWT token từ `localStorage` vào header `Authorization: Bearer <token>` cho mỗi request. Nhờ đó không cần thêm token thủ công ở từng chỗ gọi API.

**Response Interceptor:** Bắt lỗi HTTP 401 (Unauthorized) toàn cục — tự động xóa token và redirect về `/login` khi token hết hạn.

```js
// Khi gọi quizService.getAll(), token được tự động gửi kèm
// mà không cần viết lại ở mỗi service function
```

---

### 2. Service Layer (`services/authService.js`, `services/quizService.js`)

Tách logic gọi API ra khỏi component theo pattern **Service Object**.

- Mỗi service là một plain object chứa các async function.
- Lỗi được normalize bằng `error.response?.data || error.message` trước khi throw, tránh phải xử lý axios error object phức tạp ở component.
- Component chỉ cần `import quizService from '../services/quizService'` và gọi `quizService.getAll()`.

---

### 3. Zustand — Auth Store (`store/useAuthStore.js`)

Quản lý trạng thái xác thực toàn cục: `user`, `token`, `isAuthenticated`, `isLoading`.

**Khởi tạo từ localStorage:** Store được khởi tạo bằng cách đọc `localStorage` ngay khi app load, giúp user vẫn ở trạng thái đăng nhập sau khi refresh trang mà không cần gọi lại API.

```js
user: JSON.parse(localStorage.getItem('user')) || null,
isAuthenticated: !!localStorage.getItem('token'),
```

**Actions:**
- `setAuth(user, token)` — gọi sau khi login thành công
- `clearAuth()` — gọi khi logout
- `setLoading(bool)` — điều khiển trạng thái loading của form

---

### 4. Zustand — Quiz Store với Persist Middleware (`store/useQuizStore.js`)

Store quản lý toàn bộ state của luồng tạo quiz: metadata (title, description, category) và mảng questions.

**`persist` middleware:** Tự động lưu state vào `localStorage` sau mỗi thay đổi và restore khi load lại trang — người dùng không mất dữ liệu đang soạn khi lỡ refresh.

**`partialize`:** Chỉ persist những field cần thiết, loại bỏ `isSaving` (transient state) ra khỏi storage để tránh lưu trạng thái không có nghĩa.

```js
partialize: (state) => ({
  title: state.title,
  description: state.description,
  category: state.category,
  questions: state.questions,
})
```

**`publishQuiz` action:** Business logic tạo quiz nằm hoàn toàn trong store, không ở component:
1. Validate dữ liệu đầu vào.
2. Gọi `quizService.create()` để tạo quiz → lấy `quizId`.
3. Lặp tuần tự qua từng câu hỏi valid, gọi `quizService.createQuestion()` cho mỗi câu.
4. Reset state về mặc định khi thành công.

**Tại sao dùng Zustand thay vì useState + props?**
- Multi-step wizard có 3 bước, tất cả đều đọc/ghi cùng một state.
- Nếu dùng `useState` ở component cha và truyền props xuống, sẽ gây prop drilling qua nhiều tầng.
- Zustand cho phép bất kỳ component nào consume store trực tiếp.

---

### 5. Protected Route (`components/ProtectedRoute.jsx`)

HOC (Higher-Order Component) đơn giản: wrap một route, kiểm tra `isAuthenticated` từ Zustand store. Nếu chưa đăng nhập, redirect về `/login` bằng `<Navigate replace />`.

```jsx
// Dùng trong App.jsx
<Route path="/create-quiz" element={
  <ProtectedRoute>
    <CreateQuiz />
  </ProtectedRoute>
} />
```

---

### 6. Google OAuth Flow (`pages/AuthSuccess.jsx` + `services/authService.js`)

Luồng OAuth với backend:
1. User click "Đăng nhập với Google" → redirect đến `GET /api/auth/google` (backend xử lý passport.js).
2. Backend redirect về `/auth/success?token=...&user=...` sau khi xác thực xong.
3. `AuthSuccess.jsx` đọc query params, parse `user` từ URI-encoded JSON, gọi `setAuth(user, token)` để cập nhật Zustand store, rồi navigate về `/`.

---

### 7. CreateQuiz — Multi-Step Wizard (`pages/CreateQuiz.jsx`)

3-step wizard UI được điều khiển bằng local state (`useState`) vì đây là UI-only state, không cần global:

| Step | Nội dung |
|------|----------|
| 1 | Metadata: tên quiz, mô tả, danh mục, thời gian, ảnh bìa |
| 2 | Soạn câu hỏi: thêm/xóa câu hỏi, nhập đáp án, chọn đáp án đúng |
| 3 | Cài đặt & Xuất bản: giới hạn lần làm, shuffle, tổng quan → publish |

Data của wizard được đọc/ghi qua `useQuizStore` (global), không phải local state.

---

### 8. Routing (`App.jsx`)

Dùng **React Router v6** với `<BrowserRouter>` + `<Routes>`.

- Public routes: `/login`, `/register`, `/auth/success`
- Protected routes: `/`, `/create-quiz`, `/quiz/:quizId`, `/quizzes` — đều wrap trong `<ProtectedRoute>`
- Fallback: `path="*"` redirect về `/`

---

## Khái niệm kỹ thuật

### Axios Interceptor
Middleware của Axios chạy trước khi request được gửi (request interceptor) hoặc sau khi response được nhận (response interceptor). Dùng để handle cross-cutting concerns như auth, logging, error formatting mà không lặp code ở mỗi API call.

### Zustand
Thư viện state management nhẹ cho React. Khác với Redux không cần action/reducer boilerplate. Store là một hook, component subscribe vào slice state cần thiết và tự re-render khi slice đó thay đổi.

### Zustand `persist` Middleware
Wrapper tự động serialize state thành JSON và lưu vào storage (localStorage/sessionStorage/custom). Khi app khởi động, tự dynamic restore state từ storage trước khi render. `partialize` giúp lọc chỉ save một phần state.

### Protected Route (Route Guard)
Pattern trong React Router: tạo wrapper component kiểm tra điều kiện (auth, role, permission) trước khi render children. Nếu không thỏa điều kiện, redirect đến trang phù hợp.

### Service Layer (Service Object Pattern)
Tách logic gọi API vào module riêng biệt, component không biết về HTTP hay Axios. Lợi ích: dễ test, dễ thay đổi implementation (đổi từ REST sang GraphQL chỉ cần sửa service), tái sử dụng giữa nhiều component.

### JWT Authentication
JSON Web Token — chuỗi encode thông tin user + chữ ký số. Backend tạo và trả về khi login thành công. Frontend lưu vào localStorage và gửi kèm mỗi request qua `Authorization: Bearer <token>`. Backend verify token để xác thực.

### Google OAuth 2.0 (Authorization Code Flow)
Luồng xác thực qua bên thứ ba: FE redirect đến Google → Google xác thực → redirect về backend với auth code → backend đổi code lấy access token → backend tạo JWT riêng → redirect về FE với JWT.

---

## Lưu ý & Hướng phát triển

- [ ] Hiện tại `Login.jsx` và `Navbar.jsx` đều gọi `localStorage.removeItem` trực tiếp khi logout — nên centralize vào `authService.logout()`.
- [ ] Chưa có error boundary để bắt lỗi render crash.
- [ ] Có thể refactor `QuizList.jsx` và `QuizDetail.jsx` dùng TanStack Query để có caching, background refetch và loading/error state tốt hơn so với `useEffect` + `useState` thủ công.
- [ ] `Register.jsx` chưa được đọc chi tiết — cần verify flow tương tự Login.
