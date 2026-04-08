const { Quiz } = require("../models");

// Lưu trữ timer theo key: quizId_userId
const activeTimers = {};
const timerIntervals = {};

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Join theo phòng cá nhân: quizId_userId
        socket.on("joinQuiz", ({ quizId, userId }) => {
            const roomName = `${quizId}_${userId}`;
            socket.join(roomName);
            console.log(`👤 User ${userId} joined room: ${roomName}`);

            // Nếu đã có timer đang chạy cho user này trong quiz này, gửi cho họ
            if (activeTimers[roomName]) {
                socket.emit("timerUpdate", activeTimers[roomName]);
            }
        });

        // Khởi tạo timer cá nhân
        socket.on("startQuiz", async ({ quizId, userId }) => {
            const roomName = `${quizId}_${userId}`;
            try {
                // Xoá timer cũ nếu có (để phục vụ tính năng retry/làm lại từ đầu)
                if (timerIntervals[roomName]) {
                    clearInterval(timerIntervals[roomName]);
                }

                const quiz = await Quiz.findById(quizId);
                if (!quiz || !quiz.time_limit) return;

                let remainingTime = quiz.time_limit * 60;
                activeTimers[roomName] = remainingTime;

                console.log(`⏱️ Individual timer started for ${roomName}: ${remainingTime}s`);
                io.to(roomName).emit("timerStarted", remainingTime);

                timerIntervals[roomName] = setInterval(() => {
                    if (activeTimers[roomName] > 0) {
                        activeTimers[roomName]--;
                        io.to(roomName).emit("timerUpdate", activeTimers[roomName]);
                    } else {
                        clearInterval(timerIntervals[roomName]);
                        delete activeTimers[roomName];
                        delete timerIntervals[roomName];

                        io.to(roomName).emit("timerFinished");
                        console.log(`🏁 Timer finished for: ${roomName}`);
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
