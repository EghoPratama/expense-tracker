import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { signOut } from '../api/auth';
import {
  fetchExpenses,
  insertExpense,
  removeExpense,
  updateExpense,
} from '../api/expenses';
import CategorySummary from '../components/CategorySummary';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ExpenseItem from '../components/ExpenseItem';
import MonthSwitcher from '../components/MonthSwitcher';
import TabBar from '../components/TabBar';
import { Expense, NewExpense, Tab } from '../types';
import { formatRupiah, monthLabel, todayString } from '../utils/format';
import { filterByMonth, sumAmounts } from '../utils/summary';

type Props = {
  email: string;
};

export default function ExpenseScreen({ email }: Props) {
  const currentMonth = todayString().slice(0, 7); // "2026-11"

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [month, setMonth] = useState(currentMonth);
  const [tab, setTab] = useState<Tab>('list');

  // `editing` sengaja tidak dikosongkan saat form ditutup, supaya judul form
  // tidak berubah mendadak selama animasi menutup
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  // Pemuatan penuh: spinner di seluruh layar
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setExpenses(await fetchExpenses());
    } catch (e) {
      console.warn('Gagal memuat pengeluaran', e);
      setError('Gagal memuat data. Periksa koneksi internetmu lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Pemuatan senyap: data lama tetap tampil, kalau gagal cukup peringatan
  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      setExpenses(await fetchExpenses());
    } catch (e) {
      console.warn('Gagal memperbarui pengeluaran', e);
      Alert.alert('Gagal memperbarui', 'Periksa koneksi internetmu lalu coba lagi.');
    } finally {
      setRefreshing(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setModalVisible(true);
  };

  // Melempar error kalau gagal: form yang menampilkan pesannya
  const submitExpense = async (data: NewExpense) => {
    if (editing !== null) {
      const updated = await updateExpense(editing.id, data);
      setExpenses((current) =>
        current.map((expense) => (expense.id === updated.id ? updated : expense))
      );
    } else {
      const created = await insertExpense(data);
      setExpenses((current) => [created, ...current]);
      setMonth(currentMonth);
    }
    setModalVisible(false);
  };

  const deleteExpense = async (id: string) => {
    try {
      await removeExpense(id);
      setExpenses((current) => current.filter((expense) => expense.id !== id));
    } catch (e) {
      console.warn('Gagal menghapus pengeluaran', e);
      Alert.alert('Gagal menghapus', 'Periksa koneksi internetmu lalu coba lagi.');
    }
  };

  const confirmDelete = (expense: Expense) => {
    Alert.alert(
      'Hapus pengeluaran?',
      `${expense.title} (${formatRupiah(expense.amount)})`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteExpense(expense.id),
        },
      ]
    );
  };

  const confirmSignOut = () => {
    Alert.alert('Keluar dari akun?', email, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            // App.tsx mendeteksi sesi hilang dan menampilkan layar login
          } catch (e) {
            console.warn('Gagal keluar', e);
            Alert.alert('Gagal keluar', 'Coba lagi.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.message}>Memuat data...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (error !== null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.message}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadExpenses}>
          <Text style={styles.retryText}>Coba lagi</Text>
        </Pressable>
        <Pressable onPress={confirmSignOut} style={styles.errorSignOut} hitSlop={10}>
          <Text style={styles.signOut}>Keluar</Text>
        </Pressable>
        <StatusBar style="auto" />
      </View>
    );
  }

  // Data turunan: semuanya dihitung dari `expenses` dan `month`
  const monthExpenses = filterByMonth(expenses, month);
  const monthTotal = sumAmounts(monthExpenses);
  const sortedExpenses = [...monthExpenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor="#059669"
      colors={['#059669']}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
        <Pressable onPress={confirmSignOut} hitSlop={10}>
          <Text style={styles.signOut}>Keluar</Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>
          Pengeluaran {month === currentMonth ? 'bulan ini' : monthLabel(month)}
        </Text>
        <Text style={styles.summaryAmount}>{formatRupiah(monthTotal)}</Text>
      </View>

      <MonthSwitcher month={month} maxMonth={currentMonth} onChange={setMonth} />
      <TabBar current={tab} onChange={setTab} />

      {tab === 'list' ? (
        <>
          <Text style={styles.hint}>
            Ketuk untuk mengubah, tekan lama untuk menghapus
          </Text>
          <FlatList
            data={sortedExpenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
            ListEmptyComponent={
              <Text style={styles.empty}>Belum ada pengeluaran bulan ini.</Text>
            }
            renderItem={({ item }) => (
              <ExpenseItem
                expense={item}
                onPress={() => openEdit(item)}
                onLongPress={() => confirmDelete(item)}
              />
            )}
          />
        </>
      ) : (
        <ScrollView
          style={styles.summaryScroll}
          contentContainerStyle={styles.listContent}
          refreshControl={refreshControl}
        >
          <CategorySummary expenses={monthExpenses} />
        </ScrollView>
      )}

      <Pressable style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <ExpenseFormModal
        visible={modalVisible}
        expense={editing}
        onClose={() => setModalVisible(false)}
        onSubmit={submitExpense}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  email: {
    flex: 1,
    color: '#6b7280',
    fontSize: 13,
    marginRight: 12,
  },
  signOut: {
    color: '#dc2626',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  message: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorTitle: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#059669',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 24,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorSignOut: {
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: '#059669',
    borderRadius: 20,
    padding: 24,
  },
  summaryLabel: {
    color: '#d1fae5',
    fontSize: 14,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 6,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 10,
  },
  summaryScroll: {
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  empty: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 34,
  },
});