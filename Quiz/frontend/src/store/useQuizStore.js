import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import quizService from "../services/quizService";
import useAuthStore from "./useAuthStore";
const initialQuestion = {
    id: crypto.randomUUID(),
    content: '',
    type: 'single',
    options: [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
    ],
    point: 1,
}

const useQuizStore = create(
    persist(
        (set, get) => ({
            title: '',
            description: '',
            category: '',
            thumbnail: null,
            questions: [{ ...initialQuestion, id: crypto.randomUUID() }],
            isSaving: false,

            publishQuiz: async () => {
                const { title, description, category, questions } = get();
                const user = useAuthStore.getState().user;
                if (!user) return alert("Vui lòng đăng nhập trước khi thực hiện!");

                if (!title.trim()) return alert("Vui lòng nhập tiêu đề");
                if (questions.length === 0) return alert("Vui lòng thêm câu hỏi");

                const validQuestions = questions.filter(q => q.content.trim() && q.options.some(opt => opt.text.trim()));
                if (validQuestions.length === 0) return alert("Vui lòng nhập nội dung câu hỏi và ít nhất 1 đáp án");

                set({ isSaving: true });
                try {
                    const quizData = { title, description, category };
                    const response = await quizService.create(quizData);
                    const quizId = response.quiz._id;

                    for (const q of validQuestions) {
                        const questionData = {
                            content: q.content,
                            type: q.type === 'single' ? 'multiple_choice' : 'true_false',
                            quiz_id: quizId,
                            created_by: user.id || user._id,
                            answers: q.options
                                .filter(opt => opt.text.trim())
                                .map(opt => ({
                                    content: opt.text,
                                    is_correct: opt.isCorrect
                                }))
                        };
                        await quizService.createQuestion(questionData);
                    }

                    console.log("Tạo bộ câu hỏi thành công!");
                    set({
                        title: '',
                        description: '',
                        category: '',
                        questions: [{ ...initialQuestion, id: crypto.randomUUID() }]
                    });
                    return quizId;
                } catch (error) {
                    console.error("Error publishing quiz:", error);
                    alert("Lỗi khi tạo bộ câu hỏi: " + (error.message || "Lỗi server"));
                    return null;
                } finally {
                    set({ isSaving: false });
                }
            },

            updateMeta: (field, value) => {
                set({ [field]: value });
            },

            addQuestion: () => {
                const newQuestion = {
                    ...initialQuestion,
                    id: crypto.randomUUID(),
                    options: initialQuestion.options.map(opt => ({ ...opt, id: crypto.randomUUID() }))
                };

                set((state) => ({
                    questions: [...state.questions, newQuestion]
                }));
            },

            removeQuestion: (questionId) => {
                set((state) => ({
                    questions: state.questions.filter((q) => q.id !== questionId)
                }));
            },

            updateQuestionContent: (questionId, content) => {
                set((state) => ({
                    questions: state.questions.map((q) =>
                        q.id === questionId ? { ...q, content } : q
                    )
                }));
            },

            updateOptionText: (questionId, optionId, text) => {
                set((state) => ({
                    questions: state.questions.map((q) => {
                        if (q.id !== questionId) return q;

                        return {
                            ...q,
                            options: q.options.map((opt) =>
                                opt.id === optionId ? { ...opt, text } : opt
                            )
                        };
                    })
                }));
            },

            setCorrectOption: (questionId, optionId) => {
                set((state) => ({
                    questions: state.questions.map((q) => {
                        if (q.id !== questionId) return q;

                        const isMultiple = q.type === 'multiple';
                        return {
                            ...q,
                            options: q.options.map((opt) => {
                                if (isMultiple) {
                                    return opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt;
                                }
                                return { ...opt, isCorrect: opt.id === optionId };
                            })
                        };
                    })
                }));
            },

            resetQuiz: () => set({
                title: '',
                description: '',
                category: '',
                thumbnail: null,
                questions: [{ ...initialQuestion, id: crypto.randomUUID() }],
            }),
        }),
        {
            name: 'draft-quiz-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                title: state.title,
                description: state.description,
                category: state.category,
                questions: state.questions,
            }),
        }
    )
);

export default useQuizStore;