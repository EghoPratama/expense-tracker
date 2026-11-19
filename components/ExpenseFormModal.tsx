import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATEGORY_INFO, CATEGORY_LIST } from '../constants/categories';
import { Category, Expense, NewExpense } from '../types';
import { formatRupiah, todayString } from '../utils/format';

type Props = {
  visible: boolean;
  expense: Expense | null; // null = tambah baru, berisi = mengubah
  onClose: () => void;
  onSubmit: (data: NewExpense) => Promise<void>;
};

export default function ExpenseFormModal({
  visible,
  expense,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState('');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEditing = expense !== null;

  // Isi form setiap kali dibuka: data lama kalau mengubah, kosong kalau baru
  useEffect(() => {
    if (!visible) return;

    setTitle(expense?.title ?? '');
    setAmountText(expense !== null ? String(expense.amount) : '');
    setCategory(expense?.category ?? 'food');
    setError(null);
    setSaving(false);
  }, [visible, expense]);

  const amount = Number(amountText);

  const handleAmountChange = (text: string) => {
    // Hanya angka, tanpa nol di depan
    setAmountText(text.replace(/\D/g, '').replace(/^0+/, ''));
  };

  const handleSave = async () => {
    if (saving) return;

    if (title.trim() === '') {
      setError('Nama pengeluaran wajib diisi.');
      return;
    }
    if (amount <= 0) {
      setError('Nominal harus lebih dari 0.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        amount,
        category,
        date: expense?.date ?? todayString(),
      });
    } catch (e) {
      console.warn('Gagal menyimpan pengeluaran', e);
      setError('Gagal menyimpan. Periksa koneksi internetmu lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <Text style={styles.heading}>
            {isEditing ? 'Ubah pengeluaran' : 'Pengeluaran baru'}
          </Text>

          <Text style={styles.label}>Nama</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Makan siang"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Nominal</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            maxLength={12}
            value={amountText}
            onChangeText={handleAmountChange}
          />
          {amount > 0 && (
            <Text style={styles.preview}>{formatRupiah(amount)}</Text>
          )}

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.chipRow}>
            {CATEGORY_LIST.map((key) => {
              const selected = key === category;
              return (
                <Pressable
                  key={key}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setCategory(key)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {CATEGORY_INFO[key].icon} {CATEGORY_INFO[key].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error !== null && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Batal</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 16,
  },
  preview: {
    color: '#059669',
    fontWeight: '600',
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  chipSelected: {
    backgroundColor: '#059669',
  },
  chipText: {
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  error: {
    color: '#dc2626',
    marginTop: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});