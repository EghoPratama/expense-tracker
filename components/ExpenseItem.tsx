import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_INFO } from '../constants/categories';
import { Expense } from '../types';
import { formatDate, formatRupiah } from '../utils/format';

type Props = {
  expense: Expense;
  onPress: () => void;
  onLongPress: () => void;
};

export default function ExpenseItem({ expense, onPress, onLongPress }: Props) {
  const category = CATEGORY_INFO[expense.category];

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.meta}>
          {category.label} · {formatDate(expense.date)}
        </Text>
      </View>

      <Text style={styles.amount}>{formatRupiah(expense.amount)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  itemPressed: {
    opacity: 0.7,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
});