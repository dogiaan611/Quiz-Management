const express = require("express");
const { body } = require("express-validator");
const { 
    createQuiz, 
    addQuestionsToQuiz, 
    getAllQuizzes, 
    getQuizById 
} = require("../controllers/quizController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Lấy tất cả quiz (Công khai)
router.get("/quizzes", getAllQuizzes);

// Lấy chi tiết 1 quiz (Công khai hoặc có thể thêm authenticate nếu muốn)
router.get("/quizzes/:quizId", getQuizById);

router.post(
    "/quizzes",
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

router.post(
    "/quizzes/:quizId/questions",
    authenticate,
    authorize("admin", "teacher"),
    addQuestionsToQuiz
);

module.exports = router;
