# 🎓 Aplikasi Sistem Administrasi Sekolah & Surat Resmi Digital

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

**Solusi Cerdas Menuju Sekolah Digital dengan Administrasi yang Lebih Cerdas, Cepat, dan Terisolasi Mandiri.**

</div>

---

## 🌟 Fitur Utama Aplikasi

1. **📄 Tata Naskah Dinas & 9 Format Surat Resmi Standar Nasional**:
   - Surat Keterangan Mutasi / Pindah Sekolah Siswa
   - Surat Keterangan Bantuan PIP (Program Indonesia Pintar)
   - Surat Keterangan Penerimaan Siswa Pindahan
   - Surat Perintah Tugas Guru / PTK
   - Surat Keterangan Aktif Mengajar Guru
   - Surat Pembagian Tugas Mengajar & Jadwal
   - Surat Perintah Perjalanan Dinas (SPPD 2 Halaman Lengkap)
   - Surat Kuasa Pengambilan Dana PIP
   - Surat Keterangan Aktif Belajar Siswa

2. **🛡️ Sistem Multi-Tenant Terisolasi (Anti-Tubrukan Data)**:
   - Database setiap sekolah dipartisi secara mandiri berdasarkan **NPSN**.
   - Data siswa, guru, kop surat, logo, dan arsip sekolah satu tidak akan bercampur dengan sekolah lainnya.

3. **👥 5 Satuan Pendidikan Siap Pakai**:
   - **SD Negeri 2 Nyomplong** (NPSN: `20202020` - Kota Sukabumi)
   - **SD Negeri Margaasih** (NPSN: `20206123` - Kab. Bandung)
   - **SD Negeri 1 Sukaraja** (NPSN: `20203030` - Kab. Sukabumi)
   - **SD Negeri Cikole 1** (NPSN: `20204040` - Kota Sukabumi)
   - **SMP Negeri 1 Sukabumi** (NPSN: `20205050` - Kota Sukabumi)

4. **⚡ Developer Studio & Sistem Riset Kata Sandi**:
   - Menu Developer terdedikasi (`developer` / `23011995`) dengan live monitor permintaan reset password via lonceng notifikasi dan tombol 1-klik riset akun.

5. **🖨️ Generator Pratinjau & Cetak Siap Pakai**:
   - Fitur Tanda Tangan Elektronik (TTE), QR Code Verifikasi, Stempel Sekolah Digital, dan Export PDF / Cetak langsung.

---

## 🔑 Akun Sistem Utama (Developer Studio)
 
Secara bawaan (*clean installation*), hanya akun **Developer** yang aktif:
 
- **Username**: `developer`
- **Password**: `23011995`
- **Role**: `Developer`
- **Fungsi**: Akses Studio Pengembang untuk membuat akun sekolah baru, mengelola database seluruh sekolah, dan mereset kata sandi akun sekolah.
 
> **Catatan Pembuatan Akun Baru:**  
> Untuk menambahkan akun sekolah baru (Kepala Sekolah, Admin TU, Operator PIP, Guru), silakan masuk sebagai `developer` lalu buka menu **"Buat Akun Sekolah"**. Akun yang dibuat akan otomatis memiliki partisi database mandiri berdasarkan NPSN.

---

## 🚀 Panduan Menghubungkan ke GitHub & Deploy ke Vercel

### Langkah 1: Buat Repositori di GitHub
1. Buka [GitHub New Repository](https://github.com/new).
2. Beri nama repositori (contoh: `sistem-administrasi-sekolah`).
3. Pilih **Public** (atau **Private**), lalu klik **Create repository**.
4. Di terminal folder proyek ini, jalankan:
   ```bash
   git remote add origin https://github.com/USERNAME_ANDA/sistem-administrasi-sekolah.git
   git push -u origin main
   ```

---

### Langkah 2: Deploy Otomatis ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) (Login dengan akun GitHub Anda).
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Pilih repositori **`sistem-administrasi-sekolah`** dari daftar GitHub Anda, lalu klik **"Import"**.
4. *(Opsional)* Jika menggunakan integrasi AI Gemini, tambahkan pada **Environment Variables**:
   - `GEMINI_API_KEY`: *(Kunci API Gemini Anda)*
5. Klik **"Deploy"**.
6. Dalam waktu ~1 menit, aplikasi Anda akan live di domain publik seperti:
   👉 **`https://sistem-administrasi-sekolah.vercel.app`**

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server lokal
npm run dev

# 3. Buka di browser
# http://localhost:3000
```

---

<div align="center">
  <b>Created by Ricki Mulyadi</b> • Hak Cipta Dilindungi Undang-Undang
</div>
