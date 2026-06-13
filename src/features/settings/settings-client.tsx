"use client";

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

interface SettingsClientProps {
  initialFunds: Fund[];
  initialCategories: Category[];
  initialBudgets: Budget[];
  initialTemplates: Template[];
  currentMonthPeriod: string;
}

export default function SettingsClient({ 
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
    <div className="flex flex-col w-full h-full pb-20 md:pb-8 max-w-3xl mx-auto mt-4 md:mt-8 px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý các quỹ, danh mục và lối tắt của bạn.</p>
      </div>

      <div className="flex gap-4 border-b border-border mb-8 overflow-x-auto scrollbar-hide pb-2">
        {[
          { id: "funds", name: "Quỹ" },
          { id: "categories", name: "Danh mục" },
          { id: "shortcuts", name: "Lối tắt nhanh" },
          { id: "budget", name: "Ngân sách" },
          { id: "general", name: "Chung" },
          { id: "help", name: "Hướng dẫn" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-neutral-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6">
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
  );
}
