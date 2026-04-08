/**
 * Quiz API Utility Functions
 * Giúp gọi các API liên quan đến quiz từ frontend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Gửi dữ liệu bài làm lên backend
 * @param {string} quizId - ID của quiz
 * @param {Array} answers - Mảng các câu trả lời [{question_id, answer_id}]
 * @param {string} token - JWT token của user
 * @returns {Promise} - Kết quả nộp bài
 * 
 * @example
 * const result = await submitQuiz('quiz123', [
 *   { question_id: 'q1', answer_id: 'a1' },
 *   { question_id: 'q2', answer_id: null } // bỏ qua câu hỏi
 * ], 'eyJhbGc...');
 */
export const submitQuiz = async (quizId, answers, token) => {
    if (!quizId) {
        throw new Error("Quiz ID không được để trống");
    }

    if (!Array.isArray(answers)) {
        throw new Error("Answers phải là một mảng");
    }

    if (!token) {
        throw new Error("Token không được để trống");
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/quizzes/${quizId}/submit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ answers }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Lỗi khi nộp bài");
        }

        return data;
    } catch (error) {
        console.error("Submit quiz error:", error);
        throw error;
    }
};

/**
 * Lấy tất cả quiz
 * @param {string} token - JWT token (optional, nếu cần)
 * @returns {Promise} - Danh sách các quiz
 */
export const getAllQuizzes = async (token = null) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/quizzes`, { headers });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Lỗi khi lấy danh sách quiz");
        }

        return data;
    } catch (error) {
        console.error("Get all quizzes error:", error);
        throw error;
    }
};

/**
 * Lấy chi tiết một quiz
 * @param {string} quizId - ID của quiz
 * @param {string} token - JWT token (optional)
 * @returns {Promise} - Chi tiết quiz
 */
export const getQuizById = async (quizId, token = null) => {
    if (!quizId) {
        throw new Error("Quiz ID không được để trống");
    }

    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Lỗi khi lấy chi tiết quiz");
        }

        return data;
    } catch (error) {
        console.error("Get quiz by id error:", error);
        throw error;
    }
};

/**
 * Lấy thông tin user từ localStorage
 * @returns {Object} - User info {id, token, etc}
 */
export const getUserInfo = () => {
    try {
        const userInfo = localStorage.getItem("user");
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
        console.error("Get user info error:", error);
        return null;
    }
};

/**
 * Lấy token từ localStorage
 * @returns {string} - JWT token
 */
export const getToken = () => {
    return localStorage.getItem("token");
};
