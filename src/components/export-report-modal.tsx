"use client";

import { useState, useRef } from "react";
import { getReportData } from "@/lib/db/actions";
import { toast } from "sonner";
import { CashFlowChart } from "@/components/cash-flow-chart";
import { CategoryDonutChart } from "@/components/category-donut-chart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ExportReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const data = await getReportData(new Date(startDate), new Date(endDate));
      setReportData(data);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu báo cáo");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#121212",
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Bao_cao_tai_chinh_${startDate}_den_${endDate}.pdf`);
      toast.success("Đã xuất báo cáo PDF thành công!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo file PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-6">
      <div className="bg-background border border-border rounded-[32px] w-full max-w-4xl max-h-full overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 md:p-8 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Xuất báo cáo PDF</h2>
            <p className="text-sm text-muted-foreground">Chọn khoảng thời gian để tạo báo cáo phân tích chi tiết.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Từ ngày</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Đến ngày</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>

          {!reportData ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Sẵn sàng tạo báo cáo</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">Nhấn nút bên dưới để xem trước báo cáo dựa trên khoảng thời gian bạn đã chọn.</p>
              <button 
                onClick={handlePreview}
                disabled={isGenerating}
                className="bg-white text-black font-bold px-8 py-3 rounded-2xl hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? "Đang xử lý..." : "Xem trước báo cáo"}
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div ref={reportRef} className="bg-card border border-border rounded-[32px] p-8 md:p-12 text-white">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Báo cáo Tài chính</h1>
                    <p className="text-muted-foreground">Thời gian: {new Date(startDate).toLocaleDateString('vi-VN')} - {new Date(endDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 mb-1">Ngày tạo</p>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-12">
                  <div className="bg-white/[0.03] p-6 rounded-3xl border border-border">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tổng thu nhập</p>
                    <p className="text-2xl font-mono text-emerald-400">+{reportData.summary.income.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="bg-white/[0.03] p-6 rounded-3xl border border-border">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tổng chi tiêu</p>
                    <p className="text-2xl font-mono text-rose-400">-{reportData.summary.expense.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="bg-white/[0.03] p-6 rounded-3xl border border-border">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Dư thuần</p>
                    <p className={`text-2xl font-mono ${reportData.summary.net >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                      {reportData.summary.net >= 0 ? '+' : ''}{reportData.summary.net.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Xu hướng Dòng tiền
                    </h3>
                    <div className="h-[250px] w-full">
                      <CashFlowChart data={reportData.cashFlow} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      Phân bổ Chi tiêu
                    </h3>
                    <div className="h-[250px] w-full">
                      <CategoryDonutChart data={reportData.categorySpending} />
                    </div>
                  </div>
                </div>

                <div className="mb-12">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Chi tiêu theo Danh mục
                  </h3>
                  <div className="space-y-4">
                    {reportData.categorySpending.slice(0, 5).map((cat: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-border">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon || "📊"}</span>
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <span className="font-mono font-medium text-neutral-300">-{cat.spent.toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Giao dịch lớn nhất
                  </h3>
                  <div className="overflow-hidden border border-border rounded-2xl">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-white/[0.03] text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Ngày</th>
                          <th className="px-4 py-3 font-medium">Danh mục</th>
                          <th className="px-4 py-3 font-medium">Ghi chú</th>
                          <th className="px-4 py-3 text-right font-medium">Số tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {reportData.topTransactions.map((tx: any, i: number) => (
                          <tr key={i} className="text-muted-foreground">
                            <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString('vi-VN')}</td>
                            <td className="px-4 py-3">{tx.category?.name || "Khác"}</td>
                            <td className="px-4 py-3 truncate max-w-[150px]">{tx.note || "-"}</td>
                            <td className={`px-4 py-3 text-right font-mono font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mt-20 pt-8 border-t border-border text-center">
                  <p className="text-xs text-neutral-600 italic">Báo cáo được tạo tự động bởi Personal Finance Manager</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setReportData(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-muted-foreground font-semibold text-sm hover:bg-white/10 transition-all cursor-pointer"
                >
                  Chọn lại thời gian
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={isGenerating}
                  className="flex-[2] py-4 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Đang chuẩn bị PDF...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Tải xuống PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
