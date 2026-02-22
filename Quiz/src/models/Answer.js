const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Answer = sequelize.define(
    "Answer",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "answers",
        timestamps: false,
    }
);

module.exports = Answer;
