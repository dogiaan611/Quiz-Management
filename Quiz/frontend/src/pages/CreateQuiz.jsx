import React from 'react';
import useQuizStore from '../store/useQuizStore';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Layout,
  Settings,
  Eye,
  Save,
  ArrowLeft
} from 'lucide-react';

const CreateQuiz = () => {
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
    isSaving
  } = useQuizStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors outline-none focus:outline-none">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Tạo bộ câu hỏi mới</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-all outline-none focus:outline-none">
              <Eye size={18} />
              Xem trước
            </button>
            <button 
              onClick={publishQuiz} 
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-8 flex gap-8">
        <div className="flex-1 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nhập tiêu đề"
                className="w-full text-3xl font-bold border-none outline-none focus:outline-none placeholder:text-gray-300"
                value={title}
                onChange={(e) => updateMeta('title', e.target.value)}
              />
              <textarea
                placeholder="Thêm mô tả ngắn gọn..."
                className="w-full text-lg text-gray-500 border-none outline-none focus:outline-none placeholder:text-gray-300 resize-none h-20"
                value={description}
                onChange={(e) => updateMeta('description', e.target.value)}
              />

              <div className="flex gap-4 pt-4 border-t border-gray-50">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium outline-none focus:outline-none">
                  <ImageIcon size={16} />
                  Thêm ảnh bìa
                </button>
                <div className="bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                  <span className="text-gray-400 font-medium font-mono uppercase tracking-wider text-xs">Thể loại:</span>
                  <select
                    className="bg-transparent border-none outline-none focus:outline-none text-gray-700 font-bold p-0"
                    onChange={(e) => updateMeta('category', e.target.value)}
                  >
                    <option value="">Chọn một...</option>
                    <option value="it">Công nghệ thông tin</option>
                    <option value="english">Tiếng Anh</option>
                    <option value="math">Toán học</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {questions.map((q, index) => (
              <div
                key={q.id}
                id={`question-${index}`}
                className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-md shadow-blue-100">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">CÂU HỎI {q.type === 'single' ? 'TRẮC NGHIỆM' : 'NHIỀU ĐÁP ÁN'}</span>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all outline-none focus:outline-none"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <textarea
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full text-xl font-medium border-none outline-none focus:outline-none placeholder:text-gray-300 resize-none min-h-[60px]"
                  value={q.content}
                  onChange={(e) => updateQuestionContent(q.id, e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${opt.isCorrect
                        ? 'border-green-500 bg-green-50/50'
                        : 'border-gray-50 bg-gray-50/30'
                        }`}
                    >
                      <button
                        onClick={() => setCorrectOption(q.id, opt.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all outline-none focus:outline-none ${opt.isCorrect
                          ? 'bg-green-500 text-white shadow-lg shadow-green-100'
                          : 'bg-white border-2 border-gray-200 hover:border-blue-400'
                          }`}
                      >
                        {opt.isCorrect && <Plus size={14} strokeWidth={4} />}
                      </button>
                      <input
                        type="text"
                        placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                        className="bg-transparent border-none outline-none focus:outline-none w-full text-gray-700 font-medium"
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
              className="group w-full py-10 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-600 transition-all duration-300 mt-8 outline-none focus:outline-none"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-gray-200 border border-gray-100">
                <Plus size={24} />
              </div>
              <span className="font-bold tracking-wide uppercase text-xs">Thêm câu hỏi mới</span>
            </button>
          </section>
        </div>

        <aside className="w-[320px] shrink-0 space-y-6">
          <div className="sticky top-[100px] space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">
                <Layout size={16} className="text-blue-600" />
                Mục lục câu hỏi
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {questions.map((_, i) => (
                  <a
                    href={`#question-${i}`}
                    key={i}
                    className="w-full aspect-square flex items-center justify-center bg-gray-50 text-gray-400 text-sm font-bold rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all outline-none focus:outline-none"
                  >
                    {i + 1}
                  </a>
                ))}
                <button
                  onClick={addQuestion}
                  className="w-full aspect-square flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl border border-dashed border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all outline-none focus:outline-none"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-6 uppercase tracking-wider">
                <Settings size={16} className="text-blue-600" />
                Cấu hình bổ sung
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-600 px-2 py-1 rounded-md uppercase">Bản nháp</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-500">Hạn t.gian:</span>
                  <select className="bg-transparent border-none outline-none focus:outline-none text-sm font-bold text-gray-700 p-0">
                    <option>Không giới hạn</option>
                    <option>15 phút</option>
                    <option>30 phút</option>
                    <option>60 phút</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CreateQuiz;
