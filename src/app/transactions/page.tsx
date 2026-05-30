import { getAllTransactions } from "@/lib/db/actions";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  const transactions = await getAllTransactions();
  
  return <TransactionsClient initialTransactions={transactions} />;
}
