const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quiz = sequelize.define(
    "Quiz",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        access_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
        },
        time_limit: {
            type: DataTypes.INTEGER, // phút, null = không giới hạn
            allowNull: true,
        },
        max_attempts: {
            type: DataTypes.INTEGER, // 0 = không giới hạn
            defaultValue: 0,
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "quizzes",
        timestamps: true,
    }
);

module.exports = Quiz;
