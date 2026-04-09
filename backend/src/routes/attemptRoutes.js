const express = require("express");
const {
    startAttempt,
    submitAnswer,
    submitAllAnswers,
    submitAttempt,
    getAttemptById,
    getUserAttempts,
    getAttemptAnswers,
    getAttemptReview
} = require("../controllers/attemptController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// Bắt đầu một lần làm quiz mới
router.post(
    "/start",
    authenticate,
    startAttempt
);

// Thu thập một câu trả lời
router.put(
    "/:attemptId/answer",
    authenticate,
    submitAnswer
);

// Thu thập tất cả các câu trả lời
router.put(
    "/:attemptId/answers",
    authenticate,
    submitAllAnswers
);

// Nộp bài quiz
router.put(
    "/:attemptId/submit",
    authenticate,
    submitAttempt
);

// Lấy dữ liệu review chi tiết (điểm + đáp án đúng/sai từng câu)
router.get(
    "/:attemptId/review",
    authenticate,
    getAttemptReview
);

// Lấy chi tiết một lần làm bài
router.get(
    "/:attemptId",
    authenticate,
    getAttemptById
);

// Lấy tất cả các câu trả lời của một lần làm bài
router.get(
    "/:attemptId/answers",
    authenticate,
    getAttemptAnswers
);

// Lấy tất cả các lần làm bài của một user
router.get(
    "/user/:userId",
    authenticate,
    getUserAttempts
);

module.exports = router;
