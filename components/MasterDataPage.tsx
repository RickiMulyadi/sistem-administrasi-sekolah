'use client';

import React, { useState, useRef } from 'react';
import { Siswa, Guru } from '../types';
import {
  Users,
  GraduationCap,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  FileSpreadsheet,
  Download,
  UploadCloud,
  FileUp,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { showToast } from '../lib/toast';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';

interface MasterDataPageProps {
  siswaList: Siswa[];
  guruList: Guru[];
  onUpdateSiswaList: (updated: Siswa[]) => void;
  onUpdateGuruList: (updated: Guru[]) => void;
}

export const MasterDataPage: React.FC<MasterDataPageProps> = ({
  siswaList,
  guruList,
  onUpdateSiswaList,
  onUpdateGuruList,
}) => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru'>('siswa');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddSiswaModal, setShowAddSiswaModal] = useState(false);
  const [showAddGuruModal, setShowAddGuruModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'siswa' | 'guru';
    id: string;
    name: string;
  } | null>(null);

  // Import Preview Modal
  const [importPreviewData, setImportPreviewData] = useState<{
    type: 'siswa' | 'guru';
    fileName: string;
    items: (Partial<Siswa> | Partial<Guru>)[];
  } | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 1. DOWNLOAD TEMPLATE EXCEL DENGAN BORDER
  // ==========================================
  const handleDownloadTemplateSiswa = () => {
    // Definisi Kolom Template Siswa - Persis Sesuai Tabel Master Data di Gambar
    const headers = [
      'NO',
      'NAMA SISWA',
      'NIS / NISN',
      'L/P',
      'KELAS',
      'TEMPAT, TANGGAL LAHIR',
      'ORANG TUA / WALI',
      'VIRTUAL ACC PIP',
    ];

    // Data Contoh Siap Pakai (Format Nama Siswa 1, Nama Orang Tua 1, dst.)
    const sampleRows = [
      [
        1,
        'Nama Siswa 1',
        '23241001 / 0081234561',
        'L',
        'VI-A',
        'Sukabumi, 12 Mei 2012',
        'Nama Orang Tua 1',
        '8870123456789',
      ],
      [
        2,
        'Nama Siswa 2',
        '23241002 / 0081234562',
        'P',
        'VI-A',
        'Sukabumi, 18 Agustus 2012',
        'Nama Orang Tua 2',
        '8870123456790',
      ],
      [
        3,
        'Nama Siswa 3',
        '23241003 / 0081234563',
        'L',
        'VI-B',
        'Bandung, 05 November 2012',
        'Nama Orang Tua 3',
        '8870123456791',
      ],
      [
        4,
        'Nama Siswa 4',
        '23241004 / 0081234564',
        'P',
        'VI-B',
        'Sukabumi, 22 Januari 2013',
        'Nama Orang Tua 4',
        '8870123456792',
      ],
    ];

    const dataMatrix = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(dataMatrix);

    // Set Lebar Kolom Proporsional Sesuai Tampilan Tabel
    ws['!cols'] = [
      { wch: 6 },  // NO
      { wch: 30 }, // NAMA SISWA
      { wch: 24 }, // NIS / NISN
      { wch: 8 },  // L/P
      { wch: 12 }, // KELAS
      { wch: 30 }, // TEMPAT, TANGGAL LAHIR
      { wch: 28 }, // ORANG TUA / WALI
      { wch: 20 }, // VIRTUAL ACC PIP
    ];

    // Petunjuk Pengisian Sheet
    const petunjukData = [
      ['PETUNJUK PENGISIAN TEMPLATE EXCEL MASTER DATA SISWA'],
      [''],
      ['1. Kolom "NAMA SISWA" dan "NIS / NISN" wajib diisi.'],
      ['2. Kolom "NIS / NISN" diisi dengan format: NIS / NISN (Contoh: 23241001 / 0081234561).'],
      ['3. Kolom "L/P" diisi dengan huruf "L" (Laki-laki) atau "P" (Perempuan).'],
      ['4. Kolom "TEMPAT, TANGGAL LAHIR" diisi dengan format: Kota, Tanggal Bulan Tahun (Contoh: Sukabumi, 12 Mei 2012).'],
      ['5. Baris contoh pada baris 2 s.d. 5 dapat Anda timpa langsung dengan data siswa sekolah Anda.'],
      ['6. Simpan file dalam format Excel (.xlsx atau .xls) lalu klik tombol "Import dari Excel" di aplikasi.'],
    ];
    const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
    wsPetunjuk['!cols'] = [{ wch: 85 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk_Pengisian');

    XLSX.writeFile(wb, 'Template_Master_Data_Siswa_Resmi.xlsx');
    showToast('📥 Template Excel Siswa berhasil diunduh!');
  };

  const handleDownloadTemplateGuru = () => {
    // Definisi Kolom Template Guru
    const headers = [
      'No',
      'Nama Lengkap & Gelar',
      'NIP',
      'Pangkat / Golongan',
      'Jabatan',
      'Mata Pelajaran Utama',
      'Pendidikan Terakhir',
      'Status Pegawai (PNS / PPPK / GTT / Honor)',
    ];

    // Data Contoh Siap Pakai & Boleh Dihapus User (Format Nama Guru 1, 2, 3, dst.)
    const sampleRows = [
      [
        1,
        'Nama Guru 1',
        '19700512 199603 1 004',
        'Pembina Utama Muda (IV/c)',
        'Kepala Sekolah',
        'Manajerial',
        'S2 Manajemen Pendidikan',
        'PNS',
      ],
      [
        2,
        'Nama Guru 2',
        '19820315 200801 2 009',
        'Penata Tk. I (III/d)',
        'Guru Ahli Madya',
        'Guru Kelas VI',
        'S1 PGSD',
        'PNS',
      ],
      [
        3,
        'Nama Guru 3',
        '19940722 202221 1 003',
        'Penata Muda (IX)',
        'Guru Ahli Pertama',
        'PJOK',
        'S1 Pendidikan Jasmani',
        'PPPK',
      ],
      [
        4,
        'Nama Guru 4',
        '-',
        '-',
        'Guru Pengajar',
        'Pendidikan Agama Islam',
        'S1 Pendidikan Agama Islam',
        'Honor',
      ],
    ];

    const dataMatrix = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(dataMatrix);

    // Set Lebar Kolom Proporsional
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 34 }, // Nama
      { wch: 25 }, // NIP
      { wch: 26 }, // Pangkat/Golongan
      { wch: 24 }, // Jabatan
      { wch: 26 }, // Mapel
      { wch: 26 }, // Pendidikan
      { wch: 28 }, // Status
    ];

    // Petunjuk Pengisian Sheet
    const petunjukData = [
      ['PETUNJUK PENGISIAN TEMPLATE EXCEL MASTER DATA GURU & PEGAWAI'],
      [''],
      ['1. Kolom "Nama Lengkap & Gelar" WAJIB diisi.'],
      ['2. Kolom "NIP" jika belum memiliki NIP dapat diisi strip (-).'],
      ['3. Kolom "Status Pegawai" diisi salah satu dari: PNS, PPPK, GTT, atau Honor.'],
      ['4. Baris contoh pada baris 2 s.d. 5 dapat Anda hapus atau timpa dengan data guru sekolah Anda.'],
      ['5. Simpan file dalam format Excel (.xlsx atau .xls) lalu klik tombol "Import dari Excel" di aplikasi.'],
    ];
    const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
    wsPetunjuk['!cols'] = [{ wch: 80 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Guru');
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk_Pengisian');

    XLSX.writeFile(wb, 'Template_Master_Data_Guru_Resmi.xlsx');
    showToast('📥 Template Excel Guru berhasil diunduh!');
  };

  // ==========================================
  // 2. PARSER IMPORT EXCEL UNTUK SISWA & GURU
  // ==========================================
  const handleTriggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('Berkas Excel kosong atau tidak memiliki data yang valid.');
          return;
        }

        if (activeTab === 'siswa') {
          const parsedSiswa: Partial<Siswa>[] = rawJson
            .map((row) => {
              // Fuzzy column finder
              const getVal = (...keys: string[]) => {
                for (const k of keys) {
                  const foundKey = Object.keys(row).find(
                    (rKey) => rKey.trim().toLowerCase() === k.toLowerCase()
                  );
                  if (foundKey && String(row[foundKey]).trim()) {
                    return String(row[foundKey]).trim();
                  }
                }
                return '';
              };

              const nama = getVal('NAMA SISWA', 'Nama Siswa', 'Nama Lengkap', 'Nama', 'NAMA_LENGKAP', 'NAMA');
              
              // Handle NIS / NISN single or multi-column
              let nis = getVal('NIS', 'No NIS', 'nis');
              let nisn = getVal('NISN', 'No NISN', 'nisn');
              const combinedNisNisn = getVal('NIS / NISN', 'NIS/NISN', 'NIS_NISN');
              if (combinedNisNisn) {
                if (combinedNisNisn.includes('/')) {
                  const parts = combinedNisNisn.split('/');
                  nis = parts[0].trim() || nis;
                  nisn = parts[1].trim() || nisn;
                } else if (!nisn && combinedNisNisn.length >= 10) {
                  nisn = combinedNisNisn.trim();
                } else if (!nis) {
                  nis = combinedNisNisn.trim();
                }
              }

              // Handle TEMPAT, TANGGAL LAHIR
              let tempatLahir = getVal('Tempat Lahir', 'TempatLahir', 'tempat_lahir');
              let tanggalLahir = getVal('Tanggal Lahir', 'Tgl Lahir', 'tanggal_lahir');
              const combinedTTL = getVal('TEMPAT, TANGGAL LAHIR', 'Tempat, Tanggal Lahir', 'Tempat Tanggal Lahir', 'TTL');
              if (combinedTTL) {
                if (combinedTTL.includes(',')) {
                  const parts = combinedTTL.split(',');
                  tempatLahir = parts[0].trim() || tempatLahir;
                  tanggalLahir = parts.slice(1).join(',').trim() || tanggalLahir;
                } else {
                  tempatLahir = tempatLahir || combinedTTL.trim();
                }
              }

              const jkRaw = getVal('L/P', 'Jenis Kelamin (L/P)', 'Jenis Kelamin', 'JK', 'L/P (Laki-laki/Perempuan)');
              const jk: 'L' | 'P' = jkRaw.toUpperCase().startsWith('P') || jkRaw.toLowerCase().includes('perempuan') ? 'P' : 'L';

              if (!nama && !nisn) return null;

              return {
                id: `sis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                nama: nama || 'Tanpa Nama',
                nis: nis || '23240000',
                nisn: nisn || '0000000000',
                nik: getVal('NIK', 'No NIK', 'nik'),
                jenisKelamin: jk,
                tempatLahir: tempatLahir || 'Sukabumi',
                tanggalLahir: tanggalLahir || '01 Januari 2012',
                agama: getVal('Agama', 'agama') || 'Islam',
                kelas: getVal('KELAS', 'Kelas', 'Rombel', 'Tingkat') || 'VI-A',
                jurusan: getVal('Jurusan', 'Program') || 'Umum',
                alamat: getVal('Alamat Lengkap', 'Alamat', 'alamat') || 'Jl. Raya Sekolah',
                namaOrangTua: getVal('ORANG TUA / WALI', 'Nama Orang Tua / Wali', 'Nama Orang Tua', 'Nama Ortu', 'Nama Ayah', 'Orang Tua') || 'Nama Orang Tua',
                pekerjaanOrangTua: getVal('Pekerjaan Orang Tua', 'Pekerjaan Ortu', 'Pekerjaan') || 'Wiraswasta',
                noHpOrangTua: getVal('No HP Orang Tua', 'No HP', 'Telepon', 'No Telepon') || '-',
                noPeserta: getVal('No Peserta Ujian', 'No Peserta', 'Nomor Peserta') || '-',
                ruang: getVal('Ruang Ujian', 'Ruang', 'No Ruang') || 'Ruang 01',
                virtualAccPIP: getVal('VIRTUAL ACC PIP', 'Virtual Acc PIP', 'VA PIP', 'No Rekening PIP', 'virtualAccPIP') || (nisn || '-'),
                nominalPIP: getVal('Nominal PIP', 'Nominal', 'Bantuan PIP') || 'Rp 1.000.000',
              };
            })
            .filter(Boolean) as Partial<Siswa>[];

          if (parsedSiswa.length === 0) {
            alert('Tidak ada baris data siswa yang valid pada berkas Excel.');
            return;
          }

          setImportPreviewData({
            type: 'siswa',
            fileName: file.name,
            items: parsedSiswa,
          });
        } else {
          // Guru Parser
          const parsedGuru: Partial<Guru>[] = rawJson
            .map((row) => {
              const getVal = (...keys: string[]) => {
                for (const k of keys) {
                  const foundKey = Object.keys(row).find(
                    (rKey) => rKey.trim().toLowerCase() === k.toLowerCase()
                  );
                  if (foundKey && String(row[foundKey]).trim()) {
                    return String(row[foundKey]).trim();
                  }
                }
                return '';
              };

              const nama = getVal('Nama Lengkap & Gelar', 'Nama Guru', 'Nama', 'NAMA_LENGKAP', 'NAMA');
              const nip = getVal('NIP', 'No NIP', 'nip') || '-';
              const statusRaw = getVal('Status Pegawai (PNS / PPPK / GTT / Honor)', 'Status Pegawai', 'Status', 'Kepegawaian');
              let status: 'PNS' | 'PPPK' | 'GTT' | 'Honor' = 'PNS';
              if (statusRaw.toUpperCase().includes('PPPK') || statusRaw.toUpperCase().includes('P3K')) status = 'PPPK';
              else if (statusRaw.toUpperCase().includes('GTT')) status = 'GTT';
              else if (statusRaw.toUpperCase().includes('HONOR')) status = 'Honor';

              if (!nama) return null;

              return {
                id: `gr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                nama: nama,
                nip: nip,
                pangkatGolongan: getVal('Pangkat / Golongan', 'Pangkat', 'Golongan', 'Gol Ruang') || 'Penata (III/c)',
                jabatan: getVal('Jabatan', 'Jabatan Resmi', 'Tugas Tambahan') || 'Guru Pengajar',
                mapelUtama: getVal('Mata Pelajaran Utama', 'Mata Pelajaran', 'Mapel', 'Tugas Mengajar') || 'Guru Kelas',
                pendidikanTerakhir: getVal('Pendidikan Terakhir', 'Pendidikan', 'Ijazah') || 'S1 Pendidikan',
                statusPegawai: status,
              };
            })
            .filter(Boolean) as Partial<Guru>[];

          if (parsedGuru.length === 0) {
            alert('Tidak ada baris data guru yang valid pada berkas Excel.');
            return;
          }

          setImportPreviewData({
            type: 'guru',
            fileName: file.name,
            items: parsedGuru,
          });
        }
      } catch (err) {
        console.error('Error reading Excel file:', err);
        alert('Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Konfirmasi Eksekusi Import
  const handleConfirmImport = () => {
    if (!importPreviewData) return;

    if (importPreviewData.type === 'siswa') {
      const newItems = importPreviewData.items as Siswa[];
      if (importMode === 'replace') {
        onUpdateSiswaList(newItems);
        showToast(`✅ Berhasil mengganti data master dengan ${newItems.length} data siswa dari Excel!`);
      } else {
        // Append mode (gabungkan, cegah duplikat NISN jika ada)
        const existingNisns = new Set(siswaList.map((s) => s.nisn));
        const filteredNew = newItems.filter((item) => !existingNisns.has(item.nisn));
        onUpdateSiswaList([...siswaList, ...filteredNew]);
        showToast(`✅ Berhasil menambahkan ${filteredNew.length} siswa baru dari Excel!`);
      }
    } else {
      const newItems = importPreviewData.items as Guru[];
      if (importMode === 'replace') {
        onUpdateGuruList(newItems);
        showToast(`✅ Berhasil mengganti data master dengan ${newItems.length} data guru dari Excel!`);
      } else {
        // Append mode
        onUpdateGuruList([...guruList, ...newItems]);
        showToast(`✅ Berhasil menambahkan ${newItems.length} guru/pegawai baru dari Excel!`);
      }
    }

    setImportPreviewData(null);
  };

  // ==========================================
  // 3. EXPORT EXCEL MASTER DATA SAAT INI
  // ==========================================
  const handleExportSiswa = () => {
    const dataToExport = siswaList.map((s, idx) => ({
      'No': idx + 1,
      'Nama Lengkap': s.nama || '',
      'NIS': s.nis || '',
      'NISN': s.nisn || '',
      'NIK': s.nik || '',
      'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tempat Lahir': s.tempatLahir || '',
      'Tanggal Lahir': s.tanggalLahir || '',
      'Agama': s.agama || '',
      'Kelas': s.kelas || '',
      'Jurusan': s.jurusan || '',
      'Alamat Lengkap': s.alamat || '',
      'Nama Orang Tua / Wali': s.namaOrangTua || '',
      'Pekerjaan Orang Tua': s.pekerjaanOrangTua || '',
      'No HP Orang Tua': s.noHpOrangTua || '',
      'No Peserta Ujian': s.noPeserta || '',
      'Ruang Ujian': s.ruang || '',
      'Virtual Acc PIP': s.virtualAccPIP || '',
      'Nominal PIP': s.nominalPIP || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 14 },
      { wch: 16 },
      { wch: 20 },
      { wch: 15 },
      { wch: 16 },
      { wch: 18 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 32 },
      { wch: 25 },
      { wch: 20 },
      { wch: 16 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa');
    XLSX.writeFile(workbook, `Master_Data_Siswa_${Date.now()}.xlsx`);
    showToast('📊 Seluruh Data Siswa berhasil diekspor ke Excel!');
  };

  const handleExportGuru = () => {
    const dataToExport = guruList.map((g, idx) => ({
      'No': idx + 1,
      'Nama Lengkap & Gelar': g.nama || '',
      'NIP': g.nip || '',
      'Pangkat / Golongan': g.pangkatGolongan || '',
      'Jabatan': g.jabatan || '',
      'Mata Pelajaran Utama': g.mapelUtama || '',
      'Pendidikan Terakhir': g.pendidikanTerakhir || '',
      'Status Pegawai': g.statusPegawai || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 34 },
      { wch: 25 },
      { wch: 26 },
      { wch: 24 },
      { wch: 26 },
      { wch: 26 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Guru');
    XLSX.writeFile(workbook, `Master_Data_Guru_${Date.now()}.xlsx`);
    showToast('📊 Seluruh Data Guru berhasil diekspor ke Excel!');
  };

  // ==========================================
  // 4. MANUAL FORM HANDLING
  // ==========================================
  const [newSiswa, setNewSiswa] = useState<Partial<Siswa>>({
    nama: '',
    nis: '',
    nisn: '',
    kelas: 'VI-A',
    jenisKelamin: 'L',
    tempatLahir: 'Sukabumi',
    tanggalLahir: '12 Mei 2012',
    alamat: 'Jl. Raya Sekolah No. 10',
    namaOrangTua: '',
    virtualAccPIP: '',
    nominalPIP: 'Rp 1.000.000',
  });

  const [newGuru, setNewGuru] = useState<Partial<Guru>>({
    nama: '',
    nip: '',
    pangkatGolongan: 'Penata (III/c)',
    jabatan: 'Guru Pengajar',
    mapelUtama: 'Guru Kelas',
    statusPegawai: 'PNS',
    pendidikanTerakhir: 'S1 Pendidikan',
  });

  const handleAddSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiswa.nama || !newSiswa.nisn) return;

    const item: Siswa = {
      id: `sis-${Date.now()}`,
      nis: newSiswa.nis || '23240000',
      nisn: newSiswa.nisn || '0000000000',
      nama: newSiswa.nama || '',
      jenisKelamin: newSiswa.jenisKelamin || 'L',
      tempatLahir: newSiswa.tempatLahir || 'Sukabumi',
      tanggalLahir: newSiswa.tanggalLahir || '01 Januari 2012',
      kelas: newSiswa.kelas || 'VI-A',
      alamat: newSiswa.alamat || 'Jl. Raya Sekolah',
      namaOrangTua: newSiswa.namaOrangTua || 'Nama Orang Tua',
      virtualAccPIP: newSiswa.virtualAccPIP || newSiswa.nisn,
      nominalPIP: newSiswa.nominalPIP || 'Rp 1.000.000',
    };

    onUpdateSiswaList([item, ...siswaList]);
    setShowAddSiswaModal(false);
    showToast(`Data siswa "${item.nama}" berhasil disimpan ke sistem.`, 'success', 'Berhasil Disimpan');
  };

  const handleAddGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuru.nama) return;

    const item: Guru = {
      id: `gr-${Date.now()}`,
      nip: newGuru.nip || '-',
      nama: newGuru.nama || '',
      pangkatGolongan: newGuru.pangkatGolongan || 'Penata (III/c)',
      jabatan: newGuru.jabatan || 'Guru Pengajar',
      mapelUtama: newGuru.mapelUtama || 'Guru Kelas',
      pendidikanTerakhir: newGuru.pendidikanTerakhir || 'S1 Pendidikan',
      statusPegawai: (newGuru.statusPegawai as any) || 'PNS',
    };

    onUpdateGuruList([item, ...guruList]);
    setShowAddGuruModal(false);
    showToast(`Data guru "${item.nama}" berhasil disimpan ke sistem.`, 'success', 'Berhasil Disimpan');
  };

  const handleDeleteSiswa = (id: string) => {
    const target = siswaList.find((s) => s.id === id);
    if (!target) return;
    setDeleteConfirmState({
      isOpen: true,
      type: 'siswa',
      id: target.id,
      name: `${target.nama} (NISN: ${target.nisn || '-'})`,
    });
  };

  const handleDeleteGuru = (id: string) => {
    const target = guruList.find((g) => g.id === id);
    if (!target) return;
    setDeleteConfirmState({
      isOpen: true,
      type: 'guru',
      id: target.id,
      name: `${target.nama} (NIP: ${target.nip || '-'})`,
    });
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmState) return;
    if (deleteConfirmState.type === 'siswa') {
      onUpdateSiswaList(siswaList.filter((s) => s.id !== deleteConfirmState.id));
      showToast(`Data siswa "${deleteConfirmState.name}" berhasil dihapus.`, 'warning', 'Berhasil Dihapus');
    } else {
      onUpdateGuruList(guruList.filter((g) => g.id !== deleteConfirmState.id));
      showToast(`Data guru "${deleteConfirmState.name}" berhasil dihapus.`, 'warning', 'Berhasil Dihapus');
    }
    setDeleteConfirmState(null);
  };

  // Filtered Lists
  const filteredSiswa = siswaList.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery) ||
      s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGuru = guruList.filter(
    (g) =>
      g.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nip.includes(searchQuery) ||
      g.mapelUtama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5 font-sans">
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Header & Tab Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
            <span>Master Data Siswa & Guru Sekolah</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Database pusat otomatis untuk auto-fill seluruh formulir surat resmi, PIP, PPDB, dan administrasi sekolah.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('siswa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'siswa'
                ? 'bg-white text-indigo-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${activeTab === 'siswa' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span>Master Data Siswa ({siswaList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guru')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'guru'
                ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === 'guru' ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>Master Data Guru ({guruList.length})</span>
          </button>
        </div>
      </div>

      {/* Action Toolbar: Search + Excel Actions + Add Manual */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'siswa'
                ? 'Cari nama siswa, NISN, atau kelas...'
                : 'Cari nama guru, NIP, atau mata pelajaran...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
          />
        </div>

        {/* Buttons Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. DOWNLOAD TEMPLATE EXCEL (DENGAN BORDER & CONTOH LENGKAP) */}
          <button
            type="button"
            onClick={activeTab === 'siswa' ? handleDownloadTemplateSiswa : handleDownloadTemplateGuru}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Unduh Template Excel dengan format kolom dan border lengkap untuk diisi secara massal"
          >
            <Download className="w-4 h-4 text-amber-700" />
            <span>Download Template Excel</span>
          </button>

          {/* 2. UPLOAD / IMPORT EXCEL LANGSUNG BANYAK */}
          <button
            type="button"
            onClick={handleTriggerFileUpload}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Unggah berkas Excel (.xlsx / .xls) untuk import data massal secara instan"
          >
            <UploadCloud className="w-4 h-4 text-blue-700" />
            <span>Import dari Excel</span>
          </button>

          {/* 3. TAMBAH SATUAN SECARA MANUAL */}
          {activeTab === 'siswa' ? (
            <button
              type="button"
              onClick={() => setShowAddSiswaModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddGuruModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Banner on Active Tab */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {activeTab === 'siswa'
              ? '💡 Tips: Anda dapat mengunduh Template Excel, mengisi puluhan atau ratusan data siswa sekaligus dengan Excel, lalu mengunggahnya via tombol "Import dari Excel".'
              : '💡 Tips: Unduh Template Excel Guru, lengkapi daftar guru dan staf sekolah Anda, lalu unggah kembali untuk sinkronisasi otomatis ke semua SK dan Surat Tugas.'}
          </span>
        </div>
      </div>

      {/* Table Rendition */}
      {activeTab === 'siswa' ? (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">L/P</th>
                <th className="p-3">Kelas</th>
                <th className="p-3">Tempat, Tanggal Lahir</th>
                <th className="p-3">Orang Tua / Wali</th>
                <th className="p-3">Virtual Acc PIP</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSiswa.length > 0 ? (
                filteredSiswa.map((s, idx) => (
                  <tr key={s.id || idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{s.nama}</div>
                      {s.nik && <div className="text-[10px] text-slate-500 font-mono">NIK: {s.nik}</div>}
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-700">
                      <div>{s.nis || '-'}</div>
                      <div className="text-[10px] text-indigo-700 font-bold">{s.nisn}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.jenisKelamin === 'P'
                            ? 'bg-pink-100 text-pink-700 border border-pink-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {s.jenisKelamin === 'P' ? 'P' : 'L'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-indigo-900">{s.kelas}</td>
                    <td className="p-3 text-slate-600">
                      {s.tempatLahir ? `${s.tempatLahir}, ${s.tanggalLahir}` : s.tanggalLahir}
                    </td>
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold">{s.namaOrangTua || '-'}</div>
                      {s.noHpOrangTua && s.noHpOrangTua !== '-' && (
                        <div className="text-[10px] text-slate-500 font-mono">{s.noHpOrangTua}</div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">
                      {s.virtualAccPIP || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteSiswa(s.id)}
                        className="p-1.5 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <p className="font-semibold">Tidak ada data siswa yang cocok dengan pencarian.</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Silakan unduh Template Excel dan klik "Import dari Excel" untuk mengisi data secara massal.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Nama Lengkap Guru & Gelar</th>
                <th className="p-3">NIP</th>
                <th className="p-3">Golongan & Jabatan</th>
                <th className="p-3">Mata Pelajaran Utama</th>
                <th className="p-3">Pendidikan</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGuru.length > 0 ? (
                filteredGuru.map((g, idx) => (
                  <tr key={g.id || idx} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{g.nama}</td>
                    <td className="p-3 font-mono font-medium text-slate-700">{g.nip || '-'}</td>
                    <td className="p-3 text-slate-700">
                      <div className="font-semibold text-slate-800">{g.pangkatGolongan || '-'}</div>
                      <div className="text-[10px] text-slate-500">{g.jabatan || '-'}</div>
                    </td>
                    <td className="p-3 font-bold text-emerald-900">{g.mapelUtama || '-'}</td>
                    <td className="p-3 text-slate-600">{g.pendidikanTerakhir || '-'}</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                        {g.statusPegawai}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteGuru(g.id)}
                        className="p-1.5 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Guru"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <p className="font-semibold">Tidak ada data guru yang cocok dengan pencarian.</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Silakan unduh Template Excel dan klik "Import dari Excel" untuk mengisi data secara massal.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL PREVIEW & KONFIRMASI IMPORT EXCEL MASSAL        */}
      {/* ========================================================= */}
      {importPreviewData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col font-sans text-xs border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Konfirmasi Import Data Excel {importPreviewData.type === 'siswa' ? 'Siswa' : 'Guru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Berkas: <span className="font-mono font-semibold text-slate-700">{importPreviewData.fileName}</span>{' '}
                    • Ditemukan <strong className="text-blue-700">{importPreviewData.items.length} baris data</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportPreviewData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Options & Preview */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Opsi Mode Import */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-2">
                <p className="font-bold text-blue-950">Pilih Metode Penggabungan Data:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white/50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-blue-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Tambahkan ke Data Saat Ini</p>
                      <p className="text-[10px] text-slate-500">
                        Data lama tetap disimpan, data dari Excel akan ditambahkan ke daftar.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-white/50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <p className="font-bold text-slate-800">Gantikan Seluruh Data (Timpa Total)</p>
                      <p className="text-[10px] text-slate-500">
                        Hapus data lama dan gantikan sepenuhnya dengan isi berkas Excel ini.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tabel Pratinjau 5 Baris Pertama */}
              <div>
                <p className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>Pratinjau Data yang Akan Diimpor (Maks. 5 Baris Pertama):</span>
                  <span className="text-[10px] text-slate-500">Total: {importPreviewData.items.length} Data</span>
                </p>
                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-56">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      {importPreviewData.type === 'siswa' ? (
                        <tr>
                          <th className="p-2 w-8 text-center">No</th>
                          <th className="p-2">Nama Siswa</th>
                          <th className="p-2">NISN</th>
                          <th className="p-2">L/P</th>
                          <th className="p-2">Kelas</th>
                          <th className="p-2">Orang Tua</th>
                          <th className="p-2">Alamat</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="p-2 w-8 text-center">No</th>
                          <th className="p-2">Nama Guru</th>
                          <th className="p-2">NIP</th>
                          <th className="p-2">Pangkat/Gol</th>
                          <th className="p-2">Mapel</th>
                          <th className="p-2">Status</th>
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importPreviewData.items.slice(0, 5).map((item: any, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900">{item.nama}</td>
                          {importPreviewData.type === 'siswa' ? (
                            <>
                              <td className="p-2 font-mono text-indigo-700">{item.nisn}</td>
                              <td className="p-2">{item.jenisKelamin}</td>
                              <td className="p-2 font-semibold">{item.kelas}</td>
                              <td className="p-2">{item.namaOrangTua}</td>
                              <td className="p-2 truncate max-w-[150px]">{item.alamat}</td>
                            </>
                          ) : (
                            <>
                              <td className="p-2 font-mono">{item.nip}</td>
                              <td className="p-2">{item.pangkatGolongan}</td>
                              <td className="p-2 font-semibold">{item.mapelUtama}</td>
                              <td className="p-2 font-bold text-emerald-800">{item.statusPegawai}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setImportPreviewData(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Impor {importPreviewData.items.length} Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL MANUAL ADD SISWA                                 */}
      {/* ========================================================= */}
      {showAddSiswaModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 font-sans text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Tambah Data Siswa Baru</span>
            </h3>
            <form onSubmit={handleAddSiswa} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AHMAD FAUZI"
                  className="w-full border border-slate-300 p-2 rounded-lg font-bold"
                  value={newSiswa.nama}
                  onChange={(e) => setNewSiswa({ ...newSiswa, nama: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">NIS</label>
                  <input
                    type="text"
                    placeholder="23241001"
                    className="w-full border border-slate-300 p-2 rounded-lg font-mono"
                    value={newSiswa.nis}
                    onChange={(e) => setNewSiswa({ ...newSiswa, nis: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    placeholder="0081234567"
                    className="w-full border border-slate-300 p-2 rounded-lg font-mono"
                    value={newSiswa.nisn}
                    onChange={(e) => setNewSiswa({ ...newSiswa, nisn: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newSiswa.jenisKelamin}
                    onChange={(e) => setNewSiswa({ ...newSiswa, jenisKelamin: e.target.value as 'L' | 'P' })}
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kelas</label>
                  <input
                    type="text"
                    placeholder="VI-A"
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newSiswa.kelas}
                    onChange={(e) => setNewSiswa({ ...newSiswa, kelas: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newSiswa.tempatLahir}
                    onChange={(e) => setNewSiswa({ ...newSiswa, tempatLahir: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    placeholder="12 Mei 2012"
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newSiswa.tanggalLahir}
                    onChange={(e) => setNewSiswa({ ...newSiswa, tanggalLahir: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Nama Orang Tua / Wali</label>
                <input
                  type="text"
                  placeholder="Nama Ayah / Ibu / Wali"
                  className="w-full border border-slate-300 p-2 rounded-lg"
                  value={newSiswa.namaOrangTua}
                  onChange={(e) => setNewSiswa({ ...newSiswa, namaOrangTua: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  placeholder="Jl. Merdeka No. 10"
                  className="w-full border border-slate-300 p-2 rounded-lg"
                  value={newSiswa.alamat}
                  onChange={(e) => setNewSiswa({ ...newSiswa, alamat: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddSiswaModal(false)}
                  className="px-3.5 py-2 border rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL MANUAL ADD GURU                                  */}
      {/* ========================================================= */}
      {showAddGuruModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 font-sans text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Tambah Data Guru & Pegawai Baru</span>
            </h3>
            <form onSubmit={handleAddGuru} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: NINA HERLINA, S.Pd.SD."
                  className="w-full border border-slate-300 p-2 rounded-lg font-bold"
                  value={newGuru.nama}
                  onChange={(e) => setNewGuru({ ...newGuru, nama: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">NIP (Jika ada)</label>
                <input
                  type="text"
                  placeholder="19820315 200801 2 009 atau tanda strip (-)"
                  className="w-full border border-slate-300 p-2 rounded-lg font-mono"
                  value={newGuru.nip}
                  onChange={(e) => setNewGuru({ ...newGuru, nip: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    placeholder="Penata Tk. I (III/d)"
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newGuru.pangkatGolongan}
                    onChange={(e) => setNewGuru({ ...newGuru, pangkatGolongan: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jabatan</label>
                  <input
                    type="text"
                    placeholder="Guru Ahli Madya"
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newGuru.jabatan}
                    onChange={(e) => setNewGuru({ ...newGuru, jabatan: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Mata Pelajaran Utama</label>
                  <input
                    type="text"
                    placeholder="Guru Kelas VI"
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newGuru.mapelUtama}
                    onChange={(e) => setNewGuru({ ...newGuru, mapelUtama: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Pegawai</label>
                  <select
                    className="w-full border border-slate-300 p-2 rounded-lg"
                    value={newGuru.statusPegawai}
                    onChange={(e) => setNewGuru({ ...newGuru, statusPegawai: e.target.value as any })}
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTT">GTT</option>
                    <option value="Honor">Honor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Pendidikan Terakhir</label>
                <input
                  type="text"
                  placeholder="S1 PGSD"
                  className="w-full border border-slate-300 p-2 rounded-lg"
                  value={newGuru.pendidikanTerakhir}
                  onChange={(e) => setNewGuru({ ...newGuru, pendidikanTerakhir: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddGuruModal(false)}
                  className="px-3.5 py-2 border rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D Delete Confirmation Modal for Siswa & Guru */}
      <ConfirmationModal
        isOpen={!!deleteConfirmState?.isOpen}
        variant="danger"
        title={deleteConfirmState?.type === 'siswa' ? 'Peringatan Hapus Data Siswa' : 'Peringatan Hapus Data Guru / Pegawai'}
        description={
          deleteConfirmState?.type === 'siswa'
            ? 'Apakah Anda yakin ingin menghapus data siswa ini dari database sekolah? Data yang dihapus tidak dapat dipulihkan.'
            : 'Apakah Anda yakin ingin menghapus data guru ini dari database sekolah? Data yang dihapus tidak dapat dipulihkan.'
        }
        itemName={deleteConfirmState?.name}
        confirmText={deleteConfirmState?.type === 'siswa' ? 'Ya, Hapus Siswa' : 'Ya, Hapus Guru'}
        cancelText="Batal"
        onConfirm={handleExecuteDelete}
        onCancel={() => setDeleteConfirmState(null)}
      />
    </div>
  );
};
