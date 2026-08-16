'use client';

import React from 'react';
import { KopSuratHeader } from './KopSuratHeader';
import { SignatureBlock } from './SignatureBlock';
import { formatSchoolNameForBody, formatNominalPIP, formatKelasTerbilang, formatTahunPelajaran, padIndonesianDate, formatDateWithZero, formatKepsekName } from '../lib/utils';
import {
  SchoolProfile,
  LetterCategory,
  SuratMutasiPayload,
  SuratKeteranganPIPPayload,
  SuratPenerimaanPindahanPayload,
  SuratTugasPayload,
  SuratAktifMengajarPayload,
  SuratPembagianTugasPayload,
  SuratPerjalananDinasPayload,
  SuratKuasaPIPPayload,
  SuratAktifBelajarPayload,
} from '../types';

import { DocumentWatermark } from './DocumentWatermark';

interface LetterPreviewProps {
  profile: SchoolProfile;
  category: LetterCategory;
  payload: any;
}

export const LetterPreview: React.FC<LetterPreviewProps> = ({
  profile,
  category,
  payload,
}) => {
  const isMultiPageDocument = category === 'pembagian_tugas' || category === 'perjalanan_dinas';

  return (
    <div
      id="printable-document"
      className="a4-paper font-times text-black text-sm relative print:border-none print:shadow-none print:outline-none print:rounded-none"
    >
      {/* Background Watermark Logo Sekolah (Untuk Dokumen 1 Halaman) */}
      {!isMultiPageDocument && <DocumentWatermark profile={profile} />}

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* 1. SURAT MUTASI SISWA */}
        {category === 'mutasi' && (
          <RenderSuratMutasi profile={profile} data={payload as SuratMutasiPayload} />
        )}

        {/* 2. SURAT KETERANGAN PIP */}
        {category === 'keterangan_pip' && (
          <RenderSuratPIP profile={profile} data={payload as SuratKeteranganPIPPayload} />
        )}

        {/* 3. SURAT PENERIMAAN SISWA PINDAHAN */}
        {category === 'penerimaan_pindahan' && (
          <RenderSuratPenerimaan
            profile={profile}
            data={payload as SuratPenerimaanPindahanPayload}
          />
        )}

        {/* 4. SURAT TUGAS */}
        {category === 'surat_tugas' && (
          <RenderSuratTugas profile={profile} data={payload as SuratTugasPayload} />
        )}

        {/* 5. SURAT AKTIF MENGAJAR */}
        {category === 'aktif_mengajar' && (
          <RenderSuratAktifMengajar
            profile={profile}
            data={payload as SuratAktifMengajarPayload}
          />
        )}

        {/* 6. SURAT PEMBAGIAN TUGAS */}
        {category === 'pembagian_tugas' && (
          <RenderSuratPembagianTugas
            profile={profile}
            data={payload as SuratPembagianTugasPayload}
          />
        )}

        {/* 7. SURAT PERJALANAN DINAS (SPD) */}
        {category === 'perjalanan_dinas' && (
          <RenderSuratPerjalananDinas
            profile={profile}
            data={payload as SuratPerjalananDinasPayload}
          />
        )}

        {/* 8. SURAT KUASA PIP */}
        {category === 'kuasa_pip' && (
          <RenderSuratKuasaPIP profile={profile} data={payload as SuratKuasaPIPPayload} />
        )}

        {/* 9. SURAT AKTIF BELAJAR */}
        {category === 'aktif_belajar' && (
          <RenderSuratAktifBelajar
            profile={profile}
            data={payload as SuratAktifBelajarPayload}
          />
        )}
      </div>
    </div>
  );
};

/* --- HELPER COMPONENTS --- */
const EMPTY = '........................................';
const LONG_EMPTY = '.......................................................................';

function renderFieldValue(value: React.ReactNode, fallback: string = EMPTY): React.ReactNode {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' && !value.trim()) return fallback;
  if (React.isValidElement(value)) {
    const props = value.props as { children?: React.ReactNode };
    if (!props.children || props.children === '' || (typeof props.children === 'string' && !props.children.trim())) {
      return fallback;
    }
  }
  return value;
}

const Field = ({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) => (
  <div className="flex items-baseline gap-0.5 whitespace-nowrap">
    <span className="w-[140px]">{label}</span>
    <span className="flex-shrink-0">: {renderFieldValue(value)}</span>
  </div>
);

const FieldLong = ({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) => (
  <div className="flex items-baseline gap-0.5 whitespace-nowrap">
    <span className="w-[170px]">{label}</span>
    <span className="flex-shrink-0">: {renderFieldValue(value)}</span>
  </div>
);

/* --- SUB RENDERERS FOR EACH LETTER TYPE --- */

// 1. SURAT MUTASI SISWA
const RenderSuratMutasi: React.FC<{ profile: SchoolProfile; data: SuratMutasiPayload }> = ({
  profile,
  data,
}) => {
  const locationName = profile.kecamatan || profile.kota.replace('Kota ', '').replace('Kabupaten ', '');
  const schoolBodyName = formatSchoolNameForBody(profile.namaSekolah);

  const formatAddress = (alamat?: string, desa?: string, kec?: string, kab?: string) => {
    const parts: string[] = [];
    if (alamat && alamat.trim()) parts.push(alamat.trim());
    if (desa && desa.trim() && !alamat?.toLowerCase().includes(desa.toLowerCase())) parts.push(`Desa/Kel. ${desa.trim()}`);
    if (kec && kec.trim() && !alamat?.toLowerCase().includes(kec.toLowerCase())) parts.push(`Kec. ${kec.trim()}`);
    if (kab && kab.trim() && !alamat?.toLowerCase().includes(kab.toLowerCase())) parts.push(`Kab/Kota ${kab.trim()}`);
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const fullAlamatSiswa = formatAddress(data.alamatSiswa, data.desaSiswa, data.kecamatanSiswa, data.kabupatenSiswa);
  const fullAlamatOrangTua = formatAddress(data.alamatOrangTua, data.desaOrangTua, data.kecamatanOrangTua, data.kabupatenOrangTua) || fullAlamatSiswa;
  const fullAlamatSekolahTujuan = formatAddress(data.alamatSekolahTujuan, data.desaSekolahTujuan, data.kecamatanSekolahTujuan, data.kabupatenSekolahTujuan);

  return (
    <div className="text-slate-900 leading-snug text-[11.5px] font-normal">
      <KopSuratHeader profile={profile} />

      {/* Header Title */}
      <div className="text-center my-1">
        <h2 className="font-bold text-sm sm:text-base uppercase underline tracking-wider">
          SURAT KETERANGAN PINDAH SEKOLAH
        </h2>
        <p className="text-[11px] font-normal">Nomor: {data.nomorSurat || EMPTY}</p>
      </div>

      {/* Intro */}
      <p className="mb-1 text-justify">
        Yang bertanda tangan di bawah ini Kepala {schoolBodyName}
        {profile.kelurahan ? `, Desa ${profile.kelurahan}` : ''}
        {profile.kecamatan ? ` Kecamatan ${profile.kecamatan}` : ''}
        {profile.kota ? ` ${profile.kota}` : ''}, menerangkan bahwa siswa :
      </p>

      {/* Data Siswa */}
      <div className="ml-4 sm:ml-6 mb-1 space-y-0 text-[11.5px]">
        <Field label="Nama" value={<span className="font-bold">{data.namaSiswa || ''}</span>} />
        <Field label="Tempat, tanggal lahir" value={data.tempatTanggalLahir || ''} />
        <Field label="NIS / NISN" value={data.nis ? `${data.nis} / ${data.nisn}` : (data.nisn || '')} />
        <Field label="Kelas saat ini" value={data.kelas || ''} />
        <Field label="Jenis Kelamin" value={data.jenisKelamin || ''} />
        <Field label="Alamat" value={fullAlamatSiswa || ''} />
      </div>

      {/* Permohonan Orang Tua */}
      <p className="mb-1 text-justify">
        Sesuai surat permohonan pindah sekolah yang diajukan oleh orang tua / wali murid tersebut di bawah ini :
      </p>

      {/* Data Orang Tua */}
      <div className="ml-4 sm:ml-6 mb-1 space-y-0 text-[11.5px]">
        <Field label="Nama" value={<span className="font-bold">{data.namaOrangTua || ''}</span>} />
        <Field label="Pekerjaan" value={data.pekerjaanOrangTua || ''} />
        <Field label="Alamat" value={fullAlamatOrangTua || ''} />
      </div>

      {/* Sekolah Tujuan & Alasan */}
      <p className="mb-1 text-justify">
        Untuk pindah sekolah ke <span>{data.sekolahTujuan || EMPTY}</span> dengan alasan <span>{data.alasanPindah || EMPTY}</span>.
      </p>

      <p className="mb-1 text-justify">
        Bersama ini kami sertakan Buku Laporan Penilaian Hasil Belajar (RAPOR) siswa yang bersangkutan dan surat permohonan pindah orang tua / wali murid.
      </p>

      {/* TTD 1 */}
      <SignatureBlock
        profile={profile}
        compact={true}
        customCityDate={data.customCityDate || (data.tanggalPindah ? `${locationName}, ${data.tanggalPindah}` : undefined)}
      />

      {/* Separator Notice */}
      <div className="border-t border-b border-dashed border-slate-400 py-0.5 my-1 text-center text-[9.5px] sm:text-[10px] italic text-slate-700 leading-tight">
        <p>Setelah siswa tersebut diterima di sekolah yang bersangkutan, mohon isian di bawah ini diisi dan segera dikirim pada kami.</p>
      </div>

      {/* Slip Balasan Telah Menerima Siswa Pindahan */}
      <div className="pt-0.5 text-[11.5px] font-normal">
        <h3 className="font-bold text-center text-xs uppercase underline mb-1">
          SURAT KETERANGAN TELAH MENERIMA SISWA PINDAHAN
        </h3>

        <p className="mb-0.5">Yang bertanda tangan dibawah ini, Kepala Sekolah dari :</p>
        <div className="ml-4 sm:ml-6 mb-1 space-y-0 text-[11.5px]">
          <Field label="Nama Sekolah" value={data.sekolahTujuan || ''} />
          <Field label="NSS / NPSN" value="" />
          <Field label="Alamat" value={fullAlamatSekolahTujuan || data.alamatSekolahTujuan || ''} />
        </div>

        <p className="mb-0.5">Menerangkan telah menerima pindahan siswa dari <span>{schoolBodyName}</span> di bawah ini :</p>
        <div className="ml-4 sm:ml-6 mb-1 space-y-0 text-[11.5px]">
          <Field label="Nama" value={<span className="font-bold">{data.namaSiswa || ''}</span>} />
          <Field label="No. Induk / NISN" value={data.nis ? `${data.nis} / ${data.nisn}` : (data.nisn || '')} />
          <Field label="Jenis Kelamin" value={data.jenisKelamin || ''} />
          <Field label="Kelas" value={data.kelas || ''} />
        </div>

        <p className="mb-1 text-justify text-[11px] leading-tight">
          Sesuai dengan surat keterangan pindah sekolah yang Bapak / Ibu kirimkan kepada kami. Kemudian harap lembar ini dapat digunakan sesuai dengan keperluan administrasi Sekolah.
        </p>

        {/* TTD 2 Feedback Slip */}
        <div className="flex justify-end text-[11.5px] font-normal pt-0.5">
          <div className="w-64 text-left">
            <p>........................................., 20....</p>
            <p className="mt-0.5">Kepala Sekolah</p>

            <div className="h-8 my-0.5"></div>

            <p className="font-bold underline w-full inline-block">....................................................</p>
            <p className="mt-0.5">NIP. ....................................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. SURAT KETERANGAN PIP
const RenderSuratPIP: React.FC<{
  profile: SchoolProfile;
  data: SuratKeteranganPIPPayload;
}> = ({ profile, data }) => (
  <div className="font-normal">
    <KopSuratHeader profile={profile} />

    <div className="text-center my-4 font-normal">
      <h2 className="font-bold text-base uppercase underline tracking-wider">
        SURAT KETERANGAN PENCARIAN DANA PIP
      </h2>
      <p className="text-xs font-normal">Nomor: {data.nomorSurat || EMPTY}</p>
    </div>

    <p className="mb-3 font-normal">
      Yang bertanda tangan di bawah ini Kepala {formatSchoolNameForBody(profile.namaSekolah)}, menerangkan dengan
      sebenarnya bahwa:
    </p>

    <div className="ml-6 mb-4 space-y-1 font-normal">
      <Field label="Nama Siswa" value={<span className="font-bold">{data.namaSiswa  || ''}</span>} />
      <Field label="NISN" value={data.nisn  || ''} />
      <Field label="Kelas / Tingkat" value={formatKelasTerbilang(data.kelas)  || ''} />
      <Field label="Tempat, Tgl Lahir" value={data.tempatTanggalLahir  || ''} />
      <Field label="Nama Orang Tua/Wali" value={<span className="font-bold">{data.namaOrangTua  || ''}</span>} />
      <Field label="No. Rekening SimPel" value={<span className="font-mono font-normal">{data.noRekeningPIP  || ''}</span>} />
      <Field label="Bank Penyalur" value={data.namaBank  || ''} />
      <Field label="Nominal Bantuan" value={<span className="font-normal text-indigo-950">{data.nominalBantuan || ''}</span>} />
    </div>

    <p className="mb-3 text-justify font-normal">
      Nama siswa yang tercantum di atas adalah benar-benar siswa aktif yang terdaftar di{' '}
      {formatSchoolNameForBody(profile.namaSekolah)} dan merupakan penerima Manfaat Program Indonesia Pintar (PIP) Tahun
      Pelajaran {formatTahunPelajaran(data.tahunPelajaran || data.tahunAnggaran)}.
    </p>

    <p className="mb-4 text-justify font-normal">
      Surat keterangan ini diberikan kepada yang bersangkutan untuk keperluan:{' '}
      <span>{data.keperluan || EMPTY}</span> pada bank penyalur resmi.
    </p>

    <p className="mb-6 font-normal">
      Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana
      mestinya.
    </p>

    {/* Table Tempat & Tanggal Khusus Surat Keterangan PIP */}
    <div className="flex justify-end mt-6 mb-2 font-normal">
      <div className="w-80">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr>
              <td className="py-0.5 w-28 font-normal text-left">Dikeluarkan di</td>
              <td className="py-0.5 w-4 text-center">:</td>
              <td className="py-0.5 text-left font-normal">
                {data.customCityDate && data.customCityDate.includes(',')
                  ? data.customCityDate.split(',')[0].trim()
                  : data.customCityDate || profile.kota.replace('Kota ', '').replace('Kabupaten ', '')}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 font-normal text-left">Pada tanggal</td>
              <td className="py-0.5 text-center">:</td>
              <td className="py-0.5 text-left font-normal">
                {data.customCityDate && data.customCityDate.includes(',')
                  ? padIndonesianDate(data.customCityDate.split(',').slice(1).join(',').trim())
                  : formatDateWithZero(new Date())}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="border-b-2 border-black mt-1 mb-2 w-full"></div>
      </div>
    </div>

    <SignatureBlock profile={profile} hideCityDate={true} customCityDate={data.customCityDate} />
  </div>
);

// 3. SURAT PENERIMAAN SISWA PINDAHAN
const RenderSuratPenerimaan: React.FC<{
  profile: SchoolProfile;
  data: SuratPenerimaanPindahanPayload;
}> = ({ profile, data }) => {
  const schoolBodyName = formatSchoolNameForBody(profile.namaSekolah);

  const formatAddress = (alamat?: string, kel?: string, kec?: string, kota?: string) => {
    const parts: string[] = [];
    if (alamat && alamat.trim()) parts.push(alamat.trim());
    if (kel && kel.trim() && !alamat?.toLowerCase().includes(kel.toLowerCase())) parts.push(`Desa/Kel. ${kel.trim()}`);
    if (kec && kec.trim() && !alamat?.toLowerCase().includes(kec.toLowerCase())) parts.push(`Kec. ${kec.trim()}`);
    if (kota && kota.trim() && !alamat?.toLowerCase().includes(kota.toLowerCase())) parts.push(`${kota.trim()}`);
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const fullAlamatSekolah = formatAddress(profile.alamat, profile.kelurahan, profile.kecamatan, profile.kota);

  // Dikeluarkan di & Tanggal
  const defaultCity = profile.kota ? profile.kota.replace('Kota ', '').replace('Kabupaten ', '') : '';
  const defaultDateStr = formatDateWithZero(new Date());

  let dikeluarkanDi = defaultCity || EMPTY;
  let tanggalSurat = defaultDateStr;

  if (data.customCityDate) {
    if (data.customCityDate.includes(',')) {
      const parts = data.customCityDate.split(',');
      dikeluarkanDi = parts[0].trim() || dikeluarkanDi;
      const datePart = parts.slice(1).join(',').trim();
      if (datePart) tanggalSurat = padIndonesianDate(datePart);
    } else {
      dikeluarkanDi = data.customCityDate.trim();
    }
  }

  const nisNisnStr = data.nis ? `${data.nis} / ${data.nisn}` : (data.nisn || '');
  const jenisKelaminStr = data.jenisKelamin === 'L' ? 'Laki-laki' : data.jenisKelamin === 'P' ? 'Perempuan' : (data.jenisKelamin || '');

  return (
    <div className="text-slate-900 leading-snug text-[11.5px] font-normal">
      <KopSuratHeader profile={profile} />

      {/* Header Title */}
      <div className="text-center my-2 font-normal">
        <h2 className="font-bold text-sm sm:text-base uppercase underline tracking-wider">
          SURAT KETERANGAN PENERIMAAN SISWA PINDAHAN (MUTASI MASUK)
        </h2>
        <p className="text-[11px] font-normal mt-0.5">
          Nomor: {data.nomorSurat || EMPTY}
        </p>
      </div>

      {/* 1. Yang bertanda tangan di bawah ini */}
      <p className="mb-1 font-normal">Yang bertanda tangan di bawah ini:</p>
      <div className="ml-4 sm:ml-6 mb-1.5 space-y-0.5 font-normal text-[11.5px]">
        <Field label="Nama" value={<span className="font-bold">{formatKepsekName(profile.namaKepsek) || ''}</span>} />
        <Field label="NIP" value={profile.nipKepsek || ''} />
        <Field label="Jabatan" value="Kepala Sekolah" />
        <Field label="Nama Sekolah" value={schoolBodyName || ''} />
        <Field label="Alamat Sekolah" value={fullAlamatSekolah || profile.alamat || ''} />
      </div>

      {/* 2. Dengan ini menerangkan bahwa */}
      <p className="mb-1 font-normal">Dengan ini menerangkan bahwa:</p>
      <div className="ml-4 sm:ml-6 mb-1.5 space-y-0.5 font-normal text-[11.5px]">
        <Field label="Nama Siswa" value={<span className="font-bold">{data.namaSiswa || ''}</span>} />
        <Field label="NIS/NISN" value={nisNisnStr} />
        <Field label="Tempat/Tanggal Lahir" value={data.tempatTanggalLahir || ''} />
        <Field label="Jenis Kelamin" value={jenisKelaminStr} />
        <Field label="Alamat" value={data.alamatSiswa || ''} />
      </div>

      {/* 3. Adalah benar siswa tersebut di atas diterima */}
      <p className="mb-1 font-normal">
        Adalah benar siswa tersebut di atas diterima sebagai siswa pindahan (mutasi masuk) di:
      </p>
      <div className="ml-4 sm:ml-6 mb-1 space-y-0.5 font-normal text-[11.5px]">
        <Field label="Nama Sekolah" value={schoolBodyName || ''} />
        <Field label="Kelas" value={data.kelasDiterima || ''} />
      </div>

      <p className="mb-1.5 font-normal">
        Terhitung mulai tanggal: {data.tanggalMulaiBelajar ? padIndonesianDate(data.tanggalMulaiBelajar) : '........................'}
      </p>

      {/* 4. Siswa tersebut berasal dari */}
      <p className="mb-1 font-normal">Siswa tersebut berasal dari:</p>
      <div className="ml-4 sm:ml-6 mb-1.5 space-y-0.5 font-normal text-[11.5px]">
        <Field label="Nama Sekolah Asal" value={data.sekolahAsal || ''} />
        <Field label="Alamat Sekolah" value={data.alamatSekolahAsal || ''} />
      </div>

      {/* Statement */}
      <p className="mb-1 text-justify font-normal">
        Dengan ini pihak sekolah menyatakan bersedia menerima siswa tersebut sesuai dengan ketentuan yang berlaku.
      </p>

      {/* Closing */}
      <p className="mb-2 text-justify font-normal">
        Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
      </p>

      {/* Table Dikeluarkan di & Tanggal */}
      <div className="flex justify-end mt-2 mb-1 font-normal">
        <div className="w-80">
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="py-0.5 w-28 font-normal text-left">Dikeluarkan di</td>
                <td className="py-0.5 w-4 text-center">:</td>
                <td className="py-0.5 text-left font-normal">
                  {dikeluarkanDi}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 font-normal text-left">Tanggal</td>
                <td className="py-0.5 w-4 text-center">:</td>
                <td className="py-0.5 text-left font-normal">
                  {tanggalSurat}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="border-b border-black mt-0.5 mb-1.5 w-full"></div>
        </div>
      </div>

      <SignatureBlock profile={profile} hideCityDate={true} customCityDate={data.customCityDate} />
    </div>
  );
};

// 4. SURAT TUGAS
const RenderSuratTugas: React.FC<{ profile: SchoolProfile; data: SuratTugasPayload }> = ({
  profile,
  data,
}) => {
  const schoolBodyName = formatSchoolNameForBody(profile.namaSekolah);

  const formatAddress = (alamat?: string, kel?: string, kec?: string, kota?: string) => {
    const parts: string[] = [];
    if (alamat && alamat.trim()) parts.push(alamat.trim());
    if (kel && kel.trim() && !alamat?.toLowerCase().includes(kel.toLowerCase())) parts.push(`Desa/Kel. ${kel.trim()}`);
    if (kec && kec.trim() && !alamat?.toLowerCase().includes(kec.toLowerCase())) parts.push(`Kec. ${kec.trim()}`);
    if (kota && kota.trim() && !alamat?.toLowerCase().includes(kota.toLowerCase())) parts.push(`${kota.trim()}`);
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const fullAlamatSekolah = formatAddress(profile.alamat, profile.kelurahan, profile.kecamatan, profile.kota);

  // Dikeluarkan di & Tanggal
  const defaultCity = profile.kota ? profile.kota.replace('Kota ', '').replace('Kabupaten ', '') : '';
  const defaultDateStr = formatDateWithZero(new Date());

  let dikeluarkanDi = defaultCity || EMPTY;
  let tanggalSurat = defaultDateStr;

  if (data.customCityDate) {
    if (data.customCityDate.includes(',')) {
      const parts = data.customCityDate.split(',');
      dikeluarkanDi = parts[0].trim() || dikeluarkanDi;
      const datePart = parts.slice(1).join(',').trim();
      if (datePart) tanggalSurat = padIndonesianDate(datePart);
    } else {
      dikeluarkanDi = data.customCityDate.trim();
    }
  }

  const hariTanggalStr = data.hariTanggal || (data.tanggalMulai ? (data.tanggalSelesai ? `${padIndonesianDate(data.tanggalMulai)} s.d. ${padIndonesianDate(data.tanggalSelesai)}` : padIndonesianDate(data.tanggalMulai)) : EMPTY);

  return (
    <div className="text-slate-900 leading-relaxed text-xs sm:text-sm font-normal">
      <KopSuratHeader profile={profile} />

      {/* Header Title */}
      <div className="text-center my-3 font-normal">
        <h2 className="font-bold text-sm sm:text-base uppercase underline tracking-wider">
          SURAT TUGAS
        </h2>
        <p className="text-xs font-normal mt-0.5">
          Nomor: {data.nomorSurat || EMPTY}</p>
      </div>

      {/* 1. Yang bertanda tangan di bawah ini */}
      <p className="mb-1.5 font-normal">Yang bertanda tangan di bawah ini:</p>
      <div className="ml-4 sm:ml-6 mb-3 space-y-1 font-normal">
        <Field label="Nama" value={<span className="font-bold">{formatKepsekName(profile.namaKepsek)  || ''}</span>} />
        <Field label="NIP" value={profile.nipKepsek  || ''} />
        <Field label="Jabatan" value="Kepala Sekolah" />
        <Field label="Nama Sekolah" value={schoolBodyName  || ''} />
        <Field label="Alamat Sekolah" value={fullAlamatSekolah || profile.alamat  || ''} />
      </div>

      {/* 2. Dengan ini memberikan tugas kepada */}
      <p className="mb-1.5 font-normal">Dengan ini memberikan tugas kepada:</p>
      <div className="ml-4 sm:ml-6 mb-3 space-y-1 font-normal">
        <Field label="Nama" value={<span className="font-bold">{data.namaPetugas  || ''}</span>} />
        <Field label="NIP/NUPTK" value={data.nipPetugas  || ''} />
        <Field label="Jabatan" value={data.jabatan  || ''} />
      </div>

      {/* 3. Untuk melaksanakan tugas sebagai berikut */}
      <p className="mb-1.5 font-normal">Untuk melaksanakan tugas sebagai berikut:</p>
      <div className="ml-4 sm:ml-6 mb-3 space-y-1 font-normal">
        <Field label="Nama Kegiatan" value={data.namaKegiatan || data.tujuanTugas  || ''} />
        <Field label="Hari/Tanggal" value={hariTanggalStr} />
        <Field label="Waktu" value={data.waktu  || ''} />
        <Field label="Tempat" value={data.tempatTugas  || ''} />
        <Field label="Uraian Tugas" value={<span className="whitespace-pre-line">{data.uraianTugas || data.tujuanTugas  || ''}</span>} />
      </div>

      {/* Closing */}
      <p className="mb-4 text-justify font-normal">
        Demikian surat tugas ini diberikan untuk dilaksanakan dengan penuh tanggung jawab. Setelah melaksanakan tugas, yang bersangkutan diwajibkan membuat laporan kegiatan.
      </p>

      {/* Table Dikeluarkan di & Tanggal */}
      <div className="flex justify-end mt-4 mb-1 font-normal">
        <div className="w-80">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <tbody>
              <tr>
                <td className="py-0.5 w-28 font-normal text-left">Dikeluarkan di</td>
                <td className="py-0.5 w-4 text-center">:</td>
                <td className="py-0.5 text-left font-normal">{dikeluarkanDi}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-normal text-left">Tanggal</td>
                <td className="py-0.5 w-4 text-center">:</td>
                <td className="py-0.5 text-left font-normal">{tanggalSurat}</td>
              </tr>
            </tbody>
          </table>
          <div className="border-b-2 border-black mt-1 mb-2 w-full"></div>
        </div>
      </div>

      <SignatureBlock profile={profile} hideCityDate={true} customCityDate={data.customCityDate} />
    </div>
  );
};

// 5. SURAT AKTIF MENGAJAR
const RenderSuratAktifMengajar: React.FC<{
  profile: SchoolProfile;
  data: SuratAktifMengajarPayload;
}> = ({ profile, data }) => {
  const schoolBodyName = formatSchoolNameForBody(profile.namaSekolah);

  const formatAddress = (alamat?: string, kel?: string, kec?: string, kota?: string) => {
    const parts: string[] = [];
    if (alamat && alamat.trim()) parts.push(alamat.trim());
    if (kel && kel.trim() && !alamat?.toLowerCase().includes(kel.toLowerCase())) parts.push(`Desa/Kel. ${kel.trim()}`);
    if (kec && kec.trim() && !alamat?.toLowerCase().includes(kec.toLowerCase())) parts.push(`Kec. ${kec.trim()}`);
    if (kota && kota.trim() && !alamat?.toLowerCase().includes(kota.toLowerCase())) parts.push(`${kota.trim()}`);
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const fullAlamatSekolah = formatAddress(profile.alamat, profile.kelurahan, profile.kecamatan, profile.kota);

  // Dikeluarkan di & Tanggal
  const defaultCity = profile.kota ? profile.kota.replace('Kota ', '').replace('Kabupaten ', '') : '';
  const defaultDateStr = formatDateWithZero(new Date());

  let dikeluarkanDi = defaultCity || EMPTY;
  let tanggalSurat = defaultDateStr;

  if (data.customCityDate) {
    if (data.customCityDate.includes(',')) {
      const parts = data.customCityDate.split(',');
      dikeluarkanDi = parts[0].trim() || dikeluarkanDi;
      const datePart = parts.slice(1).join(',').trim();
      if (datePart) tanggalSurat = padIndonesianDate(datePart);
    } else {
      dikeluarkanDi = data.customCityDate.trim();
    }
  }

  const jenisKelaminStr = data.jenisKelamin === 'L' ? 'Laki-laki' : data.jenisKelamin === 'P' ? 'Perempuan' : (data.jenisKelamin || '');
  const sejakTanggalStr = data.sejakTanggal ? padIndonesianDate(data.sejakTanggal) : '........................';

  return (
    <div className="text-slate-900 leading-snug text-[11.5px] font-normal">
      <KopSuratHeader profile={profile} />

      {/* Header Title */}
      <div className="text-center my-2 font-normal">
        <h2 className="font-bold text-sm sm:text-base uppercase underline tracking-wider">
          SURAT KETERANGAN AKTIF MENGAJAR
        </h2>
        <p className="text-[11px] font-normal mt-0.5">
          Nomor: {data.nomorSurat || EMPTY}
        </p>
      </div>

      {/* 1. Yang bertanda tangan di bawah ini */}
      <p className="mb-1 font-normal">Yang bertanda tangan di bawah ini:</p>
      <div className="ml-4 sm:ml-6 mb-1.5 space-y-0.5 font-normal text-[11.5px]">
        <Field label="Nama" value={<span className="font-bold">{formatKepsekName(profile.namaKepsek) || ''}</span>} />
        <Field label="NIP" value={profile.nipKepsek || ''} />
        <Field label="Jabatan" value="Kepala Sekolah" />
        <Field label="Nama Sekolah" value={schoolBodyName || ''} />
        <Field label="Alamat Sekolah" value={fullAlamatSekolah || profile.alamat || ''} />
      </div>

      {/* 2. Dengan ini menerangkan bahwa */}
      <p className="mb-1 font-normal">Dengan ini menerangkan bahwa:</p>
      <div className="ml-4 sm:ml-6 mb-1.5 space-y-0.5 font-normal text-[11.5px]">
        <Field label="Nama" value={<span className="font-bold">{data.namaGuru || ''}</span>} />
        <Field label="NIP/NUPTK" value={data.nipGuru || ''} />
        <Field label="Tempat/Tanggal Lahir" value={data.tempatTanggalLahir || ''} />
        <Field label="Jenis Kelamin" value={jenisKelaminStr} />
        <Field label="Jabatan" value={data.jabatan ? (data.jabatan.startsWith('Guru') ? data.jabatan : `Guru ${data.jabatan}`) : ''} />
        <Field label="Mata Pelajaran" value={data.mataPelajaran || ''} />
        <Field label="Status Kepegawaian" value={data.statusKepegawaian || ''} />
        <Field label="Alamat" value={data.alamatGuru || ''} />
      </div>

      {/* Main Paragraph 1 */}
      <p className="mb-1 text-justify font-normal">
        Adalah benar yang bersangkutan aktif mengajar di sekolah kami sejak tanggal {sejakTanggalStr} sampai dengan sekarang.
      </p>

      {/* Main Paragraph 2 */}
      <p className="mb-1 text-justify font-normal">
        Yang bersangkutan melaksanakan tugas mengajar dengan baik dan penuh tanggung jawab sesuai dengan ketentuan yang berlaku.
      </p>

      {/* Purpose */}
      <p className="mb-0.5 text-justify font-normal">
        Surat keterangan ini dibuat untuk dipergunakan sebagai:
      </p>
      <p className="mb-1.5 ml-4 sm:ml-6 font-normal text-slate-900">
        {data.keperluan || ''}
      </p>

      {/* Closing */}
      <p className="mb-2 text-justify font-normal">
        Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
      </p>

      {/* Table Dikeluarkan di & Tanggal */}
      <div className="flex justify-end mt-2 mb-1 font-normal">
        <div className="w-80">
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="py-0.5 w-28 font-normal text-left">Dikeluarkan di</td>
                <td className="py-0.5 w-4 text-center">:</td>
                <td className="py-0.5 text-left font-normal">{dikeluarkanDi}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-normal text-left">Tanggal</td>
                <td className="py-0.5 w-4 text-center">:</td>
                <td className="py-0.5 text-left font-normal">{tanggalSurat}</td>
              </tr>
            </tbody>
          </table>
          <div className="border-b border-black mt-0.5 mb-1.5 w-full"></div>
        </div>
      </div>

      <SignatureBlock profile={profile} hideCityDate={true} customCityDate={data.customCityDate} />
    </div>
  );
};

// 6. SURAT PEMBAGIAN TUGAS (SK KEPALA SEKOLAH)
const RenderSuratPembagianTugas: React.FC<{
  profile: SchoolProfile;
  data: SuratPembagianTugasPayload;
}> = ({ profile, data }) => {
  const schoolBodyName = formatSchoolNameForBody(profile.namaSekolah) || 'SD Negeri 2 Nyomplong';
  const rawSchoolNameUpper = (profile.namaSekolah || 'SEKOLAH DASAR NEGERI 2 NYOMPLONG').toUpperCase();
  const schoolTitleText = rawSchoolNameUpper.startsWith('KEPALA')
    ? rawSchoolNameUpper
    : `KEPALA ${rawSchoolNameUpper}`;

  // Dikeluarkan di & Tanggal
  const defaultCity = profile.kota ? profile.kota.replace('Kota ', '').replace('Kabupaten ', '') : '';
  const defaultDateStr = '06 Juli 2026';

  let dikeluarkanDi = defaultCity || EMPTY;
  let tanggalSurat = defaultDateStr;

  if (data.customCityDate) {
    if (data.customCityDate.includes(',')) {
      const parts = data.customCityDate.split(',');
      dikeluarkanDi = parts[0].trim() || dikeluarkanDi;
      const datePart = parts.slice(1).join(',').trim();
      if (datePart) tanggalSurat = padIndonesianDate(datePart);
    } else {
      dikeluarkanDi = data.customCityDate.trim();
    }
  }

  const defaultMenimbang = [
    'Bahwa proses belajar mengajar merupakan inti proses penyelenggaraan pendidikan pada satuan pendidikan.',
    'Bahwa untuk menjamin kelancaran proses belajar mengajar perlu ditetapkan pembagian tugas mengajar dan tugas tambahan bagi guru.',
  ];

  const defaultMengingat = [
    'UU Nomor 20 tahun 2003 tentang Sistem Pendidikan Nasional.',
    'UU Nomor 14 tahun 2005 tentang Guru dan Dosen sebagai tenaga Profesional.',
    'Peraturan Pemerintah nomor 19 tahun 2005 tentang Standar Nasional Pendidikan jo Peraturan Pemerintah nomor 13 tahun 2015 tentang perubahan kedua Standar Nasional Pendidikan, Jo Peraturan Pemerintah Nomor 32 Tahun 2013 Tentang Perubahan Ketiga atas Peraturan Pemerintah Nomor 19 Tahun 2005 Tentang Standar Nasional Pendidikan',
    'Hasil Rapat Dewan Guru tertanggal 06 Juli 2026',
  ];

  const menimbangItems = data.menimbang && data.menimbang.length > 0 ? data.menimbang : defaultMenimbang;
  const mengingatItems = data.mengingat && data.mengingat.length > 0 ? data.mengingat : defaultMengingat;

  const guruList = data.daftarGuru || [];

  return (
    <div className="text-slate-900 leading-snug text-xs font-normal">
      {/* HALAMAN 1: NASKAH KEPUTUSAN */}
      <div className="relative overflow-hidden min-h-[275mm] flex flex-col justify-start pb-4">
        {/* Background Watermark Logo Sekolah Halaman 1 */}
        <DocumentWatermark profile={profile} />

        <div className="relative z-10">
          <KopSuratHeader profile={profile} />

          {/* Header Title Block */}
          <div className="text-center my-2 space-y-0.5 font-normal">
            <h2 className="font-bold text-sm sm:text-base uppercase tracking-wider">
              KEPUTUSAN
            </h2>
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
              {data.kepalaSekolahText || schoolTitleText}
            </h3>
            <p className="text-xs font-normal">
              Nomor : {data.nomorSK || EMPTY}</p>

            <p className="text-xs font-normal uppercase pt-1 tracking-widest">TENTANG</p>
            <p className="text-xs sm:text-sm font-normal uppercase max-w-xl mx-auto whitespace-pre-line leading-tight">
              {data.tentang || ('PEMBAGIAN TUGAS PENDIDIK DAN TENAGA KEPENDIDIKAN\n' + rawSchoolNameUpper + '\nTAHUN PELAJARAN ' + (data.tahunPelajaran || ''))}
            </p>

            <p className="text-xs sm:text-sm font-normal uppercase pt-1">
              {data.denganRahmat || ''}</p>
            <p className="text-xs font-normal leading-tight max-w-xl mx-auto">
              Kepala {schoolBodyName}, Dinas Pendidikan Kecamatan Cipatat Kabupaten Bandung Barat Provinsi Jawa Barat
            </p>
          </div>

          {/* Menimbang & Mengingat */}
          <div className="space-y-1.5 mb-2 text-justify text-xs font-normal">
            <div className="flex items-start gap-1">
              <span className="w-24 shrink-0 font-normal">Menimbang</span>
              <span className="w-4 shrink-0 text-center">:</span>
              <div className="flex-1 space-y-0.5">
                {menimbangItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="shrink-0">{String.fromCharCode(97 + idx)}.</span>
                    <span className="flex-1 text-justify">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-1 pt-0.5">
              <span className="w-24 shrink-0 font-normal">Mengingat</span>
              <span className="w-4 shrink-0 text-center">:</span>
              <div className="flex-1 space-y-0.5">
                {mengingatItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="shrink-0">{String.fromCharCode(97 + idx)}.</span>
                    <span className="flex-1 text-justify">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MEMUTUSKAN */}
          <div className="text-center font-bold my-2 tracking-widest uppercase text-xs">MEMUTUSKAN</div>

          <div className="space-y-1 mb-2 text-justify text-xs font-normal">
            <div className="flex items-start gap-1">
              <span className="w-24 shrink-0 font-normal">Menetapkan</span>
              <span className="w-4 shrink-0 text-center">:</span>
              <span className="flex-1 font-bold"></span>
            </div>

            <div className="flex items-start gap-1">
              <span className="w-24 shrink-0 font-normal">Pertama</span>
              <span className="w-4 shrink-0 text-center">:</span>
              <span className="flex-1 text-justify">
                {data.pertama || ('Pembagian Tugas Mengajar dan Tugas Tambahan pada Guru ' + schoolBodyName + ' pada tahun pelajaran ' + (data.tahunPelajaran || '') + ' meliputi pembagian tugas mengajar oleh setiap guru dalam melaksanakan kewajiban mengajar dan tugas tambahan lainnya.')}
              </span>
            </div>

            <div className="flex items-start gap-1">
              <span className="w-24 shrink-0 font-normal">Kedua</span>
              <span className="w-4 shrink-0 text-center">:</span>
              <span className="flex-1 text-justify">
                {data.kedua || 'Pembagian Tugas Mengajar dan Beban Kerja bagi setiap Guru tersebut tertuang dalam daftar terlampir dalam surat keputusan ini.'}
              </span>
            </div>

            <div className="flex items-start gap-1">
              <span className="w-24 shrink-0 font-normal">Ketiga</span>
              <span className="w-4 shrink-0 text-center">:</span>
              <span className="flex-1 text-justify">
                {data.ketiga || 'Apabila dikemudian hari ternyata terdapat kekeliruan dalam Keputusan ini, maka akan diadakan perbaikan sebagaimana mestinya.'}
              </span>
            </div>

            <div className="flex items-start gap-1">
              <span className="w-24 shrink-0 font-normal">Keempat</span>
              <span className="w-4 shrink-0 text-center">:</span>
              <span className="flex-1 text-justify">
                {data.keempat || (data.tanggalEfektif ? `Keputusan ini berlaku sejak tanggal ${data.tanggalEfektif}.` : 'Keputusan ini berlaku sejak tanggal ditetapkan.')}
              </span>
            </div>
          </div>
        </div>

        {/* Ditetapkan di & Tanggal Table + Signature Halaman 1 */}
        <div className="relative z-10 mt-4 sm:mt-5">
          <SignatureBlock
            profile={profile}
            isAktifBelajarLayout={true}
            issuanceLabel="Ditetapkan di"
            customCityDate={data.tanggalEfektif ? `${dikeluarkanDi}, ${data.tanggalEfektif}` : (data.customCityDate || (tanggalSurat ? `${dikeluarkanDi}, ${tanggalSurat}` : undefined))}
          />
        </div>
      </div>

      {/* HALAMAN 2: LAMPIRAN (HALAMAN 2 KERTAS A4) */}
      <div
        className="break-before-page pt-8 mt-8 border-t-2 border-dashed border-slate-300 print:border-none print:pt-0 print:mt-0 font-normal relative overflow-hidden min-h-[275mm] flex flex-col justify-start"
        style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
      >
        {/* Background Watermark Logo Sekolah Halaman 2 */}
        <DocumentWatermark profile={profile} />

        <div className="relative z-10">
          {/* Screen Visual Indicator for Page 2 */}
          <div className="no-print mb-4 flex items-center justify-center">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
              📄 HALAMAN 2: LAMPIRAN SK PEMBAGIAN TUGAS
            </span>
          </div>

          {/* Lampiran Header Table with Straight Colons */}
          <div className="mb-3 text-xs font-normal">
            <table className="border-collapse">
              <tbody>
                <tr>
                  <td className="w-20 py-0.5 font-normal">Lampiran</td>
                  <td className="w-4 text-center py-0.5 font-normal">:</td>
                  <td className="font-normal py-0.5">Keputusan Kepala {schoolBodyName}</td>
                </tr>
                <tr>
                  <td className="w-20 py-0.5 font-normal">Nomor</td>
                  <td className="w-4 text-center py-0.5 font-normal">:</td>
                  <td className="font-normal py-0.5">{data.nomorSK || EMPTY}</td>
                </tr>
                <tr>
                  <td className="w-20 py-0.5 font-normal">Tanggal</td>
                  <td className="w-4 text-center py-0.5 font-normal">:</td>
                  <td className="font-normal py-0.5">{data.tanggalEfektif || tanggalSurat}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lampiran Title */}
          <div className="text-center my-3 font-normal">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide whitespace-pre-line leading-tight">
              PEMBAGIAN TUGAS PENDIDIK DAN TENAGA KEPENDIDIKAN
              <br />
              {rawSchoolNameUpper}
              <br />
              TAHUN PELAJARAN {data.tahunPelajaran || `${new Date().getFullYear()} / ${new Date().getFullYear() + 1}`}
            </h3>
          </div>

          {/* Single Unified Table for All Staff */}
          <div className="mb-4 font-normal">
            <table className="w-full border-collapse border border-black text-xs font-normal">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-black p-2 w-10 font-bold">No.</th>
                  <th className="border border-black p-2 text-left w-[32%] font-bold">Nama Guru / NIP</th>
                  <th className="border border-black p-2 w-[18%] font-bold">Gol. Ruang</th>
                  <th className="border border-black p-2 text-left w-[35%] font-bold">Jabatan / Tugas Mengajar</th>
                  <th className="border border-black p-2 w-[15%] font-bold">JJM</th>
                </tr>
              </thead>
              <tbody>
                {guruList.length > 0 ? (
                  guruList.map((g, idx) => {
                    const displayJabatan = g.jabatan || (g.kelasAjar ? ('Guru Kelas ' + g.kelasAjar) : g.mapel || g.tugasTambahan || '-');
                    const displayGol = g.golongan || g.golRuang || '-';
                    const displayJJM = g.bebanJam !== undefined && g.bebanJam !== null ? String(g.bebanJam) : (g.jjm || '-');

                    return (
                      <tr key={g.id || idx} className="align-top font-normal">
                        <td className="border border-black p-2 text-center font-normal">{idx + 1}.</td>
                        <td className="border border-black p-2 text-left font-normal">
                          <div className="font-bold">{g.namaGuru || ''}</div>
                          <div className="text-[11px] font-mono mt-0.5 text-slate-800 font-normal">
                            {g.nip && g.nip !== '-' ? (g.nip.startsWith('NIP') ? g.nip : ('NIP. ' + g.nip)) : '-'}
                          </div>
                        </td>
                        <td className="border border-black p-2 text-center font-normal">{displayGol}</td>
                        <td className="border border-black p-2 text-left font-normal">{displayJabatan}</td>
                        <td className="border border-black p-2 text-center font-normal">{displayJJM}</td>
                      </tr>
                    );
                  })
                ) : (
                  // Clean 6-row template placeholder when no teachers are filled yet
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="align-top font-normal">
                      <td className="border border-black p-2 text-center font-normal">{idx + 1}.</td>
                      <td className="border border-black p-2 text-left font-normal">
                        <div className="font-normal text-slate-600">...................................................</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">NIP. ...................................</div>
                      </td>
                      <td className="border border-black p-2 text-center font-normal text-slate-500">...................</td>
                      <td className="border border-black p-2 text-left font-normal text-slate-600">...................................................</td>
                      <td className="border border-black p-2 text-center font-normal text-slate-500">........ JP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lampiran Signature Block Halaman 2 */}
        <div className="relative z-10 mt-4 sm:mt-5">
          <SignatureBlock
            profile={profile}
            isAktifBelajarLayout={true}
            issuanceLabel="Ditetapkan di"
            customCityDate={data.tanggalEfektif ? `${dikeluarkanDi}, ${data.tanggalEfektif}` : (data.customCityDate || (tanggalSurat ? `${dikeluarkanDi}, ${tanggalSurat}` : undefined))}
          />
        </div>
      </div>
    </div>
  );
};

// Helper to parse pengikut text
interface PengikutItem {
  nama: string;
  pangkat: string;
  jabatan: string;
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

// 7. SURAT PERJALANAN DINAS (SPD)
const RenderSuratPerjalananDinas: React.FC<{
  profile: SchoolProfile;
  data: SuratPerjalananDinasPayload;
}> = ({ profile, data }) => (
  <div className="font-times text-black leading-relaxed space-y-4 print:space-y-2 p-1 max-w-[800px] mx-auto font-normal">
    {/* HALAMAN 1: HALAMAN DEPAN SPPD */}
    <div className="relative overflow-hidden min-h-[275mm] flex flex-col justify-between pb-4">
      {/* Background Watermark Logo Sekolah Halaman 1 */}
      <DocumentWatermark profile={profile} />

      <div className="relative z-10">
        <KopSuratHeader profile={profile} />

        <div className="text-center my-4 print:my-2 font-normal">
          <h2 className="font-bold text-base sm:text-lg uppercase underline tracking-wider">
            SURAT PERINTAH PERJALANAN DINAS (SPPD)
          </h2>
          <p className="text-sm font-normal mt-1">Nomor: {data.nomorSPD || EMPTY}</p>
        </div>

        {/* I. HALAMAN DEPAN */}
        <div className="text-xs font-normal uppercase tracking-wide border-b border-black pb-0.5 mb-1">
          I. HALAMAN DEPAN
        </div>

        <table className="w-full border-collapse border border-black text-xs my-3 leading-normal table-fixed font-normal">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-8 text-center font-normal valign-top">1.</td>
              <td className="border border-black p-2 w-[40%] font-normal text-slate-900">
                Pejabat yang memberi perintah
              </td>
              <td className="border border-black p-2 font-normal whitespace-pre-wrap">
                : {data.pejabatPerintah ? (
                    <span className="font-bold">{data.pejabatPerintah}</span>
                  ) : profile.namaKepsek ? (
                    <span className="font-bold">{formatKepsekName(profile.namaKepsek)}</span>
                  ) : (
                    'Kepala Sekolah'
                  )}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top">2.</td>
              <td className="border border-black p-2 font-normal text-slate-900">
                Nama/NIP Pegawai yang diperintahkan
              </td>
              <td className="border border-black p-1.5 font-normal">
                <table className="w-full text-xs font-normal border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-2 font-normal py-0.5">:</td>
                      <td className="w-14 font-normal py-0.5">a. Nama</td>
                      <td className="w-3 font-normal py-0.5">:</td>
                      <td className="font-normal py-0.5">
                        {data.namaPegawai ? (
                          <span className="uppercase text-sm font-bold">{data.namaPegawai}</span>
                        ) : (
                          <span className="font-normal text-slate-700">...........................................................</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-2 font-normal py-0.5"></td>
                      <td className="w-14 font-normal py-0.5">b. NIP</td>
                      <td className="w-3 font-normal py-0.5">:</td>
                      <td className="font-normal py-0.5">
                        {data.nipPegawai ? (
                          <span className="font-mono font-normal">{data.nipPegawai}</span>
                        ) : (
                          <span className="font-normal text-slate-700">...........................................................</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top">3.</td>
              <td className="border border-black p-2 font-normal text-slate-900">
                Pangkat/Golongan
              </td>
              <td className="border border-black p-2 font-normal">
                : {data.pangkatGolongan || LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top">4.</td>
              <td className="border border-black p-2 font-normal text-slate-900">
                Jabatan/Instansi
              </td>
              <td className="border border-black p-2 font-normal">
                : {data.jabatan || LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top">5.</td>
              <td className="border border-black p-2 font-normal text-slate-900 text-justify">
                Maksud Perjalanan Dinas
              </td>
              <td className="border border-black p-2 font-normal text-justify whitespace-pre-wrap">
                : {data.maksudPerjalanan || LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top">6.</td>
              <td className="border border-black p-2 font-normal text-slate-900">
                Alat Transportasi
              </td>
              <td className="border border-black p-2 font-normal">
                : {data.alatAngkutan || LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top" rowSpan={2}>7.</td>
              <td className="border-x border-t border-black p-2 font-normal text-slate-900">
                a. Tempat Berangkat
              </td>
              <td className="border-x border-t border-black p-2 font-normal">
                : {data.tempatBerangkat || LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border-x border-b border-black p-2 font-normal text-slate-900">
                b. Tempat Tujuan
              </td>
              <td className="border-x border-b border-black p-2 font-normal">
                : {data.tempatTujuan || LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top" rowSpan={3}>8.</td>
              <td className="border-x border-t border-black p-2 font-normal text-slate-900">
                a. Lamanya Perjalanan Dinas
              </td>
              <td className="border-x border-t border-black p-2 font-normal">
                : {data.lamaPerjalanan ? `${data.lamaPerjalanan} hari, dari tanggal ${data.tanggalBerangkat || '....................'} s.d. ${data.tanggalKembali || '....................'}` : LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border-x border-black p-2 font-normal text-slate-900">
                b. Tanggal Berangkat
              </td>
              <td className="border-x border-black p-2 font-normal">
                : {data.tanggalBerangkat || LONG_EMPTY}</td>
            </tr>
            <tr>
              <td className="border-x border-b border-black p-2 font-normal text-slate-900">
                c. Tanggal Harus Kembali/Tiba
              </td>
              <td className="border-x border-b border-black p-2 font-normal">
                : {data.tanggalKembali || LONG_EMPTY}</td>
            </tr>
            {/* ROW 9: PENGIKUT */}
            {(() => {
              const items = parsePengikutText(data.pengikutText || '');
              const rowCount = Math.max(3, items.length);
              return (
                <>
                  {/* Row 9 Header */}
                  <tr>
                    <td className="border border-black p-2 text-center font-normal valign-top" rowSpan={rowCount + 1}>9.</td>
                    <td className="border border-black p-2 font-normal text-slate-900 bg-slate-50/50">
                      <span className="underline font-normal">Pengikut</span> : Nama
                    </td>
                    <td className="border border-black p-0 bg-slate-50/50">
                      <div className="grid grid-cols-2 text-xs font-normal h-full">
                        <div className="border-r border-black p-2 underline font-normal">Pangkat</div>
                        <div className="p-2 underline font-normal">Jabatan</div>
                      </div>
                    </td>
                  </tr>
                  {/* Row 9 Data Rows */}
                  {Array.from({ length: rowCount }).map((_, i) => {
                    const item = items[i] || { nama: '', pangkat: '', jabatan: '' };
                    return (
                      <tr key={i}>
                        <td className="border border-black p-2 font-normal text-[11px] break-words">
                          {item.nama ? <span className="font-bold">{item.nama}</span> : <span className="font-normal text-slate-700">........................................</span>}
                        </td>
                        <td className="border border-black p-0">
                          <div className="grid grid-cols-2 text-[11px] font-normal h-full">
                            <div className="border-r border-black p-2 break-words">
                              {item.pangkat || <span className="font-normal text-slate-700">....................</span>}
                            </div>
                            <div className="p-2 break-words">
                              {item.jabatan || <span className="font-normal text-slate-700">....................</span>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })()}
            <tr>
              <td className="border border-black p-2 text-center font-normal valign-top">10.</td>
              <td className="border border-black p-2 font-normal text-slate-900">
                Keterangan Lain-lain
              </td>
              <td className="border border-black p-2 font-normal whitespace-pre-line">
                : {data.keteranganLain || LONG_EMPTY}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Issuing Metadata Block Halaman 1 */}
      <div className="relative z-10 mt-auto pt-2 grid grid-cols-12 gap-4 text-xs font-normal">
        <div className="col-span-6"></div>
        <div className="col-span-6 space-y-1 pl-4 text-[12px]">
          <table className="w-full text-[12px]">
            <tbody>
              <tr>
                <td className="w-[38%] py-0.5 font-normal">Dikeluarkan di</td>
                <td className="py-0.5 font-normal">: {data.dikeluarkanDi || (profile.kota ? profile.kota.replace('Kota ', '').replace('Kabupaten ', '') : EMPTY)}</td>
              </tr>
              <tr>
                <td className="py-0.5 font-normal">Pada tanggal</td>
                <td className="py-0.5 font-normal">: {data.tanggalDikeluarkan || formatDateWithZero(new Date())}</td>
              </tr>
            </tbody>
          </table>
          <div className="border-b-2 border-black mt-1 mb-2 w-full"></div>
          <div className="pt-2 font-normal leading-snug text-left">
            <p>{data.jabatanPemberiPerintah || profile.jabatanKepsek || 'Kepala Sekolah'}</p>
            <p className="font-normal">{formatSchoolNameForBody(profile.namaSekolah)}</p>
            <div className="h-16 print:h-14"></div>
            <p className="font-bold underline text-xs sm:text-sm">{formatKepsekName(data.namaPemberiPerintah || profile.namaKepsek) || EMPTY}</p>
            <p className="text-xs sm:text-sm font-normal">
              {data.nipPemberiPerintah || profile.nipKepsek ? `NIP. ${data.nipPemberiPerintah || profile.nipKepsek}` : 'NIP. ' + EMPTY}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Appendix Page: Keterangan (Halaman Belakang - Halaman 2 Kertas A4) */}
    <div
      className="break-before-page pt-4 mt-6 border-t-2 border-dashed border-slate-300 print:border-none print:pt-8 print:mt-0 font-normal relative overflow-hidden min-h-[275mm]"
      style={{ pageBreakBefore: 'always', breakBefore: 'page' }}
    >
      {/* Background Watermark Logo Sekolah Halaman 2 (Layar & Cetak Multi-Halaman) */}
      <DocumentWatermark profile={profile} />

      <div className="relative z-10">
        {/* Screen Visual Indicator for Page 2 */}
        <div className="no-print mb-3 flex items-center justify-center">
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
            📄 HALAMAN 2: HALAMAN BELAKANG SPPD
          </span>
        </div>

        <div className="text-center font-bold text-sm tracking-wider pb-1 mb-3 uppercase underline">
          II. HALAMAN BELAKANG
        </div>

        <div className="font-times text-black font-normal">
        <table className="w-full border-collapse border border-black text-xs leading-normal table-fixed font-normal">
          <tbody>
            {/* ROW 1: A & B */}
            <tr>
              <td className="w-1/2 border-r border-black p-2.5 align-top">
                <div className="font-bold text-xs uppercase underline mb-1">A. TIBA DI TEMPAT TUJUAN</div>
                <div className="space-y-1 text-[11px]">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 pl-1 font-normal">Pada tanggal</span>
                    <span className="col-span-8 font-normal">: {data.belakangTibaTanggal || '...................................'}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 pl-1 font-normal">Di</span>
                    <span className="col-span-8 font-normal">: {data.belakangTibaDi || '...................................'}</span>
                  </div>
                </div>
                <p className="text-[11px] font-normal pl-1 mt-1.5">Pejabat yang berwenang,</p>
              </td>
              <td className="w-1/2 p-2.5 align-top">
                <div className="font-bold text-xs uppercase underline mb-1">B. BERANGKAT DARI TEMPAT TUJUAN</div>
                <div className="space-y-1 text-[11px]">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 pl-1 font-normal">Pada tanggal</span>
                    <span className="col-span-8 font-normal">: {data.belakangBerangkatTanggal || '...................................'}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-4 pl-1 font-normal">Ke</span>
                    <span className="col-span-8 font-normal">: {data.belakangBerangkatKe || '...................................'}</span>
                  </div>
                </div>
                <p className="text-[11px] font-normal pl-1 mt-1.5">Pejabat yang berwenang,</p>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="w-1/2 border-r border-black px-2.5 pb-2.5 align-bottom">
                <div className="h-10"></div>
                <p className="font-bold underline text-xs pl-1">
                  {data.belakangTibaPejabat || '....................................................'}
                </p>
                <p className="text-xs pl-1 font-normal">
                  NIP. {data.belakangTibaNip || '....................................................'}
                </p>
              </td>
              <td className="w-1/2 px-2.5 pb-2.5 align-bottom">
                <div className="h-10"></div>
                <p className="font-bold underline text-xs pl-1">
                  {data.belakangBerangkatPejabat || '....................................................'}
                </p>
                <p className="text-xs pl-1 font-normal">
                  NIP. {data.belakangBerangkatNip || '....................................................'}
                </p>
              </td>
            </tr>

            {/* ROW 2: C & D */}
            <tr className="border-b border-black">
              {/* Left Column: C */}
              <td className="w-1/2 border-r border-black p-2.5 align-top">
                <div className="flex flex-col justify-between h-full space-y-2">
                  <div>
                    <div className="font-bold text-xs uppercase underline mb-1">C. TIBA KEMBALI DI TEMPAT KEDUDUKAN</div>
                    <div className="space-y-1 text-[11px]">
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-4 pl-1 font-normal">Pada tanggal</span>
                        <span className="col-span-8 font-normal">: {data.belakangKembaliTanggal || '...................................'}</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-normal pl-1 mt-1.5">Pejabat yang berwenang,</p>
                  </div>
                  <div>
                    <div className="h-10"></div>
                    <p className="font-bold underline text-xs pl-1">
                      {data.belakangKembaliPejabat || '....................................................'}
                    </p>
                    <p className="text-xs pl-1 font-normal">
                      NIP. {data.belakangKembaliNip || '....................................................'}
                    </p>
                  </div>
                </div>
              </td>
              {/* Right Column: D */}
              <td className="w-1/2 p-2.5 align-top">
                <div className="space-y-1.5">
                  <div className="font-bold text-xs uppercase underline mb-1">D. CATATAN LAIN-LAIN</div>
                  <div className="pl-1 space-y-1 text-[11px] font-normal">
                    {data.catatanLain ? (
                      <p className="whitespace-pre-wrap font-normal leading-relaxed min-h-[50px]">{data.catatanLain}</p>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="border-b border-dotted border-black h-4 w-full"></div>
                        <div className="border-b border-dotted border-black h-4 w-full"></div>
                        <div className="border-b border-dotted border-black h-4 w-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>

            {/* ROW 3: E & F */}
            <tr>
              {/* Left Column: E */}
              <td className="w-1/2 border-r border-black p-2.5 align-top">
                <div className="font-bold text-xs uppercase underline mb-1">E. PERNYATAAN</div>
                <p className="text-[11px] text-justify leading-relaxed px-1 font-normal">
                  Dengan ini saya menyatakan bahwa perjalanan dinas tersebut di atas benar-benar dilaksanakan dan digunakan sebagaimana mestinya.
                </p>
                <p className="text-[11px] font-normal pl-1 mt-1.5">Yang diperintah,</p>
              </td>
              {/* Right Column: F */}
              <td className="w-1/2 p-2.5 align-top">
                <div className="font-bold text-xs uppercase underline mb-1">F. PENGESAHAN</div>
                <div className="pl-1 text-[11px] space-y-0.5 font-normal">
                  <p className="font-normal">Mengetahui,</p>
                  <p className="font-normal">Kepala Sekolah</p>
                </div>
              </td>
            </tr>
            <tr>
              {/* Left Column: E Signature */}
              <td className="w-1/2 border-r border-black px-2.5 pb-2.5 align-bottom">
                <div className="h-10"></div>
                <p className="font-bold underline text-xs pl-1">
                  {data.belakangPernyataanNama || '....................................................'}
                </p>
                <p className="text-xs pl-1 font-normal">
                  NIP. {data.belakangPernyataanNip || '....................................................'}
                </p>
              </td>
              {/* Right Column: F Signature */}
              <td className="w-1/2 px-2.5 pb-2.5 align-bottom">
                <div className="h-10"></div>
                <p className="font-bold underline text-xs pl-1">
                  {data.belakangPengesahanNama || formatKepsekName(profile.namaKepsek) || '....................................................'}
                </p>
                <p className="text-xs pl-1 font-normal">
                  NIP. {data.belakangPengesahanNip || profile.nipKepsek || '....................................................'}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>);

// 8. SURAT KUASA PIP
const RenderSuratKuasaPIP: React.FC<{
  profile: SchoolProfile;
  data: SuratKuasaPIPPayload;
}> = ({ profile, data }) => {
  const defaultCity = profile.kota ? profile.kota.replace('Kota ', '').replace('Kabupaten ', '') : '';
  const defaultDateStr = formatDateWithZero(new Date());
  
  let cityDate = defaultCity ? (defaultCity + ', ' + defaultDateStr) : '........................';
  if (data.customCityDate) {
    if (data.customCityDate.includes(',')) {
      const parts = data.customCityDate.split(',');
      const cityName = parts[0].trim();
      const datePart = parts.slice(1).join(',').trim();
      cityDate = (cityName || defaultCity) + ', ' + (datePart ? padIndonesianDate(datePart) : defaultDateStr);
    } else {
      cityDate = data.customCityDate.trim() + ', ' + defaultDateStr;
    }
  }
  
  return (
    <div className="leading-normal font-normal">
      <KopSuratHeader profile={profile} />

      <div className="text-center my-2 font-normal">
        <h2 className="font-bold text-sm sm:text-base uppercase underline tracking-wider leading-tight">
          SURAT KUASA<br />PENCAIRAN DANA PROGRAM INDONESIA PINTAR (PIP)
        </h2>
        <p className="text-[11px] sm:text-xs font-normal">
          Nomor: {data.nomorSurat || <span className="font-normal text-slate-700">...................................................</span>}
        </p>
      </div>

      <div className="space-y-1 text-[11.5px] sm:text-[12px] text-justify leading-snug font-normal">
        <div>
          <p className="mb-0.5 font-normal">Yang bertanda tangan di bawah ini:</p>
          <div className="pl-4 space-y-0.5 font-normal">
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Nama</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-bold">
                {data.namaPemberi ? (
                  <span className="uppercase font-bold">{data.namaPemberi}</span>
                ) : (
                  <span className="font-normal text-slate-700">....................................................................................................</span>
                )}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Tempat/Tgl Lahir</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-normal">
                {data.tempatLahirPemberi || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">NIK</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-mono font-normal">
                {data.nikPemberi || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Alamat</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-normal">
                {data.alamatPemberi || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
          </div>
          <p className="mt-0.5 font-normal">Selanjutnya disebut sebagai <span>Pemberi Kuasa</span>.</p>
        </div>

        <div>
          <p className="mb-0.5 font-normal">Dengan ini memberikan kuasa kepada:</p>
          <div className="pl-4 space-y-0.5 font-normal">
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Nama</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-bold">
                {data.namaPenerima ? (
                  <span className="uppercase font-bold">{data.namaPenerima}</span>
                ) : (
                  <span className="font-normal text-slate-700">....................................................................................................</span>
                )}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Tempat/Tgl Lahir</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-normal">
                {data.tempatLahirPenerima || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">NIK</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-mono font-normal">
                {data.nikPenerima || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Alamat</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-normal">
                {data.alamatPenerima || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
          </div>
          <p className="mt-0.5 font-normal">Selanjutnya disebut sebagai <span>Penerima Kuasa</span>.</p>
        </div>

        <div className="text-center font-bold tracking-widest my-0.5 text-xs uppercase">
          KHUSUS
        </div>

        <div>
          <p className="mb-0.5 font-normal">
            Untuk dan atas nama Pemberi Kuasa melakukan pencairan dana Program Indonesia Pintar (PIP) milik:
          </p>
          <div className="pl-4 space-y-0.5 font-normal">
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Nama Siswa</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-bold">
                {data.namaSiswa ? (
                  <span className="uppercase font-bold">{data.namaSiswa}</span>
                ) : (
                  <span className="font-normal text-slate-700">....................................................................................................</span>
                )}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">NISN</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-mono font-normal">
                {data.nisnSiswa || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-28 sm:w-32 flex-shrink-0 font-normal">Nama Sekolah</span>
              <span className="mr-2">:</span>
              <span className="flex-1 font-normal">
                {data.namaSekolahSiswa || formatSchoolNameForBody(profile.namaSekolah) || <span className="font-normal text-slate-700">....................................................................................................</span>}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-0.5 font-normal">Adapun tindakan yang dikuasakan meliputi:</p>
          <ul className="list-decimal pl-4 space-y-0.5 font-normal">
            <li>Mengurus administrasi pencairan dana PIP di bank penyalur.</li>
            <li>Menandatandatangani dokumen yang diperlukan terkait pencairan dana.</li>
            <li>Menerima dana PIP tersebut.</li>
          </ul>
        </div>

        <p className="text-justify leading-relaxed font-normal">
          Demikian surat kuasa ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
        </p>
      </div>

      {/* Spacing before signature */}
      <div className="mt-2 text-[11.5px] sm:text-[12px] leading-snug font-normal">
        {/* Signatures Grid */}
        <div className="grid grid-cols-2 gap-x-8 text-center font-normal">
          {/* Top Row: Empty on left, City & Date on right */}
          <div></div>
          <div className="font-normal text-center mb-0.5">
            {cityDate}
          </div>

          {/* Header Row */}
          <div>
            <p className="font-normal">Penerima Kuasa,</p>
          </div>
          <div>
            <p className="font-normal">Pemberi Kuasa,</p>
          </div>

          {/* Spacer / Materai Row (Area Tanda Tangan Lapang) */}
          <div className="h-16 flex items-center justify-center">
            <div className="text-[10px] text-slate-400 italic font-mono select-none">[ Tanda Tangan ]</div>
          </div>
          <div className="h-16 flex items-center justify-center">
            {/* Materai box for Pemberi Kuasa */}
            <div className="border border-dashed border-gray-400 w-24 h-10 flex flex-col items-center justify-center text-[8px] text-gray-500 uppercase leading-none select-none bg-slate-50/50">
              <span>Materai</span>
              <span className="font-normal mt-0.5">Rp 10.000</span>
            </div>
          </div>

          {/* Name Row */}
          <div className="px-2">
            <p className="font-bold uppercase break-words">
              {data.namaPenerima || '........................'}
            </p>
          </div>
          <div className="px-2">
            <p className="font-bold uppercase break-words">
              {data.namaPemberi || '........................'}
            </p>
          </div>
        </div>

        {/* Mengetahui Kepala Sekolah at bottom */}
        <div className="mt-3 flex flex-col items-center justify-center text-center font-normal">
          <SignatureBlock profile={profile} alignCenter={true} hideCityDate={true} headerPrefix="Mengetahui," />
        </div>
      </div>
    </div>
  );
};

// 9. SURAT AKTIF BELAJAR
const RenderSuratAktifBelajar: React.FC<{
  profile: SchoolProfile;
  data: SuratAktifBelajarPayload;
}> = ({ profile, data }) => {
  const tp = data.tahunPelajaran || '';
  const jenisKelaminStr = data.jenisKelamin === 'L' ? 'Laki-laki' : data.jenisKelamin === 'P' ? 'Perempuan' : (data.jenisKelamin || '');

  return (
    <div className="font-times text-black text-[13px] sm:text-[14px] leading-relaxed px-4 font-normal">
      <KopSuratHeader profile={profile} />

      <div className="text-center my-6 font-normal">
        <h2 className="font-bold text-base uppercase tracking-wider">
          SURAT KETERANGAN AKTIF BELAJAR
        </h2>
        {/* Underline beneath the title */}
        <div className="w-64 h-[1.5px] bg-black mx-auto mt-0.5"></div>
        <p className="text-sm mt-1 font-normal">Nomor: {data.nomorSurat || EMPTY}</p>
      </div>

      <p className="mb-4 text-justify font-normal">
        Yang bertanda tangan di bawah ini:
      </p>

      {/* Identitas Kepala Sekolah */}
      <div className="pl-6 mb-4 space-y-1 font-normal">
        <Field label="Nama" value={<span className="font-bold">{formatKepsekName(profile.namaKepsek)  || ''}</span>} />
        <Field label="NIP" value={<span className="font-mono font-normal">{profile.nipKepsek  || ''}</span>} />
        <Field label="Jabatan" value="Kepala Sekolah" />
        <Field label="Nama Sekolah" value={formatSchoolNameForBody(profile.namaSekolah)  || ''} />
      </div>

      <p className="mb-4 text-justify font-normal">
        Dengan ini menerangkan bahwa:
      </p>

      {/* Identitas Siswa */}
      <div className="pl-6 mb-4 space-y-1 font-normal">
        <Field label="Nama" value={<span className="font-bold uppercase">{data.namaSiswa  || ''}</span>} />
        <Field label="Tempat/Tgl Lahir" value={data.tempatTanggalLahir  || ''} />
        <Field label="NIS/NISN" value={<span className="font-mono font-normal">{data.nis ? (data.nis + ' / ' + data.nisn) : (data.nisn || '')}</span>} />
        <Field label="Jenis Kelamin" value={jenisKelaminStr} />
        <Field label="Kelas" value={<span className="font-normal">{(data.kelas || '') + (data.jurusan ? (' (' + data.jurusan + ')') : '')}</span>} />
        <Field label="Alamat" value={<span className="break-words text-justify font-normal">{data.alamatSiswa  || ''}</span>} />
      </div>

      <p className="mb-4 text-justify leading-relaxed font-normal">
        Adalah benar siswa/i dari <span>{formatSchoolNameForBody(profile.namaSekolah)  || ''}</span> yang sampai saat ini masih aktif mengikuti kegiatan belajar mengajar pada Tahun Pelajaran <span>{tp}</span>.
      </p>

      <p className="mb-8 text-justify leading-relaxed font-normal">
        Surat keterangan ini dibuat dengan sebenarnya untuk digunakan sebagaimana mestinya.
      </p>

      <SignatureBlock profile={profile} customCityDate={data.customCityDate} isAktifBelajarLayout={true} />
    </div>
  );
};
