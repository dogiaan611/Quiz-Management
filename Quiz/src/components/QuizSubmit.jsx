/**
 * Example React Component - QuizSubmit
 * Ví dụ cách sử dụng API nộp bài
 */

import React, { useState } from "react";
import { submitQuiz, getToken } from "../utils/quizAPI";

const QuizSubmit = ({ quizId, questions }) => {
    // State để lưu trữ các câu trả lời của user
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);

    /**
     * Xử lý khi user chọn một câu trả lời
     */
    const handleAnswerChange = (questionId, answerId) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    /**
     * Gửi bài làm lên server
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Lấy token từ localStorage
            const token = getToken();
            if (!token) {
                throw new Error("Vui lòng đăng nhập");
            }

            // Chuẩn bị mảng answers theo format API
            const submittedAnswers = questions.map((question) => ({
                question_id: question._id,
                answer_id: answers[question._id] || null,
            }));

            // Gọi API nộp bài
            const response = await submitQuiz(quizId, submittedAnswers, token);

            setResult(response.attempt);
            setMessage(`✅ Nộp bài thành công! Điểm của bạn: ${response.attempt.score}/100`);

            // Optional: chuyển đến trang kết quả
            // navigate(`/quiz/${quizId}/result/${response.attempt._id}`);
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="quiz-submit-container">
            <form onSubmit={handleSubmit}>
                {/* Hiển thị các câu hỏi */}
                {questions && questions.length > 0 ? (
                    <div className="questions-list">
                        {questions.map((question, index) => (
                            <div key={question._id} className="question-item">
                                <h4>Câu {index + 1}: {question.content}</h4>

                                {/* Nếu là câu hỏi trắc nghiệm */}
                                {question.type === "multiple_choice" && question.answers && (
                                    <div className="answers-options">
                                        {question.answers.map((answer) => (
                                            <label key={answer._id} className="answer-option">
                                                <input
                                                    type="radio"
                                                    name={`question_${question._id}`}
                                                    value={answer._id}
                                                    checked={answers[question._id] === answer._id}
                                                    onChange={() =>
                                                        handleAnswerChange(question._id, answer._id)
                                                    }
                                                />
                                                <span>{answer.content}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Nếu là câu hỏi đúng/sai */}
                                {question.type === "true_false" && question.answers && (
                                    <div className="answers-options">
                                        {question.answers.map((answer) => (
                                            <label key={answer._id} className="answer-option">
                                                <input
                                                    type="radio"
                                                    name={`question_${question._id}`}
                                                    value={answer._id}
                                                    checked={answers[question._id] === answer._id}
                                                    onChange={() =>
                                                        handleAnswerChange(question._id, answer._id)
                                                    }
                                                />
                                                <span>{answer.content}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Không có câu hỏi trong bài thi này</p>
                )}

                {/* Nút submit */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? "Đang nộp bài..." : "Nộp bài"}
                    </button>
                </div>
            </form>

            {/* Hiển thị thông báo */}
            {message && (
                <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
                    {message}
                </div>
            )}

            {/* Hiển thị kết quả nếu nộp bài thành công */}
            {result && (
                <div className="result-info">
                    <h3>Kết quả bài làm</h3>
                    <p>Điểm: {result.score}/100</p>
                    <p>Trả lời đúng: {result.correct_answers}/{result.total_questions}</p>
                    <p>Thời gian nộp: {new Date(result.submitted_at).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default QuizSubmit;
