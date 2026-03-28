const { Quiz } = require("../models");
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
            if (!existingQuiz) {
                isCodeUnique = true;
            }
        }

        const quizData = {
            title,
            description,
            time_limit,
            max_attempts,
            start_time,
            end_time,
            created_by,
            access_code,
        };

        const quiz = await Quiz.create(quizData);

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
 * Thêm các câu hỏi vào quiz dựa trên danh sách question ID
 * POST /api/quizzes/:quizId/questions
 */
const addQuestionsToQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { questionIds } = req.body; // Expecting an array of question IDs

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ message: "Danh sách question IDs không hợp lệ." });
    }

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy quiz." });
        }

        // Kiểm tra quyền sở hữu (chỉ cho phép teacher/admin tạo quiz đó mới có quyền sửa)
        if (quiz.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa quiz này." });
        }

        // Kiểm tra tính hợp lệ của questionIds nếu cần thiết (ví dụ: tất cả IDs phải tồn tại)
        // const existingQuestionsCount = await Question.countDocuments({ _id: { $in: questionIds } });
        // if (existingQuestionsCount !== questionIds.length) {
        //     return res.status(400).json({ message: "Một số câu hỏi không tồn tại." });
        // }

        // Chuyển mảng questions của quiz về string để dễ dàng filter (nếu mong muốn check trùng lặp)
        const currentQuestionIds = quiz.questions.map(id => id.toString());
        const newQuestions = questionIds.filter(id => !currentQuestionIds.includes(id));
        
        if (newQuestions.length === 0) {
            return res.status(400).json({ message: "Tất cả các câu hỏi này đã có trong quiz." });
        }

        quiz.questions.push(...newQuestions);
        await quiz.save();

        return res.status(200).json({
            message: "Thêm câu hỏi vào quiz thành công",
            added_count: newQuestions.length,
            quiz,
        });
    } catch (error) {
        console.error("Add questions to quiz error:", error);
        return res.status(500).json({ message: "Lỗi server khi thêm câu hỏi vào quiz" });
    }
};

/**
 * Lấy tất cả quiz
 * GET /api/quizzes
 */
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate("created_by", "username email");
        return res.status(200).json({ quizzes });
    } catch (error) {
        console.error("Get all quizzes error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách quiz" });
    }
};

/**
 * Lấy chi tiết một quiz bao gồm câu hỏi và câu trả lời
 * GET /api/quizzes/:quizId
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

        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy quiz." });
        }

        return res.status(200).json({ quiz });
    } catch (error) {
        console.error("Get quiz by id error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy thông tin quiz" });
    }
};

module.exports = {
    createQuiz,
    addQuestionsToQuiz,
    getAllQuizzes,
    getQuizById,
};
