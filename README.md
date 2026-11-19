# Catatan Pengeluaran

Aplikasi pencatat pengeluaran harian yang dibuat dengan React Native, Expo, TypeScript, dan Supabase. Setiap pengguna punya akun sendiri, dan datanya tersimpan di cloud sehingga aman saat ganti HP atau menginstal ulang aplikasi.

## Coba Sekarang

- **Unduh APK (Android):** [Rilis terbaru](https://github.com/EghoPratama/expense-tracker/releases/latest)
- **Akun demo:**
  - Email: `demo@example.com`
  - Password: `GANTI-DENGAN-PASSWORD-DEMO`

> Akun demo dipakai bersama, jadi datanya bisa berubah. Kamu juga bisa mendaftar dengan emailmu sendiri, datamu tidak akan terlihat oleh pengguna lain.
>
> Backend memakai paket gratis Supabase yang bisa dijeda otomatis jika lama tidak dipakai. Jika data gagal dimuat, kemungkinan proyeknya sedang dijeda. Beri tahu saya lewat issue di repository ini.

## Fitur

- Daftar, masuk, dan keluar; sesi tersimpan sehingga tidak perlu login ulang
- Tambah, ubah, dan hapus pengeluaran (nama, nominal, kategori)
- Lima kategori dengan ikon: Makanan, Transportasi, Belanja, Tagihan, Lainnya
- Total pengeluaran per bulan, dengan navigasi antar bulan
- Ringkasan per kategori: total, persentase, dan batang proporsi
- Format Rupiah (`Rp 1.250.000`) dan pratinjau nominal saat mengetik
- Tarik layar untuk menyegarkan data
- Penanganan loading, error, dan koneksi putus yang jelas di setiap layar
- Data tiap pengguna terisolasi di level database (Row Level Security)

## Teknologi

- [React Native](https://reactnative.dev/) dengan [Expo](https://expo.dev/)
- TypeScript
- [Supabase](https://supabase.com/): PostgreSQL, Auth, dan Row Level Security
- [@supabase/supabase-js](https://github.com/supabase/supabase-js)
- [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) untuk menyimpan sesi login
- [EAS Build](https://docs.expo.dev/build/introduction/) untuk membuat APK

## Keamanan Data

Aplikasi memakai kunci publik (anon) Supabase yang memang aman berada di dalam aplikasi, karena yang melindungi data adalah database, bukan aplikasi:

- **Row Level Security** aktif di tabel `expenses`. Policy hanya mengizinkan pengguna membaca, mengubah, dan menghapus baris miliknya sendiri (`user_id = auth.uid()`).
- Role `anon` (belum login) tidak punya akses sama sekali ke tabel.
- Kolom `user_id` diisi otomatis oleh database saat data ditambahkan, jadi klien tidak bisa menulis atas nama pengguna lain.
- Constraint di database menolak nominal 0 atau negatif, nama kosong, dan kategori di luar daftar, meskipun validasi di aplikasi terlewat.
- Kunci `service_role` tidak pernah dipakai atau disimpan di aplikasi.

## Skema Database

```sql
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null check (char_length(trim(title)) > 0),
  amount bigint not null check (amount > 0),
  category text not null check (category in ('food', 'transport', 'shopping', 'bills', 'other')),
  date date not null,
  created_at timestamptz not null default now()
);

create index expenses_date_idx on public.expenses (date desc);
create index expenses_user_id_idx on public.expenses (user_id);

alter table public.expenses enable row level security;

grant select, insert, update, delete on public.expenses to authenticated;

create policy "users manage own expenses" on public.expenses
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
```

## Struktur Proyek

```
expense-tracker/
├── App.tsx                   # Penjaga sesi: layar login atau layar utama
├── types.ts                  # Tipe Expense, NewExpense, Category, Tab
├── lib/
│   └── supabase.ts           # Klien Supabase dan pengaturan sesi
├── api/
│   ├── auth.ts               # signIn, signUp, signOut
│   └── expenses.ts           # fetch, insert, update, remove
├── constants/
│   └── categories.ts         # Label dan ikon kategori
├── utils/
│   ├── format.ts             # Format Rupiah, tanggal, dan bulan
│   └── summary.ts            # Penyaringan bulan dan total per kategori
├── components/
│   ├── ExpenseItem.tsx
│   ├── ExpenseFormModal.tsx  # Form tambah dan ubah
│   ├── MonthSwitcher.tsx
│   ├── TabBar.tsx
│   └── CategorySummary.tsx
└── screens/
    ├── AuthScreen.tsx        # Login dan daftar
    └── ExpenseScreen.tsx     # Layar utama
```

Kode dipisah berdasarkan tanggung jawab: `api/` hanya berurusan dengan jaringan (mengembalikan data atau melempar error), `utils/` berisi fungsi murni tanpa state, `components/` dan `screens/` berisi tampilan, dan `App.tsx` memilih layar berdasarkan sesi.

## Menjalankan di Komputer Sendiri

Prasyarat: [Node.js](https://nodejs.org/) (versi LTS), aplikasi **Expo Go** di HP, dan akun [Supabase](https://supabase.com/) (gratis).

**1. Clone dan install**

```bash
git clone https://github.com/EghoPratama/expense-tracker.git
cd expense-tracker
npm install
```

**2. Siapkan Supabase**

1. Buat project baru di Supabase.
2. Buka **SQL Editor**, lalu jalankan skema di bagian "Skema Database" di atas.
3. Untuk mempermudah pengujian, buka **Authentication → Sign In / Providers → Email** dan matikan **Confirm email**.
4. Buka **Project Settings → API**, lalu salin **Project URL** dan **anon/publishable key**.

**3. Isi variabel lingkungan**

Salin `.env.example` menjadi `.env.local`, lalu isi:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=kunci-anon-kamu
```

URL harus berupa alamat dasar project, tanpa `/rest/v1`.

**4. Jalankan**

```bash
npx expo start -c
```

Scan QR code dengan Expo Go (Android) atau aplikasi Kamera (iOS).

## Membuat APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Variabel `EXPO_PUBLIC_*` perlu didaftarkan di EAS (`eas env:create`) karena file `.env.local` tidak ikut diunggah ke server build.

## Yang Saya Pelajari

- Merancang skema PostgreSQL dengan constraint, indeks, dan relasi ke tabel autentikasi
- Mengamankan data per pengguna dengan Row Level Security, serta perbedaan antara `GRANT` (akses ke tabel) dan policy RLS (akses ke baris)
- Alur autentikasi: sesi tersimpan, pemantauan `onAuthStateChange`, dan pemetaan kode error menjadi pesan yang ramah
- Menyimpan uang sebagai bilangan bulat dan memformatnya sendiri, serta menangani tanggal sebagai string agar tidak bergeser karena zona waktu
- Pola data dua arah: database sebagai sumber kebenaran, state diubah hanya setelah server mengonfirmasi
- Menurunkan data (total, daftar bulanan, ringkasan kategori) dari satu state, bukan menyimpan salinan yang harus disinkronkan
- Memakai satu form untuk dua tugas (tambah dan ubah) dan menangani keadaan loading, simpan, dan error di setiap lapisan
- Mendiagnosis error nyata dari log: URL ganda `/rest/v1` (`PGRST125`) dan izin tabel yang belum diberikan (`42501`)
- Membuat build Android dengan EAS dan mengelola variabel lingkungan di luar repository

## Keterbatasan dan Rencana Pengembangan

- [ ] Memilih tanggal pengeluaran (saat ini selalu tanggal hari ini)
- [ ] Anggaran per kategori dengan peringatan jika terlampaui
- [ ] Grafik tren bulanan
- [ ] Ekspor data ke CSV
- [ ] Reset password lewat email
- [ ] Dukungan offline: antrean perubahan yang disinkronkan saat kembali online
- [ ] Pindah ke Expo Router jika jumlah layar bertambah
- [ ] Mode gelap

## Lisensi

MIT