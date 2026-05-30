"use client";

import { useState, useEffect } from "react";

export function DailyReminderModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mock the logic: show if user hasn't logged anything yesterday.
    // For now, always show after 1s for simulation.
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-xl mb-4">
            👋
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight mb-2">Nhắc nhở nhập liệu!</h2>
          <p className="text-sm text-neutral-400">
            Hôm qua bạn chưa ghi nhận bất kỳ khoản chi tiêu nào. Bạn có muốn bỏ ra 1 phút để nhớ lại và nhập các giao dịch không?
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 px-4 rounded-xl text-neutral-400 font-medium text-sm hover:bg-white/[0.03] transition-colors cursor-pointer"
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
