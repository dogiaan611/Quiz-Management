const { Quiz, Attempt } = require("../models");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

/**
 * Tạo quiz mới
 * POST /api/quizzes
 */
const createQuiz = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        description,
        time_limit,
        max_attempts,
        start_time,
        end_time,
    } = req.body;

    const created_by = req.user.id;

    try {
        let access_code;
        let isCodeUnique = false;
        
        while (!isCodeUnique) {
            access_code = crypto.randomBytes(4).toString("hex").toUpperCase(); 
            const existingQuiz = await Quiz.findOne({ access_code });
            if (!existingQuiz) isCodeUnique = true;
        }

        const quiz = await Quiz.create({
            title,
            description,
            time_limit,
            max_attempts,
            start_time,
            end_time,
            created_by,
            access_code,
        });

        return res.status(201).json({
            message: "Tạo quiz thành công",
            quiz,
        });
    } catch (error) {
        console.error("Create quiz error:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo quiz" });
    }
};

/**
 * Thêm câu hỏi vào quiz
 */
const addQuestionsToQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { questionIds } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ message: "Danh sách question IDs không hợp lệ." });
    }

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz." });

        if (quiz.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa quiz này." });
        }

        const currentQuestionIds = quiz.questions.map(id => id.toString());
        const newQuestions = questionIds.filter(id => !currentQuestionIds.includes(id));

        if (newQuestions.length === 0) {
            return res.status(400).json({ message: "Các câu hỏi đã tồn tại." });
        }

        quiz.questions.push(...newQuestions);
        await quiz.save();

        return res.status(200).json({
            message: "Thêm câu hỏi thành công",
            added_count: newQuestions.length,
            quiz,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Lấy tất cả quiz
 */
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate("created_by", "username email");
        return res.status(200).json({ quizzes });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Lấy chi tiết quiz
 */
const getQuizById = async (req, res) => {
    const { quizId } = req.params;

    try {
        const quiz = await Quiz.findById(quizId)
            .populate("created_by", "username email")
            .populate({
                path: "questions",
                populate: { path: "answers" }
            });

        if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz" });

        return res.status(200).json({ quiz });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * 🔥 CHECK MÃ QUIZ
 * POST /api/quizzes/check-code
 */
const checkQuizCode = async (req, res) => {
    const { code } = req.body;

    try {
        const quiz = await Quiz.findOne({ access_code: code });

        if (!quiz) {
            return res.status(404).json({ message: "Mã quiz không tồn tại" });
        }

        if (!quiz.is_published) {
            return res.status(400).json({ message: "Quiz chưa được publish" });
        }

        return res.status(200).json({
            message: "Mã hợp lệ",
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * 🔥 THAM GIA QUIZ
 * POST /api/quizzes/join
 */
const joinQuiz = async (req, res) => {
    const { code } = req.body;

    try {
        const quiz = await Quiz.findOne({ access_code: code });

        if (!quiz) {
            return res.status(404).json({ message: "Mã quiz không tồn tại" });
        }

        return res.status(200).json({
            message: "Tham gia quiz thành công",
            quiz
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * 🔥 NỘP BÀI THI
 * POST /api/quizzes/:quizId/submit
 */
const submitQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body; // Mảng: [{ question_id, answer_id }]
        const userId = req.user.id;

        // 1. Kiểm tra Quiz có tồn tại không
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy Quiz này." });
        }

        // 2. Tạo bản ghi Attempt mới (Lưu câu trả lời - Task 31)
        const attempt = await Attempt.create({
            quiz_id: quizId,
            user_id: userId,
            total_questions: quiz.questions.length,
            status: "submitted",
            submitted_at: new Date(),
            answers: answers || []
        });

        // Task 32: Tính toán điểm sẽ được thực hiện ở bước sau
        
        return res.status(201).json({ 
            message: "Đã lưu câu trả lời thành công",
            attempt_id: attempt._id,
            total_questions: attempt.total_questions,
            status: attempt.status
        });
    } catch (error) {
        console.error("Submit quiz error:", error);
        return res.status(500).json({ message: "Lỗi server khi nộp bài" });
    }
};

module.exports = {
    createQuiz,
    addQuestionsToQuiz,
    getAllQuizzes,
    getQuizById,
    checkQuizCode,
    joinQuiz,
    submitQuiz

};