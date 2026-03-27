const { Question, Answer, Quiz } = require("../models");
const mongoose = require("mongoose");

const createManualQuestion = async (req, res) => {
    try {
        const { content, type, image_url, quiz_id, created_by, answers } = req.body;

        // 1. Kiểm tra các trường bắt buộc (Không bắt buộc quiz_id nữa)
        if (!content || !created_by || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin: content, created_by, answers." });
        }

        // 2. Kiểm tra xem Quiz có tồn tại không (nếu có truyền quiz_id)
        let quiz = null;
        if (quiz_id) {
            quiz = await Quiz.findById(quiz_id);
            if (!quiz) {
                return res.status(404).json({ message: "Không tìm thấy Quiz này." });
            }
        }

        // 3. Tạo Question mới
        const newQuestion = await Question.create({
            content,
            type,
            image_url: image_url || null,
            created_by
        });

        // 4. Tạo các Answer cho Question đó
        const answersToInsert = answers.map(ans => ({
            question_id: newQuestion._id,
            content: ans.content,
            is_correct: ans.is_correct || false
        }));

        const createdAnswers = await Answer.insertMany(answersToInsert);

        // 5. Cập nhật mảng questions của Quiz (nếu có quiz_id)
        if (quiz) {
            quiz.questions.push(newQuestion._id);
            await quiz.save();
        }

        return res.status(201).json({
            message: quiz ? "Tạo câu hỏi và gán vào Quiz thành công" : "Tạo câu hỏi thành công (Lưu vào kho)",
            question: newQuestion,
            answers: createdAnswers,
            quiz_id: quiz_id || null
        });

    } catch (error) {
        console.error("❌ ERROR CREATING MANUAL QUESTION:", error);
        
        return res.status(500).json({ 
            message: "Lỗi server khi tạo câu hỏi.", 
            error: error.message
        });
    }
};


/**
 * Lấy danh sách câu hỏi của một Quiz (Optional feature)
 */
const getQuizQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId).populate({
            path: 'questions',
            populate: { path: 'answers' } // Cần định nghĩa virtual 'answers' trong Question model nếu muốn populate sâu
        });

        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy Quiz." });
        }

        return res.status(200).json({ questions: quiz.questions });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = {
    createManualQuestion,
    getQuizQuestions
};
