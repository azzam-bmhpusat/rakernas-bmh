# Sistem Absensi Visual QR BMH

Sistem absensi berbasis QR cepat dan visual untuk acara perkumpulan yang berlangsung **dua hari** (Hari Pertama & Hari Kedua) oleh Lembaga Amil Zakat Nasional **Baitul Maal Hidayatullah (BMH)**.

Peserta memindai satu QR statis, memilih sesi kehadiran, mencari atau mengetik nama dan perwakilan daerah, lalu kehadirannya langsung tampil secara realtime (≤ 2 detik) di layar videotron/proyektor utama tanpa refresh.

---

## 🚀 Fitur Utama

- **Alur Peserta Cepat (`/absen`)**:
  - Scan QR tanpa perlu install aplikasi atau registrasi akun.
  - Kartu pemilihan sesi interaktif (*Hari Pertama / Hari Kedua*).
  - Pencarian nama tamu undangan terdaftar (autocomplete cerdas) & pengisian otomatis daerah.
  - Dukungan tamu baru (*walk-in*) otomatis bertanda khusus.
  - Proteksi anti-duplikat kehadiran per sesi, pencegahan double-tap, honeypot anti-spam, dan in-memory rate limiting.
- **Videotron Layar Penuh Realtime (`/display`)**:
  - Tampilan tema gelap hijau BMH dioptimalkan untuk layar 1920×1080 (tanpa scrollbar terlihat).
  - Dua kolom dinamis: **Sudah Hadir** (terbaru di atas) dan **Belum Hadir** (urut abjad daerah & nama).
  - Counter kehadiran otomatis, persentase kehadiran, dan progress bar bergradasi.
  - Animasi transisi (*framer-motion*), banner sambutan otomatis 5 detik saat peserta hadir.
  - Pemulihan otomatis (*auto-reconnect*) dan refetch fallback berkala tiap 30 detik jika jaringan putus.
  - Auto-scroll otomatis dan halus untuk daftar tamu panjang (> 40 tamu).
- **Panel Administrasi Panitia (`/admin`)**:
  - Login aman berbasis Supabase Auth.
  - **Manajemen Tamu**: Tabel tamu undangan, pencarian nama, tambah/edit/hapus tamu, dan **Export PDF** dengan dialog filter kehadiran (Offline / Online via Zoom).
  - **Rekapitulasi Kehadiran**: Tabel kehadiran lengkap per sesi, filter perwakilan daerah, penanda walk-in, dan **Ekspor CSV** (format waktu WIB & UTF-8 dengan BOM agar terbaca sempurna di Microsoft Excel).
  - **Generator QR Cetak (`/admin/qr`)**: Halaman siap cetak dengan styling `@media print` untuk mencetak QR code beresolusi tinggi di lokasi registrasi.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript)
- **Styling & UI**: Tailwind CSS v4, shadcn/ui, Lucide Icons, Framer Motion
- **Database & Auth**: Supabase (PostgreSQL, Realtime Subscriptions, Row Level Security, Supabase Auth)
- **Validasi & Utilitas**: Zod, React Hook Form, jsPDF (export PDF), QRCode, Sonner (Toaster)
- **Testing & Tooling**: Vitest, tsx, ESLint

---

## Gambar pratinjau media sosial

Kartu Open Graph dan Twitter/X memakai renderer yang sama di `lib/og-card.tsx`,
dengan logo, judul, dan tema acara tanpa tanggal maupun lokasi. PNG siap unduh
tersedia di `/og/rakernas-bmh.png` (1200 × 630 piksel).

Atur `NEXT_PUBLIC_SITE_URL` ke URL HTTPS situs produksi agar URL gambar pada
metadata mengarah ke domain publik. Rute gambar dibuat otomatis oleh Next.js dan
dapat diakses tanpa login. URL lengkapnya ada di tag `og:image` dan `twitter:image`
karena Next.js dapat menambahkan hash pada nama rute. Saat desain diubah, perbarui
salinan PNG dari respons URL `og:image` pada server lokal.

## 📦 Prasyarat Sistem

- **Node.js**: versi 18.18.0 atau lebih baru (disarankan Node.js 20 LTS)
- **npm** (atau pnpm / yarn)
- **Akun Supabase**: proyek PostgreSQL dengan modul Realtime aktif

---

## ⚙️ Panduan Setup Lokal

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone <url-repo-anda>
cd rakernas-bmh
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.local.example` menjadi `.env.local`:
```bash
cp .env.local.example .env.local
```

Isi variabel lingkungan berikut di `.env.local`:
```env
# URL & Kunci Publik Supabase (Aman di Client)
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Kunci Rahasia Service Role (HANYA di Server, JANGAN pernah pakai prefix NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# URL Dasar Aplikasi (Dipakai untuk generate tautan QR Code)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Nama Acara yang Ditampilkan di Header Absen & Videotron
NEXT_PUBLIC_EVENT_NAME=Silaturahim & Rapat Kerja Nasional BMH
```

### 3. Migrasi Skema Database & Verifikasi RLS
Jalankan file migrasi SQL di Supabase SQL Editor:
- Lokasi skema awal: [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
- Tabel `profiles` (role `admin`/`user`, terisi otomatis dari Supabase Auth; akun yang sudah ada menjadi admin): [`supabase/migrations/0008_profiles.sql`](supabase/migrations/0008_profiles.sql)
- Role admin pada akses (RLS `public.is_admin()`): [`supabase/migrations/0009_admin_role_policies.sql`](supabase/migrations/0009_admin_role_policies.sql)
  **Urutan wajib: `0008` → `0009` → baru deploy aplikasi.** Bila ada admin yang terkunci:
  `update public.profiles set role = 'admin' where email = 'email@anda';`
- Kolom peserta di `profiles` (pengganti tabel `guests`): [`supabase/migrations/0010_profiles_participant_columns.sql`](supabase/migrations/0010_profiles_participant_columns.sql)
  → pindahkan data: `npx tsx scripts/migrate-guests-to-profiles.ts` (dry-run) lalu `--apply` → deploy aplikasi → hapus `guests`: [`0011_drop_guests.sql`](supabase/migrations/0011_drop_guests.sql) (**tidak dapat dibatalkan**; ekspor `attendances`/`registrations` dulu).

Untuk memastikan hak akses Row Level Security (RLS) berjalan aman:
```bash
npm run verify:rls
```

### 4. Buat Akun Panitia Admin Pertama
Jalankan skrip otomatis berikut untuk membuat akun admin di Supabase Auth (email langsung terverifikasi):
```bash
npm run create:admin
```
*Atau tentukan email dan password sendiri:*
```bash
npx tsx scripts/create-admin.ts panitia@bmh.or.id "KataSandiKuat123!"
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Akses aplikasi di browser:
- Halaman Absen Peserta: [http://localhost:3000/absen](http://localhost:3000/absen)
- Videotron Realtime: [http://localhost:3000/display?sesi=1](http://localhost:3000/display?sesi=1)
- Panel Admin Panitia: [http://localhost:3000/admin](http://localhost:3000/admin) (Login: `/admin/login`)
- Cetak Lembar QR: [http://localhost:3000/admin/qr](http://localhost:3000/admin/qr)

---

## 📋 Panduan Pengoperasian Acara

### A. Persiapan Sebelum Acara (Pra-Kegiatan)
1. **Siapkan Daftar Tamu Undangan**:
   - Peserta ditambahkan lewat tombol **Tambah User** di halaman `/manajemen-user`.
2. **Cetak QR Code Registrasi**:
   - Buka `/admin/qr` pada browser komputer panitia.
   - Tekan `Ctrl + P` (atau `Cmd + P`). Halaman sudah dioptimasi khusus untuk cetak kertas A4/A5 tanpa header/footer browser yang mengganggu.
   - Tempel cetakan QR di meja registrasi atau standing banner.

### B. Pengoperasian Videotron di Lokasi (Hari-H)
1. Hubungkan komputer operator ke videotron/proyektor utama via kabel HDMI.
2. Buka browser Google Chrome / Edge, lalu akses:
   - Sesi 1: `https://<domain-anda>/display?sesi=1`
   - Sesi 2: `https://<domain-anda>/display?sesi=2`
3. Tekan tombol **F11** untuk beralih ke mode **Layar Penuh (Full Screen)**.
4. Kursor mouse akan otomatis tersembunyi setelah beberapa detik tidak digerakkan.
5. Layar akan otomatis memperbarui data secara instan saat peserta submit absen.

### C. Pasca Acara (Unduh Rekapitulasi)
1. Masuk ke `/admin` tab **Rekap**.
2. Pilih sesi yang diinginkan (Hari Pertama / Hari Kedua).
3. Klik tombol **Ekspor CSV**. File yang diunduh sudah menyertakan tanda *walk-in*, stempel waktu WIB, dan kompatibel langsung dengan Microsoft Excel.

---

## 🚢 Panduan Deployment ke Vercel

`vercel.json` menjalankan `npm ci` dan `npm run build` dengan menghapus variabel
legacy `NPM_CONFIG_CACHE_DIR`/`npm_config_cache_dir` dari environment perintah.
Konfigurasi cache npm yang didukung adalah `NPM_CONFIG_CACHE`. Jika variabel
legacy dipasang di Vercel Project Settings, hapus atau ganti namanya di sana.
Gunakan Node.js 22.x (minimal 22.22.2 untuk npm 12.2.3) dan npm yang mendukung
`allowScripts` (npm 12) saat memverifikasi instalasi deployment.
Commit `package-lock.json` bersama perubahan dependensi agar
`npm ci` memakai versi yang sama. Izin postinstall esbuild dicatat per versi pada
`allowScripts` di `package.json`; saat memperbarui esbuild, tinjau kembali izinnya.
Postinstall core-js ditolak secara eksplisit karena hanya menampilkan pesan donasi.
ExcelJS tetap memakai versi 4.4.0 dengan overrides khusus untuk unzipper,
fast-csv, uuid, dan glob pada archiver-utils di dalam dependency tree ExcelJS.
Archiver tetap memakai versi 5 agar normalisasi stream kompatibel dengan ExcelJS.
ExcelJS dimuat sebagai paket server eksternal di Next.js agar adapter S3 opsional
unzipper tidak dibundel ke aplikasi yang hanya membaca dan menulis workbook lokal.
Overrides peer ESLint pada plugin React,
import, dan aksesibilitas mengikuti ESLint 10 yang didukung eslint-config-next 16.4.6;
jalankan lint serta tes impor/ekspor Excel setiap memperbarui overrides ini.
Entrypoint autentikasi Next.js memakai `proxy.ts`; logika sesi dan pembatasan akses
ada di `lib/supabase/middleware.ts`.

### Metode 1: Menggunakan Vercel Dashboard (Rekomendasi)
1. Push kode ke repositori GitHub / GitLab Anda.
2. Buka [Vercel Dashboard](https://vercel.com/new) dan pilih **Import Project**.
3. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (Set ke domain Vercel Anda, misal: `https://rakernas.bmh.or.id`)
   - `NEXT_PUBLIC_EVENT_NAME` (Misal: `Silaturahim & Rapat Kerja Nasional BMH`)
4. Klik **Deploy**.

### Metode 2: Menggunakan Vercel CLI
```bash
npx vercel
# Ikuti instruksi di terminal, lalu set env var:
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add NEXT_PUBLIC_SITE_URL
npx vercel env add NEXT_PUBLIC_EVENT_NAME
# Deploy ke produksi:
npx vercel --prod
```

---

## 🔒 Audit Keamanan & Kepatuhan

- **Pencegahan Kebocoran Kunci**: Skrip `npm run audit:bundle` mengaudit seluruh file kompilasi `.next/static` untuk memastikan service role key tidak pernah masuk ke bundel klien.
- **Row Level Security**: Klien anonim dibatasi hanya memiliki hak akses `SELECT`. Seluruh penulisan absen dari peserta diproses secara aman melalui Server Action backend.
- **Aksesibilitas (WCAG AA)**: Skema warna mengikuti standar kontras minimum 4.5:1 untuk teks biasa dan 3:1 untuk elemen grafis.
- **Robots Noindex**: Panel admin (`/admin`) dan layar videotron (`/display`) dilindungi dengan instruksi `noindex, nofollow` agar tidak diindeks mesin pencari publik.

---

## 🧪 Skrip Perintah (Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan local development server |
| `npm run build` | Melakukan kompilasi build produksi Next.js |
| `npm run lint` | Menjalankan ESLint (harus 0 error) |
| `npm run test` | Menjalankan unit test dengan Vitest |
| `npm run audit:bundle` | Memeriksa kebocoran service role key di bundle klien |
| `npm run verify:rls` | Menguji kebijakan keamanan RLS Supabase |
| `npm run create:admin` | Membuat atau mereset akun panitia admin Supabase Auth |
| `npm run test:uat` | Menjalankan rangkaian simulasi UAT & uji beban (Fase 6) |
| `npm run cleanup:test-data` | Membersihkan data absensi uji coba sebelum Hari-H acara |

---

## 📚 Dokumen Pendukung & Panduan Hari-H

- 📘 [Panduan Teknis & Operasional Hari-H (docs/panduan-hari-h.md)](docs/panduan-hari-h.md): Panduan lengkap panitia registrasi, operator videotron, SOP ekspor rekap, cetak QR cadangan, dan mitigasi jaringan.
- 📋 [Laporan Hasil UAT Resmi (docs/uat-report.md)](docs/uat-report.md): Berita acara pengujian penerimaan pengguna dengan 20/20 skenario uji lulus 100%.
- 🎨 [Design System Token (design-system.md)](design-system.md): Spesifikasi warna, tipografi, dan komponen visual BMH.
- 🗺️ [Roadmap Eksekusi Proyek (roadmap.md)](roadmap.md): Status pengerjaan Fase 0 hingga Fase 6 (selesai).

