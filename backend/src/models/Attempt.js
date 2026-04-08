const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        quiz_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        started_at: {
            type: Date,
            default: Date.now,
        },
        submitted_at: {
            type: Date,
            default: null,
        },
        score: {
            type: Number,
            default: null,
        },
        total_questions: {
            type: Number,
            default: 0,
        },
        correct_answers: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["in_progress", "submitted", "timeout"],
            default: "in_progress",
        },
        // Mảng các câu trả lời thay thế cho bảng trung gian AttemptAnswer
        answers: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                answer_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Answer",
                    default: null, // null nếu user bỏ qua câu hỏi
                },
                is_correct: {
                    type: Boolean,
                    default: false,
                },
            }
        ],
    },
    {
        timestamps: false,
    }
);

module.exports = mongoose.model("Attempt", attemptSchema);
