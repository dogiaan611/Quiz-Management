const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            maxLength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Vui lòng nhập email hợp lệ"],
        },
        password: {
            type: String,
            default: null,
        },
        googleId: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["admin", "teacher", "student"],
            default: "student",
        },
        avatar: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
