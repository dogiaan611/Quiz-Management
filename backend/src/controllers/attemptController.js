const { Attempt, Quiz, Question, Answer, User } = require("../models");

/**
 * Bắt đầu một lần làm quiz mới
 * POST /api/attempts/start
 */
const startAttempt = async (req, res) => {
    const { quiz_id } = req.body;
    const user_id = req.user.id;

    if (!quiz_id) {
        return res.status(400).json({ message: "Quiz ID không được để trống" });
    }

    try {
        // Kiểm tra quiz tồn tại
        const quiz = await Quiz.findById(quiz_id).populate("questions");
        if (!quiz) {
            return res.status(404).json({ message: "Không tìm thấy quiz" });
        }

        // Kiểm tra xem user đã đạt giới hạn số lần làm bài không
        const attemptCount = await Attempt.countDocuments({
            quiz_id,
            user_id,
            status: { $in: ["submitted", "timeout"] }
        });

        if (attemptCount >= quiz.max_attempts) {
            return res.status(403).json({ 
                message: `Bạn đã vượt quá giới hạn ${quiz.max_attempts} lần làm bài` 
            });
        }

        // Tạo một lần làm bài mới
        const attempt = new Attempt({
            quiz_id,
            user_id,
            started_at: new Date(),
            total_questions: quiz.questions.length,
            status: "in_progress",
            answers: quiz.questions.map(q => ({
                question_id: q._id,
                answer_id: null,
                is_correct: false
            }))
        });

        await attempt.save();

        return res.status(201).json({
            message: "Bắt đầu làm quiz thành công",
            attempt_id: attempt._id,
            total_questions: quiz.questions.length,
            time_limit: quiz.time_limit
        });
    } catch (error) {
        console.error("Start attempt error:", error);
        return res.status(500).json({ message: "Lỗi server khi bắt đầu làm quiz" });
    }
};

/**
 * Thu thập các câu trả lời từ người dùng (cập nhật một câu trả lời)
 * PUT /api/attempts/:attemptId/answer
 */
const submitAnswer = async (req, res) => {
    const { attemptId } = req.params;
    const { question_id, answer_id } = req.body;
    const user_id = req.user.id;

    if (!question_id) {
        return res.status(400).json({ message: "Question ID không được để trống" });
    }

    try {
        const attempt = await Attempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
        }

        // Kiểm tra quyền sở hữu
        if (attempt.user_id.toString() !== user_id) {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật lần làm bài này" });
        }

        // Kiểm tra trạng thái
        if (attempt.status !== "in_progress") {
            return res.status(400).json({ message: "Lần làm bài này đã kết thúc" });
        }

        // Kiểm tra câu hỏi tồn tại
        const question = await Question.findById(question_id);
        if (!question) {
            return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
        }

        // Nếu có answer_id, kiểm tra xem answer tồn tại và thuộc về câu hỏi này
        if (answer_id) {
            const answer = await Answer.findById(answer_id);
            if (!answer) {
                return res.status(404).json({ message: "Không tìm thấy câu trả lời" });
            }

            if (answer.question_id.toString() !== question_id) {
                return res.status(400).json({ message: "Câu trả lời không thuộc về câu hỏi này" });
            }
        }

        // Cập nhật câu trả lời trong mảng answers
        const answerIndex = attempt.answers.findIndex(
            a => a.question_id.toString() === question_id
        );

        if (answerIndex === -1) {
            return res.status(400).json({ message: "Câu hỏi không thuộc về lần làm bài này" });
        }

        // Cập nhật answer_id
        attempt.answers[answerIndex].answer_id = answer_id || null;

        // Nếu có answer_id, kiểm tra xem đáp án đó có đúng không
        if (answer_id) {
            const answer = await Answer.findById(answer_id);
            attempt.answers[answerIndex].is_correct = answer.is_correct;
        } else {
            attempt.answers[answerIndex].is_correct = false;
        }

        await attempt.save();

        return res.status(200).json({
            message: "Cập nhật câu trả lời thành công",
            attempt
        });
    } catch (error) {
        console.error("Submit answer error:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật câu trả lời" });
    }
};

/**
 * Thu thập tất cả các câu trả lời cùng một lúc
 * PUT /api/attempts/:attemptId/answers
 */
const submitAllAnswers = async (req, res) => {
    const { attemptId } = req.params;
    const { answers } = req.body; // answers là mảng [{question_id, answer_id}, ...]
    const user_id = req.user.id;

    if (!Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers phải là một mảng" });
    }

    try {
        const attempt = await Attempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
        }

        // Kiểm tra quyền sở hữu
        if (attempt.user_id.toString() !== user_id) {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật lần làm bài này" });
        }

        // Kiểm tra trạng thái
        if (attempt.status !== "in_progress") {
            return res.status(400).json({ message: "Lần làm bài này đã kết thúc" });
        }

        // Cập nhật các câu trả lời
        for (const answer of answers) {
            const { question_id, answer_id } = answer;

            if (!question_id) {
                return res.status(400).json({ message: "Question ID không được để trống" });
            }

            // Kiểm tra câu hỏi tồn tại
            const question = await Question.findById(question_id);
            if (!question) {
                return res.status(404).json({ message: `Không tìm thấy câu hỏi ${question_id}` });
            }

            // Nếu có answer_id, kiểm tra xem answer tồn tại
            if (answer_id) {
                const answerDoc = await Answer.findById(answer_id);
                if (!answerDoc) {
                    return res.status(404).json({ message: `Không tìm thấy câu trả lời ${answer_id}` });
                }

                if (answerDoc.question_id.toString() !== question_id) {
                    return res.status(400).json({ message: `Câu trả lời không thuộc về câu hỏi ${question_id}` });
                }
            }

            // Tìm và cập nhật answer trong mảng
            const answerIndex = attempt.answers.findIndex(
                a => a.question_id.toString() === question_id
            );

            if (answerIndex === -1) {
                return res.status(400).json({ message: `Câu hỏi ${question_id} không thuộc về lần làm bài này` });
            }

            attempt.answers[answerIndex].answer_id = answer_id || null;

            if (answer_id) {
                const answerDoc = await Answer.findById(answer_id);
                attempt.answers[answerIndex].is_correct = answerDoc.is_correct;
            } else {
                attempt.answers[answerIndex].is_correct = false;
            }
        }

        await attempt.save();

        return res.status(200).json({
            message: "Cập nhật tất cả các câu trả lời thành công",
            attempt
        });
    } catch (error) {
        console.error("Submit all answers error:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật câu trả lời" });
    }
};

/**
 * Nộp bài quiz (hoàn thiện lần làm bài và tính điểm)
 * PUT /api/attempts/:attemptId/submit
 */
const submitAttempt = async (req, res) => {
    const { attemptId } = req.params;
    const user_id = req.user.id;

    try {
        const attempt = await Attempt.findById(attemptId).populate({
            path: "answers.answer_id"
        });

        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
        }

        // Kiểm tra quyền sở hữu
        if (attempt.user_id.toString() !== user_id) {
            return res.status(403).json({ message: "Bạn không có quyền nộp lần làm bài này" });
        }

        // Kiểm tra trạng thái
        if (attempt.status !== "in_progress") {
            return res.status(400).json({ message: "Lần làm bài này đã được nộp rồi" });
        }

        // Tính điểm
        const correctAnswers = attempt.answers.filter(a => a.is_correct).length;
        const totalScore = (correctAnswers / attempt.total_questions) * 100;

        // Cập nhật thông tin nộp bài
        attempt.submitted_at = new Date();
        attempt.status = "submitted";
        attempt.correct_answers = correctAnswers;
        attempt.score = Math.round(totalScore * 100) / 100; // Làm tròn 2 chữ số thập phân

        await attempt.save();

        return res.status(200).json({
            message: "Nộp bài thành công",
            attempt,
            results: {
                total_questions: attempt.total_questions,
                correct_answers: correctAnswers,
                score: attempt.score
            }
        });
    } catch (error) {
        console.error("Submit attempt error:", error);
        return res.status(500).json({ message: "Lỗi server khi nộp bài" });
    }
};

/**
 * Lấy chi tiết một lần làm bài
 * GET /api/attempts/:attemptId
 */
const getAttemptById = async (req, res) => {
    const { attemptId } = req.params;
    const user_id = req.user.id;

    try {
        const attempt = await Attempt.findById(attemptId)
            .populate("quiz_id", "title description")
            .populate({
                path: "answers.question_id",
                select: "content"
            })
            .populate({
                path: "answers.answer_id",
                select: "content is_correct"
            });

        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
        }

        // Kiểm tra quyền sở hữu hoặc user là admin
        if (attempt.user_id.toString() !== user_id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền xem lần làm bài này" });
        }

        return res.status(200).json({
            attempt
        });
    } catch (error) {
        console.error("Get attempt by id error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy thông tin lần làm bài" });
    }
};

/**
 * Lấy tất cả các lần làm bài của một user
 * GET /api/attempts/user/:userId
 */
const getUserAttempts = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    try {
        // Chỉ cho phép user xem lần làm của mình hoặc admin xem tất cả
        if (userId !== currentUserId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền xem dữ liệu này" });
        }

        const attempts = await Attempt.find({ user_id: userId })
            .populate("quiz_id", "title")
            .select("-answers") // Không lấy chi tiết các câu trả lời, chỉ lấy kết quả
            .sort({ started_at: -1 });

        return res.status(200).json({
            attempts
        });
    } catch (error) {
        console.error("Get user attempts error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách lần làm bài" });
    }
};

/**
 * Lấy tất cả các câu trả lời của một lần làm bài (để hiển thị trên giao diện)
 * GET /api/attempts/:attemptId/answers
 */
const getAttemptAnswers = async (req, res) => {
    const { attemptId } = req.params;
    const user_id = req.user.id;

    try {
        const attempt = await Attempt.findById(attemptId)
            .populate({
                path: "answers.question_id",
                select: "content"
            })
            .populate({
                path: "answers.answer_id",
                select: "content is_correct"
            });

        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
        }

        // Kiểm tra quyền sở hữu
        if (attempt.user_id.toString() !== user_id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền xem dữ liệu này" });
        }

        return res.status(200).json({
            attempt_id: attempt._id,
            quiz_id: attempt.quiz_id,
            answers: attempt.answers.map(a => ({
                question_id: a.question_id._id,
                question_content: a.question_id.content,
                selected_answer_id: a.answer_id ? a.answer_id._id : null,
                selected_answer_content: a.answer_id ? a.answer_id.content : null,
                is_correct: a.is_correct
            }))
        });
    } catch (error) {
        console.error("Get attempt answers error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy các câu trả lời" });
    }
};

/**
 * Lấy chi tiết kết quả bài làm để hiển thị Review (bao gồm đáp án đúng/sai cho từng câu)
 * GET /api/attempts/:attemptId/review
 */
const getAttemptReview = async (req, res) => {
    const { attemptId } = req.params;
    const user_id = req.user.id;

    try {
        const attempt = await Attempt.findById(attemptId)
            .populate("quiz_id", "title description time_limit")
            .populate({
                path: "answers.question_id",
                populate: {
                    path: "answers", // Lấy tất cả các lựa chọn của câu hỏi đó
                    select: "content is_correct"
                }
            })
            .populate("answers.answer_id", "content is_correct");

        if (!attempt) {
            return res.status(404).json({ message: "Không tìm thấy lần làm bài" });
        }

        // Kiểm tra quyền sở hữu hoặc user là admin
        if (attempt.user_id.toString() !== user_id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền xem dữ liệu review này" });
        }

        // Kiểm tra trạng thái bài làm
        if (attempt.status === "in_progress") {
             return res.status(400).json({ message: "Bài làm đang trong quá trình thực hiện, không thể xem review" });
        }

        // Định dạng dữ liệu trả về cho Frontend
        const reviewData = {
            overview: {
                quiz_title: attempt.quiz_id.title,
                score: attempt.score,
                total_questions: attempt.total_questions,
                correct_answers: attempt.correct_answers,
                wrong_answers: attempt.total_questions - attempt.correct_answers,
                started_at: attempt.started_at,
                submitted_at: attempt.submitted_at,
                time_spent: Math.round((attempt.submitted_at - attempt.started_at) / 1000), // đơn vị giây
                status: attempt.status
            },
            questions: attempt.answers.map(item => {
                const question = item.question_id;
                const choices = question.answers || []; // Các options từ virtual populate
                const correctChoice = choices.find(c => c.is_correct);

                return {
                    question_id: question._id,
                    content: question.content,
                    type: question.type,
                    image_url: question.image_url,
                    choices: choices.map(c => ({
                        _id: c._id,
                        content: c.content,
                        is_correct: c.is_correct
                    })),
                    user_selection: {
                        answer_id: item.answer_id ? item.answer_id._id : null,
                        content: item.answer_id ? item.answer_id.content : "Bỏ qua",
                        is_correct: item.is_correct
                    },
                    correct_selection: {
                        answer_id: correctChoice ? correctChoice._id : null,
                        content: correctChoice ? correctChoice.content : "N/A"
                    }
                };
            })
        };

        return res.status(200).json(reviewData);

    } catch (error) {
        console.error("Get attempt review error:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy dữ liệu review" });
    }
};

module.exports = {
    startAttempt,
    submitAnswer,
    submitAllAnswers,
    submitAttempt,
    getAttemptById,
    getUserAttempts,
    getAttemptAnswers,
    getAttemptReview
};
