import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { signIn, signUp } from '../api/auth';

type Mode = 'login' | 'register';

function errorMessage(e: unknown): string {
  const code = (e as { code?: string } | null)?.code;

  switch (code) {
    case 'invalid_credentials':
      return 'Email atau password salah.';
    case 'user_already_exists':
      return 'Email ini sudah terdaftar. Silakan masuk.';
    case 'email_not_confirmed':
      return 'Email belum dikonfirmasi. Cek kotak masukmu.';
    case 'weak_password':
      return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
    default:
      return 'Terjadi kesalahan. Periksa koneksi internetmu lalu coba lagi.';
  }
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login');
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async () => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Format email tidak valid.');
      return;
    }
    if (!isLogin && password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password === '') {
      setError('Password wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (isLogin) {
        await signIn(cleanEmail, password);
      } else {
        const { needsConfirmation } = await signUp(cleanEmail, password);
        if (needsConfirmation) {
          setInfo('Akun dibuat. Cek emailmu untuk konfirmasi, lalu masuk.');
          setMode('login');
          setPassword('');
        }
      }
      // Kalau berhasil dan sesi terbentuk, App.tsx otomatis pindah ke layar utama
    } catch (e) {
      console.warn('Autentikasi gagal', e);
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>💸</Text>
        <Text style={styles.title}>Catatan Pengeluaran</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Masuk ke akunmu' : 'Buat akun baru'}
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="nama@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder={isLogin ? 'Password' : 'Minimal 6 karakter'}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleSubmit}
        />

        {error !== null && <Text style={styles.error}>{error}</Text>}
        {info !== null && <Text style={styles.info}>{info}</Text>}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? 'Masuk' : 'Daftar'}</Text>
          )}
        </Pressable>

        <Pressable onPress={switchMode} style={styles.switchRow} hitSlop={10}>
          <Text style={styles.switchText}>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <Text style={styles.switchLink}>{isLogin ? 'Daftar' : 'Masuk'}</Text>
          </Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logo: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
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
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    marginTop: 16,
  },
  info: {
    color: '#059669',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  switchRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#6b7280',
  },
  switchLink: {
    color: '#059669',
    fontWeight: '600',
  },
});