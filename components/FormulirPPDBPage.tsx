'use client';

import React from 'react';
import { SchoolProfile, Siswa } from '../types';
import { KopSuratHeader } from './KopSuratHeader';
import { formatSchoolNameForBody, formatKepsekName } from '../lib/utils';
import { Printer, ArrowLeft } from 'lucide-react';
import { DocumentWatermark } from './DocumentWatermark';
import { SignatureBlock } from './SignatureBlock';

interface FormulirPPDBPageProps {
  profile: SchoolProfile;
  siswaList?: Siswa[];
  onBackToDashboard?: () => void;
}

export const FormulirPPDBPage: React.FC<FormulirPPDBPageProps> = ({
  profile,
  onBackToDashboard,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const SHORT_DOTS = '...........................................';
  const LONG_DOTS = '...............................................................................................................................';

  return (
    <div className="space-y-6 font-sans">
      {/* Top Control Header Bar (Hidden on Print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900">
              Formulir Pendaftaran Peserta Didik Baru (PPDB)
            </h1>
            <p className="text-xs text-slate-500 font-medium">Dokumen cetak resmi untuk pendaftaran calon siswa baru</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen (Print)</span>
        </button>
      </div>

      {/* Live Printable A4 Document Sheet (Full Width Preview) */}
      <div className="flex justify-center bg-slate-200/80 p-3 sm:p-6 rounded-2xl border border-slate-300 overflow-x-auto print:border-none print:shadow-none print:p-0 print:m-0 print:bg-transparent print:rounded-none print:w-full">
        {/* A4 Paper Canvas */}
        <div
          id="printable-ppdb-document"
          className="bg-white w-[210mm] min-h-[297mm] p-[12mm] sm:p-[15mm] shadow-2xl border border-gray-300 font-times text-black text-[12px] sm:text-[12.5px] leading-snug relative flex flex-col justify-between overflow-hidden print:border-none print:shadow-none print:rounded-none"
        >
          {/* Background Watermark Logo Sekolah (Layar & Cetak Multi-Halaman) */}
          <DocumentWatermark profile={profile} />

          {/* Document Content Wrapper */}
          <div className="relative z-10 flex flex-col justify-between flex-1">
            {/* Kop Surat Header */}
          <div>
            <KopSuratHeader profile={profile} />

            {/* Document Title */}
            <div className="text-center my-3">
              <h1 className="font-extrabold text-base sm:text-lg uppercase tracking-wide leading-tight">
                FORMULIR PENDAFTARAN PESERTA DIDIK BARU (PPDB)
              </h1>
              <p className="text-xs font-bold uppercase mt-0.5 tracking-wider">
                TAHUN AJARAN {new Date().getFullYear()} / {new Date().getFullYear() + 1}
              </p>
            </div>

            {/* Content Body Sections */}
            <div className="space-y-3 text-justify font-normal">

              {/* A. DATA PESERTA DIDIK */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  A. DATA PESERTA DIDIK
                </h3>
                
                {/* 2 Kolom Berdampingan */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal mb-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Nama Lengkap</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">NISN</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">NIK</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Tempat, Tanggal Lahir</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Agama</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Kewarganegaraan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">Indonesia</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Anak Ke-</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Tinggal Bersama</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Moda Transportasi</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Jenis Kelamin</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        [ &nbsp; ] L &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] P
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">No. HP / WA</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Desa / Kelurahan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Kecamatan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Kabupaten / Kota</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Provinsi</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Kode Pos</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Hobi</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Cita-cita</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>
                </div>

                {/* Full Width Address Lines */}
                <div className="space-y-1 text-[12px] font-normal pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Alamat Lengkap</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">RT / RW</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 font-normal text-slate-800">
                      RT .......... / RW ..........
                    </span>
                  </div>
                </div>
              </div>

              {/* B. DATA ORANG TUA / WALI (Side-by-Side: Ayah Kandung & Ibu Kandung) */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  B. DATA ORANG TUA / WALI
                </h3>
                
                {/* 2 Side-by-side Columns: Left = Ayah Kandung, Right = Ibu Kandung */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal mb-2">
                  {/* Left Column: 1. Ayah Kandung */}
                  <div className="space-y-1">
                    <p className="font-bold underline text-[11.5px] mb-1">1. Ayah Kandung</p>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Nama Ayah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">NIK Ayah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Tahun Lahir</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Pendidikan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Pekerjaan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Penghasilan Bulanan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">No. HP / WA</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>

                  {/* Right Column: 2. Ibu Kandung */}
                  <div className="space-y-1">
                    <p className="font-bold underline text-[11.5px] mb-1">2. Ibu Kandung</p>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Nama Ibu</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">NIK Ibu</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Tahun Lahir</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Pendidikan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Pekerjaan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Penghasilan Bulanan</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">No. HP / WA</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Wali (jika ada) */}
                <div className="pt-0.5 border-t border-gray-200 mt-1">
                  <p className="font-bold underline text-[11.5px] mb-1">3. Wali (jika ada)</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="w-36 shrink-0 font-normal">Nama Wali</span>
                        <span className="w-3 shrink-0 text-center">:</span>
                        <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="w-36 shrink-0 font-normal">NIK Wali</span>
                        <span className="w-3 shrink-0 text-center">:</span>
                        <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="w-36 shrink-0 font-normal">Pendidikan Wali</span>
                        <span className="w-3 shrink-0 text-center">:</span>
                        <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="w-36 shrink-0 font-normal">Pekerjaan Wali</span>
                        <span className="w-3 shrink-0 text-center">:</span>
                        <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="w-36 shrink-0 font-normal">Penghasilan Bulanan</span>
                        <span className="w-3 shrink-0 text-center">:</span>
                        <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="w-36 shrink-0 font-normal">No. HP / WA Wali</span>
                        <span className="w-3 shrink-0 text-center">:</span>
                        <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* C. DATA PERIODIK */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  C. DATA PERIODIK
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal mb-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Tinggi Badan (cm)</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        .......... cm
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Berat Badan (kg)</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        .......... kg
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Jumlah Saudara Kandung</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        .......... orang
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Jarak ke Sekolah (km)</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        [ &nbsp; ] &lt; 1 KM &nbsp;&nbsp;&nbsp; [ &nbsp; ] &gt; 1 KM
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Waktu Tempuh (menit)</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        .......... menit
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Moda Transportasi</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* D. PILIHAN SEKOLAH & ASAL PENDIDIKAN */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  D. PILIHAN SEKOLAH & ASAL PENDIDIKAN
                </h3>
                <div className="space-y-1 text-[12px] font-normal">
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Nama Sekolah Tujuan</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 font-bold text-black uppercase">
                      {formatSchoolNameForBody(profile.namaSekolah || 'SD NEGERI MARGAASIH')}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Nama TK / PAUD Asal</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Alamat TK / PAUD</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                </div>
              </div>

              {/* E. DATA PENDUKUNG (KHUSUS SISWA PINDAHAN DARI SEKOLAH LAIN ( SD LAIN)) */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  E. DATA PENDUKUNG (KHUSUS SISWA PINDAHAN DARI SEKOLAH LAIN ( SD LAIN))
                </h3>
                
                {/* 2 Kolom Berdampingan */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal mb-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Asal Sekolah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">NPSN Sekolah Asal</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Kelas Terakhir</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Nomor Surat Pindah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Tanggal Surat Pindah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Status Mutasi Dapodik</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        [ &nbsp; ] Sudah &nbsp;&nbsp;&nbsp; [ &nbsp; ] Belum
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">No. Mutasi Dapodik</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Alasan Pindah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>
                </div>

                {/* Full Width Address Line for Sekolah Asal */}
                <div className="space-y-1 text-[12px] font-normal pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Alamat Sekolah Asal</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                </div>
              </div>

              {/* F. KELENGKAPAN BERKAS PERSYARATAN (HALAMAN 2) */}
              <div
                className="break-before-page pt-4 mt-6 border-t-2 border-dashed border-slate-300 print:border-none print:pt-4 print:mt-0 font-normal relative overflow-hidden min-h-[245mm]"
                style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
              >
                {/* Background Watermark Logo Sekolah Halaman 2 */}
                <DocumentWatermark profile={profile} />

                <div className="relative z-10">
                  {/* Screen Visual Indicator for Page 2 */}
                  <div className="no-print mb-3 flex items-center justify-center">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
                      📄 HALAMAN 2: KELENGKAPAN BERKAS & PERNYATAAN ORANG TUA / WALI
                    </span>
                  </div>

                  <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                    F. KELENGKAPAN BERKAS PERSYARATAN
                  </h3>
                <div className="grid grid-cols-2 gap-4 text-[11.5px]">
                  {/* Box 1: Peserta Didik Baru */}
                  <div className="border border-black/70 p-2.5 rounded-xs space-y-1">
                    <p className="font-bold underline text-[11.5px] leading-none mb-0.5">
                      1. Peserta Didik Baru
                    </p>
                    <p className="text-[10px] italic text-slate-700 mb-1.5">
                      (centang yang sudah dilampirkan)
                    </p>
                    <div className="space-y-0.5 font-normal">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi Kartu Keluarga</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi Akta Kelahiran</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi KTP Orang Tua / Wali</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Pas Foto (3x4)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi Kartu KIP / PKH (jika ada)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi Kartu Imunisasi (jika ada)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Surat Ket. Lulus / Belajar TK / PAUD</span>
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Siswa Pindahan */}
                  <div className="border border-black/70 p-2.5 rounded-xs space-y-1">
                    <p className="font-bold underline text-[11.5px] leading-none mb-0.5">
                      2. Siswa Pindahan
                    </p>
                    <p className="text-[10px] italic text-slate-700 mb-1.5">
                      (centang yang sudah dilampirkan)
                    </p>
                    <div className="space-y-0.5 font-normal">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi Kartu Keluarga</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi Akta Kelahiran</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi KTP Orang Tua / Wali</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Pas Foto (3x4)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Surat Pindah Sekolah (asli)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Surat Rekomendasi Sekolah Asal</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Fotokopi Raport Terakhir</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px]">[ &nbsp; ]</span>
                        <span>Surat Ket. Kelakuan Baik</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-mono text-[11px] shrink-0 mt-0.5">[ &nbsp; ]</span>
                        <span>Surat Mutasi Dapodik <span className="font-bold text-[10px] uppercase text-black block leading-tight">(BUKTI Sudah Di Mutasi di Dapodik)</span></span>
                      </div>
                    </div>
                  </div>
                </div>

              {/* G. PERNYATAAN ORANG TUA / WALI */}
              <div className="mt-3">
                <h3 className="font-bold text-xs uppercase mb-1 border-b border-black/40 pb-0.5">
                  G. PERNYATAAN ORANG TUA / WALI
                </h3>
                <p className="text-justify text-[12px] leading-snug font-normal">
                  Dengan ini saya menyatakan bahwa data yang diisikan dalam formulir pendaftaran ini adalah benar dan dapat dipertanggungjawabkan.
                  Apabila di kemudian hari terbukti data tersebut tidak benar, saya bersedia menerima sanksi sesuai ketentuan yang berlaku.
                </p>
              </div>

              {/* Signatures Footer Block (Guaranteed 1-Page Fitting & Perfect Row Alignment) */}
              <div className="mt-3 text-[12.5px] leading-relaxed break-inside-avoid print:break-inside-avoid">
                <div className="grid grid-cols-2 text-center gap-8 items-start">
                  {/* Left Column: Orang Tua / Wali Siswa */}
                  <div className="flex flex-col items-center justify-start text-center w-full">
                    {/* Row 1: City & Date Placeholder */}
                    <p className="text-[13.5px] sm:text-sm mb-0.5 font-normal leading-tight opacity-0 select-none">
                      &nbsp;
                    </p>
                    {/* Row 2: Position Title (Orang Tua / Wali Siswa,) */}
                    <p className="font-normal text-[13.5px] sm:text-sm leading-tight mb-0.5">
                      Orang Tua / Wali Siswa,
                    </p>
                    {/* Row 3: School Name Placeholder */}
                    {profile.namaSekolah && (
                      <p className="font-normal text-[13.5px] sm:text-sm leading-tight opacity-0 select-none mb-0.5">
                        &nbsp;
                      </p>
                    )}
                    {/* Row 4: Signature Space - Exact Same Height as SignatureBlock */}
                    <div className="relative my-0.5 h-18 sm:h-20 flex items-center justify-center w-full">
                      <div className="h-16 sm:h-18 w-full"></div>
                    </div>
                    {/* Row 5: Name Line */}
                    <p className="font-bold text-[13.5px] sm:text-sm tracking-wide leading-snug mb-0.5">
                      ( ................................................................ )
                    </p>
                    {/* Row 6: Pangkat Placeholder (if any) */}
                    {profile.pangkatKepsek && (
                      <p className="text-[13.5px] sm:text-sm opacity-0 select-none leading-snug">
                        &nbsp;
                      </p>
                    )}
                    {/* Row 7: NIP Placeholder */}
                    <p className="text-[13.5px] sm:text-sm font-normal opacity-0 select-none leading-snug">
                      &nbsp;
                    </p>
                  </div>

                  {/* Right Column: Kepala Sekolah */}
                  <div className="flex flex-col items-center justify-start text-center w-full">
                    <SignatureBlock
                      profile={profile}
                      customPositionTitle="Kepala Sekolah"
                      alignRight={false}
                      alignCenter={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
);
};
