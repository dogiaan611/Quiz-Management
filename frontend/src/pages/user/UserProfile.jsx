export default function UserProfile() {
  return (
    <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
      <h2 className="text-3xl font-black mb-6 dark:text-white tracking-tight">Hồ sơ cá nhân</h2>
      
      <div className="flex flex-col items-center py-10">
         <div className="w-32 h-32 rounded-full bg-slate-200 mb-6 overflow-hidden border-4 border-indigo-50">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="avatar" />
         </div>
         <h3 className="text-2xl font-bold dark:text-white mb-2">Học sinh Pro</h3>
         <p className="text-slate-500">Thành viên từ: 2024</p>
         
         <button className="mt-8 px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 transition shadow-xl shadow-indigo-100">
            Chỉnh sửa hồ sơ
         </button>
      </div>
    </div>
  );
}
