const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Nạp cấu hình từ file .env trong thư mục hiện tại
const connectDB = require("./src/config/database");
const passport = require("./src/config/passport");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Gán io vào request để controllers có thể sử dụng nếu cần
app.set("io", io);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Socket.io connection placeholder
const socketManager = require("./src/sockets/socketManager");
socketManager(io);

// Kiểm tra và kết nối MongoDB
connectDB();
// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/quizzes", require("./src/routes/quizRoutes"));
app.use("/api/questions", require("./src/routes/questionRoutes"));
app.use("/api/attempts", require("./src/routes/attemptRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Quiz Management API is running 🚀" });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
    if (err.code === "INVALID_FILE_TYPE") {
        return res.status(400).json({ message: err.message });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File quá lớn, tối đa 5MB" });
    }
    console.error(err.stack);
    res.status(500).json({ message: "Lỗi hệ thống", error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
