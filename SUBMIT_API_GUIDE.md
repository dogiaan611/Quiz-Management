# Quiz Submit API Documentation

## 📋 Tổng Quan
Hướng dẫn chi tiết về cách gửi dữ liệu bài làm quiz lên backend thông qua API.

---

## 🔧 Backend API Endpoint

### **Nộp bài làm quiz**

```
POST /api/quizzes/:quizId/submit
```

#### **Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (bắt buộc)

#### **Parameters:**
- `quizId` (path): ID của quiz cần nộp bài

#### **Request Body:**
```json
{
  "answers": [
    {
      "question_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "answer_id": "64a1b2c3d4e5f6g7h8i9j0k2"
    },
    {
      "question_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "answer_id": null
    }
  ]
}
```

#### **Success Response (201):**
```json
{
  "message": "Nộp bài thành công",
  "attempt": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
    "score": 75,
    "total_questions": 4,
    "correct_answers": 3,
    "submitted_at": "2025-04-08T10:30:00Z"
  }
}
```

#### **Error Responses:**

**400 - Bad Request:**
```json
{
  "message": "Danh sách câu trả lời không hợp lệ."
}
```

**401 - Unauthorized:**
```json
{
  "message": "Vui lòng đăng nhập"
}
```

**403 - Forbidden:**
```json
{
  "message": "Quiz đã hết thời gian."
}
```

**404 - Not Found:**
```json
{
  "message": "Không tìm thấy quiz."
}
```

**500 - Server Error:**
```json
{
  "message": "Lỗi server khi nộp bài"
}
```

---

## 💻 Frontend Implementation

### **Cách 1: Sử dụng Utility Function**

#### Setup:
1. Đơn giản nhất là import utility function `submitQuiz` từ `src/utils/quizAPI.js`

#### Ví dụ:
```javascript
import { submitQuiz, getToken } from "../utils/quizAPI";

// Danh sách trả lời
const answers = [
  { question_id: "q1", answer_id: "a1" },
  { question_id: "q2", answer_id: "a3" },
  { question_id: "q3", answer_id: null } // bỏ qua câu hỏi
];

try {
  const token = getToken();
  const result = await submitQuiz("quiz123", answers, token);
  
  console.log("Điểm:", result.attempt.score);
  console.log("Đúng:", result.attempt.correct_answers);
} catch (error) {
  console.error("Lỗi:", error.message);
}
```

### **Cách 2: Sử dụng React Component**

Sử dụng component `QuizSubmit.jsx` được cung cấp:

```javascript
import QuizSubmit from "../components/QuizSubmit";

function QuizPage() {
  const quizId = "64a1b2c3d4e5f6g7h8i9j0k1";
  const questions = [
    {
      _id: "q1",
      content: "Câu hỏi 1?",
      type: "multiple_choice",
      answers: [
        { _id: "a1", content: "Đáp án A" },
        { _id: "a2", content: "Đáp án B" }
      ]
    }
    // ... thêm câu hỏi khác
  ];

  return <QuizSubmit quizId={quizId} questions={questions} />;
}
```

### **Cách 3: Direct Fetch API (Vanilla JS)**

```javascript
const submitQuiz = async (quizId, answers, token) => {
  const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};

// Sử dụng
const token = localStorage.getItem("token");
const answers = [
  { question_id: "q1", answer_id: "a1" }
];

submitQuiz("quiz123", answers, token)
  .then(result => {
    console.log("Nộp bài thành công:", result);
  })
  .catch(error => {
    console.error("Lỗi:", error);
  });
```

### **Cách 4: Axios (nếu dùng)**

```javascript
import axios from "axios";

const submitQuizWithAxios = async (quizId, answers, token) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/quizzes/${quizId}/submit`,
      { answers },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

---

## 🔄 Flow Diagram

```
Frontend (User)
      ↓
  [User làm bài quiz]
      ↓
  [Chọn các câu trả lời]
      ↓
  [Click nút "Nộp bài"]
      ↓
  submitQuiz(quizId, answers, token)
      ↓
  POST /api/quizzes/:quizId/submit
      ↓
  Backend (Server)
      ↓
  [Kiểm tra quiz tồn tại]
      ↓
  [Kiểm tra thời gian làm bài]
      ↓
  [Kiểm tra số lần làm bài]
      ↓
  [Kiểm tra câu trả lời - đúng/sai]
      ↓
  [Tính điểm]
      ↓
  [Lưu Attempt record vào DB]
      ↓
  Trả về kết quả (score, correct_answers, etc.)
      ↓
  Frontend: Hiển thị kết quả
```

---

## 📊 Data Format Chi Tiết

### **Answers Array Format:**

```javascript
[
  {
    question_id: string,    // ID câu hỏi (bắt buộc)
    answer_id: string|null  // ID đáp án (null nếu bỏ qua)
  },
  // ... thêm câu hỏi khác
]
```

### **Attempt Object (từ server):**

```javascript
{
  _id: string,              // ID của attempt
  quiz_id: string,          // ID của quiz
  user_id: string,          // ID của user
  score: number,            // Điểm (0-100)
  total_questions: number,  // Tổng số câu hỏi
  correct_answers: number,  // Số câu trả lời đúng
  submitted_at: Date,       // Thời gian nộp bài
  status: string,           // "submitted"
  answers: [                // Chi tiết câu trả lời
    {
      question_id: string,
      answer_id: string|null,
      is_correct: boolean
    }
  ]
}
```

---

## ✅ Validation Rules

### **Backend Validation:**
- ❌ Quiz phải tồn tại
- ❌ Không nộp bài nếu quiz chưa bắt đầu
- ❌ Không nộp bài nếu quiz đã hết thời gian
- ❌ Không vượt quá số lần làm bài cho phép
- ❌ question_id phải là câu hỏi trong quiz
- ❌ answer_id phải là đáp án của câu hỏi đó

### **Frontend Validation (nên thêm):**
- Kiểm tra user đã login
- Kiểm tra token hợp lệ
- Warning nếu có câu hỏi chưa trả lời
- Hiển thị thời gian còn lại (nếu có giới hạn)

---

## 🎯 Environment Setup

### **.env Setup:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### **Backend .env:**
```
JWT_SECRET=your_secret_key
MONGODB_URI=your_mongodb_uri
PORT=5000
```

---

## 🧪 Testing

### **cURL Example:**
```bash
curl -X POST http://localhost:5000/api/quizzes/64a1b2c3d4e5f6g7/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "answers": [
      {"question_id": "q1", "answer_id": "a1"},
      {"question_id": "q2", "answer_id": null}
    ]
  }'
```

### **Postman Setup:**
1. Method: POST
2. URL: `{{API_URL}}/quizzes/:quizId/submit`
3. Headers:
   - Content-Type: application/json
   - Authorization: Bearer {{token}}
4. Body (JSON):
   ```json
   {
     "answers": [
       {"question_id": "q1", "answer_id": "a1"}
     ]
   }
   ```

---

## 🚀 Quick Start

### **1. Backend Ready:**
✅ Endpoint đã được thêm: `POST /api/quizzes/:quizId/submit`

### **2. Frontend Setup:**

```javascript
// src/pages/QuizPage.js
import React, { useEffect, useState } from "react";
import QuizSubmit from "../components/QuizSubmit";
import { getQuizById, getToken } from "../utils/quizAPI";

export default function QuizPage({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const token = getToken();
        const response = await getQuizById(quizId, token);
        setQuiz(response.quiz);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  if (loading) return <p>Đang tải...</p>;
  if (!quiz) return <p>Không tìm thấy quiz</p>;

  return <QuizSubmit quizId={quizId} questions={quiz.questions} />;
}
```

---

## 📝 Notes

- Token được lưu trong `localStorage.token` tự động từ login
- User ID được trích từ JWT token trên server
- Điểm tính theo tỷ lệ: `(correct_answers / total_questions) * 100`
- Nếu user không chọn đáp án (`answer_id = null`), câu hỏi đó được coi là sai
- Mỗi attempt là một bản ghi độc lập (user có thể làm lại nếu `max_attempts` cho phép)

---

## 🔗 Related Endpoints

- `GET /api/quizzes` - Lấy danh sách quiz
- `GET /api/quizzes/:quizId` - Lấy chi tiết quiz
- `POST /api/quizzes` - Tạo quiz (admin/teacher only)
- `POST /api/quizzes/:quizId/questions` - Thêm câu hỏi (admin/teacher only)
