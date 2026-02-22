const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AttemptAnswer = sequelize.define(
    "AttemptAnswer",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        attempt_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        answer_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // null nếu user bỏ qua câu hỏi
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "attempt_answers",
        timestamps: false,
    }
);

module.exports = AttemptAnswer;
