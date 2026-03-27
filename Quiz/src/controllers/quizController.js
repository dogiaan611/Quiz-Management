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
 * ✅ BƯỚC 2: Kiểm tra mã Quiz
 * POST /api/quizzes/check-code
 */
const checkQuizCode = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Thiếu mã quiz" });
        }

        const quiz = await Quiz.findOne({
            access_code: code.toUpperCase(),
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Mã quiz không tồn tại",
            });
        }

        // ❗ chưa publish thì không cho vào
        if (!quiz.is_published) {
            return res.status(400).json({
                message: "Quiz chưa được mở",
            });
        }

        const now = new Date();

        // ❗ check thời gian
        if (quiz.start_time && now < quiz.start_time) {
            return res.status(400).json({
                message: "Quiz chưa bắt đầu",
            });
        }

        if (quiz.end_time && now > quiz.end_time) {
            return res.status(400).json({
                message: "Quiz đã kết thúc",
            });
        }

        return res.status(200).json({
            message: "Mã hợp lệ",
            quizId: quiz._id,
            title: quiz.title,
            time_limit: quiz.time_limit,
        });
    } catch (error) {
        console.error("Check quiz code error:", error);
        return res.status(500).json({
            message: "Lỗi server",
        });
    }
};

/**
 * ✅ BƯỚC 3: Tham gia Quiz
 * POST /api/quizzes/join
 */
const joinQuiz = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Thiếu mã quiz" });
        }

        const quiz = await Quiz.findOne({
            access_code: code.toUpperCase(),
        })
        .populate({
            path: "questions",
            select: "-correct_answer", // ❗ ẩn đáp án đúng
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Mã quiz không tồn tại",
            });
        }

        if (!quiz.is_published) {
            return res.status(400).json({
                message: "Quiz chưa mở",
            });
        }

        const now = new Date();

        if (quiz.start_time && now < quiz.start_time) {
            return res.status(400).json({
                message: "Chưa tới giờ làm bài",
            });
        }

        if (quiz.end_time && now > quiz.end_time) {
            return res.status(400).json({
                message: "Đã hết giờ",
            });
        }

        return res.status(200).json({
            message: "Tham gia thành công",
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                time_limit: quiz.time_limit,
                questions: quiz.questions,
            },
        });
    } catch (error) {
        console.error("Join quiz error:", error);
        return res.status(500).json({
            message: "Lỗi server",
        });
    }
};

module.exports = {
    createQuiz,
    checkQuizCode, // 👈 thêm
    joinQuiz,      // 👈 thêm
};