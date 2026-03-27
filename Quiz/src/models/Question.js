const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["multiple_choice", "true_false"],
            default: "multiple_choice",
        },
        image_url: {
            type: String,
            default: null,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual for answers associated with this question
questionSchema.virtual("answers", {
    ref: "Answer",
    localField: "_id",
    foreignField: "question_id",
});

module.exports = mongoose.model("Question", questionSchema);
