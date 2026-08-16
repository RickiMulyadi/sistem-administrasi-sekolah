import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSchoolNameForBody(rawName: string): string {
  if (!rawName) return '';
  let str = rawName.trim();

  // Replace full uppercase names with standard title case abbreviations
  str = str.replace(/SEKOLAH DASAR NEGERI/gi, 'SD Negeri');
  str = str.replace(/SEKOLAH DASAR/gi, 'SD');
  str = str.replace(/SEKOLAH MENENGAH PERTAMA NEGERI/gi, 'SMP Negeri');
  str = str.replace(/SEKOLAH MENENGAH PERTAMA/gi, 'SMP');
  str = str.replace(/SEKOLAH MENENGAH ATAS NEGERI/gi, 'SMA Negeri');
  str = str.replace(/SEKOLAH MENENGAH ATAS/gi, 'SMA');
  str = str.replace(/SEKOLAH MENENGAH KEJURUAN NEGERI/gi, 'SMK Negeri');
  str = str.replace(/SEKOLAH MENENGAH KEJURUAN/gi, 'SMK');
  str = str.replace(/MADRASAH IBTIDAIYAH NEGERI/gi, 'MIN');
  str = str.replace(/MADRASAH TSANAWIYAH NEGERI/gi, 'MTsN');
  str = str.replace(/MADRASAH ALIYAH NEGERI/gi, 'MAN');

  // Handle uppercase abbreviations like SD NEGERI, SMP NEGERI
  str = str.replace(/\bSD NEGERI\b/gi, 'SD Negeri');
  str = str.replace(/\bSMP NEGERI\b/gi, 'SMP Negeri');
  str = str.replace(/\bSMA NEGERI\b/gi, 'SMA Negeri');
  str = str.replace(/\bSMK NEGERI\b/gi, 'SMK Negeri');

  return str
    .split(' ')
    .map((word) => {
      if (!word) return '';
      const upper = word.toUpperCase();
      if (['SD', 'SMP', 'SMA', 'SMK', 'MIN', 'MAN', 'MTSN', 'MTS', 'MI', 'MA', 'UPTD', 'UIN', 'IAIN', 'STAIN'].includes(upper)) {
        if (upper === 'MTSN') return 'MTsN';
        if (upper === 'MTS') return 'MTs';
        return upper;
      }
      if (upper === 'NEGERI' || upper === 'NEGRI') {
        return 'Negeri';
      }
      if (/^\d+$/.test(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(' ');
}

export function formatSchoolNameForKopHeader(rawName?: string): string {
  if (!rawName || rawName.trim() === '') return 'SEKOLAH DASAR NEGERI MARGAASIH';
  let str = rawName.trim().toUpperCase();

  // Convert "SD NEGERI MARGAASIH", "SDN MARGAASIH", "SD MARGAASIH" to "SEKOLAH DASAR NEGERI ..."
  if (str.startsWith('SD NEGERI ')) {
    str = str.replace(/^SD NEGERI /, 'SEKOLAH DASAR NEGERI ');
  } else if (str.startsWith('SDN ')) {
    str = str.replace(/^SDN /, 'SEKOLAH DASAR NEGERI ');
  } else if (str.startsWith('SD ')) {
    str = str.replace(/^SD /, 'SEKOLAH DASAR NEGERI ');
  } else if (str === 'SD NEGERI MARGAASIH' || str === 'SD MARGAASIH' || str === 'SDN MARGAASIH') {
    str = 'SEKOLAH DASAR NEGERI MARGAASIH';
  }

  return str;
}

export function terbilang(n: number): string {
  if (isNaN(n) || n <= 0) return '';
  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function helper(val: number): string {
    if (val < 12) {
      return angka[val];
    } else if (val < 20) {
      return helper(val - 10) + ' Belas';
    } else if (val < 100) {
      return helper(Math.floor(val / 10)) + ' Puluh ' + helper(val % 10);
    } else if (val < 200) {
      return 'Seratus ' + helper(val - 100);
    } else if (val < 1000) {
      return helper(Math.floor(val / 100)) + ' Ratus ' + helper(val % 100);
    } else if (val < 2000) {
      return 'Seribu ' + helper(val - 1000);
    } else if (val < 1000000) {
      return helper(Math.floor(val / 1000)) + ' Ribu ' + helper(val % 1000);
    } else if (val < 1000000000) {
      return helper(Math.floor(val / 1000000)) + ' Juta ' + helper(val % 1000000);
    } else if (val < 1000000000000) {
      return helper(Math.floor(val / 1000000000)) + ' Miliar ' + helper(val % 1000000000);
    }
    return val.toString();
  }

  const result = helper(n).replace(/\s+/g, ' ').trim();
  return result ? result + ' Rupiah' : '';
}

export function formatNominalPIP(val: string): string {
  if (!val) return '';
  const str = val.trim();

  // If already formatted with terbilang e.g. "Rp 450.000 (Empat Ratus...)" or contains "("
  if (str.includes('(') && str.includes(')')) {
    return str;
  }

  // Extract digits only
  const cleanDigits = str.replace(/\D/g, '');
  if (!cleanDigits) return str;

  const num = parseInt(cleanDigits, 10);
  if (isNaN(num) || num <= 0) return str;

  const formattedNum = num.toLocaleString('id-ID');
  const terbilangText = terbilang(num);

  if (terbilangText) {
    return `Rp ${formattedNum} (${terbilangText})`;
  }

  return `Rp ${formattedNum}`;
}

export function formatKelasTerbilang(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();

  // If already contains parentheses with terbilang e.g. "IV (Empat)", return clean
  if (/\(.*\)/.test(str)) {
    return str;
  }

  const numberWordMap: Record<string, { roman: string; word: string }> = {
    '1': { roman: 'I', word: 'Satu' },
    '2': { roman: 'II', word: 'Dua' },
    '3': { roman: 'III', word: 'Tiga' },
    '4': { roman: 'IV', word: 'Empat' },
    '5': { roman: 'V', word: 'Lima' },
    '6': { roman: 'VI', word: 'Enam' },
    '7': { roman: 'VII', word: 'Tujuh' },
    '8': { roman: 'VIII', word: 'Delapan' },
    '9': { roman: 'IX', word: 'Sembilan' },
    '10': { roman: 'X', word: 'Sepuluh' },
    '11': { roman: 'XI', word: 'Sebelas' },
    '12': { roman: 'XII', word: 'Dua Belas' },
  };

  const romanWordMap: Record<string, { num: string; word: string }> = {
    'I': { num: '1', word: 'Satu' },
    'II': { num: '2', word: 'Dua' },
    'III': { num: '3', word: 'Tiga' },
    'IV': { num: '4', word: 'Empat' },
    'V': { num: '5', word: 'Lima' },
    'VI': { num: '6', word: 'Enam' },
    'VII': { num: '7', word: 'Tujuh' },
    'VIII': { num: '8', word: 'Delapan' },
    'IX': { num: '9', word: 'Sembilan' },
    'X': { num: '10', word: 'Sepuluh' },
    'XI': { num: '11', word: 'Sebelas' },
    'XII': { num: '12', word: 'Dua Belas' },
  };

  // Case 1: Simple single number or Roman numeral, e.g. "4", "IV", "iv", "4 / IV"
  const clean = str.replace(/^kelas\s+/i, '').trim();

  // Exact number key
  if (numberWordMap[clean]) {
    const item = numberWordMap[clean];
    return `${item.roman} (${item.word})`;
  }

  // Exact roman key
  const upperClean = clean.toUpperCase();
  if (romanWordMap[upperClean]) {
    const item = romanWordMap[upperClean];
    return `${upperClean} (${item.word})`;
  }

  // Handle "4/IV" or "IV / 4"
  if (/^(4|IV)\s*[\/\-]\s*(4|IV)$/i.test(clean)) {
    return `IV (${romanWordMap['IV'].word})`;
  }

  // Case 2: Class with letters/stream e.g. "4 A", "IV A", "Kelas 4 A", "XI MIPA 1"
  const romanMatch = str.match(/\b(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)\b/i);
  if (romanMatch) {
    const romanUpper = romanMatch[1].toUpperCase();
    const word = romanWordMap[romanUpper]?.word;
    if (word) {
      return `${str} (${word})`;
    }
  }

  const numMatch = str.match(/\b([1-9]|1[0-2])\b/);
  if (numMatch) {
    const num = numMatch[1];
    const item = numberWordMap[num];
    if (item) {
      return `${str} (${item.word})`;
    }
  }

  return str;
}

export function padIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  let str = dateStr;
  // Replace single digit days before month names e.g. "1 Agustus 2026" -> "01 Agustus 2026"
  str = str.replace(/(\b)([1-9])\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b/gi, (match, wordBoundary, day, month) => {
    return `${wordBoundary}0${day} ${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()}`;
  });
  // Also handle single digit before s.d. or - in date ranges e.g. "1 s.d. 5 Agustus" -> "01 s.d. 05 Agustus"
  str = str.replace(/(\b)([1-9])\s+(s\.?d\.?|\-)\s+([0-9]{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b/gi, (match, wordBoundary, day1, sep, day2, month) => {
    const d1 = day1.padStart(2, '0');
    const d2 = day2.padStart(2, '0');
    return `${wordBoundary}${d1} ${sep} ${d2} ${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()}`;
  });
  return str;
}

export function formatDateWithZero(d: Date | string = new Date()): string {
  if (typeof d === 'string') {
    return padIndonesianDate(d);
  }
  const day = String(d.getDate()).padStart(2, '0');
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatTahunPelajaran(raw?: string): string {
  if (!raw || !raw.trim()) {
    const currentYear = new Date().getFullYear();
    return `${currentYear} / ${currentYear + 1}`;
  }

  const str = raw.trim();

  // If already matches "2026 / 2027" or "2026/2027"
  const rangeMatch = str.match(/^(\d{4})\s*[\/\-]\s*(\d{4})$/);
  if (rangeMatch) {
    return `${rangeMatch[1]} / ${rangeMatch[2]}`;
  }

  // If single 4-digit year like "2026" or "2027"
  const singleYearMatch = str.match(/^(\d{4})$/);
  if (singleYearMatch) {
    const yr = parseInt(singleYearMatch[1], 10);
    return `${yr} / ${yr + 1}`;
  }

  return str;
}

export function formatKepsekName(rawName?: string): string {
  if (!rawName || !rawName.trim()) return '';
  let str = rawName.trim();

  // Standardize comma spacing e.g. "RIKI MULYADI,S.PD" -> "RIKI MULYADI, S.PD"
  str = str.replace(/,\s*/g, ', ');

  const fixTitles = (titleStr: string) => {
    return titleStr
      .replace(/\bS\.PD\.SD\b/gi, 'S.Pd.SD')
      .replace(/\bS\.PD\.I\b/gi, 'S.Pd.I')
      .replace(/\bS\.PD\b/gi, 'S.Pd')
      .replace(/\bM\.PD\.I\b/gi, 'M.Pd.I')
      .replace(/\bM\.PD\b/gi, 'M.Pd')
      .replace(/\bS\.AG\b/gi, 'S.Ag')
      .replace(/\bM\.AG\b/gi, 'M.Ag')
      .replace(/\bS\.KOM\b/gi, 'S.Kom')
      .replace(/\bM\.KOM\b/gi, 'M.Kom')
      .replace(/\bS\.SOS\b/gi, 'S.Sos')
      .replace(/\bM\.SOS\b/gi, 'M.Sos')
      .replace(/\bS\.PSI\b/gi, 'S.Psi')
      .replace(/\bM\.PSI\b/gi, 'M.Psi')
      .replace(/\bS\.KED\b/gi, 'S.Ked')
      .replace(/\bS\.HUM\b/gi, 'S.Hum')
      .replace(/\bS\.SI\b/gi, 'S.Si')
      .replace(/\bM\.SI\b/gi, 'M.Si')
      .replace(/\bS\.E\b/gi, 'S.E')
      .replace(/\bM\.M\b/gi, 'M.M')
      .replace(/\bS\.T\b/gi, 'S.T')
      .replace(/\bM\.T\b/gi, 'M.T')
      .replace(/\bS\.AP\b/gi, 'S.AP')
      .replace(/\bS\.IP\b/gi, 'S.IP')
      .replace(/\bDRA\.\b/gi, 'Dra.')
      .replace(/\bDRS\.\b/gi, 'Drs.')
      .replace(/\bHJ\.\b/gi, 'Hj.')
      .replace(/\bH\.\b/gi, 'H.')
      .replace(/\bPROF\.\b/gi, 'Prof.')
      .replace(/\bDR\.\b/gi, 'Dr.');
  };

  if (str.includes(',')) {
    const parts = str.split(',');
    const namePart = parts[0].trim().toUpperCase();
    const titlesPart = parts.slice(1).join(', ');
    return `${namePart}, ${fixTitles(titlesPart)}`;
  }

  return fixTitles(str);
}

/**
 * Compresses an image File using Canvas and returns its base64 representation.
 * Downscales images to specified max dimensions and quality.
 */
export function compressImageFile(
  file: File,
  maxWidth: number = 1000,
  maxHeight: number = 1000,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a browser context, resolve immediately
    if (typeof window === 'undefined') {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Str = e.target?.result as string;
      if (!base64Str) {
        resolve('');
        return;
      }

      // SVG files are vectors, we should NOT compress them to canvas
      if (file.type === 'image/svg+xml') {
        resolve(base64Str);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // For large images (like wallpapers) or JPEGs, always use JPEG/WebP to ensure quality compression works
        // Only keep PNG for small logos/icons (width <= 400)
        let outputType = 'image/jpeg';
        if (file.type === 'image/png' && maxWidth <= 400 && maxHeight <= 400) {
          outputType = 'image/png';
        }

        try {
          const compressed = canvas.toDataURL(outputType, quality);
          resolve(compressed);
        } catch (err) {
          console.error('Canvas compression error, fallback to jpeg:', err);
          try {
            const fallback = canvas.toDataURL('image/jpeg', 0.6);
            resolve(fallback);
          } catch {
            resolve(base64Str);
          }
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
      img.src = base64Str;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Dedicated wallpaper compressor: compresses any high-res wallpaper down to crisp 720p/1080p JPEG (~70-150KB)
 * so it fits effortlessly into storage without ever exceeding browser quotas.
 */
export async function compressWallpaperFile(file: File): Promise<string> {
  return compressImageFile(file, 1920, 1080, 0.72);
}

/**
 * Compresses an image Base64 string to a targeted resolution and quality using Canvas.
 * This ensures any existing base64 strings can also be compressed.
 */
export function compressImageBase64(
  base64Str: string,
  maxWidth: number = 1000,
  maxHeight: number = 1000,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(base64Str);
      return;
    }

    // If it's not a standard image data URL, or it's very short, return as-is
    if (!base64Str || !base64Str.startsWith('data:image/') || base64Str.length < 50 * 1024) {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Determine output mime type
      const mimeType = base64Str.split(';')[0].split(':')[1] || 'image/jpeg';
      const outputMime = mimeType === 'image/png' || mimeType === 'image/svg+xml' ? 'image/png' : 'image/jpeg';

      try {
        const compressed = canvas.toDataURL(outputMime, quality);
        resolve(compressed);
      } catch (err) {
        console.error('Failed to compress base64', err);
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
}
