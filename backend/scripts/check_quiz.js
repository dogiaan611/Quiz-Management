const mongoose = require("mongoose");
const path = require("path");

const checkQuiz = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/quiz_management");
        console.log("✅ Đã kết nối DB");

        const Quiz = mongoose.model("Quiz", new mongoose.Schema({ questions: Array }));
        const quizId = "69d37b9740d64b7348f8a490"; 
        
        const quiz = await Quiz.findById(quizId);
        if (quiz) {
            console.log(`🚀 Bộ đề: ${quizId}`);
            console.log(`👉 Số lượng ID câu hỏi trong mảng questions: ${quiz.questions.length}`);
        } else {
            console.log("❌ Không tìm thấy bộ đề này!");
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkQuiz();
