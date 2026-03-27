const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./src/config/database");

const app = express();

app.use(cors());
app.use(express.json());

// Kiểm tra và kết nối MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api", require("./src/routes/quizRoutes"));
app.use("/api/questions", require("./src/routes/questionRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Quiz Management API is running 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
