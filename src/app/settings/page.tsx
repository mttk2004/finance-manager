import { getFunds } from "@/server/actions/funds";
import { getCategories } from "@/server/actions/categories";
import { getBudgets } from "@/server/actions/budgets";
import { getTemplates } from "@/server/actions/templates";
import SettingsClient from "@/features/settings/settings-client";

export default async function SettingsPage() {
  const funds = await getFunds();
  const categories = await getCategories();
  const templates = await getTemplates();
  
  const now = new Date();
  const currentMonthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const budgets = await getBudgets(currentMonthPeriod);
  
  return (
    <SettingsClient 
      initialFunds={funds} 
      initialCategories={categories} 
      initialBudgets={budgets} 
      initialTemplates={templates}
      currentMonthPeriod={currentMonthPeriod} 
    />
  );
}
