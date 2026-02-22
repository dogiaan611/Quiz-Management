const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Question = sequelize.define(
    "Question",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("multiple_choice", "true_false"),
            defaultValue: "multiple_choice",
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "questions",
        timestamps: true,
    }
);

module.exports = Question;
