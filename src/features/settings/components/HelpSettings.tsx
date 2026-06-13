import { HelpCircle, BookOpen, Lightbulb, Keyboard, Info } from "lucide-react";

export function HelpSettings() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Hướng dẫn sử dụng</h2>
          <p className="text-sm text-muted-foreground">Các mẹo để sử dụng ứng dụng hiệu quả nhất.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Section 1 */}
        <div className="bg-secondary/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-semibold text-base text-foreground">Nhập liệu siêu tốc</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>
              <span><strong>Hashtag (#):</strong> Gõ ký tự <code>#</code> vào ô ghi chú để mở danh sách gợi ý. Khi chọn một hashtag, ứng dụng sẽ tự động nhận diện danh mục (Ăn uống, Đi lại...) mà không cần bạn phải chọn thủ công.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold mt-0.5">•</span>
              <span><strong>Nhập nhanh (One-tap):</strong> Sử dụng các nút Lối tắt trên trang Dashboard để điền sẵn cả số tiền và ghi chú cho các khoản chi tiêu lặp lại (VD: Tiền cafe sáng).</span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-secondary/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Keyboard className="w-5 h-5" />
            <h3 className="font-semibold text-base text-foreground">Phím tắt & Thao tác</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>Nhấn phím <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-white text-xs mx-1">N</kbd> trên màn hình chính (Desktop) để ngay lập tức tập trung vào ô nhập số tiền.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span><strong>Hoàn tác (Undo):</strong> Nếu nhập sai giao dịch, một nút <em>Hoàn tác</em> sẽ hiển thị ở góc phải phía trên màn hình trong vòng 8 giây để bạn rút lại ngay lập tức.</span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-secondary/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-purple-400">
            <Info className="w-5 h-5" />
            <h3 className="font-semibold text-base text-foreground">Quản lý An toàn</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-0.5">•</span>
              <span><strong>Xóa dữ liệu:</strong> Khi xóa một Quỹ hoặc Danh mục, bạn luôn có tùy chọn <em>Chuyển dữ liệu</em> sang một nơi khác để đảm bảo không bị mất lịch sử giao dịch.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 font-bold mt-0.5">•</span>
              <span><strong>Cảnh báo ngân sách:</strong> Số tiền nhập sẽ chuyển màu <strong>Cam</strong> nếu khoản chi đó vượt quá ngân sách bạn đã đặt ra trong tháng.</span>
            </li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-secondary/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 text-orange-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-semibold text-base text-foreground">Báo cáo & Phân tích</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              <span>Sử dụng trang <strong>Biểu đồ</strong> để xem trực quan dòng tiền. Bạn có thể thay đổi bộ lọc thời gian ở góc phải từng biểu đồ.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 font-bold mt-0.5">•</span>
              <span>Trong trang <strong>Giao dịch</strong>, bạn có thể xuất dữ liệu ra file Excel (.csv) hoặc báo cáo PDF để lưu trữ.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
