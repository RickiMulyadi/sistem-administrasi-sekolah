'use client';

import React from 'react';
import { SchoolProfile } from '../types';

interface DocumentWatermarkProps {
  profile: SchoolProfile;
  opacity?: number;
}

export const DocumentWatermark: React.FC<DocumentWatermarkProps> = ({
  profile,
  opacity = 0.07,
}) => {
  const logoSrc = profile.logoRightUrl || profile.logoLeftUrl;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none overflow-hidden"
      style={{ opacity }}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt="Watermark Logo Sekolah"
          className="w-[130mm] h-[130mm] max-w-[480px] max-h-[480px] object-contain grayscale filter select-none"
        />
      ) : (
        <svg
          className="w-[130mm] h-[130mm] max-w-[480px] max-h-[480px] text-gray-900 select-none"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="3" fill="none" />
          <polygon points="50,12 62,35 88,35 67,52 75,76 50,60 25,76 33,52 12,35 38,35" fill="currentColor" />
          <circle cx="50" cy="46" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
};
