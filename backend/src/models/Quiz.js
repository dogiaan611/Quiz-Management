const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 200,
        },
        description: {
            type: String,
            default: null,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        access_code: {
            type: String,
            required: true,
            unique: true,
            maxLength: 10,
        },
        time_limit: {
            type: Number, // phút, null = không giới hạn
            default: null,
        },
        max_attempts: {
            type: Number, // 0 = không giới hạn
            default: 0,
        },
        start_time: {
            type: Date,
            default: null,
        },
        end_time: {
            type: Date,
            default: null,
        },
        is_published: {
            type: Boolean,
            default: false,
        },
        // Mảng các Question thay thế cho bảng trung gian QuizQuestion
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
            }
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Quiz", quizSchema);
