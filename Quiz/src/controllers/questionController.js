const { Question, Answer, Quiz } = require("../models");
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const fs = require("fs");

const createManualQuestion = async (req, res) => {
    try {
        const { content, type, image_url, quiz_id, answers } = req.body;
        const created_by = req.user.id; // Lấy từ authMiddleware (JWT)

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
            type: type || "multiple_choice",
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

        const { quiz_id } = req.body;
        const created_by = req.user?.id || req.body.created_by; // Ưu tiên lấy từ token nếu có

        if (!created_by) {
            return res.status(400).json({ message: "Không xác định được người tạo." });
        }

        // 1. Kiểm tra Quiz tồn tại nếu có truyền quiz_id
        if (quiz_id && mongoose.Types.ObjectId.isValid(quiz_id)) {
            const quizExists = await Quiz.exists({ _id: quiz_id });
            if (!quizExists) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                return res.status(404).json({ message: "Không tìm thấy Quiz với mã đã cung cấp." });
            }
        }

        // 2. Đọc file Excel
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (jsonData.length === 0) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "File Excel trống." });
        }

        const stats = { total: jsonData.length, success: 0, failed: 0 };
        const validQuestionsToInsert = [];
        const errorDetails = [];
        const rawAnswersMap = []; // Lưu tạm đáp án để insert sau khi có Question ID

        // 3. Phân loại và Validate dữ liệu
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowIndex = i + 2;
            const { question, A, B, C, D, correctAnswer } = row;

            let error = null;
            if (!question || String(question).trim().length === 0) {
                error = "Nội dung câu hỏi trống";
            } else {
                const options = [
                    { key: "A", content: A },
                    { key: "B", content: B },
                    { key: "C", content: C },
                    { key: "D", content: D }
                ].filter(opt => opt.content && String(opt.content).trim().length > 0);

                if (options.length < 2) {
                    error = "Phải có ít nhất 2 phương án trả lời";
                } else {
                    const validCorrectAns = String(correctAnswer || "").trim().toUpperCase();
                    const hasCorrect = options.some(opt => opt.key === validCorrectAns);
                    if (!hasCorrect) {
                        error = `Đáp án đúng "${correctAnswer}" không tồn tại trong danh sách A, B, C, D`;
                    } else {
                        // Nếu hợp lệ, đưa vào danh sách chờ lưu
                        validQuestionsToInsert.push({
                            content: String(question).trim(),
                            type: "multiple_choice",
                            created_by: created_by
                        });
                        rawAnswersMap.push({
                            options,
                            correctKey: validCorrectAns,
                            rowIndex
                        });
                        continue;
                    }
                }
            }

            if (error) {
                stats.failed++;
                errorDetails.push({ row: rowIndex, status: "failed", error });
            }
        }

        // 4. THỰC HIỆN LƯU VÀO DATABASE (BULK OPERATIONS)
        if (validQuestionsToInsert.length > 0) {
            // Bước 4.1: Lưu tất cả Question
            const createdQuestions = await Question.insertMany(validQuestionsToInsert);
            const newQuestionIds = createdQuestions.map(q => q._id);

            // Bước 4.2: Chuẩn bị và lưu tất cả Answer
            const allAnswersToInsert = [];
            createdQuestions.forEach((q, index) => {
                const mapData = rawAnswersMap[index];
                mapData.options.forEach(opt => {
                    allAnswersToInsert.push({
                        question_id: q._id,
                        content: opt.content,
                        is_correct: opt.key === mapData.correctKey
                    });
                });
            });

            await Answer.insertMany(allAnswersToInsert);

            // Bước 4.3: Cập nhật Quiz một lần duy nhất
            if (quiz_id && mongoose.Types.ObjectId.isValid(quiz_id)) {
                await Quiz.findByIdAndUpdate(quiz_id, {
                    $push: { questions: { $each: newQuestionIds } }
                });
            }

            stats.success = createdQuestions.length;
        }

        // 5. Dọn dẹp file tạm
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        return res.status(201).json({
            message: "Hoàn tất xử lý file!",
            stats,
            errors: errorDetails.length > 0 ? errorDetails : undefined
        });

    } catch (error) {
        console.error("❌ IMPORT EXCEL ERROR:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: "Lỗi server khi nạp file", error: error.message });
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
