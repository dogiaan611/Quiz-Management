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
        const created_by = req.user.id; // Sử dụng ID từ token để bảo mật

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
            type,
            image_url: image_url || null,
            created_by
        });

        const answersToInsert = answers.map(ans => ({
            question_id: newQuestion._id,
            content: ans.content,
            is_correct: ans.is_correct || false
        }));

        const createdAnswers = await Answer.insertMany(answersToInsert);

        if (quiz) {
            quiz.questions.push(newQuestion._id);
            await quiz.save();
        }

        return res.status(201).json({
            message: quiz ? "Tạo câu hỏi và gán vào Quiz thành công" : "Tạo câu hỏi thành công (Lưu vào kho)",
            question: newQuestion,
            answers: createdAnswers
        });

    } catch (error) {
        console.error("❌ ERROR CREATING MANUAL QUESTION:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo câu hỏi.", error: error.message });
    }
};

/**
 * Lấy danh sách câu hỏi (Có Random và Bảo mật đáp án)
 * CCVNNPTPM-27 & 28
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
                populate: { 
                    path: 'answers',
                    select: 'content' 
                }
            });

        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy Quiz." });
        }

        const isOwner = user && (user.role === 'admin' || user.role === 'teacher' || (quiz.created_by && quiz.created_by.toString() === user.id));
        
        if (!quiz.is_published && !isOwner) {
            return res.status(403).json({ message: "Bài thi này chưa được công bố hoặc bạn không có quyền xem." });
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
                .populate({
                    path: 'questions',
                    populate: { path: 'answers' } 
                });
            questions = quizFull.questions;
        } else {
            const rawQuestions = quiz.questions.map(q => {
                const questionObj = q.toObject();
                if (questionObj.answers && Array.isArray(questionObj.answers)) {
                    questionObj.answers = shuffleArray(questionObj.answers);
                }
                return questionObj;
            });
            questions = shuffleArray(rawQuestions);
        }

        return res.status(200).json({
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                time_limit: quiz.time_limit
            },
            questions
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server khi lấy câu hỏi", error: error.message });
    }
};

/**
 * Import từ Excel (Task 47 & 48)
 */
const importQuestionsFromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn file để tải lên." });
        }

        const { quiz_id } = req.body;
        const created_by = req.user.id;

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            return res.status(400).json({ message: "File Excel trống hoặc không đúng định dạng." });
        }

        const importedQuestions = [];

        for (const row of jsonData) {
            const { question, A, B, C, D, correctAnswer } = row;
            if (!question || !correctAnswer) continue;

            const questionObject = {
                question: question,
                options: [
                    { key: "A", content: A },
                    { key: "B", content: B },
                    { key: "C", content: C },
                    { key: "D", content: D }
                ].filter(opt => opt.content),
                correctAnswer: String(correctAnswer).trim().toUpperCase()
            };

            const newQuestion = await Question.create({
                content: questionObject.question,
                type: "multiple_choice",
                created_by
            });

            const answersToInsert = questionObject.options.map(opt => ({
                question_id: newQuestion._id,
                content: opt.content,
                is_correct: opt.key === questionObject.correctAnswer
            }));

            await Answer.insertMany(answersToInsert);
            importedQuestions.push(newQuestion._id);
        }

        if (quiz_id && importedQuestions.length > 0) {
            await Quiz.findByIdAndUpdate(quiz_id, {
                $push: { questions: { $each: importedQuestions } }
            });
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(201).json({
            message: "Import và lưu dữ liệu thành công!",
            count: importedQuestions.length
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: "Lỗi server khi import.", error: error.message });
    }
};

/**
 * Tải file mẫu
 */
const downloadTemplate = (req, res) => {
    try {
        const data = [{
            question: "Node.js là gì?",
            A: "Runtime JS", B: "PHP Framework", C: "OS", D: "Browser",
            correctAnswer: "A"
        }];
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
        const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=template.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        return res.send(buffer);
    } catch (error) {
        return res.status(500).json({ message: "Lỗi tạo mẫu." });
    }
};

module.exports = {
    createManualQuestion,
    getQuizQuestions,
    importQuestionsFromFile,
    downloadTemplate
};
