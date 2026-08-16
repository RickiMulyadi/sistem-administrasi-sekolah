'use client';

import React, { useState, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { SchoolProfile, Siswa } from '../types';
import { KopSuratHeader } from './KopSuratHeader';
import {
  X,
  Printer,
  FileCheck,
  CreditCard,
  Grid,
  ClipboardList,
  Sparkles,
  RefreshCw,
  UserCheck,
  Settings2,
  Users,
  Upload,
  FileArchive,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Camera,
  Download,
} from 'lucide-react';

interface BerkasUjianModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  siswaList?: Siswa[];
}

const SAMPLE_STUDENTS: Siswa[] = [];

export const BerkasUjianModal: React.FC<BerkasUjianModalProps> = ({
  isOpen,
  onClose,
  profile,
  siswaList = [],
}) => {
  // Active Tab: 'kartu' | 'denah' | 'absensi' | 'pengawas'
  const [activeTab, setActiveTab] = useState<'kartu' | 'denah' | 'absensi' | 'pengawas'>('kartu');
  const [layoutKartu, setLayoutKartu] = useState<'standar' | 'minimalis' | 'modern'>('standar');

  // Common Exam Settings
  const [namaUjian, setNamaUjian] = useState('SUMATIF AKHIR SEMESTER (SAS)');
  const [tahunAjaran, setTahunAjaran] = useState(`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`);
  const [semester, setSemester] = useState('Ganjil');
  const [jumlahRuangan, setJumlahRuangan] = useState<number>(2);
  const [selectedRuangFilter, setSelectedRuangFilter] = useState<string>('Semua');
  const [mataPelajaran, setMataPelajaran] = useState('Bahasa Indonesia');
  const [prevKota, setPrevKota] = useState(profile.kota);
  const [tempatUjian, setTempatUjian] = useState(profile.kota || 'Bandung');
  const [tanggalUjian, setTanggalUjian] = useState(
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  );

  if (profile.kota !== prevKota) {
    setPrevKota(profile.kota);
    setTempatUjian(profile.kota || 'Bandung');
  }
  const [waktuUjian, setWaktuUjian] = useState('07.30 - 09.00 WIB');
  const [namaPengawas, setNamaPengawas] = useState('');
  const [nipPengawas, setNipPengawas] = useState('');

  // Panitia Ujian single state & Pengawas Ujian list for Denah Tempat Duduk
  const [namaPanitia, setNamaPanitia] = useState('');
  const [nipPanitia, setNipPanitia] = useState('');

  const [pengawasList, setPengawasList] = useState<{ nama: string; nip: string; ruang: string }[]>([
    { nama: '', nip: '', ruang: 'Ruang 01' },
    { nama: '', nip: '', ruang: 'Ruang 02' },
    { nama: '', nip: '', ruang: 'Ruang 01' },
    { nama: '', nip: '', ruang: 'Ruang 02' },
  ]);

  // Format School Name cleanly (e.g., SD Negeri Margaasih)
  const displayNamaSekolah = useMemo(() => {
    let name = profile.namaSekolah || 'SD Negeri Margaasih';
    if (/^SEKOLAH DASAR NEGERI/i.test(name)) {
      name = name.replace(/^SEKOLAH DASAR NEGERI/i, 'SD Negeri');
    } else if (/^SD NEGERI/i.test(name)) {
      name = name.replace(/^SD NEGERI/i, 'SD Negeri');
    }
    return name
      .split(' ')
      .map((w) => (w.toLowerCase() === 'sd' ? 'SD' : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join(' ');
  }, [profile.namaSekolah]);

  // Denah Config
  const [jumlahBaris, setJumlahBaris] = useState(4);
  const [jumlahKolom, setJumlahKolom] = useState(5);
  const [jumlahPengawas, setJumlahPengawas] = useState<number>(1);

  // Photos & Excel Data State
  const [studentPhotos, setStudentPhotos] = useState<Record<string, string>>({});
  const [customSiswaList, setCustomSiswaList] = useState<Siswa[]>([]);
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const [zipStatusMessage, setZipStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [excelStatusMessage, setExcelStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // States for supervisor photos
  const [pengawasPhotos, setPengawasPhotos] = useState<Record<string, string>>({});
  const [isProcessingPengawasZip, setIsProcessingPengawasZip] = useState(false);
  const [pengawasZipStatusMessage, setPengawasZipStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const normalizeStr = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const getPengawasPhoto = (nama: string, nip: string) => {
    const normNama = normalizeStr(nama || '');
    const normNip = normalizeStr(nip || '');
    return (normNama && pengawasPhotos[normNama]) || (normNip && pengawasPhotos[normNip]) || null;
  };

  const handlePengawasZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingPengawasZip(true);
    setPengawasZipStatusMessage(null);

    try {
      const zip = await JSZip.loadAsync(file);
      const updatedPhotos: Record<string, string> = { ...pengawasPhotos };
      let matchCount = 0;
      let totalImages = 0;

      const fileEntries = Object.keys(zip.files);

      for (const filename of fileEntries) {
        const zipEntry = zip.files[filename];
        if (zipEntry.dir) continue;

        const ext = filename.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext || '')) continue;

        totalImages++;

        const baseName = filename.split('/').pop()?.split('\\').pop()?.replace(/\.[^/.]+$/, '') || '';
        const normalizedBaseName = normalizeStr(baseName);

        if (!normalizedBaseName) continue;

        // Match supervisor by Nama or NIP against active supervisors in pengawasList (up to jumlahPengawas)
        const matchedPengawas = pengawasList.slice(0, jumlahPengawas).find((p) => {
          const normName = normalizeStr(p.nama || '');
          const normNip = normalizeStr(p.nip || '');
          return (
            (normName && normName === normalizedBaseName) ||
            (normNip && normNip === normalizedBaseName)
          );
        });

        const blob = await zipEntry.async('blob');
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        updatedPhotos[normalizedBaseName] = dataUrl;

        if (matchedPengawas) {
          matchCount++;
        }
      }

      setPengawasPhotos(updatedPhotos);

      if (matchCount > 0) {
        setPengawasZipStatusMessage({
          type: 'success',
          text: `Berhasil mencocokkan ${matchCount} foto pengawas dari ${totalImages} file gambar dalam ZIP!`,
        });
      } else {
        setPengawasZipStatusMessage({
          type: 'info',
          text: `Berhasil mengunggah ${totalImages} foto pengawas. Foto akan dicocokkan otomatis jika nama atau NIP pengawas sesuai dengan nama file gambar.`,
        });
      }
    } catch (err) {
      console.error('Gagal memproses file ZIP pengawas:', err);
      setPengawasZipStatusMessage({
        type: 'error',
        text: 'Gagal membaca file ZIP pengawas. Pastikan file berformat .zip yang valid.',
      });
    } finally {
      setIsProcessingPengawasZip(false);
      event.target.value = '';
    }
  };

  // Combine custom imported siswa with passed siswaList or fallback sample students
  const allAvailableSiswa =
    siswaList.length > 0 || customSiswaList.length > 0
      ? [...customSiswaList, ...siswaList]
      : SAMPLE_STUDENTS;

  // Excel Upload Handler for bulk student data
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingExcel(true);
    setExcelStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (!rawData || rawData.length === 0) {
          setExcelStatusMessage({
            type: 'error',
            text: 'File Excel kosong atau tidak berisi data.',
          });
          setIsProcessingExcel(false);
          return;
        }

        const importedStudents: Siswa[] = rawData.map((row, index) => {
          const findVal = (keywords: string[]) => {
            for (const key of Object.keys(row)) {
              const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (keywords.some((kw) => cleanKey.includes(kw))) {
                return String(row[key]).trim();
              }
            }
            return '';
          };

          const noPeserta =
            findVal(['nopeserta', 'nopes', 'peserta']) ||
            row['No. Peserta'] ||
            row['No.Peserta'] ||
            row['No Peserta'] ||
            `01-001-${String(index + 1).padStart(3, '0')}-8`;

          const nama =
            findVal(['namasiswa', 'nama', 'siswanama']) ||
            row['Nama Siswa'] ||
            row['NamaSiswa'] ||
            row['Nama'] ||
            `NAMA SISWA ${index + 1}`;

          const ttl =
            findVal(['tempat', 'tgl', 'ttl', 'lahir']) ||
            row['Tempat, Tanggal Lahir'] ||
            row['Tempat,Tanggal Lahir'] ||
            row['Tempat Tanggal Lahir'] ||
            '';

          const nisnNisRaw =
            findVal(['nisn', 'nis']) ||
            row['NISN/NIS'] ||
            row['NISN / NIS'] ||
            row['NISN'] ||
            '';

          const ruang =
            findVal(['ruang']) ||
            row['Ruang'] ||
            row['RUANG'] ||
            'Ruang 01';

          // Parse NISN/NIS
          let nisn = '';
          let nis = '';
          if (nisnNisRaw.includes('/')) {
            const parts = nisnNisRaw.split('/');
            nisn = parts[0].trim();
            nis = parts[1].trim();
          } else {
            nisn = nisnNisRaw;
          }

          // Parse TTL
          let tempatLahir = '-';
          let tanggalLahir = '-';
          if (ttl.includes(',')) {
            const parts = ttl.split(',');
            tempatLahir = parts[0].trim();
            tanggalLahir = parts.slice(1).join(',').trim();
          } else if (ttl) {
            tempatLahir = ttl;
          }

          return {
            id: `excel-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
            noPeserta,
            nama: String(nama).toUpperCase(),
            nisn,
            nis,
            kelas: findVal(['kelas', 'class']) || row['Kelas'] || row['KELAS'] || 'Kelas 6',
            jenisKelamin: 'L',
            tempatLahir,
            tanggalLahir,
            alamat: '-',
            namaOrangTua: '-',
            ruang,
          };
        });

        setCustomSiswaList((prev) => [...prev, ...importedStudents]);
        setExcelStatusMessage({
          type: 'success',
          text: `Berhasil mengimpor ${importedStudents.length} siswa dari file Excel!`,
        });
      } catch (err) {
        console.error('Gagal membaca file Excel:', err);
        setExcelStatusMessage({
          type: 'error',
          text: 'Gagal mengimpor file Excel. Pastikan format file .xlsx, .xls, atau .csv valid.',
        });
      } finally {
        setIsProcessingExcel(false);
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setExcelStatusMessage({
        type: 'error',
        text: 'Gagal membaca file.',
      });
      setIsProcessingExcel(false);
    };

    reader.readAsBinaryString(file);
  };

  // Download Excel Template for Student Data Entry
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'No. Peserta': '01-001-001-8',
        'Nama Siswa': 'NAMA SISWA 1',
        'Tempat, Tanggal Lahir': 'Bandung, 10 Mei 2012',
        'NISN/NIS': '0012345671 / 2024001',
        'Ruang': 'Ruang 01',
      },
      {
        'No. Peserta': '01-001-002-7',
        'Nama Siswa': 'NAMA SISWA 2',
        'Tempat, Tanggal Lahir': 'Bandung, 15 Agustus 2012',
        'NISN/NIS': '0012345672 / 2024002',
        'Ruang': 'Ruang 01',
      },
      {
        'No. Peserta': '01-001-003-6',
        'Nama Siswa': 'NAMA SISWA 3',
        'Tempat, Tanggal Lahir': 'Bandung, 20 Februari 2012',
        'NISN/NIS': '0012345673 / 2024003',
        'Ruang': 'Ruang 01',
      },
      {
        'No. Peserta': '01-001-004-5',
        'Nama Siswa': 'NAMA SISWA 4',
        'Tempat, Tanggal Lahir': 'Bandung, 05 November 2012',
        'NISN/NIS': '0012345674 / 2024004',
        'Ruang': 'Ruang 01',
      },
      {
        'No. Peserta': '01-001-005-4',
        'Nama Siswa': 'NAMA SISWA 5',
        'Tempat, Tanggal Lahir': 'Bandung, 12 Desember 2012',
        'NISN/NIS': '0012345675 / 2024005',
        'Ruang': 'Ruang 01',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 28 },
      { wch: 28 },
      { wch: 24 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kartu Ujian');
    XLSX.writeFile(workbook, 'Template_Kartu_Peserta_Ujian.xlsx');
  };

  // Bulk ZIP upload handler for student photos
  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingZip(true);
    setZipStatusMessage(null);

    try {
      const zip = await JSZip.loadAsync(file);
      const updatedPhotos: Record<string, string> = { ...studentPhotos };
      let matchCount = 0;
      let totalImages = 0;

      const normalizeStr = (str: string) =>
        str
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

      const fileEntries = Object.keys(zip.files);

      for (const filename of fileEntries) {
        const zipEntry = zip.files[filename];
        if (zipEntry.dir) continue;

        const ext = filename.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext || '')) continue;

        totalImages++;

        const baseName = filename.split('/').pop()?.split('\\').pop()?.replace(/\.[^/.]+$/, '') || '';
        const normalizedBaseName = normalizeStr(baseName);

        if (!normalizedBaseName) continue;

        // Match student by NISN, NIS, or Nama against all available students
        const matchedStudent = allAvailableSiswa.find((sis) => {
          const normNisn = normalizeStr(sis.nisn || '');
          const normNis = normalizeStr(sis.nis || '');
          const normName = normalizeStr(sis.nama || '');

          return (
            (normNisn && normNisn === normalizedBaseName) ||
            (normNis && normNis === normalizedBaseName) ||
            (normName && normName === normalizedBaseName)
          );
        });

        if (matchedStudent) {
          const blob = await zipEntry.async('blob');
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          updatedPhotos[matchedStudent.id] = dataUrl;
          matchCount++;
        }
      }

      setStudentPhotos(updatedPhotos);

      if (matchCount > 0) {
        setZipStatusMessage({
          type: 'success',
          text: `Berhasil mencocokkan ${matchCount} foto siswa dari ${totalImages} file gambar dalam ZIP!`,
        });
      } else {
        setZipStatusMessage({
          type: 'error',
          text: `Ditemukan ${totalImages} file gambar di ZIP, tetapi tidak ada yang cocok dengan NISN atau Nama siswa.`,
        });
      }
    } catch (err) {
      console.error('Gagal memproses file ZIP:', err);
      setZipStatusMessage({
        type: 'error',
        text: 'Gagal membaca file ZIP. Pastikan file berformat .zip yang valid.',
      });
    } finally {
      setIsProcessingZip(false);
      event.target.value = '';
    }
  };

  const handleSinglePhotoUpload = (studentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setStudentPhotos((prev) => ({
        ...prev,
        [studentId]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSinglePhoto = (studentId: string) => {
    setStudentPhotos((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  // Automatically distribute students evenly across the selected number of rooms (jumlahRuangan)
  const studentsWithRooms = useMemo(() => {
    const total = allAvailableSiswa.length;
    if (total === 0) return [];
    const roomsCount = Math.max(1, jumlahRuangan);
    const perRoom = Math.ceil(total / roomsCount);

    return allAvailableSiswa.map((sis, idx) => {
      const roomNum = Math.min(roomsCount, Math.floor(idx / perRoom) + 1);
      const autoRuang = `Ruang ${String(roomNum).padStart(2, '0')}`;
      return {
        ...sis,
        ruang: autoRuang,
      };
    });
  }, [allAvailableSiswa, jumlahRuangan]);

  // Filter students based on selected room filter or show all
  const filteredSiswa = useMemo(() => {
    if (selectedRuangFilter === 'Semua') return studentsWithRooms;
    return studentsWithRooms.filter((s) => s.ruang === selectedRuangFilter);
  }, [studentsWithRooms, selectedRuangFilter]);

  // Automatically filter and distribute pengawas based on selected room
  const activePengawasForDenah = useMemo(() => {
    const list = pengawasList.slice(0, jumlahPengawas);
    if (selectedRuangFilter === 'Semua') return list;

    const matched = list.filter((p, idx) => {
      const assignedRuang = p.ruang || `Ruang ${String((idx % Math.max(1, jumlahRuangan)) + 1).padStart(2, '0')}`;
      return assignedRuang === selectedRuangFilter;
    });

    return matched.length > 0 ? matched : list;
  }, [pengawasList, jumlahPengawas, selectedRuangFilter, jumlahRuangan]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl shadow-2xl w-full max-w-[1580px] lg:w-[96%] max-h-[94vh] flex flex-col overflow-hidden relative my-auto">
        {/* Top Ambient Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400" />

        {/* Modal Header Controls (Screen only) */}
        <div className="no-print p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <FileCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                Berkas Kelengkapan Ujian Sekolah
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer border border-amber-400/25"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Cetak Dokumen</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950/60">
          {/* TOP TAB SELECTION BUTTONS (SCREEN ONLY) */}
          <div className="no-print p-4 sm:p-5 pb-2 border-b border-slate-800/80 shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('kartu')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'kartu'
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>1. Kartu Ujian</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('denah')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'denah'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Grid className="w-4 h-4 shrink-0" />
                <span>2. Denah Tempat Duduk</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('absensi')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'absensi'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span>3. Absensi / Daftar Hadir</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pengawas')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'pengawas'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>4. Kartu Pengawas</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTENT WORKSPACE: CONTROLS & PREVIEW */}
          <div className="flex-1 overflow-y-auto lg:overflow-hidden lg:grid lg:grid-cols-12 gap-6 p-4 sm:p-6 min-h-0">
            {/* LEFT COLUMN: CONTROLS (Scrollable on desktop) */}
            <div className="lg:col-span-5 flex flex-col gap-4 lg:overflow-y-auto max-h-full pr-0 lg:pr-2 pb-6 lg:pb-0 no-print">

          {/* QUICK CONFIGURATION BAR (SCREEN ONLY) */}
          <div className="no-print bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-3 border-b border-slate-800/80">
              <Settings2 className="w-4 h-4" />
              <span>Pengaturan Informasi Ujian & Filter Siswa</span>
            </div>

            {/* General & Dynamic Settings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-400 text-[11px] font-semibold">Nama Ujian</label>
                <input
                  type="text"
                  value={namaUjian}
                  onChange={(e) => setNamaUjian(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-semibold focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 text-[11px] font-semibold">Tahun Ajaran & Semester</label>
                <div className="grid grid-cols-5 gap-1.5">
                  <input
                    type="text"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="col-span-3 w-full bg-slate-950/80 border border-slate-850 rounded-lg px-2.5 py-2 text-white text-center font-semibold focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-colors"
                  />
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="col-span-2 w-full bg-slate-950/80 border border-slate-850 rounded-lg px-2 py-2 text-white font-semibold cursor-pointer focus:border-amber-500 outline-none transition-colors"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 text-[11px] font-semibold">Tempat Penerbitan (Kota)</label>
                <input
                  type="text"
                  value={tempatUjian}
                  onChange={(e) => setTempatUjian(e.target.value)}
                  placeholder="Contoh: Bandung Barat"
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-semibold focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 text-[11px] font-semibold">Tanggal Penerbitan / Ujian</label>
                <input
                  type="text"
                  value={tanggalUjian}
                  onChange={(e) => setTanggalUjian(e.target.value)}
                  placeholder="Contoh: 7 Agustus 2026"
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-semibold focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-400 text-[11px] font-semibold">Jumlah Ruangan</label>
                  <span className="text-[10px] text-slate-500">({allAvailableSiswa.length} Siswa)</span>
                </div>
                <select
                  value={jumlahRuangan}
                  onChange={(e) => {
                    const newCount = Number(e.target.value) || 1;
                    setJumlahRuangan(newCount);
                    if (selectedRuangFilter !== 'Semua') {
                      setSelectedRuangFilter('Semua');
                    }
                  }}
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-bold cursor-pointer focus:border-amber-500 outline-none transition-colors"
                >
                  {Array.from({ length: 10 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Ruangan
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 text-[11px] font-semibold">Filter Tampil Ruangan</label>
                <select
                  value={selectedRuangFilter}
                  onChange={(e) => setSelectedRuangFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-semibold cursor-pointer focus:border-amber-500 outline-none transition-colors"
                >
                  <option value="Semua">Semua Ruangan ({filteredSiswa.length} Siswa)</option>
                  {Array.from({ length: jumlahRuangan }).map((_, rIdx) => {
                    const rName = `Ruang ${String(rIdx + 1).padStart(2, '0')}`;
                    const countInRoom = studentsWithRooms.filter((s) => s.ruang === rName).length;
                    return (
                      <option key={rName} value={rName}>
                        {rName} ({countInRoom} Siswa)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dynamic inputs for Absensi Tab */}
              {activeTab === 'absensi' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-[11px] font-semibold">Mata Pelajaran</label>
                    <input
                      type="text"
                      value={mataPelajaran}
                      onChange={(e) => setMataPelajaran(e.target.value)}
                      placeholder="Masukkan Mata Pelajaran"
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-semibold outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-400 text-[11px] font-semibold">Waktu Ujian</label>
                    <input
                      type="text"
                      value={waktuUjian}
                      onChange={(e) => setWaktuUjian(e.target.value)}
                      placeholder="Masukkan Waktu Ujian"
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-semibold outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Layout styling selector */}
              {(activeTab === 'kartu' || activeTab === 'pengawas') && (
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-amber-400 text-[11px] font-bold">
                    Desain Layout {activeTab === 'kartu' ? 'Kartu Peserta' : 'Kartu Pengawas'}
                  </label>
                  <select
                    value={layoutKartu}
                    onChange={(e) => setLayoutKartu(e.target.value as 'standar' | 'minimalis' | 'modern')}
                    className="w-full bg-slate-950/80 border border-amber-500/30 rounded-lg px-3 py-2 text-white font-bold cursor-pointer focus:border-amber-500 outline-none transition-colors"
                  >
                    <option value="standar">Layout Standar (Kop Dinas & Logo Kiri-Kanan)</option>
                    <option value="minimalis">Layout Minimalis (Modern, Bersih & Hemat Tinta)</option>
                    <option value="modern">Layout Modern (Subtil Gradasi & Desain Premium)</option>
                  </select>
                </div>
              )}
            </div>

            {/* TAB-SPECIFIC CONFIGURATION: Denah & Pengawas */}
            {(activeTab === 'denah' || activeTab === 'pengawas') && (
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                {/* PENGATURAN MEJA & MEJA PENYALURAN */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-amber-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>{activeTab === 'pengawas' ? 'Pengaturan Pengawas' : 'Pengaturan Denah & Pengawas'}</span>
                    </span>
                    {activeTab !== 'pengawas' && (
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 font-extrabold px-2.5 py-0.5 rounded border border-amber-500/20">
                        {jumlahBaris * jumlahKolom} Meja ({jumlahBaris}x{jumlahKolom})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {activeTab !== 'pengawas' && (
                      <>
                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Baris Meja</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={jumlahBaris}
                            onChange={(e) => setJumlahBaris(Number(e.target.value) || 1)}
                            className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-bold text-center outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Kolom Meja</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={jumlahKolom}
                            onChange={(e) => setJumlahKolom(Number(e.target.value) || 1)}
                            className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-bold text-center outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>
                      </>
                    )}

                    {activeTab !== 'pengawas' && (
                      <>
                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Panitia Ujian</label>
                          <input
                            type="text"
                            value={namaPanitia}
                            onChange={(e) => setNamaPanitia(e.target.value)}
                            placeholder="Nama Panitia"
                            className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white text-[11px] outline-none focus:border-amber-400 font-medium transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[11px] mb-1 font-semibold">NIP Panitia</label>
                          <input
                            type="text"
                            value={nipPanitia}
                            onChange={(e) => setNipPanitia(e.target.value)}
                            placeholder="NIP Panitia"
                            className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white text-[11px] outline-none focus:border-amber-400 font-medium transition-colors"
                          />
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-2 pt-1">
                      <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Jumlah Pengawas</label>
                      <select
                        value={jumlahPengawas}
                        onChange={(e) => setJumlahPengawas(Number(e.target.value) || 1)}
                        className="w-full bg-slate-950/80 border border-slate-850 rounded-lg px-3 py-2 text-white font-bold cursor-pointer focus:border-amber-400 outline-none text-xs transition-colors"
                      >
                        <option value={1}>1 Pengawas</option>
                        <option value={2}>2 Pengawas</option>
                        <option value={3}>3 Pengawas</option>
                        <option value={4}>4 Pengawas</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TABLE PENGISIAN DATA PENGAWAS UJIAN */}
                <div className="bg-slate-950/50 p-4 rounded-xl border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <label className="text-amber-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Tabel Pengisian Data Pengawas Ujian</span>
                    </label>
                    <span className="text-[10px] text-amber-200/80 font-mono font-bold bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                      {jumlahPengawas} Orang Pengawas
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-800/80">
                    <table className="w-full text-left text-[11px] text-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-slate-900/60 text-slate-300 font-bold border-b border-slate-800">
                          <th className="p-2.5 w-8 text-center">No</th>
                          <th className="p-2.5">Nama Pengawas Ujian</th>
                          <th className="p-2.5">NIP Pengawas</th>
                          <th className="p-2.5 w-28">Ruang</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: jumlahPengawas }).map((_, idx) => {
                          const defaultRuang = `Ruang ${String((idx % Math.max(1, jumlahRuangan)) + 1).padStart(2, '0')}`;
                          const pItem = pengawasList[idx] || {
                            nama: '',
                            nip: '',
                            ruang: defaultRuang,
                          };
                          const currentRuang = pItem.ruang || defaultRuang;

                          return (
                            <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                              <td className="p-2 text-center font-bold text-amber-400">{idx + 1}</td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={pItem.nama}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPengawasList((prev) => {
                                      const updated = [...prev];
                                      updated[idx] = { ...updated[idx], nama: val, ruang: currentRuang };
                                      return updated;
                                    });
                                  }}
                                  placeholder={`Masukkan Nama Pengawas ${idx + 1}`}
                                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-amber-400 font-medium transition-colors"
                                />
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={pItem.nip}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPengawasList((prev) => {
                                      const updated = [...prev];
                                      updated[idx] = { ...updated[idx], nip: val, ruang: currentRuang };
                                      return updated;
                                    });
                                  }}
                                  placeholder="Masukkan NIP"
                                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-amber-400 font-medium transition-colors"
                                />
                              </td>
                              <td className="p-1.5">
                                <select
                                  value={currentRuang}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPengawasList((prev) => {
                                      const updated = [...prev];
                                      updated[idx] = { ...updated[idx], ruang: val };
                                      return updated;
                                    });
                                  }}
                                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-amber-300 text-[11px] outline-none focus:border-amber-400 font-bold cursor-pointer"
                                >
                                  {Array.from({ length: jumlahRuangan }).map((_, rIdx) => {
                                    const rName = `Ruang ${String(rIdx + 1).padStart(2, '0')}`;
                                    return (
                                      <option key={rName} value={rName}>
                                        {rName}
                                      </option>
                                    );
                                  })}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ZIP PHOTO UPLOAD FOR SUPERVISOR */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          <FileArchive className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Upload Foto Pengawas (.ZIP)</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            Penamaan file gambar di dalam ZIP bisa menggunakan Nama atau NIP Pengawas.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        <label className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-[11px] font-extrabold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-all hover:scale-[1.01] flex-1 sm:flex-initial text-center whitespace-nowrap">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isProcessingPengawasZip ? 'Mengekstrak...' : 'Upload ZIP'}</span>
                          <input
                            type="file"
                            accept=".zip,application/zip,application/x-zip-compressed"
                            onChange={handlePengawasZipUpload}
                            disabled={isProcessingPengawasZip}
                            className="hidden"
                          />
                        </label>

                        {Object.keys(pengawasPhotos).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setPengawasPhotos({})}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer shrink-0"
                            title="Hapus Semua Foto Pengawas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Notification */}
                    {pengawasZipStatusMessage && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-fadeIn ${
                          pengawasZipStatusMessage.type === 'success'
                            ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                        }`}
                      >
                        {pengawasZipStatusMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        )}
                        <span className="flex-1 leading-snug">{pengawasZipStatusMessage.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BULK UPLOAD BAR FOR EXCEL DATA & ZIP PHOTOS (KARTU UJIAN TAB) */}
            {activeTab === 'kartu' && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* EXCEL DATA UPLOAD */}
                  <div className="bg-slate-950/85 p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Data Siswa (Excel)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Format file .xlsx atau .xls</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={handleDownloadExcelTemplate}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer hover:scale-[1.01]"
                        title="Download Template Format Excel Data Siswa"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Template</span>
                      </button>

                      <label className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all hover:scale-[1.01]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isProcessingExcel ? 'Membaca...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleExcelUpload}
                          disabled={isProcessingExcel}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* ZIP PHOTO UPLOAD */}
                  <div className="bg-slate-950/85 p-4 rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                        <FileArchive className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-200">Foto Siswa (.ZIP)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">Sesuai NISN / No Peserta</p>
                      </div>
                      {Object.keys(studentPhotos).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setStudentPhotos({})}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer shrink-0"
                          title="Hapus Semua Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="pt-1.5">
                      <label className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-all w-full text-center hover:scale-[1.01]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isProcessingZip ? 'Mengekstrak...' : 'Upload ZIP'}</span>
                        <input
                          type="file"
                          accept=".zip,application/zip,application/x-zip-compressed"
                          onChange={handleZipUpload}
                          disabled={isProcessingZip}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Status Notifications */}
                {excelStatusMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-fadeIn ${
                      excelStatusMessage.type === 'success'
                        ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {excelStatusMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span className="flex-1 leading-snug">{excelStatusMessage.text}</span>
                  </div>
                )}

                {zipStatusMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-fadeIn ${
                      zipStatusMessage.type === 'success'
                        ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                        : zipStatusMessage.type === 'error'
                        ? 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
                        : 'bg-indigo-950/80 border border-indigo-500/40 text-indigo-300'
                    }`}
                  >
                    {zipStatusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
                    {zipStatusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                    <span className="flex-1 leading-snug">{zipStatusMessage.text}</span>
                  </div>
                )}
              </div>
            )}
          </div>
            </div>

            {/* RIGHT COLUMN: REAL-TIME PREVIEW (Scrollable on desktop) */}
            <div className="lg:col-span-7 flex flex-col lg:overflow-y-auto max-h-full bg-slate-900/30 rounded-2xl border border-slate-800/50 p-4 relative min-h-[500px] lg:min-h-0 pb-12 lg:pb-6">
              {/* PREVIEW HEADER PANEL (SCREEN ONLY) */}
              <div className="no-print flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Pratinjau Real-Time ({activeTab === 'kartu' ? 'Kartu Peserta' : activeTab === 'denah' ? 'Denah Tempat Duduk' : activeTab === 'absensi' ? 'Daftar Hadir' : 'Kartu Pengawas'})
                  </span>
                </div>
                {(activeTab === 'kartu' || activeTab === 'pengawas') && (
                  <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-full">
                    <span className="text-[10px] text-slate-400 font-medium">Layout:</span>
                    <span className="text-[10px] font-black uppercase text-amber-400">
                      {layoutKartu}
                    </span>
                  </div>
                )}
              </div>
              {/* PRINTABLE PAPER DISPLAY CONTAINER */}
              <div className="flex justify-center w-full">
                <div
                  id="printable-berkas-ujian"
                  className="bg-white text-black font-times w-full max-w-[210mm] min-h-[297mm] p-[8mm] sm:p-[12mm] shadow-2xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:p-0 print:m-0 print:w-full leading-snug text-[11px]"
                >

              {/* TAB 1: KARTU PESERTA UJIAN */}
              {activeTab === 'kartu' && (
                <div className="space-y-4">
                  <div className="no-print text-center mb-2 pb-2 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      Tampilan Kartu Peserta Ujian ({filteredSiswa.length} Siswa)
                    </span>
                  </div>

                  {filteredSiswa.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 italic">
                      Belum ada data siswa untuk kelas yang dipilih. Silakan isi Master Data Siswa terlebih dahulu.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredSiswa.map((sis, idx) => {
                        const displayNoPeserta =
                          sis.noPeserta ||
                          `01-001-${(idx + 1).toString().padStart(3, '0')}-8`;
                        const displayRuang = sis.ruang || 'Ruang 01';
                        const displayTtl =
                          sis.tempatLahir && sis.tanggalLahir && sis.tempatLahir !== '-' && sis.tanggalLahir !== '-'
                            ? `${sis.tempatLahir}, ${sis.tanggalLahir}`
                            : sis.tempatLahir && sis.tempatLahir !== '-'
                            ? sis.tempatLahir
                            : sis.tanggalLahir && sis.tanggalLahir !== '-'
                            ? sis.tanggalLahir
                            : '-';

                        const innerCard = (
                          <>
                            {layoutKartu === 'minimalis' || layoutKartu === 'modern' ? (
                              <>
                                {/* MINIMALIST HEADER */}
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2 relative z-10 gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                                      {profile.logoRightUrl ? (
                                        <img src={profile.logoRightUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                      ) : profile.logoLeftUrl ? (
                                        <img src={profile.logoLeftUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                      ) : (
                                        <svg className="w-7 h-7 text-indigo-700" viewBox="0 0 100 100" fill="none">
                                          <circle cx="50" cy="50" r="46" stroke="#1E3A8A" strokeWidth="2.5" fill="#EFF6FF" />
                                          <polygon points="50,12 62,35 88,35 67,52 75,76 50,60 25,76 33,52 12,35 38,35" fill="#1D4ED8" />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="text-left leading-normal">
                                      <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-tight leading-none mb-0.5">
                                        {profile.namaSekolah || 'SD NEGERI 2 NYOMPLONG'}
                                      </h4>
                                      <p className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
                                        {namaUjian}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`text-[7.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                                    layoutKartu === 'modern'
                                      ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-none'
                                      : 'text-indigo-700 bg-indigo-50 border border-indigo-100'
                                  }`}>
                                    KARTU PESERTA
                                  </span>
                                </div>

                                {/* MINIMALIST DETAILS & PHOTO */}
                                <div className="grid grid-cols-12 gap-2 text-[9.5px] sm:text-[10px] items-start relative z-10 py-1 flex-1">
                                  <div className="col-span-8 space-y-1.5">
                                    <div className="border-b border-slate-100 pb-1">
                                      <span className="text-[7.5px] uppercase tracking-wider text-slate-400 block leading-none mb-1">Nomor Peserta</span>
                                      <span className="font-mono font-black text-[11px] text-slate-950 tracking-wide block leading-none">{displayNoPeserta}</span>
                                    </div>
                                    <div className="border-b border-slate-100 pb-1">
                                      <span className="text-[7.5px] uppercase tracking-wider text-slate-400 block leading-none mb-1">Nama Lengkap</span>
                                      <span className="font-bold text-[10.5px] text-slate-950 uppercase tracking-tight block leading-none truncate">{sis.nama}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                      <div>
                                        <span className="text-[7px] uppercase tracking-wider text-slate-400 block leading-none mb-1">NISN / NIS</span>
                                        <span className="font-semibold text-slate-800 block leading-none text-[8.5px] truncate">{sis.nisn || '-'} / {sis.nis || '-'}</span>
                                      </div>
                                      <div>
                                        <span className="text-[7px] uppercase tracking-wider text-slate-400 block leading-none mb-1">Ruang</span>
                                        <span className={`font-bold block leading-none text-[8.5px] truncate ${
                                          layoutKartu === 'modern' ? 'text-purple-600 font-extrabold' : 'text-indigo-700'
                                        }`}>{displayRuang}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-[7px] uppercase tracking-wider text-slate-400 block leading-none mb-0.5">TTL</span>
                                      <span className="font-semibold text-slate-700 block leading-none text-[8.5px] truncate">{displayTtl}</span>
                                    </div>
                                  </div>

                                  {/* MINIMALIST PHOTO BOX */}
                                  <div className="col-span-4 flex flex-col items-center justify-start pt-1">
                                    {studentPhotos[sis.id] ? (
                                      <div className="relative group/photo w-[54px] h-[72px] sm:w-[58px] sm:h-[76px] border border-slate-300 overflow-hidden bg-slate-50 rounded-md flex items-center justify-center shrink-0 shadow-xs">
                                        <img src={studentPhotos[sis.id]} alt={sis.nama} className="w-full h-full object-cover" />
                                        <div className="no-print absolute inset-0 bg-slate-950/80 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                          <label className="text-[8px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded cursor-pointer hover:bg-amber-300">
                                            Ganti
                                            <input type="file" accept="image/*" onChange={(e) => handleSinglePhotoUpload(sis.id, e)} className="hidden" />
                                          </label>
                                          <button type="button" onClick={() => handleRemoveSinglePhoto(sis.id)} className="text-[8px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded hover:bg-rose-500">
                                            Hapus
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <label className="w-[54px] h-[72px] sm:w-[58px] sm:h-[76px] border border-dashed border-slate-300 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-400 flex flex-col items-center justify-center text-[8.5px] text-slate-400 hover:text-indigo-700 text-center rounded-md cursor-pointer transition-all relative group/no-photo shrink-0">
                                        <span className="font-bold text-[8px] uppercase tracking-wide">FOTO</span>
                                        <span className="font-black text-[9px] text-slate-500 mt-0.5">2 x 3</span>
                                        <span className="no-print text-[7px] text-indigo-600 font-bold mt-1.5 bg-white px-1.5 py-0.5 rounded border border-indigo-100 shadow-3xs hover:bg-indigo-50">
                                          + Foto
                                        </span>
                                        <input type="file" accept="image/*" onChange={(e) => handleSinglePhotoUpload(sis.id, e)} className="hidden" />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* MINIMALIST FOOTER */}
                                <div className="border-t border-slate-100 pt-2 flex items-end justify-between text-[8px] text-slate-500 relative z-10 leading-snug">
                                  <div className="italic text-[7.5px] text-slate-400">
                                    *Wajib dibawa & selalu dijaga.
                                  </div>
                                  <div className="text-center min-w-[120px]">
                                    <p className="text-[7.5px] text-slate-500 mb-0.5">
                                      {tempatUjian || 'Bandung'}, {tanggalUjian}
                                    </p>
                                    <p className="font-medium text-slate-600 leading-none mb-3">Kepala Sekolah,</p>
                                    <p className="font-bold underline text-slate-900 uppercase leading-none">
                                      {profile.namaKepsek || '...........................................'}
                                    </p>
                                    <p className="text-[7px] text-slate-400 mt-1 leading-none">NIP. {profile.nipKepsek || '-'}</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Card Header dengan Logo Dinas (Kiri) dan Logo Sekolah (Kanan) */}
                                <div className="flex items-center justify-between border-b-2 border-black pb-1.5 gap-1.5 relative z-10">
                                  {/* Logo Dinas (Kiri) */}
                                  <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                                    {profile.logoLeftUrl ? (
                                      <img
                                        src={profile.logoLeftUrl}
                                        alt="Logo Dinas"
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    ) : (
                                      <svg className="w-8 h-8 text-indigo-900" viewBox="0 0 100 100" fill="none">
                                        <circle cx="50" cy="50" r="46" stroke="#1E3A8A" strokeWidth="2.5" fill="#EFF6FF" />
                                        <polygon points="50,12 62,35 88,35 67,52 75,76 50,60 25,76 33,52 12,35 38,35" fill="#1D4ED8" />
                                      </svg>
                                    )}
                                  </div>

                                  {/* Text Header (Tengah) */}
                                  <div className="flex-1 text-center leading-tight">
                                    <p className="text-[8.5px] font-bold uppercase tracking-tight text-gray-900">
                                      {profile.pemerintah || 'PEMERINTAH KABUPATEN BANDUNG BARAT'}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-wide text-black leading-snug">
                                      {profile.namaSekolah || 'SD NEGERI 2 NYOMPLONG'}
                                    </p>
                                    <p className="text-[9px] font-extrabold uppercase text-amber-950 bg-amber-50 inline-block px-1.5 py-0.5 mt-0.5 rounded border border-amber-200">
                                      KARTU PESERTA {namaUjian}
                                    </p>
                                  </div>

                                  {/* Logo Sekolah (Kanan) */}
                                  <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                                    {profile.logoRightUrl ? (
                                      <img
                                        src={profile.logoRightUrl}
                                        alt="Logo Sekolah"
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    ) : (
                                      <svg className="w-8 h-8 text-amber-600" viewBox="0 0 100 100" fill="none">
                                        <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
                                        <path d="M50 20 L75 35 L50 50 L25 35 Z" fill="#D97706" />
                                      </svg>
                                    )}
                                  </div>
                                </div>

                                {/* Card Student Details - Elongated layout, single line values without text wrapping */}
                                <div className="grid grid-cols-12 gap-1.5 text-[9.5px] sm:text-[10px] items-center relative z-10 py-1">
                                  <div className="col-span-9">
                                    <table className="w-full text-left leading-snug border-collapse">
                                      <tbody>
                                        <tr className="align-baseline">
                                          <td className="w-[102px] shrink-0 font-semibold text-gray-700 py-0.5 whitespace-nowrap">No. Peserta</td>
                                          <td className="w-2 text-center font-bold text-gray-900 py-0.5">:</td>
                                          <td className="font-black text-black py-0.5 pl-1 tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">{displayNoPeserta}</td>
                                        </tr>
                                        <tr className="align-baseline">
                                          <td className="w-[102px] shrink-0 font-semibold text-gray-700 py-0.5 whitespace-nowrap">Nama Siswa</td>
                                          <td className="w-2 text-center font-bold text-gray-900 py-0.5">:</td>
                                          <td className="font-black text-black py-0.5 pl-1 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">{sis.nama}</td>
                                        </tr>
                                        <tr className="align-baseline">
                                          <td className="w-[102px] shrink-0 font-semibold text-gray-700 py-0.5 whitespace-nowrap">Tempat, Tanggal Lahir</td>
                                          <td className="w-2 text-center font-bold text-gray-900 py-0.5">:</td>
                                          <td className="font-semibold text-gray-900 py-0.5 pl-1 whitespace-nowrap overflow-hidden text-ellipsis">{displayTtl}</td>
                                        </tr>
                                        <tr className="align-baseline">
                                          <td className="w-[102px] shrink-0 font-semibold text-gray-700 py-0.5 whitespace-nowrap">NISN / NIS</td>
                                          <td className="w-2 text-center font-bold text-gray-900 py-0.5">:</td>
                                          <td className="font-bold text-gray-900 py-0.5 pl-1 whitespace-nowrap overflow-hidden text-ellipsis">{sis.nisn || '-'} / {sis.nis || '-'}</td>
                                        </tr>
                                        <tr className="align-baseline">
                                          <td className="w-[102px] shrink-0 font-semibold text-gray-700 py-0.5 whitespace-nowrap">Ruang</td>
                                          <td className="w-2 text-center font-bold text-gray-900 py-0.5">:</td>
                                          <td className="font-extrabold text-amber-950 py-0.5 pl-1 whitespace-nowrap overflow-hidden text-ellipsis">{displayRuang}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Foto Box (2 x 3) */}
                                  <div className="col-span-3 flex items-center justify-end pr-0.5">
                                    {studentPhotos[sis.id] ? (
                                      <div className="relative group/photo w-[52px] h-[68px] sm:w-14 sm:h-18 border-2 border-black overflow-hidden bg-gray-100 rounded-xs flex items-center justify-center shadow-xs shrink-0">
                                        <img
                                          src={studentPhotos[sis.id]}
                                          alt={sis.nama}
                                          className="w-full h-full object-cover"
                                        />
                                        {/* Screen-only overlay controls to change or remove photo */}
                                        <div className="no-print absolute inset-0 bg-slate-950/80 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                          <label className="text-[8px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded cursor-pointer hover:bg-amber-300">
                                            Ganti
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleSinglePhotoUpload(sis.id, e)}
                                              className="hidden"
                                            />
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveSinglePhoto(sis.id)}
                                            className="text-[8px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer hover:bg-rose-500"
                                          >
                                            Hapus
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <label className="w-[52px] h-[68px] sm:w-14 sm:h-18 border-2 border-dashed border-gray-400 bg-gray-50 hover:bg-amber-50 hover:border-amber-400 flex flex-col items-center justify-center text-[9px] text-gray-500 hover:text-amber-800 text-center p-0.5 rounded cursor-pointer transition-colors relative group/no-photo shrink-0">
                                        <span className="font-bold text-[8.5px]">FOTO</span>
                                        <span className="font-black text-[9px] text-gray-700">2 x 3</span>
                                        <span className="no-print text-[7.5px] text-indigo-600 font-bold mt-1 bg-indigo-50 group-hover/no-photo:bg-amber-100 px-1 py-0.5 rounded border border-indigo-200 group-hover/no-photo:border-amber-300">
                                          + Foto
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleSinglePhotoUpload(sis.id, e)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* Card Footer TTD */}
                                <div className="border-t border-dashed border-gray-300 pt-1 flex items-end justify-end text-[9px] text-gray-800 relative z-10">
                                  <div className="text-center">
                                    <p className="text-[8px] text-gray-700 leading-tight">
                                      {tempatUjian || 'Bandung'}, {tanggalUjian}
                                    </p>
                                    <p>Kepala Sekolah,</p>
                                    <div className="h-4"></div>
                                    <p className="font-bold underline">
                                      {profile.namaKepsek || '...........................................'}
                                    </p>
                                    <p>NIP. {profile.nipKepsek || '-'}</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        );

                        return (
                          <div
                            key={sis.id || idx}
                            className={
                              layoutKartu === 'modern'
                                ? "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-xl flex flex-col justify-between relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 print:bg-none print:border-2 print:border-indigo-400"
                                : layoutKartu === 'minimalis'
                                ? "border border-slate-300 p-4 bg-white rounded-lg flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs hover:shadow-xs print:border-slate-400"
                                : "border-2 border-black p-3 bg-white rounded-md flex flex-col justify-between space-y-2 relative overflow-hidden shadow-xs"
                            }
                          >
                            {layoutKartu === 'modern' ? (
                              <div className="bg-white p-3.5 rounded-[10px] flex flex-col justify-between h-full w-full space-y-3 relative overflow-hidden flex-1">
                                {innerCard}
                              </div>
                            ) : (
                              innerCard
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DENAH TEMPAT DUDUK */}
              {activeTab === 'denah' && (
                <div className="relative p-4 bg-white rounded-lg border border-gray-200 overflow-hidden space-y-4 min-h-[600px]">

                  <div className="relative z-10 space-y-4">
                    <KopSuratHeader profile={profile} />
                    <hr className="border-t-2 border-black my-1" />

                    <div className="text-center my-3">
                      <h1 className="text-sm sm:text-base font-black uppercase text-black">
                        DENAH TEMPAT DUDUK PESERTA UJIAN
                      </h1>
                      <p className="text-[11px] font-bold uppercase text-gray-800 mt-0.5">
                        {namaUjian} TAHUN AJARAN {tahunAjaran}
                      </p>
                    </div>

                    {/* Header Detail Rapi Aligned dengan Format Nama Sekolah SD Negeri Margaasih */}
                    <div className="border-b-2 border-black pb-2 text-[11px] font-semibold">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr className="align-baseline">
                              <td className="w-28 font-bold text-gray-800 py-0.5 whitespace-nowrap">SEKOLAH</td>
                              <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                              <td className="font-bold text-black py-0.5 pl-1">
                                {displayNamaSekolah}
                              </td>
                            </tr>
                            <tr className="align-baseline">
                              <td className="w-28 font-bold text-gray-800 py-0.5 whitespace-nowrap">RUANG UJIAN</td>
                              <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                              <td className="font-bold text-black py-0.5 pl-1">
                                {selectedRuangFilter === 'Semua'
                                  ? `Semua Ruangan (${jumlahRuangan} Ruangan)`
                                  : selectedRuangFilter}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <table className="w-full border-collapse">
                          <tbody>
                            <tr className="align-baseline">
                              <td className="w-28 font-bold text-gray-800 py-0.5 whitespace-nowrap">KELAS</td>
                              <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                              <td className="font-bold text-black py-0.5 pl-1">
                                {filteredSiswa[0]?.kelas || 'Kelas 6'}
                              </td>
                            </tr>
                            <tr className="align-baseline">
                              <td className="w-28 font-bold text-gray-800 py-0.5 whitespace-nowrap">TOTAL PESERTA</td>
                              <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                              <td className="font-bold text-black py-0.5 pl-1">{filteredSiswa.length} Siswa</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* MEJA PENGAWAS & PAPAN TULIS */}
                    <div className="my-4 space-y-2">
                      <div className="w-full bg-gray-200 border-2 border-black p-1.5 text-center font-black text-xs uppercase tracking-widest rounded shadow-xs">
                        [ PAPAN TULIS DEPAN KELAS ]
                      </div>

                      {/* Susunan Meja Pengawas Ujian Sesuai Pilihan */}
                      <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
                        {activePengawasForDenah.map((pItem, pIdx) => {
                          const pRuang = pItem.ruang || `Ruang ${String((pIdx % Math.max(1, jumlahRuangan)) + 1).padStart(2, '0')}`;
                          return (
                            <div
                              key={pIdx}
                              className="bg-amber-100/90 border-2 border-amber-900 text-amber-950 font-black text-[11px] py-1.5 px-3 rounded text-center shadow-xs flex-1 max-w-[220px] min-w-[130px]"
                            >
                              <span className="text-[9px] uppercase tracking-wider text-amber-800 block font-bold">
                                MEJA PENGAWAS {activePengawasForDenah.length > 1 ? pIdx + 1 : ''}
                              </span>
                              <span className="text-[10px] font-extrabold text-black line-clamp-1 block">
                                {pItem.nama || `Pengawas ${pIdx + 1}`}
                              </span>
                              {pItem.nip && (
                                <span className="text-[8.5px] font-semibold text-gray-700 block">
                                  NIP. {pItem.nip}
                                </span>
                              )}
                              <span className="text-[8px] font-bold text-amber-900/80 block mt-0.5">
                                {pRuang}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* GRID TEMPAT DUDUK DENGAN FOTO SISWA (PATTERN SNAKE 1-2-3-4-5...) */}
                    <div
                      className="grid gap-2.5 my-6"
                      style={{
                        gridTemplateColumns: `repeat(${jumlahKolom}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: jumlahBaris }).map((_, r) => {
                        const isEvenRow = r % 2 === 0;
                        return Array.from({ length: jumlahKolom }).map((_, c) => {
                          const nomorMeja = isEvenRow
                            ? r * jumlahKolom + c + 1
                            : (r + 1) * jumlahKolom - c;

                          const sis = filteredSiswa[nomorMeja - 1];
                          const photoSrc = sis
                            ? (sis.nisn && studentPhotos[sis.nisn]) ||
                              (sis.nama && studentPhotos[sis.nama]) ||
                              (sis as any).fotoUrl ||
                              (sis as any).foto
                            : null;

                          return (
                            <div
                              key={`seat-${r}-${c}`}
                              className={`border-2 p-1.5 rounded flex flex-col justify-between items-center text-center min-h-[105px] relative ${
                                sis ? 'border-black bg-white shadow-2xs' : 'border-dashed border-gray-300 bg-gray-50/50'
                              }`}
                            >
                              <div className="w-full text-[9.5px] font-extrabold text-gray-700 uppercase border-b pb-0.5 border-gray-200 flex items-center justify-between px-1">
                                <span>MEJA</span>
                                <span className="font-black text-black bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded text-[10px]">
                                  {nomorMeja}
                                </span>
                              </div>

                              {sis ? (
                                <div className="my-1.5 flex flex-col items-center justify-center gap-1.5 px-0.5 w-full">
                                  {photoSrc ? (
                                    <img
                                      src={photoSrc}
                                      alt={sis.nama}
                                      className="w-8 h-10 object-cover rounded border border-gray-400 shadow-2xs shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-10 border border-dashed border-gray-300 rounded bg-gray-50 flex flex-col items-center justify-center text-[7.5px] text-gray-400 font-bold shrink-0">
                                      <span>FOTO</span>
                                      <span>2x3</span>
                                    </div>
                                  )}
                                  <div className="text-center w-full px-0.5">
                                    <p className="font-black text-[10px] uppercase text-black leading-tight line-clamp-2 text-center" title={sis.nama}>
                                      {sis.nama}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 italic my-auto">KOSONG</p>
                              )}
                            </div>
                          );
                        });
                      })}
                    </div>

                    {/* TTD KEPALA SEKOLAH DAN PANITIA UJIAN */}
                    <div className="grid grid-cols-2 gap-6 pt-6 text-[11px] text-center items-start">
                      <div>
                        <p>Mengetahui,</p>
                        <p className="font-bold">Kepala Sekolah</p>
                        <div className="h-14"></div>
                        <p className="font-bold underline">
                          {profile.namaKepsek || '...........................................'}
                        </p>
                        <p>NIP. {profile.nipKepsek || '-'}</p>
                      </div>

                      <div>
                        <p>{tempatUjian || 'Bandung'}, {tanggalUjian}</p>
                        <p className="font-bold mb-1">Panitia Ujian</p>
                        <div className="h-14"></div>
                        <p className="font-bold underline">{namaPanitia || 'Panitia Ujian'}</p>
                        <p className="font-semibold text-gray-800">
                          NIP. {nipPanitia || '...........................................'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DAFTAR HADIR ABSENSI UJIAN */}
              {activeTab === 'absensi' && (
                <div className="space-y-3">
                  <KopSuratHeader profile={profile} />
                  <hr className="border-t-2 border-black my-1" />

                  <div className="text-center my-2">
                    <h1 className="text-sm sm:text-base font-black uppercase text-black">
                      DAFTAR HADIR PESERTA UJIAN
                    </h1>
                    <p className="text-[11px] font-bold uppercase text-gray-800 mt-0.5">
                      {namaUjian} TAHUN AJARAN {tahunAjaran}
                    </p>
                  </div>

                  {/* Header Info Rapi Teratur dengan Titik Dua Aligned */}
                  <div className="border-y-2 border-black py-1.5 my-2 text-[11px] font-semibold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr className="align-baseline">
                            <td className="w-32 font-bold text-gray-800 py-0.5 whitespace-nowrap">SEKOLAH</td>
                            <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                            <td className="font-bold text-black py-0.5 pl-1">{displayNamaSekolah}</td>
                          </tr>
                          <tr className="align-baseline">
                            <td className="w-32 font-bold text-gray-800 py-0.5 whitespace-nowrap">MATA PELAJARAN</td>
                            <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                            <td className="font-bold text-black py-0.5 pl-1">{mataPelajaran}</td>
                          </tr>
                          <tr className="align-baseline">
                            <td className="w-32 font-bold text-gray-800 py-0.5 whitespace-nowrap">RUANG UJIAN</td>
                            <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                            <td className="font-bold text-black py-0.5 pl-1">
                              {selectedRuangFilter === 'Semua'
                                ? `Semua Ruangan (${jumlahRuangan} Ruangan)`
                                : selectedRuangFilter}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table className="w-full border-collapse">
                        <tbody>
                          <tr className="align-baseline">
                            <td className="w-32 font-bold text-gray-800 py-0.5 whitespace-nowrap">KELAS</td>
                            <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                            <td className="font-bold text-black py-0.5 pl-1">
                              {filteredSiswa[0]?.kelas || 'Kelas 6'}
                            </td>
                          </tr>
                          <tr className="align-baseline">
                            <td className="w-32 font-bold text-gray-800 py-0.5 whitespace-nowrap">HARI, TANGGAL</td>
                            <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                            <td className="font-bold text-black py-0.5 pl-1">{tanggalUjian}</td>
                          </tr>
                          <tr className="align-baseline">
                            <td className="w-32 font-bold text-gray-800 py-0.5 whitespace-nowrap">WAKTU</td>
                            <td className="w-3 text-center font-bold text-gray-900 py-0.5">:</td>
                            <td className="font-bold text-black py-0.5 pl-1">{waktuUjian}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* TABLE ABSENSI */}
                  <table className="w-full border-collapse border border-black text-[10.5px]">
                    <thead>
                      <tr className="bg-gray-100 text-center font-bold">
                        <th className="border border-black p-1.5 w-8">NO</th>
                        <th className="border border-black p-1.5 w-24">NO. PESERTA</th>
                        <th className="border border-black p-1.5 w-24">NISN</th>
                        <th className="border border-black p-1.5">NAMA SISWA</th>
                        <th className="border border-black p-1.5 w-16">L/P</th>
                        <th className="border border-black p-1.5 w-36" colSpan={2}>
                          TANDA TANGAN
                        </th>
                        <th className="border border-black p-1.5 w-20">KET</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSiswa.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-6 text-gray-400 italic">
                            Belum ada data siswa.
                          </td>
                        </tr>
                      ) : (
                        filteredSiswa.map((sis, idx) => {
                          const noPeserta =
                            sis.noPeserta ||
                            `01-001-${(idx + 1).toString().padStart(3, '0')}-8`;
                          const isOdd = (idx + 1) % 2 !== 0;
                          return (
                            <tr key={sis.id || idx} className="border-b border-black">
                              <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                              <td className="border border-black p-1.5 text-center font-mono text-[9.5px]">
                                {noPeserta}
                              </td>
                              <td className="border border-black p-1.5 text-center font-mono text-[9.5px]">
                                {sis.nisn || '-'}
                              </td>
                              <td className="border border-black p-1.5 font-bold uppercase">{sis.nama}</td>
                              <td className="border border-black p-1.5 text-center font-bold">
                                {sis.jenisKelamin || '-'}
                              </td>
                              <td className="border border-black p-1.5 w-18 text-[9px] align-top">
                                {isOdd ? `${idx + 1}. ................` : ''}
                              </td>
                              <td className="border border-black p-1.5 w-18 text-[9px] align-top">
                                {!isOdd ? `${idx + 1}. ................` : ''}
                              </td>
                              <td className="border border-black p-1.5 text-center text-[9.5px]">
                                Hadir / ........
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* SUMMARY & SIGNATURES */}
                  <div className="grid grid-cols-2 gap-4 pt-4 text-[10.5px] items-start">
                    <div className="border border-black p-2 space-y-1">
                      <p className="font-bold underline">REKAPITULASI KEHADIRAN:</p>
                      <p>1. Jumlah Peserta Seharusnya : {filteredSiswa.length} Orang</p>
                      <p>2. Jumlah Peserta Hadir &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ........ Orang</p>
                      <p>3. Jumlah Tidak Hadir &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ........ Orang</p>
                    </div>

                    <div className="pt-1">
                      {activePengawasForDenah.length === 1 ? (
                        <div className="text-center">
                          <p className="font-bold">Pengawas Ujian,</p>
                          <div className="h-12"></div>
                          <p className="font-bold underline">{activePengawasForDenah[0]?.nama || '...........................................'}</p>
                          <p>NIP. {activePengawasForDenah[0]?.nip || '...........................................'}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 text-center items-start">
                          {activePengawasForDenah.map((p, pIdx) => (
                            <div key={pIdx} className="space-y-0.5">
                              <p className="font-bold">Pengawas Ujian {pIdx + 1},</p>
                              <div className="h-10"></div>
                              <p className="font-bold underline text-[10px]">{p.nama || '...........................................'}</p>
                              <p className="text-[9.5px]">NIP. {p.nip || '........................'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: KARTU PENGAWAS UJIAN */}
              {activeTab === 'pengawas' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="no-print text-center mb-2 pb-2 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-500 uppercase">
                      Tampilan Kartu Pengawas Ujian ({jumlahPengawas} Pengawas)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: jumlahPengawas }).map((_, idx) => {
                      const pItem = pengawasList[idx] || {
                        nama: '',
                        nip: '',
                        ruang: `Ruang ${String((idx % Math.max(1, jumlahRuangan)) + 1).padStart(2, '0')}`,
                      };
                      const pRuang = pItem.ruang || `Ruang ${String((idx % Math.max(1, jumlahRuangan)) + 1).padStart(2, '0')}`;

                      const supervisorCardInner = (
                        <>
                          {layoutKartu === 'minimalis' || layoutKartu === 'modern' ? (
                            <>
                              {/* MINIMALIST HEADER */}
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2 relative z-10 gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                                    {profile.logoRightUrl ? (
                                      <img src={profile.logoRightUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                    ) : profile.logoLeftUrl ? (
                                      <img src={profile.logoLeftUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                      <svg className="w-7 h-7 text-indigo-700" viewBox="0 0 100 100" fill="none">
                                        <circle cx="50" cy="50" r="46" stroke="#1E3A8A" strokeWidth="2.5" fill="#EFF6FF" />
                                        <polygon points="50,12 62,35 88,35 67,52 75,76 50,60 25,76 33,52 12,35 38,35" fill="#1D4ED8" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="text-left leading-normal">
                                    <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-tight leading-none mb-0.5">
                                      {profile.namaSekolah || 'SD NEGERI 2 NYOMPLONG'}
                                    </h4>
                                    <p className="text-[7.5px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
                                      {profile.pemerintah || 'Pemerintah Dinas Pendidikan'}
                                    </p>
                                  </div>
                                </div>
                                <span className={`text-[7.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                                  layoutKartu === 'modern'
                                    ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-none'
                                    : 'text-indigo-700 bg-indigo-50 border border-indigo-100'
                                }`}>
                                  PENGAWAS
                                </span>
                              </div>

                              {/* MINIMALIST DETAILS */}
                              <div className="grid grid-cols-12 gap-1.5 text-[10px] sm:text-[11px] items-center relative z-10 py-1 flex-1">
                                <div className="col-span-9 space-y-2">
                                  <div>
                                    <span className="text-[7.5px] uppercase tracking-wider text-slate-400 block leading-none mb-0.5">Nama Pengawas</span>
                                    <span className="font-bold text-[11px] text-slate-900 uppercase tracking-tight block leading-none truncate">
                                      {pItem.nama || '...........................................'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-[7px] uppercase tracking-wider text-slate-400 block leading-none mb-0.5">NIP</span>
                                      <span className="font-mono font-semibold text-[9px] text-slate-800 block leading-none truncate">
                                        {pItem.nip || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[7px] uppercase tracking-wider text-slate-400 block leading-none mb-0.5">Tugas Ruang</span>
                                      <span className={`font-extrabold block leading-none text-[9.5px] truncate ${
                                        layoutKartu === 'modern' ? 'text-purple-600' : 'text-indigo-700'
                                      }`}>
                                        {pRuang}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-[7px] uppercase tracking-wider text-slate-400 block leading-none mb-0.5">Unit Kerja</span>
                                    <span className="font-medium text-[9px] text-slate-700 block leading-none truncate">
                                      {displayNamaSekolah}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[7px] uppercase tracking-wider text-slate-400 block leading-none mb-0.5">Ujian / TA</span>
                                    <span className="font-bold text-slate-800 block leading-none text-[8px] whitespace-nowrap overflow-visible">
                                      <span style={{ display: 'inline-block', transform: 'scaleX(1.05)', transformOrigin: 'left', letterSpacing: '0.02em' }}>
                                        {namaUjian} ({tahunAjaran})
                                      </span>
                                    </span>
                                  </div>
                                </div>

                                {/* Photo Box */}
                                <div className="col-span-3 flex items-center justify-end pr-0.5">
                                  {getPengawasPhoto(pItem.nama, pItem.nip) ? (
                                    <div className="w-[52px] h-[72px] border border-slate-300 overflow-hidden bg-slate-50 rounded-md flex items-center justify-center shrink-0 shadow-3xs">
                                      <img src={getPengawasPhoto(pItem.nama, pItem.nip)!} alt="Foto Pengawas" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-[52px] h-[72px] border border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center text-[7.5px] text-slate-400 font-bold shrink-0 rounded-md leading-none shadow-3xs">
                                      <span>FOTO</span>
                                      <span className="my-0.5">PENGAWAS</span>
                                      <span className="font-black text-[8px] text-slate-500">3 x 4</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* MINIMALIST FOOTER */}
                              <div className="border-t border-slate-100 pt-2 flex items-end justify-between text-[8px] text-slate-500 relative z-10 leading-snug">
                                <div className="italic text-[7.5px] text-slate-400">
                                  *Harap selalu dikenakan.
                                </div>
                                <div className="text-center min-w-[130px]">
                                  <p className="text-[7.5px] text-slate-500 mb-0.5">
                                    {tempatUjian || 'Bandung'}, {tanggalUjian || '.....................'}
                                  </p>
                                  <p className="font-medium text-slate-600 leading-none mb-2">Kepala Sekolah,</p>
                                  <p className="font-bold underline text-slate-900 uppercase leading-none">
                                    {profile.namaKepsek || '...........................................'}
                                  </p>
                                  <p className="text-[7px] text-slate-400 mt-1 leading-none">NIP. {profile.nipKepsek || '-'}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Header */}
                              <div className="flex items-center justify-between border-b-2 border-black pb-1.5 gap-1.5 relative z-10">
                                {/* Logo Dinas (Kiri) */}
                                <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                                  {profile.logoLeftUrl ? (
                                    <img
                                      src={profile.logoLeftUrl}
                                      alt="Logo Dinas"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <svg className="w-8 h-8 text-indigo-900" viewBox="0 0 100 100" fill="none">
                                      <circle cx="50" cy="50" r="46" stroke="#1E3A8A" strokeWidth="2.5" fill="#EFF6FF" />
                                      <polygon points="50,12 62,35 88,35 67,52 75,76 50,60 25,76 33,52 12,35 38,35" fill="#1D4ED8" />
                                    </svg>
                                  )}
                                </div>

                                {/* Text Header */}
                                <div className="flex-1 text-center leading-tight">
                                  <p className="text-[8.5px] font-bold uppercase tracking-tight text-gray-900">
                                    {profile.pemerintah || 'PEMERINTAH KABUPATEN BANDUNG BARAT'}
                                  </p>
                                  <p className="text-[10px] font-black uppercase tracking-wide text-black leading-snug">
                                    {profile.namaSekolah || 'SD NEGERI 2 NYOMPLONG'}
                                  </p>
                                  <p className="text-[9px] font-extrabold uppercase text-indigo-950 bg-indigo-50 inline-block px-1.5 py-0.5 mt-0.5 rounded border border-indigo-200">
                                    KARTU PENGAWAS UJIAN
                                  </p>
                                </div>

                                {/* Logo Sekolah */}
                                <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                                  {profile.logoRightUrl ? (
                                    <img
                                      src={profile.logoRightUrl}
                                      alt="Logo Sekolah"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <svg className="w-8 h-8 text-amber-600" viewBox="0 0 100 100" fill="none">
                                      <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
                                      <path d="M50 20 L75 35 L50 50 L25 35 Z" fill="#D97706" />
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {/* Content Details */}
                              <div className="grid grid-cols-12 gap-1.5 text-[10px] sm:text-[11px] items-center relative z-10 py-1">
                                <div className="col-span-9">
                                  <table className="w-full text-left leading-snug border-collapse">
                                    <tbody>
                                      <tr className="align-baseline">
                                        <td className="w-[85px] font-semibold text-gray-700 py-1 whitespace-nowrap">Nama Pengawas</td>
                                        <td className="w-2 text-center font-bold text-gray-900 py-1">:</td>
                                        <td className="font-black text-black py-1 pl-1 uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                          {pItem.nama || '...........................................'}
                                        </td>
                                      </tr>
                                      <tr className="align-baseline">
                                        <td className="w-[85px] font-semibold text-gray-700 py-1 whitespace-nowrap">NIP</td>
                                        <td className="w-2 text-center font-bold text-gray-900 py-1">:</td>
                                        <td className="font-bold text-gray-900 py-1 pl-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                          {pItem.nip || '-'}
                                        </td>
                                      </tr>
                                      <tr className="align-baseline">
                                        <td className="w-[85px] font-semibold text-gray-700 py-1 whitespace-nowrap">Unit Kerja</td>
                                        <td className="w-2 text-center font-bold text-gray-900 py-1">:</td>
                                        <td className="font-semibold text-gray-900 py-1 pl-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                          {displayNamaSekolah}
                                        </td>
                                      </tr>
                                      <tr className="align-baseline">
                                        <td className="w-[85px] font-semibold text-gray-700 py-1 whitespace-nowrap">Tugas Ruang</td>
                                        <td className="w-2 text-center font-bold text-gray-900 py-1">:</td>
                                        <td className="font-extrabold text-amber-950 py-1 pl-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                          {pRuang}
                                        </td>
                                      </tr>
                                      <tr className="align-baseline">
                                        <td className="w-[85px] font-semibold text-gray-700 py-1 whitespace-nowrap">Ujian / TA</td>
                                        <td className="w-2 text-center font-bold text-gray-900 py-1">:</td>
                                        <td className="font-bold text-black py-1 pl-1 text-[7.5px] whitespace-nowrap overflow-visible">
                                          <span style={{ display: 'inline-block', transform: 'scaleX(1.15)', transformOrigin: 'left', letterSpacing: '0.03em' }}>
                                            {namaUjian} ({tahunAjaran})
                                          </span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                {/* Photo Box */}
                                <div className="col-span-3 flex items-center justify-end pr-0.5">
                                  {getPengawasPhoto(pItem.nama, pItem.nip) ? (
                                    <div className="w-[52px] h-[72px] border-2 border-black overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 rounded-xs">
                                      <img src={getPengawasPhoto(pItem.nama, pItem.nip)!} alt="Foto Pengawas" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-[52px] h-[72px] border-2 border-black bg-gray-50 flex flex-col items-center justify-center text-[8px] text-gray-400 font-bold shrink-0 rounded-xs leading-none">
                                      <span>FOTO</span>
                                      <span className="my-0.5">PENGAWAS</span>
                                      <span className="font-black text-[9px] text-gray-700">3 x 4</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Signature Block */}
                              <div className="border-t border-dashed border-gray-300 pt-1.5 flex items-end justify-between text-[9px] text-gray-800 relative z-10">
                                <div className="text-left leading-tight text-gray-500 font-medium">
                                  <p>*Berlaku selama ujian.</p>
                                  <p>*Harap selalu dikenakan.</p>
                                </div>
                                <div className="text-center min-w-[140px]">
                                  <p>{tempatUjian || 'Bandung'}, {tanggalUjian || '.....................'}</p>
                                  <p>Kepala Sekolah,</p>
                                  <div className="h-7"></div>
                                  <p className="font-normal underline text-black uppercase">
                                    {profile.namaKepsek || '...........................................'}
                                  </p>
                                  <p className="font-normal text-gray-700">NIP. {profile.nipKepsek || '-'}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      );

                      return (
                        <div
                          key={idx}
                          className={
                            layoutKartu === 'modern'
                              ? "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-xl flex flex-col justify-between relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 print:bg-none print:border-2 print:border-indigo-400"
                              : layoutKartu === 'minimalis'
                              ? "border border-slate-300 p-4 bg-white rounded-lg flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs hover:shadow-xs print:border-slate-400"
                              : "border-2 border-black p-4 bg-white rounded-md flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs"
                          }
                          style={{ minHeight: '260px' }}
                        >
                          {layoutKartu === 'modern' ? (
                            <div className="bg-white p-3.5 rounded-[10px] flex flex-col justify-between h-full w-full space-y-3 relative overflow-hidden flex-1">
                              {supervisorCardInner}
                            </div>
                          ) : (
                            supervisorCardInner
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};
