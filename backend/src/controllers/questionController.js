const { Question, Answer, Quiz } = require("../models");
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const fs = require("fs");

/**
 * Tạo câu hỏi thủ công
 */
const createManualQuestion = async (req, res) => {
    try {
        const { content, type, image_url, quiz_id, answers } = req.body;
        const created_by = req.user.id; // Luôn dùng ID từ Token

        if (!content || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin: content, answers." });
        }

        let quiz = null;
        if (quiz_id) {
            quiz = await Quiz.findById(quiz_id);
            if (!quiz) {
                return res.status(404).json({ message: "Không tìm thấy Quiz này." });
            }
        }

        const newQuestion = await Question.create({
            content,
            type: type || "multiple_choice",
            image_url: image_url || null,
            created_by
        });

        const answersToInsert = answers.map(ans => ({
            question_id: newQuestion._id,
            content: ans.content,
            is_correct: ans.is_correct || false
        }));

        await Answer.insertMany(answersToInsert);

        if (quiz) {
            quiz.questions.push(newQuestion._id);
            await quiz.save();
        }

        return res.status(201).json({
            message: quiz ? "Tạo câu hỏi và gắn vào Quiz thành công" : "Tạo câu hỏi thành công",
            question: newQuestion
        });

    } catch (error) {
        return res.status(500).json({ message: "Lỗi tạo câu hỏi.", error: error.message });
    }
};

/**
 * Lấy câu hỏi Quiz (CÓ RANDOM & BẢO MẬT ĐÁP ÁN)
 * Task 27, 28
 */
const getQuizQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const user = req.user;

        const quiz = await Quiz.findById(quizId)
            .select("title description time_limit max_attempts questions is_published created_by")
            .populate({
                path: 'questions',
                select: 'content type image_url',
                populate: { path: 'answers', select: 'content' }
            });

        if (!quiz) return res.status(404).json({ message: "Không tìm thấy Quiz." });

        const isOwner = user && (user.role === 'admin' || user.role === 'teacher' || (quiz.created_by && quiz.created_by.toString() === user.id));
        
        if (!quiz.is_published && !isOwner) {
            return res.status(403).json({ message: "Bài thi này chưa được công bố." });
        }

        const shuffleArray = (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        };

        let questions;
        if (isOwner && req.query.showCorrect === 'true') {
            const quizFull = await Quiz.findById(quizId)
                .populate({ path: 'questions', populate: { path: 'answers' } });
            questions = quizFull.questions;
        } else {
            const rawQuestions = quiz.questions.map(q => {
                const qObj = q.toObject();
                if (qObj.answers) qObj.answers = shuffleArray(qObj.answers);
                return qObj;
            });
            questions = shuffleArray(rawQuestions);
        }

        return res.status(200).json({
            quiz: { _id: quiz._id, title: quiz.title, time_limit: quiz.time_limit },
            questions
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy danh sách câu hỏi." });
    }
};

/**
 * Import từ Excel (TÍCH HỢP VALIDATION TASK 49-54)
 */
const importQuestionsFromFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Vui lòng chọn file." });

        const { quiz_id, commit = "true" } = req.body;
        const isCommit = commit === "true";
        const created_by = req.user.id; // Bắt buộc dùng ID từ Token để bảo mật

        const workbook = xlsx.readFile(req.file.path);
        const fileName = req.file.originalname;
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        if (jsonData.length === 0) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "File trống." });
        }

        const stats = { total: jsonData.length, valid: 0, invalid: 0 };
        const validQueue = [];
        const report = [];

        // 1. Kiểm tra dữ liệu (Validation Logic từ Task 49, 50, 51)
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowIndex = i + 2;
            const { question, A, B, C, D, correctAnswer } = row;

            let error = null;
            if (!question) {
                error = "Thiếu nội dung câu hỏi";
            } else {
                const options = [
                    { key: "A", content: A }, { key: "B", content: B },
                    { key: "C", content: C }, { key: "D", content: D }
                ].filter(opt => opt.content);

                if (options.length < 2) {
                    error = "Phải có ít nhất 2 phương án";
                } else {
                    const correctKey = String(correctAnswer || "").trim().toUpperCase();
                    const hasCorrect = options.some(opt => opt.key === correctKey);
                    if (!hasCorrect) {
                        error = `Đáp án đúng "${correctAnswer}" không hợp lệ`;
                    } else {
                        stats.valid++;
                        validQueue.push({ question, options, correctKey });
                        report.push({ row: rowIndex, status: "valid", question });
                        continue;
                    }
                }
            }
            stats.invalid++;
            report.push({ row: rowIndex, status: "invalid", error, question: question || "(Bỏ trống)" });
        }

        // 2. Lưu dữ liệu (Commit Logic từ Task 53, 54)
        let finalQuizId = quiz_id;
        if (isCommit && validQueue.length > 0) {
            if (!finalQuizId || !mongoose.Types.ObjectId.isValid(finalQuizId)) {
                const newQuiz = await Quiz.create({
                    title: `Quiz từ file ${fileName}`,
                    created_by,
                    access_code: Math.random().toString(36).substring(2, 8).toUpperCase()
                });
                finalQuizId = newQuiz._id;
            }

            for (const item of validQueue) {
                const newQ = await Question.create({
                    content: item.question,
                    type: "multiple_choice",
                    created_by
                });

                const answers = item.options.map(opt => ({
                    question_id: newQ._id,
                    content: opt.content,
                    is_correct: opt.key === item.correctKey
                }));

                await Answer.insertMany(answers);
                await Quiz.findByIdAndUpdate(finalQuizId, { $push: { questions: newQ._id } });
            }
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(201).json({
            message: isCommit ? "Lưu dữ liệu thành công" : "Kiểm tra dữ liệu hoàn tất (Chưa lưu)",
            quiz_id: finalQuizId,
            stats,
            details: report
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
    }
};

const downloadTemplate = (req, res) => {
    try {
        const data = [{ question: "Ví dụ?", A: "Đ", B: "S", correctAnswer: "A" }];
        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Template");
        const buf = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
        res.setHeader("Content-Disposition", "attachment; filename=template.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return res.send(buf);
    } catch (error) { return res.status(500).send("Lỗi tạo mẫu."); }
};

/**
 * Xoá câu hỏi
 */
const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        
        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: "Không tìm thấy câu hỏi." });

        // Bảo mật: Chỉ chủ sở hữu hoặc admin mới được xoá
        if (question.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền xoá câu hỏi này." });
        }

        // 1. Xoá mọi đáp án liên quan
        await Answer.deleteMany({ question_id: questionId });

        // 2. Xoá khỏi danh sách questions của tất cả các Quiz
        await Quiz.updateMany({}, { $pull: { questions: questionId } });

        // 3. Xoá câu hỏi
        await Question.findByIdAndDelete(questionId);

        return res.status(200).json({ message: "Xoá câu hỏi thành công" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi xoá câu hỏi.", error: error.message });
    }
};

/**
 * Lấy tất cả câu hỏi của User (Ngân hàng câu hỏi cá nhân)
 */
const getAllQuestions = async (req, res) => {
    try {
        const created_by = req.user.id;
        const questions = await Question.find({ created_by })
            .populate("answers")
            .sort({ createdAt: -1 });

        return res.status(200).json({ questions });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi lấy ngân hàng câu hỏi." });
    }
};

module.exports = { 
    createManualQuestion, 
    getQuizQuestions, 
    importQuestionsFromFile, 
    downloadTemplate, 
    deleteQuestion, 
    getAllQuestions 
};
