const express = require("express");
const { body } = require("express-validator");
const { createQuiz } = require("../controllers/quizController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
    "/quizzes",
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

module.exports = router;
