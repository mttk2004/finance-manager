import { getDashboardData } from "@/server/actions/dashboard";
import DashboardClient from "@/features/dashboard/dashboard-client";

export default async function DashboardPage() {
  const initialData = await getDashboardData();
  
  return <DashboardClient initialData={initialData} />;
}
