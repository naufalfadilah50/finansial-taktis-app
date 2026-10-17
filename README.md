# 💰 Finansial Taktis App - Aplikasi Keuangan Pribadi

**Finansial Taktis App** adalah aplikasi manajemen keuangan pribadi modern berbasis web yang dirancang responsif dan fleksibel untuk dikemas ke platform mobile (Android) menggunakan **Capacitor**. Aplikasi ini membantu pengguna mengelola arus kas bulanan secara cerdas melalui kalkulasi batas pengeluaran harian otomatis, pencatatan alokasi tabungan, pengaturan jadwal gajian dinamis, serta laporan rekapitulasi keuangan periode sebelumnya.

---

## 🌟 Fitur Unggulan

- **📊 Dashboard Utama & Total Saldo:**
  - Menampilkan informasi **Total Saldo** real-time beserta alokasi akumulasi **Tabungan**.
  - Navigasi ringkas dengan tab menu *Dashboard*, *Rekap*, dan *Riwayat*.

- **📅 Pengaturan Jadwal Gajian Dinamis:**
  - Fitur **Ubah Tanggal Gajian** yang dapat disesuaikan dengan siklus gajian tiap pengguna (tanggal 1–31).
  - Mengkalkulasi secara otomatis sisa hari menuju jadwal gajian berikutnya.

- **⚠️ Batas Pengeluaran Harian & Peringatan Otomatis:**
  - Menghitung secara cerdas batas pengeluaran harian ideal agar keuangan aman hingga tanggal gajian tiba.
  - Dilengkapi *status indicator* (Aman/Peringatan) serta sinyal peringatan merah (*Alert*) jika pengeluaran harian melebihi batas aman.

- **➕ Modal Transaksi Lengkap (Pemasukan, Pengeluaran & Tabungan):**
  - **+ Pemasukan:** Pencatatan arus uang masuk beserta tanggal, nominal, keterangan, dan kategori (misal: *Gaji*).
  - **Nabung:** Fitur khusus mencatat alokasi tabungan beserta tujuan menabung.
  - **- Pengeluaran:** Pencatatan arus uang keluar lengkap dengan kategori (misal: *Konsumsi*, Transportasi, dll).

- **📑 Rekapitulasi Keuangan & Riwayat Periode:**
  - **Periode Saat Ini:** Menampilkan total pemasukan, pengeluaran, tabungan, dan saldo bersih bulan berjalan.
  - **Riwayat Periode Sebelumnya:** Laporan historis bulanan lalu (misal: periode bulan sebelumnya) untuk melihat perbandingan pemasukan vs pengeluaran serta sisa uang akhir periode.

- **📜 Riwayat Transaksi Detail:**
  - Daftar transaksi terbaru yang dikelompokkan berdasarkan tanggal secara urut.
  - Dilengkapi indikator warna (hijau untuk pemasukan/tabungan, merah untuk pengeluaran) serta tombol hapus transaksi.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** HTML5, CSS3 / Custom Dark Theme, JavaScript (ES6)
- **Mobile Wrapper:** Capacitor Android Integration
- **Platform Base:** Cross-platform (Web & Mobile Android)

---

## 💻 Cara Menjalankan Aplikasi Secara Lokal

### Metode 1: Live Server (VS Code)
1. Buka folder proyek di VS Code:
   ```bash
   cd C:\xampp\htdocs\pemrograman web\finansial-taktis-app
