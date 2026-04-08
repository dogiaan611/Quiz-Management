const express = require("express");
const {
    startAttempt,
    saveAnswer,
    submitAttempt,
    getAttemptById
} = require("../controllers/attemptController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

// Bắt đầu làm quiz
router.post("/start", authenticate, startAttempt);

// Lưu một câu trả lời
router.put("/:attemptId/answer", authenticate, saveAnswer);

// Nộp bài và chấm điểm
router.put("/:attemptId/submit", authenticate, submitAttempt);

// Lấy chi tiết bài làm
router.get("/:attemptId", authenticate, getAttemptById);

module.exports = router;
