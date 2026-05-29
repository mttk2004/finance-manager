export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0a0a0a] text-neutral-200 font-sans overflow-hidden">
      {/* Header Section */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Chào buổi sáng, Sơn!</h1>
          <p className="text-xs text-neutral-500">Thứ Ba, ngày 24 tháng 10 năm 2023</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500">Tổng tài sản</span>
            <span className="text-lg font-mono text-emerald-400 font-bold">42.500.000đ</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 p-4 sm:p-8 overflow-y-auto">
        {/* Left Column: Action & Entry */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          
          {/* Summary & Budget Progress */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-medium text-neutral-400">Ngân sách tháng 10</h3>
              <span className="text-xs font-mono text-neutral-500">Đã chi 65%</span>
            </div>
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[65%]"></div>
            </div>
            <div className="flex justify-between mt-3 text-[11px] font-mono">
              <span className="text-neutral-400">- 9.750.000đ</span>
              <span className="text-neutral-500">Hạn mức: 15.000.000đ</span>
            </div>
          </div>

          {/* Action Zone */}
          <div className="flex-1 bg-neutral-900/50 border border-white/5 rounded-2xl p-6 flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Nhập nhanh (One-Tap)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <button className="p-3 rounded-xl bg-neutral-800 border border-white/5 hover:border-blue-500 transition-colors text-center cursor-pointer">
                <div className="text-xl mb-1">☕</div>
                <div className="text-[10px] text-neutral-400">Cà phê 35k</div>
              </button>
              <button className="p-3 rounded-xl bg-neutral-800 border border-white/5 hover:border-blue-500 transition-colors text-center cursor-pointer">
                <div className="text-xl mb-1">🍜</div>
                <div className="text-[10px] text-neutral-400">Ăn sáng 40k</div>
              </button>
              <button className="p-3 rounded-xl bg-neutral-800 border border-white/5 hover:border-blue-500 transition-colors text-center cursor-pointer">
                <div className="text-xl mb-1">🚌</div>
                <div className="text-[10px] text-neutral-400">Grab/Bus 25k</div>
              </button>
              <button className="p-3 rounded-xl bg-neutral-800 border border-white/5 hover:border-blue-500 transition-colors text-center cursor-pointer">
                <div className="text-xl mb-1">🛒</div>
                <div className="text-[10px] text-neutral-400">Tạp hóa 150k</div>
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input type="text" placeholder="0.00" className="w-full bg-transparent border-b-2 border-neutral-800 text-5xl font-mono text-white py-4 focus:outline-none focus:border-blue-500 placeholder:text-neutral-800" />
                <span className="absolute right-0 bottom-4 text-neutral-600 text-xl font-mono">VND</span>
              </div>
              <input type="text" placeholder="Ghi chú + #hashtag (Ví dụ: Ăn trưa #vui_ve)" className="w-full bg-neutral-800/50 border border-white/5 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-500" />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button className="py-4 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 cursor-pointer">GHI CHI (OUT)</button>
                <button className="py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 cursor-pointer">GHI THU (IN)</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Recent */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          
          {/* Insights Section */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-6">Dòng tiền 7 ngày</h3>
            <div className="h-32 flex items-end justify-between gap-2">
              <div className="w-full bg-emerald-500/20 h-[40%] rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-emerald-500 h-[20%] rounded-t-sm"></div></div>
              <div className="w-full bg-rose-500/20 h-[60%] rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-rose-500 h-[45%] rounded-t-sm"></div></div>
              <div className="w-full bg-emerald-500/20 h-[30%] rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-emerald-500 h-[10%] rounded-t-sm"></div></div>
              <div className="w-full bg-rose-500/20 h-[80%] rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-rose-500 h-[70%] rounded-t-sm"></div></div>
              <div className="w-full bg-emerald-500/20 h-[50%] rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-emerald-500 h-[40%] rounded-t-sm"></div></div>
              <div className="w-full bg-rose-500/20 h-[40%] rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-rose-500 h-[30%] rounded-t-sm"></div></div>
              <div className="w-full bg-emerald-500/20 h-[90%] rounded-t-sm relative"><div className="absolute bottom-0 w-full bg-emerald-500 h-[85%] rounded-t-sm"></div></div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="flex-1 bg-neutral-900/50 border border-white/5 rounded-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500">Giao dịch gần đây</h3>
              <button className="text-[10px] text-blue-400 hover:underline cursor-pointer">Xem tất cả</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">☕</div>
                  <div>
                    <p className="text-sm text-neutral-200 line-clamp-1">Cà phê Highland</p>
                    <p className="text-[10px] text-neutral-500">Hôm nay • #lam_viec</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-medium text-rose-400 whitespace-nowrap">- 35.000đ</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">💰</div>
                  <div>
                    <p className="text-sm text-neutral-200 line-clamp-1">Thanh toán Freelance</p>
                    <p className="text-[10px] text-neutral-500">Hôm qua • #thu_nhap</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-medium text-emerald-400 whitespace-nowrap">+ 2.500.000đ</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">🍜</div>
                  <div>
                    <p className="text-sm text-neutral-200 line-clamp-1">Bún chả Obamall</p>
                    <p className="text-[10px] text-neutral-500">Hôm qua • #an_uong</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-medium text-rose-400 whitespace-nowrap">- 55.000đ</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">🏠</div>
                  <div>
                    <p className="text-sm text-neutral-200 line-clamp-1">Tiền điện tháng 10</p>
                    <p className="text-[10px] text-neutral-500">22/10 • #co_dinh</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-medium text-rose-400 whitespace-nowrap">- 840.000đ</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Bar Info */}
      <footer className="px-8 py-4 flex-col sm:flex-row flex sm:justify-between items-center text-[10px] text-neutral-600 border-t border-white/5 bg-black/40 mt-auto gap-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
          <span>Quỹ chính: <strong className="text-neutral-400">Ví Tiền Mặt</strong> (32.000.000đ)</span>
          <span>Dự phòng: <strong className="text-neutral-400">Tiết kiệm</strong> (10.500.000đ)</span>
        </div>
        <div className="flex items-center justify-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          Connected to Neon Serverless DB
        </div>
      </footer>
    </div>
  );
}
