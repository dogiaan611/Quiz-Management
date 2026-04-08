const { Quiz, Attempt, Answer, Question } = require("../models");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

/**
 * Tạo quiz mới
 */
const createQuiz = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        description,
        time_limit,
        max_attempts,
        start_time,
        end_time,
    } = req.body;

    const created_by = req.user.id;

    try {
        let access_code;
        let isCodeUnique = false;
        
        while (!isCodeUnique) {
            access_code = crypto.randomBytes(4).toString("hex").toUpperCase(); 
            const existingQuiz = await Quiz.findOne({ access_code });
            if (!existingQuiz) isCodeUnique = true;
        }

        const quiz = await Quiz.create({
            title,
            description,
            time_limit,
            max_attempts,
            start_time,
            end_time,
            created_by,
            access_code,
        });

        return res.status(201).json({
            message: "Tạo quiz thành công",
            quiz,
        });
    } catch (error) {
        console.error("Create quiz error:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo quiz" });
    }
};

/**
 * Thêm câu hỏi vào quiz
 */
const addQuestionsToQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { questionIds } = req.body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ message: "Danh sách question IDs không hợp lệ." });
    }

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz." });

        if (quiz.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa quiz này." });
        }

        const currentQuestionIds = quiz.questions.map(id => id.toString());
        const newQuestions = questionIds.filter(id => !currentQuestionIds.includes(id));

        if (newQuestions.length === 0) {
            return res.status(400).json({ message: "Các câu hỏi đã tồn tại." });
        }

        quiz.questions.push(...newQuestions);
        await quiz.save();

        return res.status(200).json({
            message: "Thêm câu hỏi thành công",
            added_count: newQuestions.length,
            quiz,
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Lấy tất cả quiz
 */
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate("created_by", "username email");
        return res.status(200).json({ quizzes });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Lấy chi tiết quiz
 */
const getQuizById = async (req, res) => {
    const { quizId } = req.params;

    try {
        const quiz = await Quiz.findById(quizId)
            .populate("created_by", "username email")
            .populate({
                path: "questions",
                populate: { path: "answers" }
            });

        if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz" });

        return res.status(200).json({ quiz });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * 🔥 CHECK MÃ QUIZ
 */
const checkQuizCode = async (req, res) => {
    const { code } = req.body;
    try {
        const quiz = await Quiz.findOne({ access_code: code });
        if (!quiz) return res.status(404).json({ message: "Mã quiz không tồn tại" });
        return res.status(200).json({
            message: "Mã hợp lệ",
            quiz: { id: quiz._id, title: quiz.title, description: quiz.description }
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * 🔥 THAM GIA QUIZ
 */
const joinQuiz = async (req, res) => {
    const { code } = req.body;
    try {
        const quiz = await Quiz.findOne({ access_code: code });
        if (!quiz) return res.status(404).json({ message: "Mã quiz không tồn tại" });
        return res.status(200).json({ message: "Tham gia thành công", quiz });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * 🔥 NỘP BÀI THI (Task 30, 31, 32)
 */
const submitQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers, guestInfo } = req.body;
        const userId = req.user ? req.user.id : null;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Không tìm thấy Quiz." });

        let correctCount = 0;
        const processedAnswers = [];

        if (answers && Array.isArray(answers)) {
            for (const ans of answers) {
                const dbAnswer = await Answer.findOne({ _id: ans.answer_id, question_id: ans.question_id });
                const isCorrect = dbAnswer ? dbAnswer.is_correct : false;
                if (isCorrect) correctCount++;
                processedAnswers.push({
                    question_id: ans.question_id,
                    answer_id: ans.answer_id,
                    is_correct: isCorrect
                });
            }
        }

        const score = (quiz.questions.length > 0) 
            ? ((correctCount / quiz.questions.length) * 10).toFixed(2) 
            : 0;

        const attemptData = {
            quiz_id: quizId,
            total_questions: quiz.questions.length,
            correct_answers: correctCount,
            score: parseFloat(score),
            status: "submitted",
            submitted_at: new Date(),
            answers: processedAnswers
        };

        if (userId) {
            attemptData.user_id = userId;
        } else if (guestInfo) {
            attemptData.guest_name = guestInfo.name;
            attemptData.guest_email = guestInfo.email;
        } else {
            return res.status(400).json({ message: "Thiếu thông tin người làm bài." });
        }

        const attempt = await Attempt.create(attemptData);

        return res.status(201).json({ 
            message: "Nộp bài thành công",
            attempt: {
                id: attempt._id,
                score: attempt.score,
                correct_answers: attempt.correct_answers,
                total_questions: attempt.total_questions,
                submitted_at: attempt.submitted_at
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server khi nộp bài" });
    }
};

/**
 * 🔥 LẤY KẾT QUẢ BÀI LÀM (Task 34)
 */
const getAttemptResult = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const userId = req.user.id;

        const attempt = await Attempt.findById(attemptId)
            .populate("quiz_id", "title description")
            .populate({ path: "answers.question_id", select: "content type image_url" })
            .populate({ path: "answers.answer_id", select: "content is_correct" });

        if (!attempt) return res.status(404).json({ message: "Không tìm thấy kết quả." });

        if (attempt.user_id.toString() !== userId && req.user.role === 'student') {
            return res.status(403).json({ message: "Bạn không có quyền xem." });
        }

        return res.status(200).json({ message: "Thành công", result: attempt });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Lấy các quiz do chính user hiện tại tạo
 */
const getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ created_by: req.user.id }).populate("created_by", "username");
        return res.status(200).json({ quizzes });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Cập nhật quiz
 */
const updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz." });
        
        // Chỉ chủ sở hữu hoặc admin mới được sửa
        if (quiz.created_by.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền sửa quiz này." });
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, req.body, { new: true });
        return res.status(200).json({ message: "Cập nhật thành công", quiz: updatedQuiz });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Xóa quiz
 */
const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);
        
        if (!quiz) return res.status(404).json({ message: "Không tìm thấy quiz." });
        
        if (quiz.created_by.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền xóa quiz này." });
        }

        await Quiz.findByIdAndDelete(quizId);
        // Xóa các câu hỏi liên quan hoặc xử lý logic cascade nếu cần
        await Question.deleteMany({ _id: { $in: quiz.questions } });
        
        return res.status(200).json({ message: "Xóa quiz thành công" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    createQuiz,
    addQuestionsToQuiz,
    getAllQuizzes,
    getQuizById,
    checkQuizCode,
    joinQuiz,
    submitQuiz,
    getAttemptResult,
    getMyQuizzes,
    updateQuiz,
    deleteQuiz
};
