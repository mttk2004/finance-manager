import { getFunds, getCategories, getBudgets } from "@/lib/db/actions";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const funds = await getFunds();
  const categories = await getCategories();
  
  const now = new Date();
  const currentMonthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const budgets = await getBudgets(currentMonthPeriod);
  
  return <SettingsClient initialFunds={funds} initialCategories={categories} initialBudgets={budgets} currentMonthPeriod={currentMonthPeriod} />;
}
