'use client';

import React from 'react';
import { SchoolProfile } from '../types';
import { formatSchoolNameForKopHeader } from '../lib/utils';

interface KopSuratHeaderProps {
  profile: SchoolProfile;
}

export const KopSuratHeader: React.FC<KopSuratHeaderProps> = ({ profile }) => {
  return (
    <div className="w-full font-times mb-2.5">
      <div className="flex items-center justify-between text-center pb-2 px-1">
        {/* Left Emblem: Logo Dinas / Pemda / Tut Wuri */}
        <div className="w-24 shrink-0 flex items-center justify-center">
          {profile.logoLeftUrl ? (
            <img
              src={profile.logoLeftUrl}
              alt="Logo Kiri"
              className="w-22 h-22 max-w-[88px] max-h-[88px] object-contain"
            />
          ) : (
            <svg
              className="w-22 h-22 max-w-[88px] max-h-[88px] text-indigo-900"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Tut Wuri Handayani style emblem vector */}
              <circle cx="50" cy="50" r="46" stroke="#1E3A8A" strokeWidth="3" fill="#EFF6FF" />
              <polygon points="50,12 62,35 88,35 67,52 75,76 50,60 25,76 33,52 12,35 38,35" fill="#1D4ED8" />
              <circle cx="50" cy="46" r="14" fill="#F59E0B" />
              <text
                x="50"
                y="86"
                fontSize="8"
                fontWeight="normal"
                fill="#1E3A8A"
                textAnchor="middle"
              >
                TUT WURI HANDAYANI
              </text>
            </svg>
          )}
        </div>

        {/* Center Text Header */}
        <div className="flex-1 px-1.5 text-center leading-tight overflow-hidden">
          <p className="text-sm sm:text-base md:text-[17px] font-bold uppercase tracking-wide text-black whitespace-nowrap">
            {profile.pemerintah || 'PEMERINTAH KABUPATEN BANDUNG BARAT'}
          </p>
          {profile.dinas && profile.dinas.trim() !== '' ? (
            <p className="text-xs sm:text-sm md:text-[15px] font-bold uppercase tracking-wide text-black mt-0.5 whitespace-nowrap">
              {profile.dinas}
            </p>
          ) : null}
          <p className="text-base sm:text-lg md:text-[19px] font-bold uppercase my-0.5 tracking-wide text-black whitespace-nowrap">
            {formatSchoolNameForKopHeader(profile.namaSekolah)}
          </p>
          <p className="text-[11px] font-normal text-gray-900 whitespace-nowrap">
            NPSN: {profile.npsn || '20206123'}
            {profile.akreditasi && profile.akreditasi.trim() !== '' ? ` \u00A0|\u00A0 Akreditasi: ${profile.akreditasi}` : ''}
          </p>
          {/* Address Line (Lurus Memanjang Single Line) */}
          <p className="text-[10px] sm:text-[10.5px] font-normal text-gray-900 leading-normal mt-0.5 whitespace-nowrap">
            {[
              profile.alamat,
              profile.kelurahan ? `Kel. ${profile.kelurahan}` : '',
              profile.kecamatan ? `Kec. ${profile.kecamatan}` : '',
              profile.kota,
              profile.provinsi,
              profile.kodePos ? `Pos ${profile.kodePos}` : ''
            ].filter(Boolean).join(', ')}
          </p>
          {(() => {
            const contactParts: string[] = [];
            if (profile.telepon && profile.telepon.trim() !== '') {
              contactParts.push(`Telp: ${profile.telepon}`);
            }
            if (profile.email && profile.email.trim() !== '') {
              contactParts.push(`Email: ${profile.email}`);
            }
            if (profile.website && profile.website.trim() !== '') {
              contactParts.push(`Website: ${profile.website}`);
            }
            if (contactParts.length === 0) return null;
            return (
              <p className="text-[9.5px] sm:text-[10px] text-gray-800 font-normal whitespace-nowrap">
                {contactParts.join(' \u00A0•\u00A0 ')}
              </p>
            );
          })()}
        </div>

        {/* Right Emblem / Logo Sekolah */}
        <div className="w-24 shrink-0 flex items-center justify-center">
          {profile.logoRightUrl ? (
            <img
              src={profile.logoRightUrl}
              alt="Logo Sekolah"
              className="w-22 h-22 max-w-[88px] max-h-[88px] object-contain"
            />
          ) : (
            <div className="w-22 h-22 max-w-[88px] max-h-[88px] rounded-full border-2 border-amber-600 bg-amber-50 flex flex-col items-center justify-center p-1.5 shadow-xs">
              <span className="text-[9px] font-normal text-amber-900 text-center leading-tight">
                {profile.namaSekolah ? profile.namaSekolah.split(' ').slice(0, 2).join(' ') : 'SDN'}
              </span>
              <span className="text-[8px] text-amber-700 font-normal mt-0.5 uppercase">
                {profile.kota ? profile.kota.replace('Kabupaten ', '').replace('Kota ', '') : 'SEKOLAH'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Official Kop Double Border Line */}
      <div className="w-full mt-1">
        <div className="border-b-[3px] border-black mb-[2px]"></div>
        <div className="border-b-[1px] border-black"></div>
      </div>
    </div>
  );
};
