'use client';

import React from 'react';
import { SchoolProfile } from '../types';
import { KopSuratHeader } from './KopSuratHeader';
import { SignatureBlock } from './SignatureBlock';
import { DocumentWatermark } from './DocumentWatermark';
import { formatSchoolNameForBody, formatKepsekName } from '../lib/utils';
import { Printer, ArrowLeft } from 'lucide-react';

interface PersyaratanMutasiPageProps {
  profile: SchoolProfile;
  siswaList?: any[];
  onBackToDashboard?: () => void;
}

export const PersyaratanMutasiPage: React.FC<PersyaratanMutasiPageProps> = ({
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
      {/* Top Header Control Bar (Hidden on Print) */}
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
              Formulir Pendaftaran Siswa Pindahan (Mutasi)
            </h1>
            <p className="text-xs text-slate-500 font-medium">Dokumen cetak resmi untuk pendaftaran mutasi siswa masuk</p>
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
          id="printable-mutasi-document"
          className="bg-white w-[210mm] min-h-[297mm] p-[12mm] sm:p-[15mm] shadow-2xl border border-gray-300 font-times text-black text-[12.5px] sm:text-[13px] leading-snug relative flex flex-col justify-between overflow-hidden print:border-none print:shadow-none print:rounded-none"
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
                FORMULIR PENDAFTARAN SISWA PINDAHAN (MUTASI)
              </h1>
            </div>

            {/* Content Body Sections */}
            <div className="space-y-3.5 text-justify font-normal">

              {/* A. IDENTITAS SISWA */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  A. IDENTITAS SISWA
                </h3>
                
                {/* Grid 2 Kolom dengan Lebar Label Uniform (w-44) */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal mb-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Nama Lengkap Siswa</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Tempat, Tgl Lahir</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Agama</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Nama Asal Sekolah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">NISN</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Jenis Kelamin</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 font-normal text-slate-800">
                        [ &nbsp; ] L &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ &nbsp; ] P
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Diterima di Kelas</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Tgl Mulai Belajar</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>
                </div>

                {/* Full Width Address Lines (Label width w-44 so colon lines up 100% with Column 1) */}
                <div className="space-y-1 text-[12px] font-normal pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Alamat Tempat Tinggal Siswa</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal"></span>
                    <span className="w-3 shrink-0 text-center"></span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Alamat Lengkap Sekolah Asal</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                </div>
              </div>

              {/* B. DATA ORANG TUA / WALI */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  B. DATA ORANG TUA / WALI
                </h3>
                
                {/* Grid 2 Kolom dengan Lebar Label Uniform (w-44) */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal mb-1">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Nama Ayah Kandung</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Nama Ibu Kandung</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">Nama Wali (jika ada)</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Pekerjaan Ayah</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">Pekerjaan Ibu</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">No. HP / WhatsApp</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>
                </div>

                {/* Full Width Address Line for Ortu / Wali (Label width w-44 so colon lines up 100% with Column 1) */}
                <div className="space-y-1 text-[12px] font-normal pt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal">Alamat Tempat Tinggal Ortu</span>
                    <span className="w-3 shrink-0 text-center">:</span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="w-44 shrink-0 font-normal"></span>
                    <span className="w-3 shrink-0 text-center"></span>
                    <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</span>
                  </div>
                </div>
              </div>

              {/* C. DATA ADMINISTRASI & KELENGKAPAN BERKAS */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1.5 border-b border-black/40 pb-0.5">
                  C. DATA ADMINISTRASI & KELENGKAPAN BERKAS
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] font-normal mb-2">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">No. Kartu Keluarga (KK)</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="w-44 shrink-0 font-normal">No. Surat Pindah Asal</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="w-36 shrink-0 font-normal">No. Akta Kelahiran</span>
                      <span className="w-3 shrink-0 text-center">:</span>
                      <span className="flex-1 overflow-hidden font-normal text-slate-800 tracking-wider">{SHORT_DOTS}</span>
                    </div>
                  </div>
                </div>

                {/* Checkbox Grid 2 Kolom */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px] pl-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">[ &nbsp; ]</span>
                    <span>Fotokopi KK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">[ &nbsp; ]</span>
                    <span>Fotokopi Akta Kelahiran</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">[ &nbsp; ]</span>
                    <span>Fotokopi KTP Orang Tua</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">[ &nbsp; ]</span>
                    <span>Fotokopi Rapor Legalisir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">[ &nbsp; ]</span>
                    <span>Surat Pindah Sekolah Asal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">[ &nbsp; ]</span>
                    <span>Surat Mutasi Dapodik</span>
                  </div>
                </div>
              </div>

              {/* D. ALASAN PINDAH SEKOLAH */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1 border-b border-black/40 pb-0.5">
                  D. ALASAN PINDAH SEKOLAH
                </h3>
                <div className="space-y-1 text-[12px] font-normal pt-0.5">
                  <div className="w-full overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</div>
                  <div className="w-full overflow-hidden font-normal text-slate-800 tracking-wider">{LONG_DOTS}</div>
                </div>
              </div>

              {/* E. PERNYATAAN ORANG TUA / WALI */}
              <div>
                <h3 className="font-bold text-xs uppercase mb-1 border-b border-black/40 pb-0.5">
                  E. PERNYATAAN ORANG TUA / WALI
                </h3>
                <p className="text-justify text-[12px] leading-snug font-normal">
                  Saya yang bertanda tangan di bawah ini menyatakan bahwa seluruh data yang saya isikan di atas adalah benar dan sah.
                  Apabila di kemudian hari terdapat ketidaksesuaian data, saya bersedia menerima ketentuan dan prosedur yang berlaku.
                </p>
              </div>
            </div>

            {/* Signatures Footer Block */}
            <div className="mt-5 text-[12.5px] leading-relaxed">
              <div className="grid grid-cols-2 text-center gap-8 items-start">
                {/* Left Column: Orang Tua / Wali */}
                <div className="flex flex-col items-center justify-start text-center w-full">
                  {/* Row 1: City & Date Placeholder */}
                  <p className="text-[13.5px] sm:text-sm mb-0.5 font-normal leading-tight opacity-0 select-none">
                    &nbsp;
                  </p>
                  {/* Row 2: Position Title */}
                  <p className="font-normal text-[13.5px] sm:text-sm leading-tight mb-0.5">
                    Orang Tua / Wali Siswa,
                  </p>
                  {/* Row 3: School Name Placeholder */}
                  {profile.namaSekolah && (
                    <p className="font-normal text-[13.5px] sm:text-sm leading-tight opacity-0 select-none mb-0.5">
                      &nbsp;
                    </p>
                  )}
                  {/* Row 4: Signature Space */}
                  <div className="relative my-0.5 h-18 sm:h-20 flex items-center justify-center w-full">
                    <div className="h-16 sm:h-18 w-full"></div>
                  </div>
                  {/* Row 5: Name Line */}
                  <p className="font-bold text-[13.5px] sm:text-sm tracking-wide leading-snug mb-0.5">
                    ( ................................................................ )
                  </p>
                  {/* Row 6: Pangkat Placeholder */}
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
  );
};
