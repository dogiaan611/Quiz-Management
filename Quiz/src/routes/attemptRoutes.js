const express = require("express");
const {
    startAttempt,
    submitAnswer,
    submitAllAnswers,
    submitAttempt,
    getAttemptById,
    getUserAttempts,
    getAttemptAnswers
} = require("../controllers/attemptController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// Bắt đầu một lần làm quiz mới
router.post(
    "/attempts/start",
    authenticate,
    startAttempt
);

// Thu thập một câu trả lời
router.put(
    "/attempts/:attemptId/answer",
    authenticate,
    submitAnswer
);

// Thu thập tất cả các câu trả lời
router.put(
    "/attempts/:attemptId/answers",
    authenticate,
    submitAllAnswers
);

// Nộp bài quiz
router.put(
    "/attempts/:attemptId/submit",
    authenticate,
    submitAttempt
);

// Lấy chi tiết một lần làm bài
router.get(
    "/attempts/:attemptId",
    authenticate,
    getAttemptById
);

// Lấy tất cả các câu trả lời của một lần làm bài
router.get(
    "/attempts/:attemptId/answers",
    authenticate,
    getAttemptAnswers
);

// Lấy tất cả các lần làm bài của một user
router.get(
    "/attempts/user/:userId",
    authenticate,
    getUserAttempts
);

module.exports = router;
