const express = require("express");
const { createManualQuestion, getQuizQuestions } = require("../controllers/questionController");

const router = express.Router();

/**
 * @route POST /api/questions/manual
 * @desc Tạo câu hỏi thủ công cho một Quiz
 * @access Private (Teacher/Admin)
 */
router.post("/manual", createManualQuestion);

/**
 * @route GET /api/questions/quiz/:quizId
 * @desc Lấy danh sách câu hỏi của một Quiz
 * @access Private/Public
 */
router.get("/quiz/:quizId", getQuizQuestions);

module.exports = router;
