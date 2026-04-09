const express = require("express");
const { body } = require("express-validator");
const { register, login, googleAuth, googleCallback } = require("../controllers/authController");

const router = express.Router();

router.post(
    "/register",
    [
        body("username")
            .trim()
            .notEmpty().withMessage("Username không được để trống")
            .isLength({ min: 3, max: 50 }).withMessage("Username phải từ 3-50 ký tự"),
        body("email")
            .trim()
            .notEmpty().withMessage("Email không được để trống")
            .isEmail().withMessage("Email không hợp lệ")
            .normalizeEmail(),
        body("password")
            .notEmpty().withMessage("Password không được để trống")
            .isLength({ min: 6 }).withMessage("Password phải có ít nhất 6 ký tự"),
    ],
    register
);

router.post(
    "/login",
    [
        body("email")
            .trim()
            .notEmpty().withMessage("Email không được để trống")
            .isEmail().withMessage("Email không hợp lệ")
            .normalizeEmail(),
        body("password")
            .notEmpty().withMessage("Password không được để trống"),
    ],
    login
);

// Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

module.exports = router;
