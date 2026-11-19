import { supabase } from '../lib/supabase';

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

// needsConfirmation = true kalau akun dibuat tapi belum ada sesi
// (terjadi hanya jika "Confirm email" di dashboard menyala)
export async function signUp(
  email: string,
  password: string
): Promise<{ needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { needsConfirmation: data.session === null };
}

// scope 'local': keluar di HP ini saja, tanpa perlu internet
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}