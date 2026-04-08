import api from "./axios";

const API_BASE = "/questions";

export const getQuizQuestions = (quizId) => 
  api.get(`${API_BASE}/quiz/${quizId}?showCorrect=true`);

export const createManualQuestion = (data) => 
  api.post(`${API_BASE}/manual`, data);

export const importQuestions = (quizId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("quiz_id", quizId);
  formData.append("commit", "true");
  
  return api.post(`${API_BASE}/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const downloadTemplate = () => 
  api.get(`${API_BASE}/template`, { responseType: "blob" });
