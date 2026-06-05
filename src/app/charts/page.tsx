import { getBalanceHistory, getCashFlowData, getCategorySpendingData } from "@/server/actions/charts";
import ChartsClient from "@/features/charts/charts-client";

export default async function ChartsPage() {
  const [balance, trend, category] = await Promise.all([
    getBalanceHistory('this-month'),
    getCashFlowData('this-month'),
    getCategorySpendingData('this-month')
  ]);

  return (
    <ChartsClient 
      initialBalance={balance} 
      initialTrend={trend} 
      initialCategory={category} 
    />
  );
}
