const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const User = require("./src/models/User");

const promoteUser = async () => {
    try {
        // TRỰC TIẾP ĐIỀN ĐỊA CHỈ MONGO VỚI TÊN DB CHUẨN (CÓ DẤU GẠCH DƯỚI _)
        const uri = "mongodb://127.0.0.1:27017/quiz_management";
        
        await mongoose.connect(uri);
        console.log(`✅ Đã kết nối tới Database: ${mongoose.connection.name}`);

        const userInfo = "huy@gmail.com";

        const user = await User.findOneAndUpdate(
            { $or: [{ email: userInfo }, { username: userInfo }] },
            { role: "admin" },
            { returnDocument: "after" }
        );

        if (user) {
            console.log(`🚀 Chúc mừng! User ${user.email} (${user.username}) đã được nâng cấp lên: ${user.role.toUpperCase()}`);
        } else {
            console.log(`❌ Không tìm thấy User với thông tin: ${userInfo}`);
            const allUsers = await User.find({}, "username email role");
            console.log("\n--- Danh sách User đang có trong DB ---");
            allUsers.forEach(u => console.log(`👉 Username: ${u.username} | Email: ${u.email} | Role: ${u.role}`));
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error("❌ Lỗi khi nâng cấp User:", error);
    }
};

promoteUser();
