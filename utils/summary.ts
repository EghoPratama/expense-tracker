import { Category, Expense } from '../types';

export type CategoryTotal = {
  category: Category;
  total: number;
  percent: number; // 0-100
};

export function filterByMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((expense) => expense.date.startsWith(month));
}

export function sumAmounts(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

// Total per kategori, diurutkan dari yang terbesar. Kategori tanpa transaksi tidak dimasukkan.
export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const grandTotal = sumAmounts(expenses);
  if (grandTotal === 0) return [];

  const totals = new Map<Category, number>();
  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  return Array.from(totals, ([category, total]) => ({
    category,
    total,
    percent: (total / grandTotal) * 100,
  })).sort((a, b) => b.total - a.total);
}