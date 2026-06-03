"use client";

import { useState, useEffect } from "react";

interface DailyReminderModalProps {
  show?: boolean;
}

export function DailyReminderModal({ show = false }: DailyReminderModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-xl mb-4">
            👋
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight mb-2">Nhắc nhở nhập liệu!</h2>
          <p className="text-sm text-muted-foreground">
            Hôm qua bạn chưa ghi nhận bất kỳ khoản chi tiêu nào. Bạn có muốn bỏ ra 1 phút để nhớ lại và nhập các giao dịch không?
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 px-4 rounded-xl text-muted-foreground font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            Đưa tôi vào app
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-neutral-950 font-semibold text-sm hover:bg-emerald-400 active:scale-[0.98] transition-all cursor-pointer"
          >
            Nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
}
