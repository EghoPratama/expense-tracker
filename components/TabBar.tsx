import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tab } from '../types';

type Props = {
  current: Tab;
  onChange: (tab: Tab) => void;
};

const TABS: { value: Tab; label: string }[] = [
  { value: 'list', label: 'Transaksi' },
  { value: 'summary', label: 'Ringkasan' },
];

export default function TabBar({ current, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const selected = tab.value === current;
        return (
          <Pressable
            key={tab.value}
            style={[styles.tab, selected && styles.tabSelected]}
            onPress={() => onChange(tab.value)}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabSelected: {
    backgroundColor: '#fff',
  },
  text: {
    color: '#6b7280',
    fontWeight: '600',
  },
  textSelected: {
    color: '#111827',
  },
});