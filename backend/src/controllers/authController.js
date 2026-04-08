const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const passport = require("passport");
const { User } = require("../models");

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            const field = existingUser.email === email ? "Email" : "Username";
            return res.status(409).json({ message: `${field} đã được sử dụng` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "Đăng ký thành công",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

const googleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
});

const googleCallback = (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err, userData) => {
        if (err || !userData) {
            return res.status(401).json({ message: "Đăng nhập Google thất bại" });
        }

        try {
            let user = await User.findOne({ email: userData.email });

            if (!user) {
                user = await User.create({
                    username: userData.username,
                    email: userData.email,
                    googleId: userData.googleId,
                    avatar: userData.avatar,
                    password: null,
                });
            } else if (!user.googleId) {
                user.googleId = userData.googleId;
                if (!user.avatar && userData.avatar) {
                    user.avatar = userData.avatar;
                }
                await user.save();
            }

            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            const userDataParams = encodeURIComponent(JSON.stringify({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            }));

            const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
            return res.redirect(`${frontendURL}/auth/success?token=${token}&user=${userDataParams}`);
        } catch (error) {
            console.error("Google callback error:", error);
            const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
            return res.redirect(`${frontendURL}/login?error=google_auth_failed`);
        }
    })(req, res, next);
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const totalAttempts = await Attempt.countDocuments({ user_id: userId, status: "submitted" });
        
        const recentAttempts = await Attempt.find({ user_id: userId, status: "submitted" })
            .sort({ submitted_at: -1 })
            .limit(5)
            .populate("quiz_id", "title");

        const avgScoreResult = await Attempt.aggregate([
            { $match: { user_id: userId, status: "submitted" } },
            { $group: { _id: null, avg: { $avg: "$score" } } }
        ]);
        const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avg.toFixed(1) : 0;

        return res.status(200).json({
            totalAttempts,
            avgScore,
            recentAttempts
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    register,
    login,
    googleAuth,
    googleCallback,
    getMe,
    getUserStats
};
