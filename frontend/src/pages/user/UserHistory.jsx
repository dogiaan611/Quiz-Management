export default function UserHistory() {
  return (
    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
      <h2 className="text-3xl font-black mb-6 dark:text-white tracking-tight">Lịch sử làm bài</h2>
      <p className="text-slate-500">Danh sách các bài thi bạn đã tham gia sẽ xuất hiện ở đây.</p>
      {/* Tính năng này đang được phát triển */}
      <div className="mt-10 p-20 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300">
         Chưa có dữ liệu lịch sử.
      </div>
    </div>
  );
}
