import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuizStore from '../store/useQuizStore';
import {
  Plus,
  Trash2,
  ArrowRight,
  Save,
  Upload,
  Lightbulb,
  CheckCircle2,
  Settings,
  BookOpen,
  Check,
} from 'lucide-react';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh', 'CNTT', 'Lịch sử', 'Địa lý'];

const STEPS = [
  { id: 1, label: 'Thông tin chung' },
  { id: 2, label: 'Soạn câu hỏi' },
  { id: 3, label: 'Cài đặt' },
];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {STEPS.map((step, idx) => (
      <React.Fragment key={step.id}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            currentStep === step.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : currentStep > step.id
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {currentStep > step.id ? <Check size={14} strokeWidth={3} /> : step.id}
          </div>
          <span className={`text-sm font-semibold ${
            currentStep === step.id ? 'text-blue-600' : currentStep > step.id ? 'text-blue-400' : 'text-gray-400'
          }`}>
            {step.label}
          </span>
        </div>
        {idx < STEPS.length - 1 && (
          <div className={`w-16 h-px mx-3 ${currentStep > step.id ? 'bg-blue-300' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const Step1 = ({ title, description, updateMeta }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [timeLimit, setTimeLimit] = useState(45);

  const handleCategorySelect = (cat) => {
    const newCat = selectedCategory === cat ? '' : cat;
    setSelectedCategory(newCat);
    updateMeta('category', newCat);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Tên quiz</label>
          <input
            type="text"
            placeholder="Ví dụ: Kiểm tra Giải tích chương 1"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            value={title}
            onChange={(e) => updateMeta('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Mô tả ngắn</label>
          <textarea
            placeholder="Tóm tắt nội dung chính..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 placeholder:text-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none h-28"
            value={description}
            onChange={(e) => updateMeta('description', e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Danh mục</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all outline-none ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Thời gian làm bài</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => {
                  setTimeLimit(e.target.value);
                  updateMeta('time_limit', parseInt(e.target.value) || 0);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
              <span className="text-sm font-medium text-gray-400 shrink-0">phút</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Ảnh bìa</label>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all outline-none">
              <Upload size={16} />
              <span className="text-sm font-semibold">Tải ảnh lên (16:9)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
        <Lightbulb size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-600">Một tiêu đề hấp dẫn và ảnh bìa chất lượng giúp học sinh hào hứng hơn với bài thi của bạn.</p>
      </div>
    </div>
  );
};

const Step2 = ({ questions, addQuestion, removeQuestion, updateQuestionContent, updateOptionText, setCorrectOption }) => (
  <div className="space-y-5">
    {questions.map((q, index) => (
      <div
        key={q.id}
        id={`question-${index}`}
        className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-200 transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-md shadow-blue-100">
              {index + 1}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {q.type === 'single' ? 'Trắc nghiệm' : 'Nhiều đáp án'}
            </span>
          </div>
          <button
            onClick={() => removeQuestion(q.id)}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all outline-none"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <textarea
          placeholder="Nhập nội dung câu hỏi..."
          className="w-full px-0 text-base font-medium border-none outline-none placeholder:text-gray-300 resize-none min-h-[52px] text-gray-800"
          value={q.content}
          onChange={(e) => updateQuestionContent(q.id, e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
          {q.options.map((opt, optIdx) => (
            <div
              key={opt.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                opt.isCorrect ? 'border-green-500 bg-green-50/50' : 'border-gray-100 bg-gray-50/30'
              }`}
            >
              <button
                onClick={() => setCorrectOption(q.id, opt.id)}
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all outline-none ${
                  opt.isCorrect
                    ? 'bg-green-500 text-white shadow-md shadow-green-100'
                    : 'bg-white border-2 border-gray-200 hover:border-blue-400'
                }`}
              >
                {opt.isCorrect && <CheckCircle2 size={13} strokeWidth={3} />}
              </button>
              <input
                type="text"
                placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                className="bg-transparent border-none outline-none w-full text-sm font-medium text-gray-700 placeholder:text-gray-300"
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
      className="group w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-600 transition-all duration-300 outline-none"
    >
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all border border-gray-100">
        <Plus size={20} />
      </div>
      <span className="font-bold tracking-wide uppercase text-xs">Thêm câu hỏi mới</span>
    </button>
  </div>
);

const Step3 = ({ questions, updateMeta, publishQuiz, isSaving }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
      <h3 className="font-bold text-gray-800 flex items-center gap-2">
        <Settings size={18} className="text-blue-600" />
        Cài đặt bài thi
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-4 border-b border-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-700">Số lần làm tối đa</p>
            <p className="text-xs text-gray-400 mt-0.5">Số lần mỗi học sinh được phép làm bài</p>
          </div>
          <select
            onChange={(e) => updateMeta('max_attempts', parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 outline-none"
          >
            <option value={1}>1 lần</option>
            <option value={2}>2 lần</option>
            <option value={3}>3 lần</option>
            <option value={0}>Không giới hạn</option>
          </select>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-700">Hiển thị đáp án</p>
            <p className="text-xs text-gray-400 mt-0.5">Học sinh xem được đáp án sau khi nộp bài</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Xáo trộn câu hỏi</p>
            <p className="text-xs text-gray-400 mt-0.5">Thứ tự câu hỏi sẽ ngẫu nhiên mỗi lần thi</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
          </label>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen size={18} className="text-blue-600" />
        <span className="font-bold text-gray-800">Tổng quan</span>
      </div>
      <div className="flex items-center justify-between py-3 border-b border-gray-50">
        <span className="text-sm text-gray-500">Số câu hỏi</span>
        <span className="text-sm font-bold text-gray-800">{questions.length} câu</span>
      </div>
      <div className="flex items-center justify-between py-3">
        <span className="text-sm text-gray-500">Trạng thái</span>
        <span className="text-xs font-bold bg-yellow-100 text-yellow-600 px-2.5 py-1 rounded-full">Bản nháp</span>
      </div>
    </div>
  </div>
);

const CreateQuiz = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const {
    title,
    description,
    updateMeta,
    questions,
    addQuestion,
    removeQuestion,
    updateQuestionContent,
    updateOptionText,
    setCorrectOption,
    publishQuiz,
    isSaving,
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
    if (quizId) {
      navigate(`/quiz/${quizId}`);
    }
  };

  const stepTitles = {
    1: { title: 'Tạo Quiz mới', subtitle: 'Nhập các thông tin cơ bản để bắt đầu soạn thảo nội dung.' },
    2: { title: 'Soạn câu hỏi', subtitle: `Đã có ${questions.length} câu hỏi. Thêm và chỉnh sửa nội dung câu hỏi bên dưới.` },
    3: { title: 'Cài đặt & Xuất bản', subtitle: 'Cấu hình các tùy chọn cuối cùng và xuất bản bài thi.' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />

      <main className="max-w-[620px] mx-auto px-4 py-10">
        <StepIndicator currentStep={currentStep} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{stepTitles[currentStep].title}</h1>
          <p className="text-gray-400 text-sm">{stepTitles[currentStep].subtitle}</p>
        </div>

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
          <Step3
            questions={questions}
            updateMeta={updateMeta}
            publishQuiz={publishQuiz}
            isSaving={isSaving}
          />
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleBack}
            className={`text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}
          >
            Lưu bản nháp
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all outline-none"
            >
              Tiếp theo
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSaving ? 'Đang xuất bản...' : 'Xuất bản Quiz'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateQuiz;
