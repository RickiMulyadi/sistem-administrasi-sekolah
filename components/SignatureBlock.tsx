'use client';

import React from 'react';
import { SchoolProfile } from '../types';
import { padIndonesianDate, formatDateWithZero, formatSchoolNameForBody, formatKepsekName } from '../lib/utils';

interface SignatureBlockProps {
  profile: SchoolProfile;
  customCityDate?: string;
  customPositionTitle?: string;
  headerPrefix?: string;
  alignRight?: boolean;
  alignCenter?: boolean;
  hideCityDate?: boolean;
  isAktifBelajarLayout?: boolean;
  issuanceLabel?: string;
  compact?: boolean;
}

export const SignatureBlock: React.FC<SignatureBlockProps> = ({
  profile,
  customCityDate,
  customPositionTitle,
  headerPrefix,
  alignRight = true,
  alignCenter = false,
  hideCityDate = false,
  isAktifBelajarLayout = false,
  issuanceLabel = 'Ditetapkan di',
  compact = false,
}) => {
  const rawCity = (profile.kota ? profile.kota.replace('Kota ', '').replace('Kabupaten ', '').trim() : '') || (profile.kecamatan ? profile.kecamatan.trim() : '');
  const defaultDateStr = formatDateWithZero(new Date());

  let cityDate = rawCity ? `${rawCity}, ${defaultDateStr}` : defaultDateStr;
  let issuanceCity = rawCity;
  let issuanceDate = defaultDateStr;

  if (customCityDate && customCityDate.trim()) {
    const cleanedCustom = customCityDate.trim().replace(/^[,\s]+/, '');
    if (cleanedCustom.includes(',')) {
      const parts = cleanedCustom.split(',');
      const cityName = parts[0].trim();
      const datePart = parts.slice(1).join(',').trim();
      if (cityName) {
        cityDate = `${cityName}, ${datePart ? padIndonesianDate(datePart) : defaultDateStr}`;
        issuanceCity = cityName;
      } else if (rawCity) {
        cityDate = `${rawCity}, ${datePart ? padIndonesianDate(datePart) : defaultDateStr}`;
        issuanceCity = rawCity;
      } else {
        cityDate = datePart ? padIndonesianDate(datePart) : defaultDateStr;
      }
      issuanceDate = datePart ? padIndonesianDate(datePart) : defaultDateStr;
    } else {
      cityDate = rawCity ? `${rawCity}, ${padIndonesianDate(cleanedCustom)}` : padIndonesianDate(cleanedCustom);
      issuanceCity = rawCity;
      issuanceDate = padIndonesianDate(cleanedCustom);
    }
  }

  const positionTitle = customPositionTitle || 'Kepala Sekolah';

  return (
    <div
      className={`w-full font-times text-black text-[13.5px] sm:text-sm flex ${
        alignCenter ? 'justify-center' : alignRight ? 'justify-end mt-2' : 'justify-start mt-2'
      }`}
    >
      <div className={`w-72 sm:w-80 max-w-full relative select-none ${alignCenter ? 'text-center' : 'text-left'}`}>
        {/* Stempel / Cap Basah - Posisi & Ukuran Persis Seperti Gambar 1 (Atas di font Tanggal/Kepsek, Bawah di NIP, Kiri menimpa TTD & teks) */}
        {(profile.showStempel || Boolean(profile.stempelUrl)) && (
          profile.stempelUrl ? (
            <img
              src={profile.stempelUrl}
              alt="Cap Basah / Stempel Resmi"
              className={`absolute object-contain pointer-events-none z-20 mix-blend-multiply opacity-90 -rotate-3 print:opacity-95 ${
                alignCenter
                  ? 'left-1/2 -translate-x-[90%] -top-3'
                  : '-left-6 sm:-left-7 -top-3'
              }`}
              style={{ width: '145px', height: '145px', maxWidth: 'none', maxHeight: 'none' }}
            />
          ) : (
            <div
              className={`absolute rounded-full border-2 border-indigo-900/85 flex items-center justify-center p-2 pointer-events-none opacity-85 z-20 mix-blend-multiply bg-indigo-50/15 -rotate-3 ${
                alignCenter
                  ? 'left-1/2 -translate-x-[90%] -top-3'
                  : '-left-6 sm:-left-7 -top-3'
              }`}
              style={{ width: '145px', height: '145px' }}
            >
              <div className="w-full h-full rounded-full border border-dashed border-indigo-900 flex flex-col items-center justify-center text-center p-1">
                <span className="text-[9px] sm:text-[9.5px] font-bold text-indigo-950 uppercase leading-none tracking-tight">
                  PEMERINTAH {profile.kota.replace('Kota ', '').replace('Kabupaten ', '').toUpperCase()}
                </span>
                <span className="text-[7.5px] sm:text-[8px] font-bold text-indigo-900 my-1 leading-none truncate max-w-full px-0.5">
                  ★ {formatSchoolNameForBody(profile.namaSekolah)} ★
                </span>
                <span className="text-[8px] sm:text-[8.5px] font-bold text-indigo-950 border-y border-indigo-800 w-full py-0.5 uppercase tracking-tighter leading-none">
                  STEMPEL RESMI
                </span>
                <span className="text-[7.5px] sm:text-[8px] font-bold text-indigo-900 mt-1 leading-none">
                  DINAS PENDIDIKAN
                </span>
              </div>
            </div>
          )
        )}

        {/* Tempat & Tanggal Surat */}
        {isAktifBelajarLayout ? (
          <div className="mb-1 text-[13.5px] sm:text-sm text-left relative z-10">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="py-0.5 w-[110px] font-normal">{issuanceLabel}</td>
                  <td className="py-0.5 w-[15px]">:</td>
                  <td className="py-0.5 font-normal">{issuanceCity || '........................................'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 font-normal">Pada tanggal</td>
                  <td className="py-0.5">:</td>
                  <td className="py-0.5 font-normal">{issuanceDate || '........................................'}</td>
                </tr>
              </tbody>
            </table>
            <div className="border-b-2 border-black mt-1 mb-1 w-full"></div>
          </div>
        ) : (
          !hideCityDate && (
            <p className={`text-[13.5px] sm:text-sm mb-0.5 font-normal leading-tight relative z-10 ${alignCenter ? 'text-center' : 'text-left'}`}>
              {cityDate}
            </p>
          )
        )}

        {/* Header Prefix (Misal: "Mengetahui,") */}
        {headerPrefix && (
          <p className={`font-normal text-[13.5px] sm:text-sm leading-tight mb-0.5 relative z-10 ${alignCenter ? 'text-center' : 'text-left'}`}>
            {headerPrefix}
          </p>
        )}

        {/* Jabatan */}
        <p className={`font-normal text-[13.5px] sm:text-sm leading-tight mb-0.5 relative z-10 ${alignCenter ? 'text-center' : 'text-left'}`}>
          {positionTitle}
        </p>

        {/* Nama Sekolah (jika ada) */}
        {profile.namaSekolah && (
          <p className={`font-normal text-[13.5px] sm:text-sm leading-tight break-words text-black mb-0.5 relative z-10 ${alignCenter ? 'text-center' : 'text-left'}`}>
            {formatSchoolNameForBody(profile.namaSekolah)}
          </p>
        )}

        {/* Area TTD (Tanda Tangan) - Tinggi Standar Gambar 1 */}
        <div className={`relative my-0.5 h-18 sm:h-20 flex items-center ${
          alignCenter ? 'justify-center' : 'justify-start'
        }`}>
          {profile.ttdKepsekUrl && profile.showTTD ? (
            <img
              src={profile.ttdKepsekUrl}
              alt="TTD Kepala Sekolah"
              className={`absolute -top-3 object-contain mix-blend-multiply pointer-events-none z-10 scale-105 ${
                alignCenter ? 'left-1/2 -translate-x-1/2' : 'left-8 sm:left-10'
              }`}
              style={{ height: '85px', width: 'auto', maxWidth: '230px' }}
            />
          ) : (
            <div className="h-16 sm:h-18 w-full"></div>
          )}

          {/* Verification QR Code (Jika diaktifkan) */}
          {profile.showQRCode && (
            <div className="absolute right-0 bottom-0 bg-white p-0.5 border border-gray-300 rounded shadow-sm z-30">
              <div className="w-7 h-7 text-[6px] bg-slate-100 flex flex-col items-center justify-center text-gray-700 font-mono text-center leading-none p-0.5">
                <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5 bg-gray-200">
                  <div className="bg-black"></div>
                  <div className="bg-white"></div>
                  <div className="bg-black"></div>
                  <div className="bg-white"></div>
                  <div className="bg-black"></div>
                  <div className="bg-black"></div>
                  <div className="bg-black"></div>
                  <div className="bg-white"></div>
                  <div className="bg-black"></div>
                </div>
                <span className="scale-75 font-bold">SAH</span>
              </div>
            </div>
          )}
        </div>

        {/* Nama Kepala Sekolah (Tebal & Bergaris Bawah Bersih Tanpa Garis Ganda) */}
        {profile.namaKepsek ? (
          <p className={`font-bold underline text-[13.5px] sm:text-sm tracking-wide relative z-10 leading-snug ${alignCenter ? 'text-center' : 'text-left'}`}>
            {formatKepsekName(profile.namaKepsek)}
          </p>
        ) : (
          <p className={`text-[13.5px] sm:text-sm font-semibold tracking-wider relative z-10 leading-snug select-none ${alignCenter ? 'text-center' : 'text-left'}`}>
            ........................................................................
          </p>
        )}

        {/* Pangkat / Golongan (Jika ada) */}
        {profile.pangkatKepsek && (
          <p className={`text-[13.5px] sm:text-sm relative z-10 leading-snug ${alignCenter ? 'text-center' : 'text-left'}`}>
            {profile.pangkatKepsek}
          </p>
        )}

        {/* NIP */}
        <p className={`text-[13.5px] sm:text-sm font-normal relative z-10 leading-snug ${alignCenter ? 'text-center' : 'text-left'}`}>
          {profile.nipKepsek ? `NIP. ${profile.nipKepsek}` : 'NIP. ....................................................'}
        </p>
      </div>
    </div>
  );
};

