"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("funds");

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-3xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Cài đặt</h1>
        <p className="text-neutral-400">Quản lý các quỹ, danh mục và lối tắt của bạn.</p>
      </div>

      <div className="flex gap-4 border-b border-white/[0.04] mb-8 overflow-x-auto scrollbar-hide pb-2">
        {[
          { id: "funds", name: "Quỹ" },
          { id: "categories", name: "Danh mục" },
          { id: "shortcuts", name: "Lối tắt nhanh" },
          { id: "budget", name: "Ngân sách" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6">
        {activeTab === "funds" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-white">Quản lý Quỹ (Funds)</h3>
              <button className="text-xs bg-white text-black font-medium px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer">
                + Thêm quỹ
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Quỹ chính", isDefault: true, balance: 45500000 },
                { name: "Quỹ dự phòng", isDefault: false, balance: 20000000 },
                { name: "Quỹ du lịch", isDefault: false, balance: 5000000 },
              ].map(fund => (
                <div key={fund.name} className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-xl border border-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-neutral-200">{fund.name}</span>
                    {fund.isDefault && (
                      <span className="text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-mono text-neutral-400 text-sm">{fund.balance.toLocaleString('vi-VN')}đ</span>
                     <button className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar tabs for other sections but kept minimal for mockup */}
        {activeTab !== "funds" && (
          <div className="py-12 text-center text-neutral-500 text-sm">
            Nội dung {activeTab} sẽ được mở rộng trong tương lai...
          </div>
        )}
      </div>
    </div>
  );
}
