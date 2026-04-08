import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../store/useQuizStore';
import {
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
  Upload,
  Lightbulb,
  CheckCircle2,
  Settings,
  BookOpen,
  Check,
  HelpCircle,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const CATEGORIES = ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh', 'CNTT', 'Lịch sử', 'Địa lý'];

const STEPS = [
  { id: 1, label: 'Thông tin chung', icon: BookOpen },
  { id: 2, label: 'Soạn câu hỏi',    icon: HelpCircle },
  { id: 3, label: 'Cài đặt & Xuất bản', icon: Settings },
];

/* ── Step Indicator ─────────────────────────────────────── */
const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((step, idx) => {
      const done   = currentStep > step.id;
      const active = currentStep === step.id;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${
                active
                  ? 'text-white shadow-lg shadow-blue-300'
                  : done
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
              style={active ? { background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' } : {}}
            >
              {done ? <Check size={15} strokeWidth={3} /> : step.id}
            </div>
            <span className={`text-xs font-bold whitespace-nowrap ${
              active ? 'text-blue-600' : done ? 'text-emerald-500' : 'text-slate-400'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-20 md:w-28 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${
              currentStep > step.id ? 'bg-emerald-300' : 'bg-slate-200'
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── Step 1 — Quiz Info ─────────────────────────────────── */
const Step1 = ({ title, description, updateMeta }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [timeLimit, setTimeLimit] = useState(45);

  const handleCategorySelect = (cat) => {
    const newCat = selectedCategory === cat ? '' : cat;
    setSelectedCategory(newCat);
    updateMeta('category', newCat);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-7 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Tên Quiz <span className="text-red-400">*</span></label>
          <input
            type="text"
            placeholder="VD: Kiểm tra Giải tích chương 1"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-sm"
            value={title}
            onChange={(e) => updateMeta('title', e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Mô tả ngắn</label>
          <textarea
            placeholder="Tóm tắt nội dung chính của bộ câu hỏi..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none h-28 text-sm"
            value={description}
            onChange={(e) => updateMeta('description', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">Danh mục</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all outline-none ${
                  selectedCategory === cat
                    ? 'text-white border-transparent shadow-md shadow-blue-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500'
                }`}
                style={selectedCategory === cat ? { background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Time + Cover */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Thời gian làm bài</label>
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => {
                  setTimeLimit(e.target.value);
                  updateMeta('time_limit', parseInt(e.target.value) || 0);
                }}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all text-sm"
              />
              <span className="text-sm font-medium text-slate-400 shrink-0">phút</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Ảnh bìa</label>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all outline-none text-sm">
              <Upload size={15} />
              <span className="font-semibold">Tải ảnh (16:9)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-blue-50 rounded-xl border border-blue-100">
        <Lightbulb size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-600 font-medium">Tiêu đề hấp dẫn và ảnh bìa chất lượng giúp học sinh hào hứng hơn với bài thi của bạn.</p>
      </div>
    </div>
  );
};

/* ── Step 2 — Questions ─────────────────────────────────── */
const Step2 = ({ questions, addQuestion, removeQuestion, updateQuestionContent, updateOptionText, setCorrectOption }) => (
  <div className="space-y-4 animate-slide-up">
    {questions.map((q, index) => (
      <div
        key={q.id}
        id={`question-${index}`}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:border-blue-200 transition-all duration-200"
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-8 h-8 text-white font-black rounded-lg text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
            >
              {index + 1}
            </span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {q.type === 'single' ? 'Trắc nghiệm' : 'Nhiều đáp án'}
            </span>
          </div>
          <button
            onClick={() => removeQuestion(q.id)}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all outline-none"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <textarea
          placeholder="Nhập nội dung câu hỏi..."
          className="w-full px-0 text-base font-semibold border-none outline-none placeholder:text-slate-300 resize-none min-h-[48px] text-slate-800 bg-transparent"
          value={q.content}
          onChange={(e) => updateQuestionContent(q.id, e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-5">
          {q.options.map((opt, optIdx) => (
            <div
              key={opt.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                opt.isCorrect ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-100 bg-slate-50/30'
              }`}
            >
              <button
                onClick={() => setCorrectOption(q.id, opt.id)}
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all outline-none ${
                  opt.isCorrect
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                    : 'bg-white border-2 border-slate-200 hover:border-blue-400'
                }`}
              >
                {opt.isCorrect && <CheckCircle2 size={13} strokeWidth={3} />}
              </button>
              <input
                type="text"
                placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700 placeholder:text-slate-300"
                value={opt.text}
                onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    ))}

    <button
      onClick={addQuestion}
      className="group w-full py-7 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-600 transition-all duration-300 outline-none"
    >
      <div
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:text-white transition-all border border-slate-100"
        style={undefined}
      >
        <Plus size={20} className="group-hover:text-blue-600" />
      </div>
      <span className="font-black tracking-wide uppercase text-xs">Thêm câu hỏi mới</span>
    </button>
  </div>
);

/* ── Step 3 — Settings ──────────────────────────────────── */
const Step3 = ({ questions, updateMeta }) => (
  <div className="space-y-5 animate-slide-up">
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-7 space-y-0">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
        <Settings size={17} className="text-blue-500" />
        Cài đặt bài thi
      </h3>

      {/* Max attempts */}
      <div className="flex items-center justify-between py-4 border-b border-slate-50">
        <div>
          <p className="text-sm font-semibold text-slate-700">Số lần làm tối đa</p>
          <p className="text-xs text-slate-400 mt-0.5">Số lần mỗi học sinh được làm bài</p>
        </div>
        <select
          onChange={(e) => updateMeta('max_attempts', parseInt(e.target.value))}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 transition-all"
        >
          <option value={1}>1 lần</option>
          <option value={2}>2 lần</option>
          <option value={3}>3 lần</option>
          <option value={0}>Không giới hạn</option>
        </select>
      </div>

      {/* Show answers */}
      <div className="flex items-center justify-between py-4 border-b border-slate-50">
        <div>
          <p className="text-sm font-semibold text-slate-700">Hiển thị đáp án</p>
          <p className="text-xs text-slate-400 mt-0.5">Học sinh xem đáp án sau khi nộp</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked />
          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>

      {/* Shuffle */}
      <div className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">Xáo trộn câu hỏi</p>
          <p className="text-xs text-slate-400 mt-0.5">Thứ tự câu hỏi ngẫu nhiên mỗi lần thi</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>
    </div>

    {/* Summary */}
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <BookOpen size={17} className="text-blue-500" />
        <span className="font-bold text-slate-800">Tổng quan</span>
      </div>
      <div className="space-y-0">
        <div className="flex items-center justify-between py-3 border-b border-slate-50">
          <span className="text-sm text-slate-500 font-medium">Số câu hỏi</span>
          <span className="text-sm font-black text-slate-800">{questions.length} câu</span>
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="text-sm text-slate-500 font-medium">Trạng thái</span>
          <span className="text-xs font-bold bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full">Bản nháp</span>
        </div>
      </div>
    </div>
  </div>
);

/* ── CreateQuiz Page ─────────────────────────────────────── */
const CreateQuiz = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const {
    title, description, updateMeta,
    questions, addQuestion, removeQuestion,
    updateQuestionContent, updateOptionText, setCorrectOption,
    publishQuiz, isSaving,
  } = useQuizStore();

  const handleNext = () => {
    if (currentStep === 1 && !title.trim()) return alert('Vui lòng nhập tên quiz trước');
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handlePublish = async () => {
    const quizId = await publishQuiz();
    if (quizId) navigate(`/quiz/${quizId}`);
  };

  const stepTitles = {
    1: { title: 'Tạo Quiz mới', subtitle: 'Nhập thông tin cơ bản để bắt đầu soạn thảo.' },
    2: { title: 'Soạn câu hỏi', subtitle: `Đã có ${questions.length} câu hỏi.` },
    3: { title: 'Cài đặt & Xuất bản', subtitle: 'Cấu hình các tùy chọn và xuất bản bài thi.' },
  };

  return (
    <DashboardLayout
      title={stepTitles[currentStep].title}
      subtitle={stepTitles[currentStep].subtitle}
    >
      <div className="max-w-[640px] mx-auto">
        <StepIndicator currentStep={currentStep} />

        {currentStep === 1 && (
          <Step1 title={title} description={description} updateMeta={updateMeta} />
        )}
        {currentStep === 2 && (
          <Step2
            questions={questions}
            addQuestion={addQuestion}
            removeQuestion={removeQuestion}
            updateQuestionContent={updateQuestionContent}
            updateOptionText={updateOptionText}
            setCorrectOption={setCorrectOption}
          />
        )}
        {currentStep === 3 && (
          <Step3 questions={questions} updateMeta={updateMeta} />
        )}

        {/* Navigation bar */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}
          >
            <ArrowLeft size={15} />
            Quay lại
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
            >
              Tiếp theo
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)' }}
            >
              <Save size={15} />
              {isSaving ? 'Đang xuất bản...' : 'Xuất bản Quiz'}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateQuiz;
