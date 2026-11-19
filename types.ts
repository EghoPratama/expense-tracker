export type Category = 'food' | 'transport' | 'shopping' | 'bills' | 'other';

export type Expense = {
  id: string; // uuid dari database
  title: string;
  amount: number; // dalam Rupiah, bilangan bulat
  category: Category;
  date: string; // format "2026-11-19"
  createdAt: string; // timestamp dari database, untuk urutan
};

// Data yang diisi pengguna (id dan createdAt dibuat database)
export type NewExpense = Omit<Expense, 'id' | 'createdAt'>;

export type Tab = 'list' | 'summary';