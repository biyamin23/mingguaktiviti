# PORTAL MINGGU AKTIVITI SEMESTER 2 — MRSM TUMPAT 2026

Pusat Kawalan & Pengurusan Rasmi bagi **Minggu Aktiviti Semester 2, Maktab Rendah Sains MARA Tumpat** yang berlangsung pada **13 hingga 15 September 2026**.

Aplikasi ini dibangunkan sebagai sistem web berskala pengeluaran (*production-ready*) dengan konsep reka bentuk **"Modern MRSM Activity Command Center"**, disokong oleh pangkalan data **Supabase PostgreSQL** dan storan awan **Supabase Storage**.

---

## 🌟 Ciri-Ciri Utama

1. **Pusat Kawalan (Dashboard)**
   - Paparan metrik statistik langsung (Guru, Homeroom, Jadual, Pertandingan, Keputusan, Laporan).
   - **Kedudukan Serentak 4 Kolum Desktop** bagi Tingkatan 1, Tingkatan 2, Tingkatan 3, dan Tingkatan 4.
   - Garis masa aktiviti terkini dan keputusan terkini.

2. **Pengurusan Jadual Aktiviti Terpusat (`/jadual`)**
   - Paparan garis masa berkumpulan mengikut tarikh (**13, 14, 15 September 2026**) dan paparan jadual padat (*compact table*).
   - Perekodan slot: Tajuk Slot, Tarikh, Masa Mula/Tamat (dengan validasi automatik), Sasaran Tingkatan multi-select relasi (`schedule_slot_targets` [T1]–[T5]), dan PIC guru daripada *searchable dropdown*.
   - Fungsi **Salin Slot (*Duplicate Slot*)**, Kemaskini, dan Pemadaman selamat (*delete safety*).

3. **Perekodan Keputusan Pertandingan (`/keputusan`)**
   - Log masuk guru berasaskan Nombor Gaji.
   - Pilihan pertandingan mengikut tingkatan (Tingkatan 1 hingga 4 sahaja; Tingkatan 5 dikecualikan).
   - Pemilihan **5 pemenang utama** (Johan, Naib Johan, Ketiga, Keempat, Kelima).
   - Dialog pengesahan (*confirmation dialog*) sebelum data disimpan.
   - Pengiraan **merit penyertaan automatik (10 mata)** untuk kesemua homeroom yang bertanding dalam tingkatan tersebut.

4. **Sistem Pemarkahan Merit Terkunci**
   - **Johan**: 100 Merit
   - **Naib Johan**: 70 Merit
   - **Ketiga**: 40 Merit
   - **Keempat**: 30 Merit
   - **Kelima**: 20 Merit
   - **Penyertaan**: 10 Merit
   - *Integriti Sejarah*: Mata merit disimpan terus dalam `result_entries.merit` supaya perubahan tetapan pada masa depan tidak mengubah markah sejarah yang telah disahkan.

5. **Ranking & Analisis Kumulatif (`/ranking`)**
   - Tab khas bagi Tingkatan 1, 2, 3, dan 4.
   - Kad podium: **#1 Emas (*Gold*)**, **#2 Perak (*Silver*)**, dan **#3 Gangsa (*Bronze*)**.
   - Modal perincian pecahan pungutan merit per aktiviti bagi setiap homeroom.

6. **Laporan Bergambar & Mampatan Imej Mandatori (`/laporan-bergambar`)**
   - Pemilihan slot jadual secara langsung menghubungkan metadata rasmi (Tajuk, Tarikh, Masa, PIC, Sasaran).
   - **Enjin Mampatan Imej Klien (*Client-Side Compression*)**:
     - Memproses imej di dalam pelayar sebelum muat naik bagi menjimatkan ruang storan dan jalur lebar.
     - Resolusi sisi panjang dihadkan kepada maksimum **1920 px**.
     - Penukaran format automatik kepada **WebP** dengan kualiti **0.78**.
     - Had saiz asal maksimum 15 MB.
     - Paparan penjimatan saiz (contoh: 4.8 MB → 640 KB, penjimatan sehingga 80%).
   - Muat naik ke Supabase Storage laluan: `reports/{report_id}/{uuid}.webp`.

7. **Dokumentasi & Cetakan Rasmi A4**
   - **Dokumentasi Pemenang (`/dokumentasi/pemenang`)**: Format cetakan A4 Landskap (*print CSS*) lengkap dengan pengepala MRSM Tumpat dan ruangan tandatangan.
   - **Dokumentasi Laporan Slot (`/dokumentasi/laporan`)**: Paparan dan cetakan A4 Potret bagi setiap slot berserta grid foto dan kapsyen.

8. **Galeri Foto Rasmi (`/galeri`)**
   - Bersumberkan rekod imej Supabase (`report_images`).
   - Grid foto responsif, sokongan *lazy-loading*, dan pratonton penuh (*lightbox*).

9. **Data Master**
   - **Guru (`/data-master/guru`)**: Pengurusan guru, nombor gaji unik, peranan.
   - **Homeroom (`/data-master/homeroom`)**: Penetapan penasihat tunggal (1 guru = 1 homeroom), tanda *Perlu Semakan Data*.
   - **Pertandingan (`/data-master/pertandingan`)**: Senarai pertandingan Tingkatan 1–4 (T5 dihalang secara ketat).
   - **Tetapan Merit (`/data-master/merit`)**: Tetapan nilai mata merit.
   - **Import Data Master (`/data-master/import`)**: Alatan web untuk mengimport data CSV/JSON dengan pengesanan anomali pintar.

---

## 🛠️ Teknologi & Senibina

- **Rangka Kerja Web**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Gaya Visual**: Tailwind CSS v4 + Reka bentuk tersuai (*Deep Royal Blue `#0B2F6B`, Royal Blue `#1646A0`, Action Blue `#2563EB`, Sky Blue `#38BDF8`, Gold Accent `#FBBF24`*)
- **Pangkalan Data**: Supabase PostgreSQL (10 relasi jadual + RLS + Foreign Keys + Constraints)
- **Storan Fail**: Supabase Storage (`report-images` bucket)
- **Ikon**: Lucide React
- **Pengehosan Sasaran**: Vercel

---

## 🚀 Panduan Pemasangan Tempatan (Local Development)

### 1. Klon Repositori
```bash
git clone https://github.com/biyamin23/mingguaktiviti.git
cd mingguaktiviti
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Pembolehubah Persekitaran (*Environment Variables*)
Salin fail `.env.example` kepada `.env.local`:
```bash
cp .env.example .env.local
```

Isikan kredensial Supabase anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```
> *Nota: Jika belum memasukkan kunci Supabase, portal dilengkapi dengan lapisan fallback data autoritatif tempatan supaya fungsi aplikasi boleh diuji serta-merta tanpa ranap.*

### 4. Menjalankan Pelayan Pembangunan
```bash
npm run dev
```
Buka pelayar web di `http://localhost:3000`.

---

## 🗄️ Persediaan Pangkalan Data Supabase

1. Buka papan pemuka Supabase anda di [https://supabase.com](https://supabase.com).
2. Pergi ke **SQL Editor**.
3. Buka fail skrip migrasi di:
   ```
   supabase/migrations/20260909000000_init_schema.sql
   ```
4. Jalankan (*Run*) skrip tersebut untuk membina:
   - Jadual `teachers`, `homerooms`, `competitions`, `merit_settings`, `schedule_slots`, `schedule_slot_targets`, `results`, `result_entries`, `reports`, `report_images`.
   - Polisi keselamatan peringkat baris (**Row Level Security - RLS**).
   - Baldi storan **`report-images`** dan polisi akses awam.
5. Jalankan skrip benih awal di:
   ```
   supabase/seed.sql
   ```

---

## 📥 Pengimportan Data Master (Master Data Seeding)

Kami menyediakan dua mekanisme selamat untuk memuatkan data master guru & homeroom:

### Cara 1: Melalui CLI Script
```bash
npm run seed
```
atau menggunakan fail CSV/JSON luaran:
```bash
npm run seed -- path/ke/fail.csv
```

### Cara 2: Melalui Antaramuka Web Portal
1. Buka portal di pelayar web.
2. Navigasi ke **Data Master** → **Import Data Master** (`/data-master/import`).
3. Tampal data CSV dalam format:
   ```csv
   Tingkatan,Nama Homeroom,Nama Penasihat,Nombor Gaji
   1,1 Al-Farabi,Ustazah Siti Aminah binti Razak,G1002
   1,1 Ibn Sina,Cikgu Mohd Danial bin Hashim,G1003
   ...
   ```
4. Klik **Semak & Sahkan Data**.
5. Sistem akan menyemak keunikan nombor gaji, hubungan guru-homeroom, dan menandakan sebarang rekod yang meragukan sebagai `"Perlu Semakan Data"`.
6. Klik **Import Ke Pangkalan Data Supabase**.

---

## ☁️ Panduan Penerbitan ke Vercel (Deployment)

1. Pastikan semua kod terkini telah ditolak (*pushed*) ke repositori GitHub:
   ```bash
   git push origin main
   ```
2. Buka papan pemuka [Vercel](https://vercel.com).
3. Klik **Add New Project** → **Import Git Repository**: `biyamin23/mingguaktiviti`.
4. Dalam tetapan projek Vercel, tambah pembolehubah persekitaran (*Environment Variables*):
   - `NEXT_PUBLIC_SUPABASE_URL` = Nilai URL Supabase anda
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Nilai Anon Key Supabase anda
   - `SUPABASE_SERVICE_ROLE_KEY` = Nilai Service Role Key (jika diperlukan untuk operasi pentadbir)
5. Klik **Deploy**.
6. Sahkan aplikasi berfungsi sepenuhnya di URL pengeluaran Vercel anda.

---

## 🔒 Keselamatan & Had Sistem Semasa

- **Model Log Masuk**: Buat masa ini, sistem menggunakan pengenalpastian nombor gaji (*lightweight identification*) mengikut keperluan acara sekolah, dan bukannya pengesahan kata laluan penuh (*strong authentication*).
- **Peningkatan Masa Hadapan**: Senibina kod dan lapisan konteks sesi telah direka bentuk secara modular supaya peralihan kepada pengesahan penuh **Supabase Auth** (emel/kata laluan atau OTP) boleh dilaksanakan secara terus tanpa mengubah struktur pangkalan data sedia ada.

---

## 📋 Pengesahan Kualiti & Pembinaan

- **TypeScript Compilation**: `npx tsc --noEmit` — **0 Ralat**
- **Linting Kod**: `npm run lint` — **0 Ralat / 0 Amaran**
- **Pembinaan Pengeluaran**: `npm run build` — **Berjaya Sepenuhnya (14 Laluan Praterbit)**
- **Ujian Pelayar**: Telah disahkan berfungsi melalui ujian interaktif bagi kesemua aliran kerja utama.
