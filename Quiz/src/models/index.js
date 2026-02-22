const sequelize = require("../config/database");

const User = require("./User");
const Question = require("./Question");
const Answer = require("./Answer");
const Quiz = require("./Quiz");
const QuizQuestion = require("./QuizQuestion");
const Attempt = require("./Attempt");
const AttemptAnswer = require("./AttemptAnswer");

// =============================================
// ASSOCIATIONS
// =============================================

// User tạo Questions
User.hasMany(Question, { foreignKey: "created_by", as: "questions" });
Question.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// User tạo Quizzes
User.hasMany(Quiz, { foreignKey: "created_by", as: "quizzes" });
Quiz.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// Question có nhiều Answers
Question.hasMany(Answer, { foreignKey: "question_id", as: "answers", onDelete: "CASCADE" });
Answer.belongsTo(Question, { foreignKey: "question_id" });

// Quiz <-> Question (nhiều-nhiều qua QuizQuestion)
Quiz.belongsToMany(Question, {
    through: QuizQuestion,
    foreignKey: "quiz_id",
    otherKey: "question_id",
    as: "questions",
});
Question.belongsToMany(Quiz, {
    through: QuizQuestion,
    foreignKey: "question_id",
    otherKey: "quiz_id",
    as: "quizzes",
});
Quiz.hasMany(QuizQuestion, { foreignKey: "quiz_id", as: "quizQuestions" });
QuizQuestion.belongsTo(Quiz, { foreignKey: "quiz_id" });
QuizQuestion.belongsTo(Question, { foreignKey: "question_id" });

// User làm Quiz => Attempt
User.hasMany(Attempt, { foreignKey: "user_id", as: "attempts" });
Attempt.belongsTo(User, { foreignKey: "user_id", as: "user" });

Quiz.hasMany(Attempt, { foreignKey: "quiz_id", as: "attempts" });
Attempt.belongsTo(Quiz, { foreignKey: "quiz_id", as: "quiz" });

// Attempt có nhiều AttemptAnswer
Attempt.hasMany(AttemptAnswer, { foreignKey: "attempt_id", as: "answers", onDelete: "CASCADE" });
AttemptAnswer.belongsTo(Attempt, { foreignKey: "attempt_id" });

// AttemptAnswer liên kết Question & Answer
Question.hasMany(AttemptAnswer, { foreignKey: "question_id" });
AttemptAnswer.belongsTo(Question, { foreignKey: "question_id", as: "question" });

Answer.hasMany(AttemptAnswer, { foreignKey: "answer_id" });
AttemptAnswer.belongsTo(Answer, { foreignKey: "answer_id", as: "selectedAnswer" });

// =============================================
// SYNC DB
// =============================================
const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true }); // alter: cập nhật bảng nếu có thay đổi
        console.log("✅ All tables synced successfully!");
    } catch (error) {
        console.error("❌ Error syncing tables:", error);
    }
};

module.exports = {
    sequelize,
    syncDB,
    User,
    Question,
    Answer,
    Quiz,
    QuizQuestion,
    Attempt,
    AttemptAnswer,
};
