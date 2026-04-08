const express = require("express");
const { startAttempt, submitAttempt } = require("../controllers/attemptController");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @route POST /api/attempts/start/:quizId
 * @desc Bắt đầu một lượt làm bài
 */
router.post("/start/:quizId", authenticate, startAttempt);

/**
 * @route POST /api/attempts/submit/:attemptId
 * @desc Nộp kết quả làm bài và chấm điểm
 */
router.post("/submit/:attemptId", authenticate, submitAttempt);

module.exports = router;
