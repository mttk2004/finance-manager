"use client";


export function IncomeDistributionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-xl mb-4">
            🏦
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight mb-2">Phân bổ thu nhập</h2>
          <p className="text-sm text-neutral-400">
            Bạn vừa thêm 1 khoản thu nhập. Bạn có muốn trích một phần vào các quỹ phụ không?
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          {['Quỹ dự phòng', 'Quỹ du lịch', 'Quỹ đầu tư'].map(fund => (
            <div key={fund} className="flex items-center justify-between bg-[#1A1A1A] p-3 rounded-xl border border-white/[0.02]">
              <span className="text-sm font-medium text-neutral-300">{fund}</span>
              <div className="relative w-24">
                <input type="text" placeholder="0" className="w-full bg-transparent text-right text-sm font-mono text-white focus:outline-none placeholder:text-neutral-600 pr-4" />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-500 text-xs text-mono">đ</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-neutral-400 font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            Bỏ qua
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 active:scale-[0.98] transition-all cursor-pointer"
          >
            Lưu phân bổ
          </button>
        </div>
      </div>
    </div>
  );
}
