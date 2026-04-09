const { Quiz } = require("../models");

// Theo dõi trạng thái quiz đang chạy
const activeQuizzes = {}; 
// Theo dõi danh sách học sinh trong phòng chờ: { quizId: [{ id, name, socketId }] }
const lobbies = {};

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        /**
         * 1. HỌC SINH VÀO PHÒNG CHỜ (LOBBY)
         */
        socket.on("joinLobby", ({ quizId, user }) => {
            if (!quizId || !user) return;

            if (!lobbies[quizId]) {
                lobbies[quizId] = [];
            }

            // Xoá socket cũ của User này nếu có (đề phòng chiếm chỗ)
            lobbies[quizId] = lobbies[quizId].filter(p => p.id !== user.id);
            
            // Thêm người dùng mới
            const newUser = { ...user, socketId: socket.id };
            lobbies[quizId].push(newUser);
            
            socket.join(`lobby_${quizId}`);
            
            console.log(`[LOBBY] User ${user.name} joined lobby for Quiz: ${quizId}`);
            
            // Phát bản tin cập nhật cho mọi người trong lobby
            io.to(`lobby_${quizId}`).emit("lobbyUpdate", lobbies[quizId]);
        });

        // Lấy trạng thái lobby hiện tại
        socket.on("getLobbyState", ({ quizId }) => {
            if (lobbies[quizId]) {
                socket.emit("lobbyUpdate", lobbies[quizId]);
            }
        });

        // 🚪 THOÁT PHÒNG CHỜ CHỦ ĐỘNG
        socket.on("leaveLobby", ({ quizId, userId }) => {
            if (lobbies[quizId]) {
                lobbies[quizId] = lobbies[quizId].filter(p => p.id !== userId);
                console.log(`[LOBBY] User ${userId} requested leave from ${quizId}`);
                io.to(`lobby_${quizId}`).emit("lobbyUpdate", lobbies[quizId]);
            }
            socket.leave(`lobby_${quizId}`);
        });

        /**
         * 2. GIÁO VIÊN BẮT ĐẦU QUIZ
         */
        socket.on("startQuizByHost", async ({ quizId }) => {
            const lobbyRoom = `lobby_${quizId}`;
            const quizRoom = `quiz_${quizId}`;

            try {
                const quiz = await Quiz.findById(quizId);
                if (!quiz) return;

                // Nếu quiz chưa có bộ đếm chạy, bắt đầu chạy
                if (!activeQuizzes[quizId]) {
                    console.log(`🚀 Quiz ${quizId} started by host!`);
                    
                    // Thông báo cho tất cả học sinh trong lobby chuyển sang trang làm bài
                    io.to(lobbyRoom).emit("quizStartedByHost");

                    let remainingTime = quiz.time_limit * 60;
                    activeQuizzes[quizId] = {
                        remainingTime,
                        interval: null
                    };

                    activeQuizzes[quizId].interval = setInterval(() => {
                        if (activeQuizzes[quizId].remainingTime > 0) {
                            activeQuizzes[quizId].remainingTime--;
                            // Gửi thời gian đồng bộ cho mọi người trong phòng QUIZ
                            io.to(quizRoom).emit("timerUpdate", activeQuizzes[quizId].remainingTime);
                        } else {
                            clearInterval(activeQuizzes[quizId].interval);
                            delete activeQuizzes[quizId];
                            io.to(quizRoom).emit("timerFinished");
                            console.log(`🏁 Quiz ${quizId} finished.`);
                        }
                    }, 1000);
                }
            } catch (error) {
                console.error("❌ Error starting synchronized quiz:", error);
            }
        });

        /**
         * 3. CHUYỂN TỪ PHÒNG CHỜ SANG PHÒNG THI
         */
        socket.on("joinQuizRoom", ({ quizId }) => {
            const quizRoom = `quiz_${quizId}`;
            socket.join(quizRoom);
            
            // Gửi thời gian hiện tại ngay khi học sinh join vào (trường hợp join trễ)
            if (activeQuizzes[quizId]) {
                socket.emit("timerUpdate", activeQuizzes[quizId].remainingTime);
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
            
            // Xoá học sinh khỏi các lobby
            for (const quizId in lobbies) {
                const initialCount = lobbies[quizId].length;
                lobbies[quizId] = lobbies[quizId].filter(p => p.socketId !== socket.id);
                
                if (lobbies[quizId].length !== initialCount) {
                    console.log(`[LOBBY] User removed from lobby: ${quizId}`);
                    io.to(`lobby_${quizId}`).emit("lobbyUpdate", lobbies[quizId]);
                }
            }
        });
    });
};
