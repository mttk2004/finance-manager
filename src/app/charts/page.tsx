import { getBalanceHistory, getCashFlowData, getCategorySpendingData } from "@/lib/db/actions";
import ChartsClient from "./ChartsClient";

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
