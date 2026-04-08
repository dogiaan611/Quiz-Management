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
    getMyQuizzes,
    updateQuiz,
    deleteQuiz
} = require("../controllers/quizController");

const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// 🔹 Lấy tất cả quiz (Công khai)
router.get("/", getAllQuizzes);

// 🔹 Lấy quiz của tôi (dành cho GV)
router.get("/my-quizzes", authenticate, authorize("admin", "teacher"), getMyQuizzes);

// 🔹 Lấy chi tiết quiz
router.get("/:quizId", getQuizById);

// 🔹 Cập nhật quiz
router.put("/:quizId", authenticate, authorize("admin", "teacher"), updateQuiz);

// 🔹 Xóa quiz
router.delete("/:quizId", authenticate, authorize("admin", "teacher"), deleteQuiz);

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

// 🔥 NỘP BÀI THI
router.post(
    "/:quizId/submit",
    (req, res, next) => {
        // Nếu có Authorization header thì check token, nếu không thì cho qua (guest)
        if (req.headers.authorization) {
            return authenticate(req, res, next);
        }
        next();
    },
    submitQuiz
);

// 🔥 LẤY KẾT QUẢ BÀI LÀM
router.get(
    "/attempts/:attemptId",
    authenticate,
    getAttemptResult
);

module.exports = router;