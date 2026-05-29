import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CashFlowChart } from "@/components/cash-flow-chart";
import { CategoryDonutChart } from "@/components/category-donut-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-col w-full h-full p-4 space-y-6 overflow-y-auto">
      {/* 1. Header & Summary */}
      <section className="pt-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Chào Sơn! 👋</h1>
            <p className="text-[11px] text-neutral-500">Thứ Ba, 24/10/2023</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
        </div>

        <div className="flex flex-col items-center mb-6">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Tổng số dư</span>
          <span className="text-4xl font-mono text-emerald-400 font-bold tracking-tighter">45.500.000đ</span>
        </div>

        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-xs font-medium text-neutral-400">Ngân sách tháng 10</h3>
            <span className="text-[10px] font-mono text-neutral-500">4M / 10M</span>
          </div>
          <Progress value={40} className="h-2 bg-neutral-800 [&>div]:bg-blue-500" />
          <div className="flex justify-between mt-2 text-[10px] font-mono">
            <span className="text-neutral-400">Đã chi: 40%</span>
            <span className="text-neutral-500">Còn lại: 6.000.000đ</span>
          </div>
        </div>
      </section>

      {/* 2. Action Zone */}
      <section>
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3 px-1">Nhập nhanh (One-Tap)</h3>
        {/* Horizontal Scroll Quick Templates */}
        <div className="flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide -mx-4 px-4">
          <Badge variant="outline" className="snap-start shrink-0 py-2 px-3 border-white/10 bg-neutral-900/50 hover:bg-neutral-800 cursor-pointer flex gap-2 text-xs">
            ☕ Cà phê 30k
          </Badge>
          <Badge variant="outline" className="snap-start shrink-0 py-2 px-3 border-white/10 bg-neutral-900/50 hover:bg-neutral-800 cursor-pointer flex gap-2 text-xs">
            ⛽ Đổ xăng 50k
          </Badge>
          <Badge variant="outline" className="snap-start shrink-0 py-2 px-3 border-white/10 bg-neutral-900/50 hover:bg-neutral-800 cursor-pointer flex gap-2 text-xs">
            🍜 Ăn sáng 40k
          </Badge>
          <Badge variant="outline" className="snap-start shrink-0 py-2 px-3 border-white/10 bg-neutral-900/50 hover:bg-neutral-800 cursor-pointer flex gap-2 text-xs">
            🚌 Di chuyển 25k
          </Badge>
        </div>

        <Card className="bg-neutral-900/50 border-white/5 mt-4">
          <CardContent className="p-4 space-y-4">
            <div className="relative border-b-2 border-neutral-800 focus-within:border-blue-500 transition-colors">
              <input 
                type="text" 
                placeholder="0" 
                className="w-full bg-transparent text-4xl font-mono text-white py-3 focus:outline-none placeholder:text-neutral-800 text-center" 
              />
              <span className="absolute right-2 bottom-3 text-neutral-600 text-sm font-mono">VND</span>
            </div>
            
            <input 
              type="text" 
              placeholder="Ghi chú + #hashtag (Ví dụ: Ăn trưa #vui_ve)" 
              className="w-full bg-neutral-800/30 border border-white/5 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-500" 
            />
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button className="py-3 rounded-xl bg-rose-600/10 text-rose-500 font-bold text-xs hover:bg-rose-600/20 border border-rose-500/20 transition-colors">
                CHI TIỀN
              </button>
              <button className="py-3 rounded-xl bg-emerald-600/10 text-emerald-500 font-bold text-xs hover:bg-emerald-600/20 border border-emerald-500/20 transition-colors">
                THU VÀO
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Insights & Charts */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="bg-neutral-900/50 border-white/5 p-4 flex flex-col justify-between">
          <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 mb-4">Dòng tiền 7 ngày</h3>
          <CashFlowChart />
        </Card>
        <Card className="bg-neutral-900/50 border-white/5 p-4 flex flex-col justify-between">
          <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 mb-4">Danh mục chi</h3>
          <CategoryDonutChart />
        </Card>
      </section>

      {/* 4. Recent Transactions */}
      <section className="pb-4">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-[10px] uppercase tracking-widest text-neutral-500">Giao dịch gần đây</h3>
          <button className="text-[10px] text-blue-400 hover:underline">Xem tất cả</button>
        </div>
        
        <Card className="bg-neutral-900/50 border-white/5 divide-y divide-white/5">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">☕</div>
              <div>
                <p className="text-xs text-neutral-200 font-medium">Cà phê Highland</p>
                <p className="text-[10px] text-neutral-500">Hôm nay • #lam_viec</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-rose-400">- 35.000đ</span>
          </div>
          
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">⛽</div>
              <div>
                <p className="text-xs text-neutral-200 font-medium">Đổ xăng</p>
                <p className="text-[10px] text-neutral-500">Hôm qua • #di_chuyen</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-rose-400">- 50.000đ</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">💰</div>
              <div>
                <p className="text-xs text-neutral-200 font-medium">Lương tháng 10</p>
                <p className="text-[10px] text-neutral-500">22/10 • #thu_nhap</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-400">+ 15.000.000đ</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">🍜</div>
              <div>
                <p className="text-xs text-neutral-200 font-medium">Bún chả Obamall</p>
                <p className="text-[10px] text-neutral-500">21/10 • #an_uong</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-rose-400">- 55.000đ</span>
          </div>

          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs shrink-0">🛒</div>
              <div>
                <p className="text-xs text-neutral-200 font-medium">Đi siêu thị Lotte</p>
                <p className="text-[10px] text-neutral-500">20/10 • #sinh_hoat</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-rose-400">- 530.000đ</span>
          </div>
        </Card>
      </section>
    </div>
  );
}
