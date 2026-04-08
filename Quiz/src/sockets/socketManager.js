const { Quiz } = require("../models");

// Đối tượng lưu trữ thời gian của các quiz đang diễn ra
const activeTimers = {};
// Đối tượng lưu trữ các interval để quản lý việc đếm ngược
const timerIntervals = {};

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Join vào room theo QuizId
        socket.on("joinQuiz", (quizId) => {
            socket.join(quizId);
            console.log(`👤 Client ${socket.id} joined quiz: ${quizId}`);

            // Gửi thời gian hiện tại nếu quiz đã bắt đầu
            if (activeTimers[quizId]) {
                socket.emit("timerUpdate", activeTimers[quizId]);
            }
        });

        // Khởi tạo và đồng bộ thời gian làm bài
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
                io.to(quizId).emit("timerStarted", remainingTime);

                // Task CCVNNPTPM-74: Logic đếm ngược và đồng bộ thời gian thực cho toàn bộ room
                timerIntervals[quizId] = setInterval(() => {
                    if (activeTimers[quizId] > 0) {
                        activeTimers[quizId]--;

                        // Broadcast thời gian mới cho mọi người trong phòng
                        io.to(quizId).emit("timerUpdate", activeTimers[quizId]);
                    } else {
                        // Khi hết giờ: dừng bộ đếm và thông báo
                        clearInterval(timerIntervals[quizId]);
                        delete activeTimers[quizId];
                        delete timerIntervals[quizId];

                        io.to(quizId).emit("timerFinished");
                        console.log(`🏁 Timer finished for quiz: ${quizId}`);
                    }
                }, 1000);

            } catch (error) {
                console.error("❌ Error starting quiz timer:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};
