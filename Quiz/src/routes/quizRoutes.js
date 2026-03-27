const express = require("express");
const { body } = require("express-validator");
const { 
    createQuiz, 
    checkQuizCode, 
    joinQuiz 
} = require("../controllers/quizController");

const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * ✅ Tạo quiz
 * POST /api/quizzes
 */
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

/**
 * ✅ Check mã
 * POST /api/quizzes/check-code
 */
router.post(
    "/check-code",
    [
        body("code")
            .trim()
            .notEmpty().withMessage("Mã quiz không được để trống"),
    ],
    checkQuizCode
);

/**
 * ✅ Join quiz
 * POST /api/quizzes/join
 */
router.post(
    "/join",
    [
        body("code")
            .trim()
            .notEmpty().withMessage("Mã quiz không được để trống"),
    ],
    joinQuiz
);

module.exports = router;