"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fund, Category, Budget, Template } from "@/types";
import { useFunds } from "@/hooks/use-funds";
import { useCategories } from "@/hooks/use-categories";
import { useBudgets } from "@/hooks/use-budgets";
import { useTemplates } from "@/hooks/use-templates";
import { FundSettings } from "./components/FundSettings";
import { CategorySettings } from "./components/CategorySettings";
import { BudgetSettings } from "./components/BudgetSettings";
import { ShortcutSettings } from "./components/ShortcutSettings";
import { GeneralSettings } from "./components/GeneralSettings";
import { HelpSettings } from "./components/HelpSettings";
import { Wallet, Tag, Zap, Target, Sliders, HelpCircle } from "lucide-react";

interface SettingsClientProps {
  initialFunds: Fund[];
  initialCategories: Category[];
  initialBudgets: Budget[];
  initialTemplates: Template[];
  currentMonthPeriod: string;
}

const SETTINGS_TABS = [
  { 
    id: "funds", 
    name: "Quỹ", 
    description: "Tài khoản, ví & tiền mặt", 
    icon: Wallet 
  },
  { 
    id: "categories", 
    name: "Danh mục", 
    description: "Nhóm thu nhập & chi tiêu", 
    icon: Tag 
  },
  { 
    id: "shortcuts", 
    name: "Lối tắt", 
    description: "Mẫu giao dịch nhanh", 
    icon: Zap 
  },
  { 
    id: "budget", 
    name: "Ngân sách", 
    description: "Hạn mức chi tiêu tháng", 
    icon: Target 
  },
  { 
    id: "general", 
    name: "Chung", 
    description: "Giao diện & Accent color", 
    icon: Sliders 
  },
  { 
    id: "help", 
    name: "Hướng dẫn", 
    description: "Học cách làm chủ ứng dụng", 
    icon: HelpCircle 
  },
];

function SettingsContent({ 
  initialFunds, 
  initialCategories, 
  initialBudgets, 
  initialTemplates, 
  currentMonthPeriod 
}: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const activeTab = searchParams.get("tab") || "funds";

  const setActiveTab = (tab: string) => {
    router.push(`/settings?tab=${tab}`, { scroll: false });
  };
  
  // --- Custom Hooks ---
  const { funds, isFetching: fundsFetching } = useFunds(initialFunds);
  const { categories, isFetching: categoriesFetching } = useCategories(initialCategories);
  const { budgets, isFetching: budgetsFetching } = useBudgets(currentMonthPeriod, initialBudgets);
  const { templates, isFetching: templatesFetching } = useTemplates(initialTemplates);

  const isLoading = fundsFetching || categoriesFetching || budgetsFetching || templatesFetching;

  return (
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-5xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Cài đặt</h1>
        <p className="text-muted-foreground text-sm">Cấu hình thiết lập, tối ưu hóa các lối tắt và cá nhân hóa trải nghiệm tài chính của bạn.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col gap-1 w-full md:w-64 shrink-0 bg-card/40 backdrop-blur-xl border border-border p-4 rounded-3xl">
          {SETTINGS_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-start gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer text-left group active:scale-[0.98] ${
                  isActive 
                    ? "bg-primary-accent/10 border border-primary-accent/10 text-foreground" 
                    : "border border-transparent hover:bg-white/[0.02] text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive ? "bg-primary-accent text-white" : "bg-white/[0.03] text-muted-foreground group-hover:text-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight">{tab.name}</span>
                  <span className="text-[10px] text-muted-foreground/80 mt-0.5 leading-none">{tab.description}</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-2 w-full -mx-4 px-4 mb-4">
          {SETTINGS_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer border ${
                  isActive 
                    ? "bg-primary-accent/10 border-primary-accent text-primary-accent font-bold" 
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-grow w-full bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 min-h-[480px] shadow-2xl relative">
          {activeTab === "funds" && (
            <FundSettings funds={funds} isLoading={isLoading} />
          )}

          {activeTab === "categories" && (
            <CategorySettings categories={categories} isLoading={isLoading} />
          )}

          {activeTab === "budget" && (
            <BudgetSettings 
              categories={categories} 
              budgets={budgets} 
              currentMonthPeriod={currentMonthPeriod} 
              isLoading={isLoading} 
            />
          )}

          {activeTab === "shortcuts" && (
            <ShortcutSettings categories={categories} templates={templates} isLoading={isLoading} />
          )}
          
          {activeTab === "general" && (
            <GeneralSettings isLoading={isLoading} />
          )}

          {activeTab === "help" && (
            <HelpSettings />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsClient(props: SettingsClientProps) {
  return (
    <Suspense fallback={null}>
      <SettingsContent {...props} />
    </Suspense>
  );
}
