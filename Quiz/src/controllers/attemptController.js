const { Quiz, Question, Answer, Attempt } = require("../models");
const mongoose = require("mongoose");

/**
 * 🚀 BẮT ĐẦU LÀM BÀI (START ATTEMPT)
 */
const startAttempt = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id; // Lấy từ authMiddleware (JWT)

        // 1. Kiểm tra Quiz có tồn tại không và lấy danh sách câu hỏi kèm đáp án
        const quiz = await Quiz.findById(quizId).populate({
            path: "questions",
            populate: {
                path: "answers",
                select: "content _id" // CHỈ LẤY nội dung và ID, KHÔNG LẤY trường is_correct
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy bộ đề này." });
        }

        // 2. Tạo bản ghi Attempt mới ở trạng thái "in_progress"
        const newAttempt = await Attempt.create({
            quiz_id: quizId,
            user_id: userId,
            started_at: new Date(),
            total_questions: quiz.questions.length,
            status: "in_progress"
        });

        return res.status(201).json({
            message: "Bắt đầu làm bài thi thành công!",
            attempt_id: newAttempt._id,
            quiz_title: quiz.title,
            questions: quiz.questions 
        });

    } catch (error) {
        console.error("❌ START ATTEMPT ERROR:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * 🏆 NỘP BÀI VÀ CHẤM ĐIỂM TỰ ĐỘNG (SUBMIT & GRADE)
 * Body mong đợi: { answers: [{ question_id: "...", answer_id: "..." }, ...] }
 */
const submitAttempt = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { answers } = req.body; 

        // 1. Tìm bản ghi Attempt đang làm dở
        const attempt = await Attempt.findById(attemptId);
        if (!attempt || attempt.status !== "in_progress") {
            return res.status(400).json({ message: "Lượt làm bài không hợp lệ hoặc đã nộp rồi." });
        }

        // --- BẮT ĐẦU CHẤM ĐIỂM DỰA TRÊN DỮ LIỆU ĐÃ IMPORT TỪ EXCEL ---
        let correctCount = 0;
        const processedAnswers = [];

        for (const userAns of answers) {
            const { question_id, answer_id } = userAns;

            // Truy xuất đáp án thực tế trong DB
            const correctAnswer = await Answer.findOne({ 
                question_id: question_id, 
                is_correct: true 
            });

            const isCorrect = correctAnswer && String(correctAnswer._id) === String(answer_id);
            
            if (isCorrect) correctCount++;

            processedAnswers.push({
                question_id,
                answer_id,
                is_correct: isCorrect
            });
        }

        // Tính toán điểm số (Thang điểm 10)
        const score = (correctCount / (attempt.total_questions || 1)) * 10;

        // 2. Cập nhật kết quả vào bản ghi Attempt
        attempt.submitted_at = new Date();
        attempt.status = "submitted";
        attempt.correct_answers = correctCount;
        attempt.score = Math.round(score * 100) / 100; // Làm tròn 2 chữ số
        attempt.answers = processedAnswers;

        await attempt.save();

        return res.status(200).json({
            message: "Nộp bài thành công!",
            result: {
                total_questions: attempt.total_questions,
                correct_answers: correctCount,
                score: attempt.score,
                submitted_at: attempt.submitted_at
            }
        });

    } catch (error) {
        console.error("❌ SUBMIT ATTEMPT ERROR:", error);
        return res.status(500).json({ message: "Lỗi server khi nộp bài", error: error.message });
    }
};

module.exports = {
    startAttempt,
    submitAttempt
};
