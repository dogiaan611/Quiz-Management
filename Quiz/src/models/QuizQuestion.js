const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const QuizQuestion = sequelize.define(
    "QuizQuestion",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        quiz_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        order_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "quiz_questions",
        timestamps: false,
    }
);

module.exports = QuizQuestion;
