"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/hooks/use-dashboard";

interface GeneralSettingsProps {
  isLoading: boolean;
}

export function GeneralSettings({ isLoading: parentIsLoading }: GeneralSettingsProps) {
  const { resetData, isResetting } = useDashboard();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const isLoading = parentIsLoading || isResetting;

  const handleResetData = () => {
    resetData(undefined, {
      onSuccess: () => setIsResetConfirmOpen(false)
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-foreground">Cài đặt chung</h3>
      <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
        <h4 className="text-rose-500 font-semibold mb-2 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Vùng nguy hiểm
        </h4>
        <p className="text-sm text-muted-foreground mb-6">
          Hành động này sẽ xóa vĩnh viễn toàn bộ giao dịch, ngân sách, lối tắt và các quỹ bạn đã tạo. Ứng dụng sẽ được đưa về trạng thái mặc định ban đầu.
        </p>
        <button 
          onClick={() => setIsResetConfirmOpen(true)}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          XÓA TẤT CẢ DỮ LIỆU
        </button>
      </div>

      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground tracking-tight mb-2">Xác nhận reset?</h2>
              <p className="text-sm text-muted-foreground">
                Bạn có chắc chắn muốn xóa <strong className="text-foreground">TOÀN BỘ</strong> dữ liệu không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsResetConfirmOpen(false)}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl text-muted-foreground font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleResetData}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-400 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
