import api from './api';

const quizService = {
  create: async (quizData) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addQuestions: async (quizId, questions) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/questions`, { questions });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createQuestion: async (questionData) => {
    try {
      const response = await api.post('/questions/manual', questionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAll: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default quizService;
