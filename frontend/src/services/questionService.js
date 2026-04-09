import api from "./axios";

const API_BASE = "/questions";

export const createManualQuestion = (data) => api.post(`${API_BASE}/manual`, data);

export const getAllQuestions = () => api.get(API_BASE);

export const getQuizQuestions = (quizId, showCorrect = false) => 
    api.get(`${API_BASE}/quiz/${quizId}${showCorrect ? '?showCorrect=true' : ''}`);

export const importQuestionsFromFile = (formData) => 
    api.post(`${API_BASE}/import`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const downloadTemplate = () => 
    api.get(`${API_BASE}/template`, { responseType: 'blob' });

export const deleteQuestion = (questionId) => 
    api.delete(`${API_BASE}/${questionId}`);
