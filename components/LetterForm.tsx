'use client';

import React, { useState } from 'react';
import {
  LetterCategory,
  Siswa,
  Guru,
  SuratMutasiPayload,
  SuratKeteranganPIPPayload,
  SuratPenerimaanPindahanPayload,
  SuratTugasPayload,
  SuratAktifMengajarPayload,
  SuratPembagianTugasPayload,
  DetailPembagianTugasItem,
  SuratPerjalananDinasPayload,
  SuratKuasaPIPPayload,
  SuratAktifBelajarPayload,
} from '../types';
import { Sparkles, UserCheck, GraduationCap, RefreshCw, Plus, Trash2, MapPin, Download, UploadCloud, FileSpreadsheet, CheckCircle2, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatNominalPIP, formatKelasTerbilang, formatTahunPelajaran } from '../lib/utils';
import { showToast } from '../lib/toast';

interface LetterFormProps {
  category: LetterCategory;
  payload: any;
  onChangePayload: (newPayload: any) => void;
  siswaList: Siswa[];
  guruList: Guru[];
  onAiDraftRequest?: (prompt: string, targetField: string) => void;
}

export const LetterForm: React.FC<LetterFormProps> = ({
  category,
  payload,
  onChangePayload,
  siswaList,
  guruList,
}) => {
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('');
  const [selectedGuruId, setSelectedGuruId] = useState<string>('');

  const updateField = (field: string, value: any) => {
    onChangePayload({
      ...payload,
      [field]: value,
    });
  };

  // Helper to handle auto-selecting Siswa
  const handleSelectSiswa = (siswaId: string) => {
    setSelectedSiswaId(siswaId);
    const sis = siswaList.find((s) => s.id === siswaId);
    if (!sis) return;

    if (category === 'mutasi') {
      onChangePayload({
        ...payload,
        namaSiswa: sis.nama,
        nis: sis.nis,
        nisn: sis.nisn,
        tempatTanggalLahir: `${sis.tempatLahir}, ${sis.tanggalLahir}`,
        jenisKelamin: sis.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        kelas: sis.kelas,
        alamatSiswa: sis.alamat,
        namaOrangTua: sis.namaOrangTua || '',
        pekerjaanOrangTua: sis.pekerjaanOrangTua || 'Ibu Rumah Tangga',
        alamatOrangTua: sis.alamat || '',
      });
    } else if (category === 'keterangan_pip') {
      onChangePayload({
        ...payload,
        namaSiswa: sis.nama,
        nisn: sis.nisn,
        kelas: sis.kelas,
        tempatTanggalLahir: `${sis.tempatLahir}, ${sis.tanggalLahir}`,
        namaOrangTua: sis.namaOrangTua,
        noRekeningPIP: sis.virtualAccPIP || sis.nisn,
        nominalBantuan: sis.nominalPIP || 'Rp 1.800.000,-',
      });
    } else if (category === 'aktif_belajar') {
      onChangePayload({
        ...payload,
        namaSiswa: sis.nama,
        nis: sis.nis,
        nisn: sis.nisn,
        tempatTanggalLahir: `${sis.tempatLahir}, ${sis.tanggalLahir}`,
        jenisKelamin: sis.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        kelas: sis.kelas,
        jurusan: sis.jurusan || 'MIPA',
        namaOrangTua: sis.namaOrangTua,
        alamatSiswa: sis.alamat,
      });
    } else if (category === 'penerimaan_pindahan') {
      onChangePayload({
        ...payload,
        namaSiswa: sis.nama,
        nisn: sis.nisn,
        kelasDiterima: sis.kelas,
      });
    } else if (category === 'kuasa_pip') {
      onChangePayload({
        ...payload,
        namaPemberi: sis.namaOrangTua,
        nisnSiswa: sis.nisn,
        kelasSiswa: sis.kelas,
        alamatPemberi: sis.alamat,
        noRekening: sis.virtualAccPIP || sis.nisn,
        nominal: sis.nominalPIP || 'Rp 1.800.000,-',
      });
    }
  };

  // Helper to handle auto-selecting Guru
  const handleSelectGuru = (guruId: string) => {
    setSelectedGuruId(guruId);
    const gr = guruList.find((g) => g.id === guruId);
    if (!gr) return;

    if (category === 'surat_tugas') {
      onChangePayload({
        ...payload,
        namaPetugas: gr.nama,
        nipPetugas: gr.nip,
        pangkatGolongan: gr.pangkatGolongan,
        jabatan: gr.jabatan,
      });
    } else if (category === 'aktif_mengajar') {
      onChangePayload({
        ...payload,
        namaGuru: gr.nama,
        nipGuru: gr.nip,
        pangkatGolongan: gr.pangkatGolongan,
        jabatan: gr.jabatan,
        mataPelajaran: gr.mapelUtama,
      });
    } else if (category === 'perjalanan_dinas') {
      onChangePayload({
        ...payload,
        namaPegawai: gr.nama,
        nipPegawai: gr.nip,
        pangkatGolongan: gr.pangkatGolongan,
        jabatan: gr.jabatan,
      });
    } else if (category === 'kuasa_pip') {
      onChangePayload({
        ...payload,
        namaPenerima: gr.nama,
        nipPenerima: gr.nip,
        jabatanPenerima: gr.jabatan,
      });
    }
  };

  // Auto generate new Letter Number
  const handleAutoNumber = () => {
    const randomCode = Math.floor(100 + Math.random() * 900);
    const currentYear = new Date().getFullYear();
    const mapCode: Record<LetterCategory, string> = {
      mutasi: `421.3/${randomCode}/SMAN1-JKT/${currentYear}`,
      keterangan_pip: `421.5/${randomCode}/SMAN1-PIP/${currentYear}`,
      penerimaan_pindahan: `421.3/${randomCode}/SMAN1-JKT/${currentYear}`,
      surat_tugas: `800/${randomCode}/SMAN1-ST/${currentYear}`,
      aktif_mengajar: `800/${randomCode}/SMAN1-SKAM/${currentYear}`,
      pembagian_tugas: `421.2/${randomCode}/SK-PEMBAGIAN/${currentYear}`,
      perjalanan_dinas: `090/${randomCode}/SPD-SMAN1/${currentYear}`,
      kuasa_pip: `421.5/${randomCode}/SK-PIP/${currentYear}`,
      aktif_belajar: `421.3/${randomCode}/SMAN1-SKAB/${currentYear}`,
    };
    const keyToUpdate = category === 'perjalanan_dinas' ? 'nomorSPD' : category === 'pembagian_tugas' ? 'nomorSK' : 'nomorSurat';
    updateField(keyToUpdate, mapCode[category]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      {/* Top Action Toolbar for Master Data Autofill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Siswa Selector if relevant */}
          {['mutasi', 'keterangan_pip', 'aktif_belajar', 'penerimaan_pindahan', 'kuasa_pip'].includes(
            category
          ) && (
            <div className="flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-200 text-indigo-900 px-2.5 py-1.5 rounded-lg">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold">Pilih Siswa:</span>
              <select
                className="bg-white border border-indigo-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 font-medium"
                value={selectedSiswaId}
                onChange={(e) => handleSelectSiswa(e.target.value)}
              >
                <option value="">-- Master Data Siswa --</option>
                {siswaList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.kelas})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Guru Selector if relevant */}
          {['surat_tugas', 'aktif_mengajar', 'perjalanan_dinas', 'kuasa_pip'].includes(category) && (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 px-2.5 py-1.5 rounded-lg">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Pilih Guru/Tendik:</span>
              <select
                className="bg-white border border-emerald-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
                value={selectedGuruId}
                onChange={(e) => handleSelectGuru(e.target.value)}
              >
                <option value="">-- Master Data Guru --</option>
                {guruList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} ({g.mapelUtama})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Form Inputs based on Category */}
      <div className="space-y-3 text-xs">
        {/* Common Field: Nomor Surat (Omitted for pembagian_tugas as FormPembagianTugas has its dedicated section) */}
        {category !== 'pembagian_tugas' && (
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {category === 'perjalanan_dinas' ? 'Nomor SPD' : 'Nomor Surat Resmi'}
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder={
                category === 'perjalanan_dinas' ? 'Masukkan Nomor SPD' : 'Masukkan Nomor Surat Resmi'
              }
              value={category === 'perjalanan_dinas' ? payload.nomorSPD : payload.nomorSurat || ''}
              onChange={(e) =>
                updateField(
                  category === 'perjalanan_dinas' ? 'nomorSPD' : 'nomorSurat',
                  e.target.value
                )
              }
            />
          </div>
        )}

        {/* 1. FORM MUTASI SISWA */}
        {category === 'mutasi' && (
          <FormMutasi fields={payload as SuratMutasiPayload} onChange={updateField} />
        )}

        {/* 2. FORM KETERANGAN PIP */}
        {category === 'keterangan_pip' && (
          <FormPIP fields={payload as SuratKeteranganPIPPayload} onChange={updateField} />
        )}

        {/* 3. FORM PENERIMAAN PINDAHAN */}
        {category === 'penerimaan_pindahan' && (
          <FormPenerimaan
            fields={payload as SuratPenerimaanPindahanPayload}
            onChange={updateField}
          />
        )}

        {/* 4. FORM SURAT TUGAS */}
        {category === 'surat_tugas' && (
          <FormSuratTugas fields={payload as SuratTugasPayload} onChange={updateField} />
        )}

        {/* 5. FORM AKTIF MENGAJAR */}
        {category === 'aktif_mengajar' && (
          <FormAktifMengajar fields={payload as SuratAktifMengajarPayload} onChange={updateField} />
        )}

        {/* 6. FORM PEMBAGIAN TUGAS (SK) */}
        {category === 'pembagian_tugas' && (
          <FormPembagianTugas
            fields={payload as SuratPembagianTugasPayload}
            onChange={updateField}
            guruList={guruList}
          />
        )}

        {/* 7. FORM PERJALANAN DINAS */}
        {category === 'perjalanan_dinas' && (
          <FormPerjalananDinas
            fields={payload as SuratPerjalananDinasPayload}
            onChange={updateField}
          />
        )}

        {/* 8. FORM KUASA PIP */}
        {category === 'kuasa_pip' && (
          <FormKuasaPIP fields={payload as SuratKuasaPIPPayload} onChange={updateField} />
        )}

        {/* 9. FORM AKTIF BELAJAR */}
        {category === 'aktif_belajar' && (
          <FormAktifBelajar fields={payload as SuratAktifBelajarPayload} onChange={updateField} />
        )}

        {/* TEMPAT & TANGGAL SURAT (Bisa Diubah Untuk Semua Jenis Surat Kecuali SPD) */}
        {category !== 'perjalanan_dinas' && (
          <div className="pt-4 mt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tempat Surat
              </h3>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tempat / Kota Surat (Custom)
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Masukkan Tempat / Kota Surat Resmi"
                value={payload.customCityDate || ''}
                onChange={(e) => updateField('customCityDate', e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Khusus mengganti nama Tempat/Kota surat saja. Tanggal surat akan tetap otomatis mengikuti tanggal dokumen/hari ini.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- INDIVIDUAL FORM CATEGORY COMPONENTS --- */

// 1. Mutasi Form
const FormMutasi: React.FC<{
  fields: SuratMutasiPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block font-semibold text-slate-700 mb-1">Nama Siswa</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 font-medium"
        value={fields.namaSiswa || ''}
        onChange={(e) => onChange('namaSiswa', e.target.value)}
        placeholder="Masukkan Nama Siswa"
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">NIS</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-medium"
          value={fields.nis || ''}
          onChange={(e) => onChange('nis', e.target.value)}
          placeholder="Masukkan NIS"
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">NISN</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-medium"
          value={fields.nisn || ''}
          onChange={(e) => onChange('nisn', e.target.value)}
          placeholder="Masukkan NISN"
        />
      </div>
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Tempat, Tgl Lahir</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.tempatTanggalLahir || ''}
        onChange={(e) => onChange('tempatTanggalLahir', e.target.value)}
        placeholder="Masukkan Tempat, Tgl Lahir (Contoh: Bandung, 12 Mei 2008)"
      />
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
        <select
          className="w-full border border-slate-300 rounded-lg p-2 bg-white"
          value={fields.jenisKelamin || ''}
          onChange={(e) => onChange('jenisKelamin', e.target.value)}
        >
          <option value="">-Pilih Jenis Kelamin-</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2"
          value={fields.kelas || ''}
          onChange={(e) => onChange('kelas', e.target.value)}
          placeholder="Masukkan Kelas"
        />
      </div>
    </div>

    {/* Table Detail Alamat Siswa */}
    <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Tabel Detail Alamat Siswa
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Alamat, Desa, Kecamatan, Kabupaten</span>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 text-xs mb-1">
          1. Alamat Jalan / Kampung / RT / RW
        </label>
        <textarea
          rows={2}
          placeholder="Masukkan Alamat / Jalan / RT / RW Siswa"
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[60px] font-medium bg-white"
          value={fields.alamatSiswa || ''}
          onChange={(e) => onChange('alamatSiswa', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">2. Desa / Kelurahan</label>
          <input
            type="text"
            placeholder="Masukkan Desa / Kelurahan"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
            value={fields.desaSiswa || ''}
            onChange={(e) => onChange('desaSiswa', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">3. Kecamatan</label>
          <input
            type="text"
            placeholder="Masukkan Kecamatan"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
            value={fields.kecamatanSiswa || ''}
            onChange={(e) => onChange('kecamatanSiswa', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">4. Kabupaten / Kota</label>
          <input
            type="text"
            placeholder="Masukkan Kabupaten / Kota"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-medium"
            value={fields.kabupatenSiswa || ''}
            onChange={(e) => onChange('kabupatenSiswa', e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Data Orang Tua / Wali */}
    <div className="md:col-span-2 border-t border-slate-200 pt-3 mt-1">
      <h4 className="font-bold text-slate-800 text-sm mb-2">Data Orang Tua / Wali Pemohon</h4>
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
      <input
        type="text"
        placeholder="Masukkan Nama Orang Tua / Wali"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.namaOrangTua || ''}
        onChange={(e) => onChange('namaOrangTua', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Pekerjaan Orang Tua / Wali</label>
      <input
        type="text"
        placeholder="Masukkan Pekerjaan Orang Tua / Wali"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.pekerjaanOrangTua || ''}
        onChange={(e) => onChange('pekerjaanOrangTua', e.target.value)}
      />
    </div>

    {/* Table Detail Alamat Orang Tua */}
    <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Tabel Detail Alamat Orang Tua / Wali
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Alamat, Desa, Kecamatan, Kabupaten</span>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 text-xs mb-1">
          1. Alamat Jalan / Kampung / RT / RW
        </label>
        <textarea
          rows={2}
          placeholder="Masukkan Alamat / Jalan / RT / RW Orang Tua / Wali"
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[60px] font-medium bg-white"
          value={fields.alamatOrangTua || ''}
          onChange={(e) => onChange('alamatOrangTua', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">2. Desa / Kelurahan</label>
          <input
            type="text"
            placeholder="Masukkan Desa / Kelurahan"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
            value={fields.desaOrangTua || ''}
            onChange={(e) => onChange('desaOrangTua', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">3. Kecamatan</label>
          <input
            type="text"
            placeholder="Masukkan Kecamatan"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
            value={fields.kecamatanOrangTua || ''}
            onChange={(e) => onChange('kecamatanOrangTua', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">4. Kabupaten / Kota</label>
          <input
            type="text"
            placeholder="Masukkan Kabupaten / Kota"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-medium"
            value={fields.kabupatenOrangTua || ''}
            onChange={(e) => onChange('kabupatenOrangTua', e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Sekolah Tujuan */}
    <div className="md:col-span-2 border-t border-slate-200 pt-3 mt-1">
      <h4 className="font-bold text-slate-800 text-sm mb-2">Sekolah Tujuan & Alasan</h4>
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Sekolah Tujuan Mutasi</label>
      <input
        type="text"
        placeholder="Masukkan Sekolah Tujuan Mutasi"
        className="w-full border border-slate-300 rounded-lg p-3 font-bold text-indigo-900 bg-slate-50 focus:bg-white text-sm"
        value={fields.sekolahTujuan || ''}
        onChange={(e) => onChange('sekolahTujuan', e.target.value)}
      />
    </div>

    {/* Table Detail Alamat Sekolah Tujuan */}
    <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Tabel Detail Alamat Sekolah Tujuan
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Alamat, Desa, Kecamatan, Kabupaten</span>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 text-xs mb-1">
          1. Alamat Jalan / Komplek Sekolah Tujuan
        </label>
        <textarea
          rows={2}
          placeholder="Masukkan Alamat Jalan / Komplek Sekolah Tujuan"
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[60px] font-medium bg-white"
          value={fields.alamatSekolahTujuan || ''}
          onChange={(e) => onChange('alamatSekolahTujuan', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">2. Desa / Kelurahan</label>
          <input
            type="text"
            placeholder="Masukkan Desa / Kelurahan"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
            value={fields.desaSekolahTujuan || ''}
            onChange={(e) => onChange('desaSekolahTujuan', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">3. Kecamatan</label>
          <input
            type="text"
            placeholder="Masukkan Kecamatan"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white"
            value={fields.kecamatanSekolahTujuan || ''}
            onChange={(e) => onChange('kecamatanSekolahTujuan', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 text-xs mb-1">4. Kabupaten / Kota</label>
          <input
            type="text"
            placeholder="Masukkan Kabupaten / Kota"
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-medium"
            value={fields.kabupatenSekolahTujuan || ''}
            onChange={(e) => onChange('kabupatenSekolahTujuan', e.target.value)}
          />
        </div>
      </div>
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Tanggal Efektif Pindah</label>
      <input
        type="text"
        placeholder="Masukkan Tanggal Efektif Pindah"
        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
        value={fields.tanggalPindah || ''}
        onChange={(e) => onChange('tanggalPindah', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Alasan Pindah Sekolah</label>
      <textarea
        rows={3}
        placeholder="Masukkan Alasan Pindah Sekolah..."
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[90px] font-medium bg-slate-50 focus:bg-white"
        value={fields.alasanPindah || ''}
        onChange={(e) => onChange('alasanPindah', e.target.value)}
      />
    </div>
  </div>
);

// 2. PIP Form
const FormPIP: React.FC<{
  fields: SuratKeteranganPIPPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Nama Siswa Penerima</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-medium"
          placeholder="Masukkan Nama Siswa Penerima"
          value={fields.namaSiswa || ''}
          onChange={(e) => onChange('namaSiswa', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">NISN</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-mono"
          placeholder="Masukkan NISN"
          value={fields.nisn || ''}
          onChange={(e) => onChange('nisn', e.target.value)}
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Tempat Tanggal Lahir</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-medium"
          placeholder="Masukkan Tempat, Tgl Lahir (Contoh: Bandung, 12 Mei 2008)"
          value={fields.tempatTanggalLahir || ''}
          onChange={(e) => onChange('tempatTanggalLahir', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Kelas / Tingkat</label>
        <input
          type="text"
          placeholder="Masukkan Kelas / Tingkat (Contoh: IV A, 4, atau V)"
          className="w-full border border-slate-300 rounded-lg p-2 font-medium"
          value={fields.kelas || ''}
          onChange={(e) => onChange('kelas', e.target.value)}
          onBlur={(e) => {
            if (e.target.value) {
              onChange('kelas', formatKelasTerbilang(e.target.value));
            }
          }}
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua/Wali</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2"
          placeholder="Masukkan Nama Orang Tua/Wali"
          value={fields.namaOrangTua || ''}
          onChange={(e) => onChange('namaOrangTua', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">No. Rekening PIP / SimPel</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-indigo-900"
          placeholder="Masukkan No. Rekening PIP / SimPel"
          value={fields.noRekeningPIP || ''}
          onChange={(e) => onChange('noRekeningPIP', e.target.value)}
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">Bank Penyalur</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2"
          placeholder="Masukkan Bank Penyalur"
          value={fields.namaBank || ''}
          onChange={(e) => onChange('namaBank', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
        <input
          type="text"
          placeholder="Masukkan Tahun Pelajaran (Contoh: 2026 / 2027)"
          className="w-full border border-slate-300 rounded-lg p-2 font-medium"
          value={fields.tahunPelajaran || fields.tahunAnggaran || ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange('tahunPelajaran', val);
            onChange('tahunAnggaran', val);
          }}
          onBlur={(e) => {
            const formatted = formatTahunPelajaran(e.target.value);
            onChange('tahunPelajaran', formatted);
            onChange('tahunAnggaran', formatted);
          }}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block font-semibold text-slate-700 mb-1">Nominal Bantuan</label>
        <input
          type="text"
          placeholder="Masukkan Nominal Bantuan (Contoh: 450000)"
          className="w-full border border-slate-300 rounded-lg p-2 font-medium"
          value={fields.nominalBantuan || ''}
          onChange={(e) => onChange('nominalBantuan', e.target.value)}
          onBlur={(e) => {
            if (e.target.value) {
              onChange('nominalBantuan', formatNominalPIP(e.target.value));
            }
          }}
        />

        {/* Quick nominal presets */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
          <span className="text-slate-500 font-medium">Nominal Cepat PIP:</span>
          {['225000', '375000', '450000', '750000', '1800000'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange('nominalBantuan', formatNominalPIP(val))}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 border border-slate-200 text-slate-700 font-medium cursor-pointer transition-colors"
            >
              Rp {parseInt(val).toLocaleString('id-ID')}
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block font-semibold text-slate-700 mb-1">Keperluan Keterangan</label>
        <textarea
          rows={3}
          placeholder="Masukkan Keperluan Keterangan (Contoh: Pencairan Dana PIP / Bank Soal...)"
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[80px] font-medium bg-slate-50 focus:bg-white"
          value={fields.keperluan || ''}
          onChange={(e) => onChange('keperluan', e.target.value)}
        />
      </div>
    </div>
  );
};

// 3. Form Penerimaan Pindahan
const FormPenerimaan: React.FC<{
  fields: SuratPenerimaanPindahanPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block font-semibold text-slate-700 mb-1">Nama Siswa Pindahan</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 font-medium"
        placeholder="Masukkan Nama Siswa"
        value={fields.namaSiswa || ''}
        onChange={(e) => onChange('namaSiswa', e.target.value)}
      />
    </div>
    <div>
      <label className="block font-semibold text-slate-700 mb-1">NIS / NISN</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Masukkan NIS"
          className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs"
          value={fields.nis || ''}
          onChange={(e) => onChange('nis', e.target.value)}
        />
        <input
          type="text"
          placeholder="Masukkan NISN"
          className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs"
          value={fields.nisn || ''}
          onChange={(e) => onChange('nisn', e.target.value)}
        />
      </div>
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Tempat / Tanggal Lahir</label>
      <input
        type="text"
        placeholder="Masukkan Tempat, Tgl Lahir (Contoh: Bandung, 12 Mei 2008)"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.tempatTanggalLahir || ''}
        onChange={(e) => onChange('tempatTanggalLahir', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
      <select
        className="w-full border border-slate-300 rounded-lg p-2 bg-white"
        value={fields.jenisKelamin || ''}
        onChange={(e) => onChange('jenisKelamin', e.target.value)}
      >
        <option value="">-Pilih Jenis Kelamin-</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Alamat Siswa</label>
      <input
        type="text"
        placeholder="Masukkan Alamat Siswa"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.alamatSiswa || ''}
        onChange={(e) => onChange('alamatSiswa', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Sekolah Asal</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2"
        placeholder="Masukkan Sekolah Asal"
        value={fields.sekolahAsal || ''}
        onChange={(e) => onChange('sekolahAsal', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Alamat Sekolah Asal</label>
      <input
        type="text"
        placeholder="Masukkan Alamat Sekolah Asal"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.alamatSekolahAsal || ''}
        onChange={(e) => onChange('alamatSekolahAsal', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Diterima di Kelas</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 font-bold"
        placeholder="Masukkan Kelas Diterima (Contoh: XI MIPA 2)"
        value={fields.kelasDiterima || ''}
        onChange={(e) => onChange('kelasDiterima', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Mulai Belajar Tanggal</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2"
        placeholder="Masukkan Tanggal Mulai Belajar"
        value={fields.tanggalMulaiBelajar || ''}
        onChange={(e) => onChange('tanggalMulaiBelajar', e.target.value)}
      />
    </div>
  </div>
);

// 4. Form Surat Tugas
const FormSuratTugas: React.FC<{
  fields: SuratTugasPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block font-semibold text-slate-700 mb-1">Nama Pegawai Ditugaskan</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 font-bold"
        placeholder="Masukkan Nama Pegawai Ditugaskan"
        value={fields.namaPetugas || ''}
        onChange={(e) => onChange('namaPetugas', e.target.value)}
      />
    </div>
    <div>
      <label className="block font-semibold text-slate-700 mb-1">NIP / NUPTK</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 font-mono"
        placeholder="Masukkan NIP / NUPTK"
        value={fields.nipPetugas || ''}
        onChange={(e) => onChange('nipPetugas', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
      <input
        type="text"
        placeholder="Masukkan Jabatan"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.jabatan || ''}
        onChange={(e) => onChange('jabatan', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Nama Kegiatan</label>
      <input
        type="text"
        placeholder="Masukkan Nama Kegiatan / Tujuan Tugas"
        className="w-full border border-slate-300 rounded-lg p-2 font-medium"
        value={fields.namaKegiatan || fields.tujuanTugas || ''}
        onChange={(e) => {
          onChange('namaKegiatan', e.target.value);
          onChange('tujuanTugas', e.target.value);
        }}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Hari / Tanggal</label>
      <input
        type="text"
        placeholder="Masukkan Hari / Tanggal"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.hariTanggal || fields.tanggalMulai || ''}
        onChange={(e) => {
          onChange('hariTanggal', e.target.value);
          onChange('tanggalMulai', e.target.value);
        }}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Waktu</label>
      <input
        type="text"
        placeholder="Masukkan Waktu"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.waktu || ''}
        onChange={(e) => onChange('waktu', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Tempat Pelaksanaan</label>
      <input
        type="text"
        placeholder="Masukkan Tempat Pelaksanaan"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.tempatTugas || ''}
        onChange={(e) => onChange('tempatTugas', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Uraian Tugas</label>
      <textarea
        rows={3}
        placeholder="Masukkan Rincian / Uraian Tugas"
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[85px] font-medium bg-slate-50 focus:bg-white"
        value={fields.uraianTugas || ''}
        onChange={(e) => onChange('uraianTugas', e.target.value)}
      />
    </div>
  </div>
);

// 5. Form Aktif Mengajar
const FormAktifMengajar: React.FC<{
  fields: SuratAktifMengajarPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block font-semibold text-slate-700 mb-1">Nama Guru</label>
      <input
        type="text"
        placeholder="Masukkan Nama Guru"
        className="w-full border border-slate-300 rounded-lg p-2 font-bold"
        value={fields.namaGuru || ''}
        onChange={(e) => onChange('namaGuru', e.target.value)}
      />
    </div>
    <div>
      <label className="block font-semibold text-slate-700 mb-1">NIP / NUPTK</label>
      <input
        type="text"
        placeholder="Masukkan NIP / NUPTK"
        className="w-full border border-slate-300 rounded-lg p-2 font-mono"
        value={fields.nipGuru || ''}
        onChange={(e) => onChange('nipGuru', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Tempat / Tanggal Lahir</label>
      <input
        type="text"
        placeholder="Masukkan Tempat, Tanggal Lahir"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.tempatTanggalLahir || ''}
        onChange={(e) => onChange('tempatTanggalLahir', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
      <select
        className="w-full border border-slate-300 rounded-lg p-2 bg-white"
        value={fields.jenisKelamin || ''}
        onChange={(e) => onChange('jenisKelamin', e.target.value)}
      >
        <option value="">-Pilih Jenis Kelamin-</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
      <input
        type="text"
        placeholder="Masukkan Jabatan"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.jabatan || ''}
        onChange={(e) => onChange('jabatan', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
      <input
        type="text"
        placeholder="Masukkan Mata Pelajaran"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.mataPelajaran || ''}
        onChange={(e) => onChange('mataPelajaran', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
      <input
        type="text"
        placeholder="Masukkan Status Kepegawaian"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.statusKepegawaian || ''}
        onChange={(e) => onChange('statusKepegawaian', e.target.value)}
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1">Aktif Mengajar Sejak Tanggal</label>
      <input
        type="text"
        placeholder="Masukkan Tanggal Mulai Aktif Mengajar"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.sejakTanggal || ''}
        onChange={(e) => onChange('sejakTanggal', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Alamat Guru</label>
      <input
        type="text"
        placeholder="Masukkan Alamat Tempat Tinggal Guru"
        className="w-full border border-slate-300 rounded-lg p-2"
        value={fields.alamatGuru || ''}
        onChange={(e) => onChange('alamatGuru', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1">Dibuat Untuk dipergunakan sebagai</label>
      <textarea
        rows={3}
        placeholder="Masukkan Keperluan Surat Keterangan"
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[85px] font-medium bg-slate-50 focus:bg-white"
        value={fields.keperluan || ''}
        onChange={(e) => onChange('keperluan', e.target.value)}
      />
    </div>
  </div>
);

// 6. Form Pembagian Tugas
const FormPembagianTugas: React.FC<{
  fields: SuratPembagianTugasPayload;
  onChange: (field: string, val: any) => void;
  guruList: Guru[];
}> = ({ fields, onChange, guruList }) => {
  const [excelSuccessMsg, setExcelSuccessMsg] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setExcelSuccessMsg(msg);
    setTimeout(() => {
      setExcelSuccessMsg(null);
    }, 4000);
  };

  // Download Template Excel SK Pembagian Tugas Mengajar Sesuai Tabel di Gambar
  const handleDownloadTemplateSK = () => {
    const headers = ['No.', 'Nama Guru / NIP', 'Gol. Ruang', 'Jabatan / Tugas Mengajar', 'JJM'];
    const sampleRows = [
      [1, 'Nama Guru 1\nNIP. 19700512 199603 1 004', 'IV/a', 'Guru Kelas I', '24 JP'],
      [2, 'Nama Guru 2\nNIP. 19820315 200801 2 009', 'III/d', 'Guru Kelas II', '24 JP'],
      [3, 'Nama Guru 3\nNIP. 19940722 202221 1 003', 'IX', 'Guru PJOK', '24 JP'],
      [4, 'Nama Guru 4\nNIP. -', '-', 'Guru PAI', '24 JP'],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = [
      { wch: 6 },  // No.
      { wch: 36 }, // Nama Guru / NIP
      { wch: 16 }, // Gol. Ruang
      { wch: 32 }, // Jabatan / Tugas Mengajar
      { wch: 12 }, // JJM
    ];

    const petunjukData = [
      ['PETUNJUK PENGISIAN TEMPLATE EXCEL SK PEMBAGIAN TUGAS MENGAJAR'],
      [''],
      ['1. Kolom "Nama Guru / NIP" dapat diisi nama guru dan NIP (pisahkan baris baru atau tanda garis miring /).'],
      ['2. Kolom "Gol. Ruang" diisi golongan ruang kepangkatan (Contoh: IV/a, III/d, IX, atau tanda strip -).'],
      ['3. Kolom "Jabatan / Tugas Mengajar" diisi tugas guru (Contoh: Guru Kelas I, Guru PJOK, Guru PAI).'],
      ['4. Kolom "JJM" diisi jumlah jam mengajar per minggu (Contoh: 24 JP, 32 JP).'],
      ['5. Baris contoh pada baris 2 s.d. 5 dapat Anda timpa langsung dengan data guru sekolah Anda.'],
      ['6. Klik tombol "Upload Excel SK" pada formulir aplikasi untuk otomatis mengisi tabel dokumen Lampiran SK.'],
    ];
    const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
    wsPetunjuk['!cols'] = [{ wch: 90 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SK_Pembagian_Tugas');
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk_Pengisian');

    XLSX.writeFile(wb, 'Template_SK_Pembagian_Tugas_Mengajar.xlsx');
    showToast('Template Excel SK Pembagian Tugas berhasil diunduh.', 'info', 'Unduh Berhasil');
  };

  // Upload Excel SK Pembagian Tugas & Auto-Populate ke Tabel Lampiran Dokumen
  const handleTriggerUpload = () => {
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
          showToast('Berkas Excel kosong atau tidak memiliki baris data.', 'error', 'Format Tidak Valid');
          return;
        }

        const parsedItems: DetailPembagianTugasItem[] = rawJson
          .map((row, idx) => {
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

            const combinedGuruNip = getVal('Nama Guru / NIP', 'Nama Guru/NIP', 'Nama Guru', 'Nama', 'NAMA_GURU');
            let namaGuru = combinedGuruNip;
            let nip = getVal('NIP', 'nip', 'No NIP') || '-';

            if (combinedGuruNip) {
              if (combinedGuruNip.includes('\n')) {
                const lines = combinedGuruNip.split('\n');
                namaGuru = lines[0].trim();
                const nipLine = lines.slice(1).join(' ');
                nip = nipLine.replace(/NIP[\.\:\s]*/gi, '').trim() || nip;
              } else if (combinedGuruNip.includes('/')) {
                const parts = combinedGuruNip.split('/');
                namaGuru = parts[0].trim();
                nip = parts.slice(1).join('/').replace(/NIP[\.\:\s]*/gi, '').trim() || nip;
              }
            }

            const golongan = getVal('Gol. Ruang', 'Gol Ruang', 'Golongan', 'Pangkat/Golongan', 'Gol') || '-';
            const jabatan = getVal('Jabatan / Tugas Mengajar', 'Jabatan/Tugas Mengajar', 'Jabatan', 'Tugas Mengajar', 'Tugas') || 'Guru Kelas';
            let bebanJam = getVal('JJM', 'Beban Jam', 'Jam Mengajar', 'Jam', 'JP') || '24 JP';
            if (bebanJam && !bebanJam.toUpperCase().includes('JP') && !isNaN(Number(bebanJam))) {
              bebanJam = `${bebanJam} JP`;
            }

            if (!namaGuru) return null;

            return {
              id: `pt-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              namaGuru: namaGuru || `Nama Guru ${idx + 1}`,
              nip: nip || '-',
              golongan: golongan,
              jabatan: jabatan,
              bebanJam: bebanJam || '24 JP',
            };
          })
          .filter(Boolean) as DetailPembagianTugasItem[];

        if (parsedItems.length === 0) {
          showToast('Tidak ada data guru yang valid pada file Excel.', 'error', 'Data Tidak Ditemukan');
          return;
        }

        onChange('daftarGuru', parsedItems);
        showToast(`Berhasil menyimpan ${parsedItems.length} guru ke tabel Lampiran SK!`, 'success', 'Berhasil Disimpan');
      } catch (err) {
        console.error('Error parsing SK Excel:', err);
        showToast('Gagal membaca file Excel. Pastikan file berformat .xlsx atau .xls.', 'error', 'Gagal Membaca File');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAddGuruItem = () => {
    const list = fields.daftarGuru || [];
    const id = `pt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newItem: DetailPembagianTugasItem = {
      id,
      namaGuru: '',
      nip: '',
      golongan: 'IX/Ahli Pertama',
      jabatan: 'Guru Kelas',
      bebanJam: '24 JP',
    };
    onChange('daftarGuru', [...list, newItem]);
  };

  const handleRemoveGuruItem = (id: string) => {
    const list = fields.daftarGuru || [];
    onChange(
      'daftarGuru',
      list.filter((g) => g.id !== id)
    );
  };

  const handleUpdateGuruItem = (id: string, key: string, val: any) => {
    const list = fields.daftarGuru || [];
    const updated = list.map((item) => (item.id === id ? { ...item, [key]: val } : item));
    onChange('daftarGuru', updated);
  };

  const handleSelectGuruFor = (id: string, guruId: string) => {
    const selected = guruList.find((g) => g.id === guruId);
    if (selected) {
      const list = fields.daftarGuru || [];
      const updated = list.map((item) =>
        item.id === id
          ? {
              ...item,
              namaGuru: selected.nama,
              nip: selected.nip,
              golongan: selected.pangkatGolongan || item.golongan || '-',
              jabatan: selected.jabatan || item.jabatan || 'Guru Kelas',
            }
          : item
      );
      onChange('daftarGuru', updated);
    }
  };

  const staffList = fields.daftarGuru || [];

  return (
    <div className="space-y-3 text-xs sm:text-sm">
      {/* Hidden File Input for SK Excel */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Floating Notification */}
      {excelSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg flex items-center justify-between font-semibold text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{excelSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setExcelSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Nomor SK Keputusan (Single Clean Field) */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Nomor SK Keputusan</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-medium focus:ring-2 focus:ring-indigo-500"
          placeholder="Contoh: 421.2/015/SD-2026"
          value={fields.nomorSK || ''}
          onChange={(e) => onChange('nomorSK', e.target.value)}
        />
      </div>

      {/* 2. Tahun Pelajaran & Tanggal Efektif SK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
            placeholder="Contoh: 2026 / 2027"
            value={fields.tahunPelajaran || ''}
            onChange={(e) => onChange('tahunPelajaran', e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Tanggal Efektif SK</label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg p-2 font-semibold text-indigo-700 bg-indigo-50/50 border-indigo-200"
            placeholder="Contoh: 15 Juli 2026"
            value={fields.tanggalEfektif || ''}
            onChange={(e) => onChange('tanggalEfektif', e.target.value)}
          />
        </div>
      </div>

      {/* Daftar Pendidik & Tenaga Kependidikan dengan Tombol Download Template & Upload Excel */}
      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div>
            <span className="font-bold text-slate-900 text-xs">
              Daftar Pembagian Tugas Guru ({staffList.length} Orang)
            </span>
            <p className="text-[11px] text-slate-500">
              Otomatis mengisi tabel Halaman 2 (Lampiran Dokumen SK).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* 1. Tombol Download Template Excel SK */}
            <button
              type="button"
              onClick={handleDownloadTemplateSK}
              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Unduh Template Excel SK Pembagian Tugas (No, Nama Guru / NIP, Gol. Ruang, Jabatan / Tugas Mengajar, JJM)"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Download Template Excel</span>
            </button>

            {/* 2. Tombol Upload / Import Excel SK */}
            <button
              type="button"
              onClick={handleTriggerUpload}
              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Upload file Excel untuk langsung mengisi tabel Lampiran SK secara otomatis"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-700" />
              <span>Upload Excel SK</span>
            </button>

            {/* 3. Tombol Tambah Baris Manual */}
            <button
              type="button"
              onClick={handleAddGuruItem}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>
        </div>

        {staffList.map((item, idx) => (
          <div key={item.id || idx} className="bg-white p-2.5 rounded border border-slate-200 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-700 text-xs">
              <span>No. #{idx + 1} - {item.namaGuru || 'Nama Guru'}</span>
              <button
                type="button"
                onClick={() => handleRemoveGuruItem(item.id)}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {guruList.length > 0 && (
              <div className="text-[11px]">
                <select
                  className="w-full border border-slate-200 rounded p-1 text-[11px] bg-slate-50"
                  onChange={(e) => handleSelectGuruFor(item.id, e.target.value)}
                >
                  <option value="">-- Pilih dari Master Data Guru --</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nama} ({g.nip})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6 sm:col-span-6">
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama Guru"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-medium"
                  value={item.namaGuru}
                  onChange={(e) => handleUpdateGuruItem(item.id, 'namaGuru', e.target.value)}
                />
              </div>

              <div className="col-span-6 sm:col-span-6">
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">NIP / NUPTK</label>
                <input
                  type="text"
                  placeholder="19810523..."
                  className="w-full border border-slate-300 rounded p-1.5 text-xs font-mono"
                  value={item.nip}
                  onChange={(e) => handleUpdateGuruItem(item.id, 'nip', e.target.value)}
                />
              </div>

              <div className="col-span-4 sm:col-span-4">
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Gol. Ruang</label>
                <input
                  type="text"
                  placeholder="IX/Ahli Pertama"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs text-center"
                  value={item.golongan || item.golRuang || ''}
                  onChange={(e) => handleUpdateGuruItem(item.id, 'golongan', e.target.value)}
                />
              </div>

              <div className="col-span-5 sm:col-span-5">
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Jabatan / Tugas Mengajar</label>
                <input
                  type="text"
                  placeholder="Guru Kelas 4 A"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs"
                  value={item.jabatan || item.tugasTambahan || item.mapel || ''}
                  onChange={(e) => handleUpdateGuruItem(item.id, 'jabatan', e.target.value)}
                />
              </div>

              <div className="col-span-3 sm:col-span-3">
                <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">JJM</label>
                <input
                  type="text"
                  placeholder="32 JP"
                  className="w-full border border-slate-300 rounded p-1.5 text-xs text-center font-bold"
                  value={item.bebanJam || item.jjm || ''}
                  onChange={(e) => handleUpdateGuruItem(item.id, 'bebanJam', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Form Perjalanan Dinas
interface PengikutItem {
  nama: string;
  pangkat: string;
  jabatan: string;
}

interface PengikutRow extends PengikutItem {
  id: string;
}

function parsePengikutText(text: string): PengikutItem[] {
  if (!text) return [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  return lines.map(line => {
    let parts: string[] = [];
    if (line.includes('|')) {
      parts = line.split('|').map(s => s.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(s => s.trim());
    } else if (line.includes('  ')) {
      parts = line.split('  ').map(s => s.trim()).filter(Boolean);
    } else {
      const rawParts = line.split(',').map(s => s.trim());
      if (rawParts.length > 2) {
        const jabatan = rawParts.pop() || '';
        const pangkat = rawParts.pop() || '';
        const nama = rawParts.join(', ');
        parts = [nama, pangkat, jabatan];
      } else if (rawParts.length === 2) {
        parts = [rawParts[0], rawParts[1], ''];
      } else {
        parts = [line, '', ''];
      }
    }
    return {
      nama: parts[0] || '',
      pangkat: parts[1] || '',
      jabatan: parts[2] || ''
    };
  });
}

function serializePengikut(items: PengikutItem[]): string {
  return items
    .map(item => `${item.nama.trim()} | ${item.pangkat.trim()} | ${item.jabatan.trim()}`)
    .join('\n');
}

const FormPerjalananDinas: React.FC<{
  fields: SuratPerjalananDinasPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => {
  const [items, setItems] = React.useState<PengikutRow[]>(() => {
    return parsePengikutText(fields.pengikutText || '').map((item, idx) => ({
      ...item,
      id: `row-${idx}-${Date.now()}`
    }));
  });

  const lastSerializedRef = React.useRef(fields.pengikutText || '');

  React.useEffect(() => {
    if (fields.pengikutText !== lastSerializedRef.current) {
      const parsed = parsePengikutText(fields.pengikutText || '').map((item, idx) => ({
        ...item,
        id: `row-${idx}-${Date.now()}`
      }));
      setItems(parsed);
      lastSerializedRef.current = fields.pengikutText || '';
    }
  }, [fields.pengikutText]);

  const handleUpdateItem = (index: number, key: keyof PengikutItem, value: string) => {
    const newItems = [...items];
    if (!newItems[index]) return;
    newItems[index] = {
      ...newItems[index],
      [key]: value,
    };
    setItems(newItems);
    
    const serialized = serializePengikut(newItems);
    lastSerializedRef.current = serialized;
    onChange('pengikutText', serialized);
  };

  const handleAddItem = () => {
    const newItems = [...items, { id: `row-${Date.now()}-${Math.random()}`, nama: '', pangkat: '', jabatan: '' }];
    setItems(newItems);
    
    const serialized = serializePengikut(newItems);
    lastSerializedRef.current = serialized;
    onChange('pengikutText', serialized);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    
    const serialized = serializePengikut(newItems);
    lastSerializedRef.current = serialized;
    onChange('pengikutText', serialized);
  };

  const inputClass = "w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
  const headerClass = "md:col-span-2 font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1.5 mt-4 first:mt-0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
      <div className={headerClass}>
        Nomor Surat & Pejabat Pemberi Perintah:
      </div>
      <div>
        <label className={labelClass}>Nomor Surat (SPD)</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="Masukkan Nomor SPD..."
          value={fields.nomorSPD || ''}
          onChange={(e) => onChange('nomorSPD', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pejabat Pemberi Perintah</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Instansi/Jabatan..."
          value={fields.pejabatPerintah || ''}
          onChange={(e) => onChange('pejabatPerintah', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Pegawai Yang Diperintah:
      </div>
      <div>
        <label className={labelClass}>Nama Pegawai</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Nama Pegawai"
          value={fields.namaPegawai || ''}
          onChange={(e) => onChange('namaPegawai', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>NIP Pegawai (Opsional)</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="Masukkan NIP Pegawai"
          value={fields.nipPegawai || ''}
          onChange={(e) => onChange('nipPegawai', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Jabatan Pegawai</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Jabatan Pegawai"
          value={fields.jabatan || ''}
          onChange={(e) => onChange('jabatan', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pangkat / Golongan</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Pangkat / Golongan"
          value={fields.pangkatGolongan || ''}
          onChange={(e) => onChange('pangkatGolongan', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Gaji Pokok</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Gaji Pokok"
          value={fields.gajiPokok || ''}
          onChange={(e) => onChange('gajiPokok', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Tingkat Perjalanan Dinas</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Tingkat Perjalanan"
          value={fields.tingkatPerjalanan || ''}
          onChange={(e) => onChange('tingkatPerjalanan', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Detail Perjalanan Dinas:
      </div>
      <div>
        <label className={labelClass}>Tempat Berangkat / Kedudukan</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Tempat Berangkat / Kedudukan"
          value={fields.tempatBerangkat || ''}
          onChange={(e) => onChange('tempatBerangkat', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Tempat Tujuan</label>
        <input
          type="text"
          className={`${inputClass} font-bold text-indigo-900`}
          placeholder="Masukkan Tempat Tujuan"
          value={fields.tempatTujuan || ''}
          onChange={(e) => onChange('tempatTujuan', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Alat Transportasi</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Alat Transportasi"
          value={fields.alatAngkutan || ''}
          onChange={(e) => onChange('alatAngkutan', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Lama Perjalanan</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Lama Perjalanan"
          value={fields.lamaPerjalanan || ''}
          onChange={(e) => onChange('lamaPerjalanan', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Dari Tanggal (Berangkat)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Tanggal Berangkat"
          value={fields.tanggalBerangkat || ''}
          onChange={(e) => onChange('tanggalBerangkat', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>s.d. Tanggal (Kembali)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Tanggal Kembali"
          value={fields.tanggalKembali || ''}
          onChange={(e) => onChange('tanggalKembali', e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className={labelClass}>Maksud Perjalanan Dinas</label>
        <textarea
          rows={3}
          placeholder="Masukkan Maksud Perjalanan Dinas"
          className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none min-h-[70px]"
          value={fields.maksudPerjalanan || ''}
          onChange={(e) => onChange('maksudPerjalanan', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Pengikut (Optional):
      </div>
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-2.5">
          <label className="block text-xs font-semibold text-slate-700">Daftar Pengikut (Tabel Pengisian)</label>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-indigo-150 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengikut
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 font-medium bg-white shadow-sm">
              Belum ada pengikut. Klik tombol &quot;Tambah Pengikut&quot; di atas untuk menambahkan.
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3 relative hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800 text-xs">
                    Pengikut #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Pengikut"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  <div className="md:col-span-5">
                    <label className={labelClass}>
                      Nama Pengikut
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Nama Lengkap..."
                      value={item.nama}
                      onChange={(e) => handleUpdateItem(index, 'nama', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>
                      Pangkat / Golongan
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Pangkat / Golongan..."
                      value={item.pangkat}
                      onChange={(e) => handleUpdateItem(index, 'pangkat', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className={labelClass}>
                      Jabatan
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Jabatan..."
                      value={item.jabatan}
                      onChange={(e) => handleUpdateItem(index, 'jabatan', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={headerClass}>
        Pembebanan Biaya & Anggaran:
      </div>
      <div>
        <label className={labelClass}>Atas Beban / Instansi Pembeban</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Instansi Pembeban Anggaran..."
          value={fields.instansiPenanggungJawab || ''}
          onChange={(e) => onChange('instansiPenanggungJawab', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Sumber Dana / Mata Anggaran</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Sumber Dana..."
          value={fields.akunAnggaran || ''}
          onChange={(e) => onChange('akunAnggaran', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Keterangan Lain-lain (Baris ke-10):
      </div>
      <div className="md:col-span-2">
        <textarea
          rows={2}
          placeholder="Keterangan Lain-lain..."
          className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none min-h-[60px]"
          value={fields.keteranganLain || ''}
          onChange={(e) => onChange('keteranganLain', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Penerbitan Surat (Dikeluarkan Di):
      </div>
      <div>
        <label className={labelClass}>Dikeluarkan Di</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Tempat Dikeluarkan..."
          value={fields.dikeluarkanDi || ''}
          onChange={(e) => onChange('dikeluarkanDi', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pada Tanggal</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Tanggal Dikeluarkan..."
          value={fields.tanggalDikeluarkan || ''}
          onChange={(e) => onChange('tanggalDikeluarkan', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Tanda Tangan Pejabat Pemberi Perintah (Catatan):
      </div>
      <div>
        <label className={labelClass}>Jabatan Penandatangan</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Jabatan Penandatangan..."
          value={fields.jabatanPemberiPerintah || ''}
          onChange={(e) => onChange('jabatanPemberiPerintah', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Nama Penandatangan</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Nama Penandatangan..."
          value={fields.namaPemberiPerintah || ''}
          onChange={(e) => onChange('namaPemberiPerintah', e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>NIP Penandatangan</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="NIP Penandatangan..."
          value={fields.nipPemberiPerintah || ''}
          onChange={(e) => onChange('nipPemberiPerintah', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Halaman Belakang - A. Tiba di Tempat Tujuan:
      </div>
      <div>
        <label className={labelClass}>Di (Tempat Tujuan)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Tempat Tujuan..."
          value={fields.belakangTibaDi || ''}
          onChange={(e) => onChange('belakangTibaDi', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pada Tanggal Tiba</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Tanggal Tiba..."
          value={fields.belakangTibaTanggal || ''}
          onChange={(e) => onChange('belakangTibaTanggal', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pejabat yang Berwenang (Nama)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Nama Pejabat..."
          value={fields.belakangTibaPejabat || ''}
          onChange={(e) => onChange('belakangTibaPejabat', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>NIP Pejabat</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="NIP Pejabat..."
          value={fields.belakangTibaNip || ''}
          onChange={(e) => onChange('belakangTibaNip', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Halaman Belakang - B. Berangkat dari Tempat Tujuan:
      </div>
      <div>
        <label className={labelClass}>Ke (Tempat Asal / Tujuan Baru)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Tempat Asal / Baru..."
          value={fields.belakangBerangkatKe || ''}
          onChange={(e) => onChange('belakangBerangkatKe', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pada Tanggal Berangkat</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Tanggal Berangkat..."
          value={fields.belakangBerangkatTanggal || ''}
          onChange={(e) => onChange('belakangBerangkatTanggal', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pejabat yang Berwenang (Nama)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Nama Pejabat..."
          value={fields.belakangBerangkatPejabat || ''}
          onChange={(e) => onChange('belakangBerangkatPejabat', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>NIP Pejabat</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="NIP Pejabat..."
          value={fields.belakangBerangkatNip || ''}
          onChange={(e) => onChange('belakangBerangkatNip', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Halaman Belakang - C. Tiba Kembali di Tempat Kedudukan:
      </div>
      <div>
        <label className={labelClass}>Pada Tanggal Tiba Kembali</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Tanggal Tiba Kembali..."
          value={fields.belakangKembaliTanggal || ''}
          onChange={(e) => onChange('belakangKembaliTanggal', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Pejabat yang Berwenang (Nama)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Nama Pejabat..."
          value={fields.belakangKembaliPejabat || ''}
          onChange={(e) => onChange('belakangKembaliPejabat', e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>NIP Pejabat</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="NIP Pejabat..."
          value={fields.belakangKembaliNip || ''}
          onChange={(e) => onChange('belakangKembaliNip', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        Halaman Belakang - D. Catatan Lain-lain & E. Pernyataan & F. Pengesahan:
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>D. Catatan Lain-lain</label>
        <textarea
          rows={2}
          className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none min-h-[60px]"
          placeholder="Catatan lain-lain..."
          value={fields.catatanLain || ''}
          onChange={(e) => onChange('catatanLain', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>E. Nama Yang Diperintah</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Nama..."
          value={fields.belakangPernyataanNama || ''}
          onChange={(e) => onChange('belakangPernyataanNama', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>E. NIP Yang Diperintah</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="NIP..."
          value={fields.belakangPernyataanNip || ''}
          onChange={(e) => onChange('belakangPernyataanNip', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>F. Nama Kepala Sekolah (Pengesah)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Nama..."
          value={fields.belakangPengesahanNama || ''}
          onChange={(e) => onChange('belakangPengesahanNama', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>F. NIP Kepala Sekolah (Pengesah)</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="NIP..."
          value={fields.belakangPengesahanNip || ''}
          onChange={(e) => onChange('belakangPengesahanNip', e.target.value)}
        />
      </div>
    </div>
  );
};

// 8. Form Kuasa PIP
const FormKuasaPIP: React.FC<{
  fields: SuratKuasaPIPPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => {
  const inputClass = "w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50/50 focus:bg-white transition-all shadow-sm outline-none";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
  const headerClass = "md:col-span-2 font-bold text-xs uppercase tracking-wider text-indigo-900 border-b border-indigo-100 pb-1.5 mt-4 first:mt-0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
      <div className={headerClass}>
        I. Identitas Pemberi Kuasa:
      </div>
      <div>
        <label className={labelClass}>Nama Lengkap (Pemberi Kuasa)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Nama Pemberi Kuasa"
          value={fields.namaPemberi || ''}
          onChange={(e) => onChange('namaPemberi', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Tempat / Tanggal Lahir</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Tempat, Tanggal Lahir"
          value={fields.tempatLahirPemberi || ''}
          onChange={(e) => onChange('tempatLahirPemberi', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>NIK (Nomor Induk Kependudukan)</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="Masukkan NIK Pemberi Kuasa"
          value={fields.nikPemberi || ''}
          onChange={(e) => onChange('nikPemberi', e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Alamat Lengkap</label>
        <textarea
          rows={2}
          className={`${inputClass} min-h-[44px]`}
          placeholder="Masukkan Alamat Pemberi Kuasa"
          value={fields.alamatPemberi || ''}
          onChange={(e) => onChange('alamatPemberi', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        II. Identitas Penerima Kuasa:
      </div>
      <div>
        <label className={labelClass}>Nama Lengkap (Penerima Kuasa)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Nama Penerima Kuasa"
          value={fields.namaPenerima || ''}
          onChange={(e) => onChange('namaPenerima', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>Tempat / Tanggal Lahir</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Tempat, Tanggal Lahir"
          value={fields.tempatLahirPenerima || ''}
          onChange={(e) => onChange('tempatLahirPenerima', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>NIK (Nomor Induk Kependudukan)</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="Masukkan NIK Penerima Kuasa"
          value={fields.nikPenerima || ''}
          onChange={(e) => onChange('nikPenerima', e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Alamat Lengkap</label>
        <textarea
          rows={2}
          className={`${inputClass} min-h-[44px]`}
          placeholder="Masukkan Alamat Penerima Kuasa"
          value={fields.alamatPenerima || ''}
          onChange={(e) => onChange('alamatPenerima', e.target.value)}
        />
      </div>

      <div className={headerClass}>
        III. Identitas Siswa & Sekolah (KHUSUS):
      </div>
      <div>
        <label className={labelClass}>Nama Lengkap Siswa</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Nama Siswa"
          value={fields.namaSiswa || ''}
          onChange={(e) => onChange('namaSiswa', e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass}>NISN Siswa</label>
        <input
          type="text"
          className={`${inputClass} font-mono`}
          placeholder="Masukkan NISN Siswa"
          value={fields.nisnSiswa || ''}
          onChange={(e) => onChange('nisnSiswa', e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Nama Sekolah (Kosongkan jika default dari profil sekolah)</label>
        <input
          type="text"
          className={inputClass}
          placeholder="Masukkan Nama Sekolah"
          value={fields.namaSekolahSiswa || ''}
          onChange={(e) => onChange('namaSekolahSiswa', e.target.value)}
        />
      </div>
    </div>
  );
};

// 9. Form Aktif Belajar
const FormAktifBelajar: React.FC<{
  fields: SuratAktifBelajarPayload;
  onChange: (field: string, val: any) => void;
}> = ({ fields, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div>
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Nama Siswa</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 font-bold text-xs"
        value={fields.namaSiswa || ''}
        onChange={(e) => onChange('namaSiswa', e.target.value)}
        placeholder="Masukkan Nama Siswa"
      />
    </div>
    <div>
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Tempat, Tgl Lahir</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
        value={fields.tempatTanggalLahir || ''}
        onChange={(e) => onChange('tempatTanggalLahir', e.target.value)}
        placeholder="Masukkan Tempat, Tgl Lahir (Contoh: Bandung, 12 Mei 2008)"
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block font-semibold text-slate-700 mb-1 text-xs">NIS</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs"
          value={fields.nis || ''}
          onChange={(e) => onChange('nis', e.target.value)}
          placeholder="Masukkan NIS"
        />
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1 text-xs">NISN</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg p-2 font-mono text-xs"
          value={fields.nisn || ''}
          onChange={(e) => onChange('nisn', e.target.value)}
          placeholder="Masukkan NISN"
        />
      </div>
    </div>
    <div>
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Jenis Kelamin</label>
      <select
        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
        value={fields.jenisKelamin || ''}
        onChange={(e) => onChange('jenisKelamin', e.target.value)}
      >
        <option value="">-Pilih Jenis Kelamin-</option>
        <option value="Laki-laki">Laki-laki</option>
        <option value="Perempuan">Perempuan</option>
      </select>
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Kelas</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 font-semibold text-xs"
        value={fields.kelas || ''}
        onChange={(e) => onChange('kelas', e.target.value)}
        placeholder="Masukkan Kelas (Contoh: VI-A)"
      />
    </div>
    <div>
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Jurusan / Program</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
        value={fields.jurusan || ''}
        onChange={(e) => onChange('jurusan', e.target.value)}
        placeholder="Masukkan Jurusan / Program (Kosongkan jika SD)"
      />
    </div>

    <div>
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Tahun Pelajaran</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
        placeholder="Masukkan Tahun Pelajaran (Contoh: 2026/2027)"
        value={fields.tahunPelajaran || ''}
        onChange={(e) => onChange('tahunPelajaran', e.target.value)}
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Alamat Siswa</label>
      <textarea
        rows={2}
        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
        value={fields.alamatSiswa || ''}
        onChange={(e) => onChange('alamatSiswa', e.target.value)}
        placeholder="Masukkan Alamat Siswa"
      />
    </div>

    <div className="md:col-span-2">
      <label className="block font-semibold text-slate-700 mb-1 text-xs">Keperluan Surat</label>
      <textarea
        rows={2}
        placeholder="Masukkan Keperluan Surat (Contoh: Persyaratan Beasiswa / Pembuatan Paspor...)"
        className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 font-medium bg-slate-50 focus:bg-white"
        value={fields.keperluan || ''}
        onChange={(e) => onChange('keperluan', e.target.value)}
      />
    </div>
  </div>
);
