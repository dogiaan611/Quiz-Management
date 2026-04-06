const { Question, Answer, Quiz } = require("../models");
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const fs = require("fs");

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

/**
 * API Upload file Excel (.xlsx)
 */
const importQuestionsFromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn file để tải lên." });
        }

        const { quiz_id, created_by } = req.body;
        if (!created_by) {
            return res.status(400).json({ message: "Vui lòng cung cấp mã người tạo (created_by)." });
        }

        // Đọc file Excel từ đường dẫn tạm của Multer
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
        const worksheet = workbook.Sheets[sheetName];
        
        // Chuyển đổi dữ liệu sheet thành mảng JSON
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
            return res.status(400).json({ message: "File Excel trống hoặc không đúng định dạng." });
        }

        const stats = {
            total: jsonData.length,
            success: 0,
            failed: 0
        };

        const importedData = []; 

        for (const row of jsonData) {
            const { question, A, B, C, D, correctAnswer } = row;

            // 1. Kiểm tra Question (Bắt buộc)
            if (!question || String(question).trim().length === 0) {
                stats.failed++;
                continue;
            }

            // 2. Kiểm tra Options (Phải có ít nhất 2 options trở lên)
            const availableOptions = [
                { key: "A", content: A },
                { key: "B", content: B },
                { key: "C", content: C },
                { key: "D", content: D }
            ].filter(opt => opt.content && String(opt.content).trim().length > 0);

            if (availableOptions.length < 2) {
                stats.failed++;
                continue;
            }

            // 3. Kiểm tra đáp án đúng (Bắt buộc và phải nằm trong các Key hiện có)
            const validCorrectAnswer = String(correctAnswer).trim().toUpperCase();
            const isAnswerExists = availableOptions.some(opt => opt.key === validCorrectAnswer);

            if (!correctAnswer || !isAnswerExists) {
                stats.failed++;
                continue;
            }

            // --- ĐÃ VƯỢT QUA KIỂM TRA -> Chuyển thành Object sạch ---
            const questionObject = {
                question: String(question).trim(),
                options: availableOptions,
                correctAnswer: validCorrectAnswer
            };

            // 1. Lưu Question vào Database
            const newQuestion = await Question.create({
                content: questionObject.question,
                type: "multiple_choice",
                created_by: created_by
            });

            // 2. Lưu Answer vào Database dựa trên mảng options đã gộp
            const answersToInsert = questionObject.options.map(opt => ({
                question_id: newQuestion._id,
                content: opt.content,
                is_correct: opt.key === questionObject.correctAnswer
            }));

            await Answer.insertMany(answersToInsert);

            // 3. Gán vào Quiz (nếu có)
            if (quiz_id && mongoose.Types.ObjectId.isValid(quiz_id)) {
                await Quiz.findByIdAndUpdate(quiz_id, {
                    $push: { questions: newQuestion._id }
                });
            }

            importedData.push(questionObject);
            stats.success++;
        }

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(201).json({
            message: "Đã chuyển đổi Excel thành Object và lưu thành công!",
            stats,
            data: importedData // Trả về danh sách Object question, options, correctAnswer
        });

    } catch (error) {
        console.error("❌ ERROR IMPORTING FROM EXCEL:", error);
        
        // Cố gắng xóa file nếu có lỗi xảy ra
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ 
            message: "Lỗi server khi nhập câu hỏi từ Excel.", 
            error: error.message 
        });
    }
};

/**
 * API Tải file Excel mẫu (.xlsx)
 */
const downloadTemplate = (req, res) => {
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
