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
router.post("/manual", authenticate, authorize("admin", "teacher"), createManualQuestion);

/**
 * @route GET /api/questions/quiz/:quizId
 * @desc Lấy danh sách câu hỏi của một Quiz
 * @access Private/Public
 */
router.get("/quiz/:quizId", getQuizQuestions);

/**
 * @route POST /api/questions/import
 * @desc API Upload file Excel (.xlsx)
 * @access Private (Teacher/Admin)
 */
router.post("/import", authenticate, authorize("admin", "teacher"), upload.single("file"), importQuestionsFromFile);

/**
 * @route GET /api/questions/template
 * @desc API Tải file Excel mẫu (.xlsx)
 */
router.get("/template", downloadTemplate);

module.exports = router;
