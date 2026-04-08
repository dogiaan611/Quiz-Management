const express = require("express");
const { createManualQuestion, getQuizQuestions, importQuestionsFromFile, downloadTemplate } = require("../controllers/questionController");
const upload = require("../middlewares/uploadMiddleware");

const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @route POST /api/questions/manual
 * @desc Tạo câu hỏi thủ công cho một Quiz
 * @access Private (Teacher/Admin)
 */
router.post("/manual", authenticate, authorize("teacher", "admin"), createManualQuestion);

/**
 * @route GET /api/questions/quiz/:quizId
 * @desc Lấy danh sách câu hỏi của một Quiz (dành phục vụ làm bài, không có đáp án đúng nếu là SV)
 * @access Private
 */
router.get("/quiz/:quizId", authenticate, getQuizQuestions);

/**
 * @route POST /api/questions/import
 * @desc API Upload file Excel (.xlsx)
 */
router.post("/import", authenticate, authorize("teacher", "admin"), upload.single("file"), importQuestionsFromFile);

/**
 * @route GET /api/questions/template
 * @desc API Tải file Excel mẫu (.xlsx)
 */
router.get("/template", downloadTemplate);

module.exports = router;
