const { Attempt, Quiz, Question, Answer } = require("../models");

/**
 * Bắt đầu làm quiz - tạo Attempt record
 * POST /api/attempts/start
 */
const startAttempt = async (req, res) => {
    const { quiz_id } = req.body;
    const user_id = req.user.id;

    try {
        if (!quiz_id) {
            return res.status(400).json({ message: "Thiếu quiz_id" });
        }

        const quiz = await Quiz.findById(quiz_id);
        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy quiz" });
        }

        // Kiểm tra số lần nộp bài
        if (quiz.max_attempts > 0) {
            const attemptCount = await Attempt.countDocuments({
                quiz_id,
                user_id,
                status: { $in: ["submitted", "timeout"] }
            });

            if (attemptCount >= quiz.max_attempts) {
                return res.status(403).json({
                    message: `Bạn đã hết lượt làm bài. Tối đa ${quiz.max_attempts} lần`
                });
            }
        }

        // Kiểm tra thời gian
        const now = new Date();
        if (quiz.start_time && now < quiz.start_time) {
            return res.status(403).json({ message: "Quiz chưa bắt đầu" });
        }

        if (quiz.end_time && now > quiz.end_time) {
            return res.status(403).json({ message: "Quiz đã kết thúc" });
        }

        // Tạo attempt mới
        const attempt = new Attempt({
            quiz_id,
            user_id,
            status: "in_progress",
            answers: []
        });

        await attempt.save();

        return res.status(201).json({
            attempt_id: attempt._id,
            time_limit: quiz.time_limit || null,
            message: "Bắt đầu làm bài thành công"
        });
    } catch (error) {
        console.error("Start attempt error:", error);
        return res.status(500).json({ message: "Lỗi server khi bắt đầu làm bài" });
    }
};

/**
 * Lưu một câu trả lời
 * PUT /api/attempts/:attemptId/answer
 */
const saveAnswer = async (req, res) => {
    const { attemptId } = req.params;
    const { question_id, answer_id } = req.body;

    try {
        if (!question_id) {
            return res.status(400).json({ message: "Thiếu question_id" });
        }

        const attempt = await Attempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy bài làm" });
        }

        if (attempt.status !== "in_progress") {
            return res.status(403).json({ message: "Bài làm đã hoàn thành" });
        }

        // Tìm hoặc tạo câu trả lời
        const answerIndex = attempt.answers.findIndex(
            ans => ans.question_id.toString() === question_id
        );

        if (answerIndex >= 0) {
            attempt.answers[answerIndex].answer_id = answer_id || null;
        } else {
            attempt.answers.push({
                question_id,
                answer_id: answer_id || null,
                is_correct: false
            });
        }

        await attempt.save();

        return res.status(200).json({
            message: "Lưu câu trả lời thành công",
            attempt_id: attempt._id
        });
    } catch (error) {
        console.error("Save answer error:", error);
        return res.status(500).json({ message: "Lỗi server khi lưu câu trả lời" });
    }
};

/**
 * Nộp bài và chấm điểm
 * PUT /api/attempts/:attemptId/submit
 */
const submitAttempt = async (req, res) => {
    const { attemptId } = req.params;

    try {
        const attempt = await Attempt.findById(attemptId)
            .populate("quiz_id")
            .populate("answers.question_id");

        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy bài làm" });
        }

        if (attempt.status !== "in_progress") {
            return res.status(403).json({ message: "Bài làm đã hoàn thành" });
        }

        // Chấm điểm
        let correctCount = 0;
        const detailedResults = [];

        for (const ans of attempt.answers) {
            let isCorrect = false;

            if (ans.answer_id) {
                const answer = await Answer.findById(ans.answer_id);
                if (answer && answer.is_correct) {
                    isCorrect = true;
                    correctCount++;
                }
            }

            ans.is_correct = isCorrect;

            detailedResults.push({
                question_id: ans.question_id._id,
                question_text: ans.question_id.content,
                answer_id: ans.answer_id,
                is_correct: isCorrect
            });
        }

        // Cập nhật attempt
        const totalQuestions = attempt.quiz_id.questions.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

        attempt.status = "submitted";
        attempt.submitted_at = new Date();
        attempt.score = score;
        attempt.total_questions = totalQuestions;
        attempt.correct_answers = correctCount;

        await attempt.save();

        // Trả về kết quả
        return res.status(200).json({
            message: "Nộp bài thành công",
            attempt_id: attempt._id,
            results: {
                score,
                correct_answers: correctCount,
                total_questions: totalQuestions,
                percentage: `${score}%`,
                details: detailedResults
            }
        });
    } catch (error) {
        console.error("Submit attempt error:", error);
        return res.status(500).json({ message: "Lỗi server khi nộp bài" });
    }
};

/**
 * Lấy chi tiết bài làm
 * GET /api/attempts/:attemptId
 */
const getAttemptById = async (req, res) => {
    const { attemptId } = req.params;

    try {
        const attempt = await Attempt.findById(attemptId)
            .populate("quiz_id", "title description")
            .populate("answers.question_id")
            .populate("answers.answer_id");

        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy bài làm" });
        }

        return res.status(200).json({
            attempt_id: attempt._id,
            quiz_id: attempt.quiz_id._id,
            quiz_title: attempt.quiz_id.title,
            status: attempt.status,
            score: attempt.score,
            submitted_at: attempt.submitted_at,
            results: {
                correct_answers: attempt.correct_answers,
                total_questions: attempt.total_questions,
                percentage: `${attempt.score}%`
            },
            answers: attempt.answers
        });
    } catch (error) {
        console.error("Get attempt by id error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy bài làm" });
    }
};

module.exports = {
    startAttempt,
    saveAnswer,
    submitAttempt,
    getAttemptById
};
