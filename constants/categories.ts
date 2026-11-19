import { Category } from '../types';

export const CATEGORY_INFO: Record<Category, { label: string; icon: string }> = {
  food: { label: 'Makanan', icon: '🍜' },
  transport: { label: 'Transportasi', icon: '🛵' },
  shopping: { label: 'Belanja', icon: '🛍️' },
  bills: { label: 'Tagihan', icon: '💡' },
  other: { label: 'Lainnya', icon: '📦' },
};

export const CATEGORY_LIST = Object.keys(CATEGORY_INFO) as Category[];