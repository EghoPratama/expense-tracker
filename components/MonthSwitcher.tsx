import { Pressable, StyleSheet, Text, View } from 'react-native';
import { monthLabel, shiftMonth } from '../utils/format';

type Props = {
  month: string; // "2026-11"
  maxMonth: string; // bulan terbaru yang boleh dibuka
  onChange: (month: string) => void;
};

export default function MonthSwitcher({ month, maxMonth, onChange }: Props) {
  const canGoNext = month < maxMonth;

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.arrow}
        onPress={() => onChange(shiftMonth(month, -1))}
        hitSlop={10}
      >
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>

      <Text style={styles.label}>{monthLabel(month)}</Text>

      <Pressable
        style={[styles.arrow, !canGoNext && styles.arrowDisabled]}
        onPress={() => onChange(shiftMonth(month, 1))}
        disabled={!canGoNext}
        hitSlop={10}
      >
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  arrowText: {
    fontSize: 24,
    lineHeight: 28,
    color: '#111827',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
});