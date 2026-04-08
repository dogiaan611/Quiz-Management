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

        const importResults = []; // Danh sách phân loại Hợp lệ và Không hợp lệ

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowIndex = i + 2; // Số thứ tự dòng trong Excel (thường bắt đầu từ 2)
            const { question, A, B, C, D, correctAnswer } = row;

            // --- 1. KIỂM TRA LỖI (VALIDATION) ---
            let error = null;

            if (!question || String(question).trim().length === 0) {
                error = "Nội dung câu hỏi không được để trống";
            } else {
                const availableOptions = [
                    { key: "A", content: A },
                    { key: "B", content: B },
                    { key: "C", content: C },
                    { key: "D", content: D }
                ].filter(opt => opt.content && String(opt.content).trim().length > 0);

                if (availableOptions.length < 2) {
                    error = "Phải có ít nhất 2 phương án trả lời";
                } else {
                    const validCorrectAnswer = String(correctAnswer || "").trim().toUpperCase();
                    const isAnswerExists = availableOptions.some(opt => opt.key === validCorrectAnswer);
                    
                    if (!correctAnswer || !isAnswerExists) {
                        error = `Đáp án đúng "${correctAnswer}" không tồn tại trong các lựa chọn A, B, C, D`;
                    }
                }
            }

            // --- 2. XỬ LÝ THEO KẾT QUẢ KIỂM TRA ---
            if (error) {
                stats.failed++;
                importResults.push({
                    row: rowIndex,
                    status: "failed",
                    question: question || "(Bỏ trống)",
                    error: error
                });
                continue;
            }

            // --- 3. NẾU HỢP LỆ -> LƯU VÀO DATABASE ---
            const validOptions = [
                { key: "A", content: A },
                { key: "B", content: B },
                { key: "C", content: C },
                { key: "D", content: D }
            ].filter(opt => opt.content && String(opt.content).trim().length > 0);

            const newQuestion = await Question.create({
                content: String(question).trim(),
                type: "multiple_choice",
                created_by: created_by
            });

            const answersToInsert = validOptions.map(opt => ({
                question_id: newQuestion._id,
                content: opt.content,
                is_correct: opt.key === String(correctAnswer || "").trim().toUpperCase()
            }));

            await Answer.insertMany(answersToInsert);

            if (quiz_id && mongoose.Types.ObjectId.isValid(quiz_id)) {
                await Quiz.findByIdAndUpdate(quiz_id, {
                    $push: { questions: newQuestion._id }
                });
            }

            stats.success++;
            importResults.push({
                row: rowIndex,
                status: "success",
                question: question,
                question_id: newQuestion._id
            });
        }

        // 4. Xóa file sau khi xử lý xong
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(201).json({
            message: "Xử lý file Excel hoàn tất!",
            stats: stats,
            details: importResults
        });

    } catch (error) {
        console.error("❌ ERROR IMPORTING FROM EXCEL:", error);
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
