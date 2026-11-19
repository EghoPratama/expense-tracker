import { supabase } from '../lib/supabase';
import { Category, Expense, NewExpense } from '../types';

// Bentuk baris di database (nama kolom pakai snake_case)
type ExpenseRow = {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  created_at: string;
};

const COLUMNS = 'id, title, amount, category, date, created_at';

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    category: row.category,
    date: row.date,
    createdAt: row.created_at,
  };
}

export async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select(COLUMNS)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ExpenseRow[]).map(toExpense);
}

export async function insertExpense(expense: NewExpense): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    })
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toExpense(data as ExpenseRow);
}

export async function removeExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function updateExpense(
  id: string,
  expense: NewExpense
): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    })
    .eq('id', id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return toExpense(data as ExpenseRow);
}