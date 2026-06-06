export const QUERY_KEYS = {
  FUNDS: ['funds'] as const,
  CATEGORIES: ['categories'] as const,
  BUDGETS: (period: string) => ['budgets', period] as const,
  TEMPLATES: ['templates'] as const,
  DASHBOARD: ['dashboard'] as const,
  TRANSACTIONS: (filters: any) => ['transactions', filters] as const,
  BALANCE_HISTORY: (range: string) => ['balanceHistory', range] as const,
  CASH_FLOW_TREND: (range: string) => ['cashFlowTrend', range] as const,
  CASH_FLOW_BAR: (range: string) => ['cashFlowBar', range] as const,
  CATEGORY_SPENDING: (range: string) => ['categorySpending', range] as const,
  TOP_SPENDING: (range: string) => ['topSpending', range] as const,
};

export const TRANSACTION_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  TRANSFER: 'TRANSFER',
  LEND: 'LEND',
  BORROW: 'BORROW',
} as const;

export const CATEGORY_TYPES = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export const DATE_RANGE_OPTIONS = [
  { value: "this-month", label: "Tháng này" },
  { value: "last-month", label: "Tháng trước" },
  { value: "last-3-months", label: "3 tháng gần nhất" },
  { value: "last-6-months", label: "6 tháng gần nhất" },
  { value: "last-12-months", label: "12 tháng gần nhất" },
  { value: "all-time", label: "Tất cả thời gian" },
];
