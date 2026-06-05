import { getAllTransactions } from "@/server/actions/transactions";
import TransactionsClient from "@/features/transactions/transactions-client";

export default async function TransactionsPage() {
  const transactions = await getAllTransactions();
  
  return <TransactionsClient initialTransactions={transactions} />;
}
