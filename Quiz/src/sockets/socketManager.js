module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Placeholder for timer logic (CCVNNPTPM-72/73)
        // Ví dụ: join vào room quizId
        socket.on("joinQuiz", (quizId) => {
            socket.join(quizId);
            console.log(`👤 Client ${socket.id} joined quiz: ${quizId}`);
        });

        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};
