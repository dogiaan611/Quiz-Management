import axios from "axios";

const API = "http://localhost:5000/api/quizzes";
const QUESTIONS_API = "http://localhost:5000/api/questions";

export const getQuizzes = () => axios.get(API);

export const createQuiz = (data) => axios.post(API, data);

export const updateQuiz = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteQuiz = (id) =>
  axios.delete(`${API}/${id}`);

// Lấy danh sách câu hỏi của một quiz
export const getQuizQuestions = (quizId) =>
  axios.get(`${QUESTIONS_API}/quiz/${quizId}`);