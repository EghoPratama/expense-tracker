import { Session } from '@supabase/supabase-js';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { supabase } from './lib/supabase';
import AuthScreen from './screens/AuthScreen';
import ExpenseScreen from './screens/ExpenseScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // 1. Cek sesi yang tersimpan di HP (dari login sebelumnya)
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (e) {
        console.warn('Gagal membaca sesi', e);
      } finally {
        setChecking(false);
      }
    };
    init();

    // 2. Pantau perubahan: login, logout, sesi kedaluwarsa
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#059669" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (session === null) {
    return <AuthScreen />;
  }

  return (
    <ExpenseScreen key={session.user.id} email={session.user.email ?? ''} />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
});