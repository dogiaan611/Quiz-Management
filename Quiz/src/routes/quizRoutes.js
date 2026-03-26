const express = require("express");
const { body } = require("express-validator");
const { createQuiz } = require("../controllers/quizController");

const router = express.Router();

router.post(
    "/quizzes",
    [
        body("title")
            .trim()
            .notEmpty().withMessage("Tiêu đề không được để trống")
            .isLength({ max: 200 }).withMessage("Tiêu đề tối đa 200 ký tự"),
        body("created_by")
            .notEmpty().withMessage("UserId (created_by) không được để trống"),
    ],
    createQuiz
);

module.exports = router;
