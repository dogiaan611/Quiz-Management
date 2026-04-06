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
 * Lấy danh sách câu hỏi của một Quiz để phục vụ làm bài
 * GET /api/questions/quiz/:quizId
 */
const getQuizQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const user = req.user;

        // Tìm quiz và populate đầy đủ câu hỏi và câu trả lời
        const quiz = await Quiz.findById(quizId)
            .select("title description time_limit max_attempts questions is_published created_by")
            .populate({
                path: 'questions',
                select: 'content type image_url', // lấy thông tin câu hỏi
                populate: { 
                    path: 'answers',
                    select: 'content' // mặc định chỉ lấy content answers
                }
            });

        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy Quiz." });
        }

        // Kiểm tra quyền: Nếu chưa publish thì chỉ cho phép teacher/admin xem
        const isOwner = user && (user.role === 'admin' || user.role === 'teacher' || (quiz.created_by && quiz.created_by.toString() === user.id));
        
        if (!quiz.is_published && !isOwner) {
            return res.status(403).json({ message: "Bài thi này chưa được công bố hoặc bạn không có quyền xem." });
        }

        let questions;
        
        // Hàm xáo trộn mảng (Fisher-Yates)
        const shuffleArray = (array) => {
            const newArr = [...array];
            for (let i = newArr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
            }
            return newArr;
        };

        // Nếu là GV hoặc admin muốn xem full (có đáp án đúng và không shuffle)
        if (isOwner && req.query.showCorrect === 'true') {
            const quizFull = await Quiz.findById(quizId)
                .populate({
                    path: 'questions',
                    populate: { path: 'answers' } 
                });
            questions = quizFull.questions;
        } else {
            // Đối với SV làm bài: Xáo trộn cả CÂU HỎI và CÂU TRẢ LỜI
            const rawQuestions = quiz.questions.map(q => {
                const questionObj = q.toObject();
                if (questionObj.answers && Array.isArray(questionObj.answers)) {
                    questionObj.answers = shuffleArray(questionObj.answers);
                }
                return questionObj;
            });
            
            // Random hóa thứ tự câu hỏi (Sprints 2 task: Tạo logic câu hỏi random)
            questions = shuffleArray(rawQuestions);
        }

        return res.status(200).json({
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                time_limit: quiz.time_limit,
                max_attempts: quiz.max_attempts
            },
            questions: questions
        });
    } catch (error) {
        console.error("❌ ERROR GET QUIZ QUESTIONS:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách câu hỏi", error: error.message });
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

        return res.status(200).json({
            message: "Tải file lên thành công và đã lưu file tạm.",
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: req.file.path,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error("❌ ERROR UPLOADING FILE:", error);
        return res.status(500).json({ message: "Lỗi server khi upload file.", error: error.message });
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
