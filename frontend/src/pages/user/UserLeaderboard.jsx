export default function UserLeaderboard() {
  return (
    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
      <h2 className="text-3xl font-black mb-6 dark:text-white tracking-tight">Bảng xếp hạng</h2>
      <p className="text-slate-500">Cạnh tranh cùng bạn bè để vươn lên vị trí dẫn đầu!</p>
      
      <div className="mt-8 space-y-4">
         {[1,2,3].map(i => (
           <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
              <div className="flex items-center gap-4">
                 <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">{i}</span>
                 <span className="font-bold dark:text-white">Người dùng ẩn danh</span>
              </div>
              <span className="font-black text-indigo-600">1000 pts</span>
           </div>
         ))}
      </div>
    </div>
  );
}
