const { User, Attempt, Quiz, Question } = require("../models");

/**
 * Lấy thống kê tổng hợp cho Admin Dashboard
 */
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalQuizzes = await Quiz.countDocuments();
        const totalAttempts = await Attempt.countDocuments({ status: "submitted" });
        
        // Tính điểm trung bình (trên thang điểm 10)
        const averageScoreResult = await Attempt.aggregate([
            { $match: { status: "submitted" } },
            { $group: { _id: null, avgScore: { $avg: "$score" } } }
        ]);
        const averageScore = averageScoreResult.length > 0 ? averageScoreResult[0].avgScore.toFixed(1) : 0;

        // Hoạt động hôm nay
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayAttempts = await Attempt.countDocuments({
            submitted_at: { $gte: startOfToday }
        });

        // Hoạt động gần đây (5 lần nộp bài mới nhất)
        const recentActivities = await Attempt.find({ status: "submitted" })
            .sort({ submitted_at: -1 })
            .limit(5)
            .populate("user_id", "username")
            .populate("quiz_id", "title");

        return res.status(200).json({
            stats: {
                totalUsers,
                totalQuizzes,
                totalAttempts,
                averageScore,
                todayAttempts
            },
            recentActivities: recentActivities.map(act => ({
                id: act._id,
                username: act.user_id?.username || "Ẩn danh",
                quizTitle: act.quiz_id?.title || "Quiz đã xóa",
                time: act.submitted_at
            }))
        });
    } catch (error) {
        console.error("Get stats error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
    }
};

/**
 * Quản lý Users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(id, { username, role, isActive }, { new: true }).select("-password");
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    getStats,
    getAllUsers,
    updateUser
};
