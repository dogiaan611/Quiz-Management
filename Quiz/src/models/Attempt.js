const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attempt = sequelize.define(
    "Attempt",
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        started_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        submitted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        total_questions: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        correct_answers: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM("in_progress", "submitted", "timeout"),
            defaultValue: "in_progress",
        },
    },
    {
        tableName: "attempts",
        timestamps: false,
    }
);

module.exports = Attempt;
