const express = require("express");
const { body } = require("express-validator");
const { 
    createQuiz, 
    addQuestionsToQuiz, 
    getAllQuizzes, 
    getQuizById,
    checkQuizCode,
    joinQuiz
} = require("../controllers/quizController");

const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Lấy tất cả quiz
router.get("/", getAllQuizzes);

// 🔹 Lấy chi tiết quiz
router.get("/:quizId", getQuizById);

// 🔹 Tạo quiz
router.post(
    "/",
    authenticate,
    authorize("admin", "teacher"),
    [
        body("title")
            .trim()
            .notEmpty().withMessage("Tiêu đề không được để trống")
            .isLength({ max: 200 }).withMessage("Tiêu đề tối đa 200 ký tự"),
    ],
    createQuiz
);

// 🔹 Thêm câu hỏi
router.post(
    "/:quizId/questions",
    authenticate,
    authorize("admin", "teacher"),
    addQuestionsToQuiz
);

// 🔥 CHECK MÃ QUIZ
router.post(
    "/check-code",
    body("code").notEmpty().withMessage("Mã không được để trống"),
    checkQuizCode
);

// 🔥 THAM GIA QUIZ
router.post(
    "/join",
    body("code").notEmpty().withMessage("Mã không được để trống"),
    joinQuiz
);

module.exports = router;