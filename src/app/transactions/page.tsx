import { getAllTransactions } from "@/server/actions/transactions";
import { getFunds } from "@/server/actions/funds";
import { getCategories } from "@/server/actions/categories";
import TransactionsClient from "@/features/transactions/transactions-client";

export default async function TransactionsPage() {
  const [transactions, funds, categories] = await Promise.all([
    getAllTransactions(),
    getFunds(),
    getCategories(),
  ]);
  
  return <TransactionsClient initialTransactions={transactions} funds={funds} categories={categories} />;
}
