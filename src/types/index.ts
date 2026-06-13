export type CategoryType = 'INCOME' | 'EXPENSE';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'LEND' | 'BORROW';

export interface Category {
  id: string;
  name: string;
  type?: CategoryType;
  icon?: string | null;
  hashtags?: string[] | null;
}

export interface Fund {
  id: string;
  name: string;
  balance: number | null;
  isDefault: boolean | null;
  attributes?: Record<string, unknown> | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Transaction {
  id: string;
  fundId?: string;
  toFundId?: string | null;
  categoryId?: string | null;
  amount: number;
  type: TransactionType;
  date: Date | null;
  note: string | null;
  createdAt?: Date | null;
  category?: Category | null;
  fund?: { id?: string, name: string } | null;
  toFund?: { id?: string, name: string } | null;
}

export interface Budget {
  id: string;
  categoryId: string;
  amountLimit: number;
  period: string;
  isOverride: boolean;
  category?: Category | null;
}

export interface Template {
  id: string;
  title: string;
  type: TransactionType;
  categoryId: string | null;
  amount: number | null;
  notePreset: string | null;
  category?: Category | null;
}

export interface CashFlowItem {
  name: string;
  income: number;
  expense: number;
}

export interface CategorySpending {
  id: string;
  name: string;
  icon: string | null;
  spent: number;
  category?: Category | null;
}

export interface BalanceHistory {
  name: string;
  balance: number;
}

export interface DashboardData {
  allFunds: Fund[];
  recentTransactions: Transaction[];
  totalBalance: number;
  budgetTracking: (Budget & { spent: number })[];
  totalSpentMonth: number;
  totalSpentLastMonth: number;
  totalBudgetMonth: number;
  currentMonthPeriod: string;
  allCategories: Category[];
  initialCashFlow: CashFlowItem[];
  allTemplates: Template[];
}

export interface TransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
  totalCount: number;
}

export interface ReportData {
  summary: {
    income: number;
    expense: number;
    net: number;
    transactionCount: number;
  };
  categorySpending: CategorySpending[];
  cashFlow: CashFlowItem[];
  topTransactions: Transaction[];
}
