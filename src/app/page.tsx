import { DashboardService } from "@/server/services/dashboard";
import { ChartService } from "@/server/services/charts";
import DashboardClient from "@/features/dashboard/dashboard-client";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/features/dashboard/dashboard-skeleton";

export default async function DashboardPage() {
  const essentialData = await DashboardService.getData();
  const cashFlowPromise = ChartService.getCashFlow('this-month');
  
  return (
    <DashboardClient initialData={essentialData} cashFlowPromise={cashFlowPromise} />
  );
}
