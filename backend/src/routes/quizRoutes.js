const express = require("express");
const { body } = require("express-validator");
const { 
    createQuiz, 
    addQuestionsToQuiz, 
    getAllQuizzes, 
    getQuizById,
    checkQuizCode,
    joinQuiz,
    submitQuiz,
    getAttemptResult,
    deleteQuiz,
    updateQuiz
} = require("../controllers/quizController");

const { authenticate, authorize, optionalAuthenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Lấy tất cả quiz (Yêu cầu đăng nhập để lọc theo role)
router.get("/", authenticate, getAllQuizzes);

// 🔹 Lấy chi tiết quiz
router.get("/:quizId", optionalAuthenticate, getQuizById);

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

// 🔹 Sửa quiz
router.put(
    "/:quizId",
    authenticate,
    authorize("admin", "teacher"),
    updateQuiz
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

// 🔥 NỘP BÀI THI
router.post(
    "/:quizId/submit",
    authenticate,
    submitQuiz
);

// 🔥 LẤY KẾT QUẢ BÀI LÀM
router.get(
    "/attempts/:attemptId",
    authenticate,
    getAttemptResult
);

// 🔥 XOÁ QUIZ
router.delete(
    "/:quizId",
    authenticate,
    authorize("admin", "teacher"),
    deleteQuiz
);

module.exports = router;