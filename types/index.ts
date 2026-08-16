export type LetterCategory =
  | 'mutasi'
  | 'keterangan_pip'
  | 'penerimaan_pindahan'
  | 'surat_tugas'
  | 'aktif_mengajar'
  | 'pembagian_tugas'
  | 'perjalanan_dinas'
  | 'kuasa_pip'
  | 'aktif_belajar';

export interface SchoolProfile {
  pemerintah: string; // e.g., PEMERINTAH KABUPATEN BANDUNG BARAT
  dinas?: string; // e.g., DINAS PENDIDIKAN (Opsional)
  cabangDinas?: string; // (Removed from UI, kept optional for backwards compat)
  namaSekolah: string; // e.g., SEKOLAH DASAR NEGERI MARGAASIH
  npsn: string;
  akreditasi?: string; // e.g., A (Sangat Baik)
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  
  // Penandatangan (Kepala Sekolah)
  namaKepsek: string;
  nipKepsek: string;
  pangkatKepsek: string; // e.g., Pembina Utama Muda / IV-c
  jabatanKepsek: string; // e.g., Kepala Sekolah
  
  // Tampilan & Stempel
  showStempel: boolean;
  showTTD: boolean;
  showQRCode: boolean;
  logoLeftUrl?: string;
  logoRightUrl?: string;
  ttdKepsekUrl?: string;
  stempelUrl?: string;
  operatorAvatarUrl?: string;
  loginBgUrl?: string;
  loginLogoUrl?: string;
  operatorBadge?: string;
  operatorName?: string;
  operatorSubtitle?: string;
  operatorChecklistTitle?: string;
  operatorChecklistItems?: string[];
}

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nik?: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama?: string;
  kelas: string;
  jurusan?: string;
  alamat: string;
  namaOrangTua: string;
  pekerjaanOrangTua?: string;
  noHpOrangTua?: string;
  noPeserta?: string;
  ruang?: string;
  virtualAccPIP?: string;
  nominalPIP?: string;
}

export interface Guru {
  id: string;
  nip: string;
  nama: string;
  pangkatGolongan: string;
  jabatan: string;
  mapelUtama: string;
  pendidikanTerakhir: string;
  statusPegawai: 'PNS' | 'PPPK' | 'GTT' | 'Honor';
}

export type UserRole =
  | 'Kepala Sekolah'
  | 'Admin TU'
  | 'Tenaga Administrasi'
  | 'Operator PIP'
  | 'Guru'
  | 'Developer';

export interface UserSession {
  isAuthenticated: boolean;
  username: string;
  namaLengkap: string;
  role: UserRole;
  avatarUrl?: string;
  jabatan?: string;
  npsn?: string;
}

export interface UserAccount {
  username: string;
  namaLengkap: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  createdAt?: string;
  npsn?: string;
  namaSekolah?: string;
  alamat?: string;
  desa?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  logoSekolahUrl?: string;
  jabatan?: string;
}

export interface PasswordResetRequest {
  id: string;
  namaSekolah: string;
  npsn?: string;
  username: string;
  namaPengaju?: string;
  kontakHp?: string;
  catatan?: string;
  requestedAt: string;
  status: 'pending' | 'resolved';
}

// Letter specific payloads
export interface SuratMutasiPayload {
  nomorSurat: string;
  sifat: string;
  lampiran: string;
  perihal: string;
  customCityDate?: string;
  
  siswaId?: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  tempatTanggalLahir: string;
  jenisKelamin: string;
  kelas: string;
  alamatSiswa?: string;
  desaSiswa?: string;
  kecamatanSiswa?: string;
  kabupatenSiswa?: string;
  
  namaOrangTua?: string;
  pekerjaanOrangTua?: string;
  alamatOrangTua?: string;
  desaOrangTua?: string;
  kecamatanOrangTua?: string;
  kabupatenOrangTua?: string;
  
  sekolahTujuan: string;
  alamatSekolahTujuan?: string;
  desaSekolahTujuan?: string;
  kecamatanSekolahTujuan?: string;
  kabupatenSekolahTujuan?: string;
  alasanPindah: string;
  tanggalPindah: string;
  nomorRekomendasiDinas?: string;
  catatan?: string;
}

export interface SuratKeteranganPIPPayload {
  nomorSurat: string;
  customCityDate?: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  tempatTanggalLahir: string;
  namaOrangTua: string;
  noRekeningPIP: string;
  namaBank: string;
  nominalBantuan: string;
  tahunPelajaran?: string;
  tahunAnggaran?: string;
  keperluan: string; // e.g., "Pencairan Dana PIP Tahap 2 T.P 2026 / 2027"
}

export interface SuratPenerimaanPindahanPayload {
  nomorSurat: string;
  sifat?: string;
  lampiran?: string;
  perihal?: string;
  customCityDate?: string;
  
  namaSiswa: string;
  nis?: string;
  nisn: string;
  tempatTanggalLahir?: string;
  jenisKelamin?: string;
  alamatSiswa?: string;

  kelasDiterima: string;
  sekolahAsal: string;
  alamatSekolahAsal?: string;
  alasanDiterima?: string;
  tanggalMulaiBelajar: string;
  persyaratanStatus?: string; // e.g. "Lengkap & Memenuhi Syarat"
}

export interface SuratTugasPayload {
  nomorSurat: string;
  dasarTugas?: string;
  customCityDate?: string;
  
  namaPetugas: string;
  nipPetugas: string;
  pangkatGolongan?: string;
  jabatan: string;
  
  namaKegiatan?: string;
  hariTanggal?: string;
  waktu?: string;
  tujuanTugas?: string;
  tempatTugas: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  uraianTugas?: string;
  bebanBiaya?: string;
  keteranganLain?: string;
}

export interface SuratAktifMengajarPayload {
  nomorSurat: string;
  customCityDate?: string;
  namaGuru: string;
  nipGuru: string;
  tempatTanggalLahir?: string;
  jenisKelamin?: string;
  pangkatGolongan?: string;
  jabatan: string;
  mataPelajaran: string;
  statusKepegawaian?: string;
  alamatGuru?: string;
  sejakTanggal?: string;
  jumlahJamMengajar?: string;
  semesterTahunAjar?: string;
  keperluan: string; // e.g., "Persyaratan Sertifikasi Guru / TPG"
}

export interface DetailPembagianTugasItem {
  id: string;
  namaGuru: string;
  nip: string;
  golongan?: string;
  golRuang?: string;
  jabatan?: string;
  mapel?: string;
  kelasAjar?: string;
  bebanJam?: number | string;
  jjm?: string;
  tugasTambahan?: string;
  kategori?: 'guru_kelas' | 'guru_mapel' | 'tugas_tambahan' | string;
}

export interface SuratPembagianTugasPayload {
  nomorSK: string;
  customCityDate?: string;
  tanggalEfektif?: string;
  tentang?: string;
  tahunPelajaran?: string;
  semester?: string;
  denganRahmat?: string;
  kepalaSekolahText?: string;
  menimbang?: string[];
  mengingat?: string[];
  memperhatikan?: string;
  pertama?: string;
  kedua?: string;
  ketiga?: string;
  keempat?: string;
  daftarGuru?: DetailPembagianTugasItem[];
}

export interface SuratPerjalananDinasPayload {
  nomorSPD: string;
  customCityDate?: string;
  pejabatPerintah: string;
  namaPegawai: string;
  nipPegawai: string;
  pangkatGolongan: string;
  jabatan: string;
  maksudPerjalanan: string;
  alatAngkutan: string;
  tempatBerangkat: string;
  tempatTujuan: string;
  lamaPerjalanan: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  instansiPenanggungJawab: string;
  akunAnggaran: string;
  biayaLumpsum?: string;
  bebanAnggaran?: string;
  pasalAnggaran?: string;
  namaPemberiPerintah?: string;
  nipPemberiPerintah?: string;
  jabatanPemberiPerintah?: string;
  gajiPokok?: string;
  tingkatPerjalanan?: string;
  pengikutText?: string;
  keteranganLain?: string;
  dikeluarkanDi?: string;
  tanggalDikeluarkan?: string;
  tibaKembaliDi?: string;
  sekretarisNama?: string;
  sekretarisNIP?: string;
  sekretarisJabatan?: string;
  catatanLain?: string;
  nomorPP?: string;
  tanggalPP?: string;
  
  // Halaman Belakang fields
  belakangTibaTanggal?: string;
  belakangTibaDi?: string;
  belakangTibaPejabat?: string;
  belakangTibaNip?: string;
  
  belakangBerangkatTanggal?: string;
  belakangBerangkatKe?: string;
  belakangBerangkatPejabat?: string;
  belakangBerangkatNip?: string;
  
  belakangKembaliTanggal?: string;
  belakangKembaliPejabat?: string;
  belakangKembaliNip?: string;
  
  belakangPernyataanNama?: string;
  belakangPernyataanNip?: string;
  
  belakangPengesahanNama?: string;
  belakangPengesahanNip?: string;
}

export interface SuratKuasaPIPPayload {
  nomorSurat: string;
  customCityDate?: string;
  
  // Pihak 1 (Pemberi Kuasa)
  namaPemberi: string;
  tempatLahirPemberi?: string;
  nikPemberi?: string;
  nisnSiswa: string;
  kelasSiswa: string;
  hubunganDenganSiswa: string; // e.g., "Orang Tua / Wali Murid"
  alamatPemberi: string;
  noHpPemberi: string;
  
  // Pihak 2 (Penerima Kuasa)
  namaPenerima: string;
  tempatLahirPenerima?: string;
  nikPenerima?: string;
  nipPenerima: string;
  jabatanPenerima: string;
  alamatPenerima: string;
  
  // Objek Kuasa
  namaBank: string;
  noRekening: string;
  nominal: string;
  keperluan: string;
  
  // Detail Siswa & Sekolah
  namaSiswa?: string;
  namaSekolahSiswa?: string;
}

export interface SuratAktifBelajarPayload {
  nomorSurat: string;
  customCityDate?: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  tempatTanggalLahir: string;
  jenisKelamin: string;
  kelas: string;
  jurusan: string;
  namaOrangTua: string;
  alamatSiswa: string;
  keperluan: string; // e.g., "Persyaratan Pengajuan Beasiswa / Asuransi / Tunjangan Gaji Orang Tua"
  tahunPelajaran?: string;
}

export interface ArchiveItem {
  id: string;
  category: LetterCategory;
  categoryTitle: string;
  nomorSurat: string;
  penerimaAtauSubjek: string;
  tanggalCetak: string;
  dibuatOleh: string;
  payload: any;
}
