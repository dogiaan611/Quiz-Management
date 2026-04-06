const { Quiz } = require("../models");

// Đối tượng lưu trữ thời gian của các quiz đang diễn ra
const activeTimers = {};

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // 1. Join vào room theo QuizId
        socket.on("joinQuiz", (quizId) => {
            socket.join(quizId);
            console.log(`👤 Client ${socket.id} joined quiz: ${quizId}`);

            // Gửi thời gian hiện tại nếu quiz đã bắt đầu
            if (activeTimers[quizId]) {
                socket.emit("timerUpdate", activeTimers[quizId]);
            }
        });

        // Khởi tạo thời gian làm bài
        socket.on("startQuiz", async (quizId) => {
            try {
                // Kiểm tra nếu quiz đã có timer rồi thì không khởi tạo lại
                if (activeTimers[quizId]) return;

                const quiz = await Quiz.findById(quizId);
                if (!quiz || !quiz.time_limit) return;

                // Quy đổi từ phút sang giây
                let remainingTime = quiz.time_limit * 60;
                activeTimers[quizId] = remainingTime;

                console.log(`⏱️ Started timer for quiz ${quizId}: ${remainingTime}s`);

                // Thông báo cho tất cả user trong room là quiz đã bắt đầu
                io.to(quizId).emit("timerStarted", remainingTime);

            } catch (error) {
                console.error("❌ Error starting quiz timer:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};
