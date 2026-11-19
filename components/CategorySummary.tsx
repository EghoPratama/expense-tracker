import { StyleSheet, Text, View } from 'react-native';
import { CATEGORY_INFO } from '../constants/categories';
import { Expense } from '../types';
import { formatRupiah } from '../utils/format';
import { totalsByCategory } from '../utils/summary';

type Props = {
  expenses: Expense[]; // sudah disaring untuk satu bulan
};

export default function CategorySummary({ expenses }: Props) {
  const rows = totalsByCategory(expenses);

  if (rows.length === 0) {
    return <Text style={styles.empty}>Belum ada data untuk bulan ini.</Text>;
  }

  return (
    <View>
      {rows.map((row) => {
        const info = CATEGORY_INFO[row.category];
        return (
          <View key={row.category} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.name}>
                {info.icon} {info.label}
              </Text>
              <Text style={styles.amount}>{formatRupiah(row.total)}</Text>
            </View>

            <View style={styles.track}>
              <View style={[styles.fill, { width: `${row.percent}%` }]} />
            </View>

            <Text style={styles.percent}>{Math.round(row.percent)}% dari total</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  percent: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
});