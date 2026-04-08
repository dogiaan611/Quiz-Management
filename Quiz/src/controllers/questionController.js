const { Question, Answer, Quiz } = require("../models");
const mongoose = require("mongoose");

const createManualQuestion = async (req, res) => {
    try {
        const { content, type, image_url, quiz_id, answers } = req.body;
        const created_by = req.user.id;

        // 1. Kiểm tra các trường bắt buộc
        if (!content || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin: content, answers." });
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

/**
 * API Upload file Excel (.xlsx)
 */
/**
 * API Upload file Excel (.xlsx) và Import vào Database
 */
const importQuestionsFromFile = async (req, res) => {
    const xlsx = require("xlsx");
    const fs = require("fs");
    
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn file để tải lên." });
        }

        const { quiz_id } = req.body;
        const created_by = req.user.id;

        // 1. Đọc file Excel
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
            return res.status(400).json({ message: "File Excel trống hoặc không đúng định dạng." });
        }

        const importedQuestions = [];

        // 2. Lặp qua từng dòng để lưu vào DB
        for (const row of data) {
            const { question, A, B, C, D, correctAnswer } = row;

            if (!question || !correctAnswer) continue;

            // Tạo Question
            const newQuestion = await Question.create({
                content: question,
                type: "multiple_choice",
                created_by
            });

            // Chuẩn bị Answers
            const possibleAnswers = [
                { content: A, label: "A" },
                { content: B, label: "B" },
                { content: C, label: "C" },
                { content: D, label: "D" }
            ].filter(ans => ans.content); // Chỉ lấy những câu trả lời có nội dung

            const answersToInsert = possibleAnswers.map(ans => ({
                question_id: newQuestion._id,
                content: ans.content,
                is_correct: ans.label === correctAnswer
            }));

            await Answer.insertMany(answersToInsert);
            importedQuestions.push(newQuestion._id);
        }

        // 3. Nếu có quiz_id, gán vào Quiz
        if (quiz_id && importedQuestions.length > 0) {
            const quiz = await Quiz.findById(quiz_id);
            if (quiz) {
                quiz.questions.push(...importedQuestions);
                await quiz.save();
            }
        }

        // 4. Xóa file tạm sau khi xử lý xong
        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            message: `Import thành công ${importedQuestions.length} câu hỏi.`,
            quiz_id: quiz_id || null
        });

    } catch (error) {
        console.error("❌ ERROR IMPORTING FROM FILE:", error);
        // Xóa file nếu có lỗi xảy ra
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: "Lỗi server khi import file.", error: error.message });
    }
};

/**
 * API Tải file Excel mẫu (.xlsx)
 */
const downloadTemplate = (req, res) => {
    const xlsx = require("xlsx");
    try {
        const data = [
            {
                question: "Node.js là gì?",
                A: "Môi trường runtime JavaScript",
                B: "Một framework PHP",
                C: "Một hệ điều hành",
                D: "Một trình duyệt",
                correctAnswer: "A"
            }
        ];

        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

        const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", "attachment; filename=mau-import-cau-hoi.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        
        return res.send(buffer);
    } catch (error) {
        console.error("❌ ERROR GENERATING TEMPLATE:", error);
        return res.status(500).json({ message: "Lỗi server khi tạo file mẫu.", error: error.message });
    }
};

module.exports = {
    createManualQuestion,
    getQuizQuestions,
    importQuestionsFromFile,
    downloadTemplate
};
