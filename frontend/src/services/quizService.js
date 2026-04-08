import api from "./axios";

const API_BASE = "/quizzes";
const ATTEMPTS_API = "/attempts";

// ===== QUIZ OPERATIONS =====
export const getQuizzes = () => api.get(API_BASE);

export const getQuizById = (id) => api.get(`${API_BASE}/${id}`);

export const createQuiz = (data) => api.post(API_BASE, data);

export const updateQuiz = (id, data) =>
  api.put(`${API_BASE}/${id}`, data);

export const deleteQuiz = (id) =>
  api.delete(`${API_BASE}/${id}`);

export const addQuestionsToQuiz = (quizId, questionIds) =>
  api.post(`${API_BASE}/${quizId}/questions`, { questionIds });

// ===== ATTEMPT OPERATIONS (Thu thập câu trả lời) =====

// Bắt đầu làm quiz
export const startAttempt = (quizId) =>
  api.post(`${ATTEMPTS_API}/start`, { quiz_id: quizId });

// Cập nhật một câu trả lời
export const submitAnswer = (attemptId, questionId, answerId) =>
  api.put(`${ATTEMPTS_API}/${attemptId}/answer`, {
    question_id: questionId,
    answer_id: answerId,
  });

// Cập nhật tất cả câu trả lời cùng lúc
export const submitAllAnswers = (attemptId, answers) =>
  api.put(`${ATTEMPTS_API}/${attemptId}/answers`, { answers });

// Nộp bài (hoàn thiện và tính điểm) - DÙNG CHO BACKEND HIỆN TẠI
export const submitQuiz = (quizId, answers) =>
  api.post(`${API_BASE}/${quizId}/submit`, { answers });

// Nộp bài (hoàn thiện và tính điểm)
export const submitAttempt = (attemptId) =>
  api.put(`${ATTEMPTS_API}/${attemptId}/submit`);

// Lấy chi tiết lần làm bài
export const getAttemptById = (attemptId) =>
  api.get(`${ATTEMPTS_API}/${attemptId}`);

// Lấy tất cả câu trả lời của lần làm bài
export const getAttemptAnswers = (attemptId) =>
  api.get(`${ATTEMPTS_API}/${attemptId}/answers`);

// Lấy dữ liệu review chi tiết (điểm + đáp án đúng/sai từng câu)
export const getAttemptReview = (attemptId) =>
  api.get(`${ATTEMPTS_API}/${attemptId}/review`);

// Lấy danh sách lần làm bài của user
export const getUserAttempts = (userId) =>
  api.get(`${ATTEMPTS_API}/user/${userId}`);