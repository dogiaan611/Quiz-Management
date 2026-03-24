const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        is_correct: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: false,
    }
);

module.exports = mongoose.model("Answer", answerSchema);
