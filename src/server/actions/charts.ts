'use server'

import { ChartService } from '../services/charts';

export async function getCashFlowData(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
  return await ChartService.getCashFlow(range);
}

export async function getCategorySpendingData(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
  return await ChartService.getCategorySpending(range);
}

export async function getReportData(startDate: Date, endDate: Date) {
  return await ChartService.getReportData(startDate, endDate);
}

export async function getBalanceHistory(range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time') {
  return await ChartService.getBalanceHistory(range);
}
