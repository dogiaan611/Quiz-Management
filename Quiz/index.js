const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize, syncDB } = require("./src/models");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Quiz Management API is running 🚀" });
});

// Kết nối DB và sync bảng rồi mới khởi động server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected!");

    await syncDB();

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
