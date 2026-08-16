'use client';

import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import { compressImageFile } from '../lib/utils';
import {
  Building2,
  Check,
  X,
  MapPin,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface SchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  onSave: (updatedProfile: SchoolProfile) => void;
}

interface ImageUploaderProps {
  label: string;
  sublabel: string;
  value?: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  aspectHint?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  sublabel,
  value,
  onChange,
  icon,
  aspectHint = 'Format PNG / JPG / SVG (Maks. 5MB)',
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress to max 500px resolution for logos, signatures, and stamps
      const result = await compressImageFile(file, 500, 500, 0.75);
      if (result) {
        onChange(result);
      }
    } catch (err) {
      console.error('Failed to compress school profile image:', err);
      // Fallback to reading file normally if compression fails
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onChange(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="font-bold text-slate-800 text-xs">{label}</p>
            <p className="text-[10px] text-slate-500">{sublabel}</p>
          </div>
        </div>
        {value ? (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Ada Gambar
          </span>
        ) : (
          <span className="text-[10px] bg-slate-200/80 text-slate-600 border border-slate-300 px-2 py-0.5 rounded-full font-medium">
            Belum Diupload
          </span>
        )}
      </div>

      {/* Preview Area & Upload Controls */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
        {value ? (
          <div className="relative shrink-0 w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden p-1">
            <img src={value} alt={label} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="shrink-0 w-16 h-16 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-1 text-center">
            <ImageIcon className="w-5 h-5 mb-0.5 text-slate-400" />
            <span className="text-[9px] font-medium leading-none">Kosong</span>
          </div>
        )}

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{value ? 'Ganti File' : 'Upload File'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-slate-500 hover:text-slate-800 text-[11px] underline font-medium ml-auto cursor-pointer"
            >
              {showUrlInput ? 'Sembunyikan URL' : 'Link URL'}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-medium">{aspectHint}</p>
        </div>
      </div>

      {showUrlInput && (
        <div className="pt-1">
          <input
            type="text"
            placeholder="Atau masukkan link URL gambar (https://...)"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white font-mono"
          />
        </div>
      )}
    </div>
  );
};

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...profile });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Pengaturan Profil Sekolah & Kop Surat</h3>
              <p className="text-[11px] text-slate-400">Silakan isi formulir di bawah ini sesuai data resmi sekolah Anda</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs">
          {/* Section 1: Instansi & Sekolah */}
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">
              1. Header Kop Surat (Instansi & Sekolah)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pemerintah Daerah / Provinsi
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Pemerintah Daerah / Provinsi (Contoh: PEMERINTAH KABUPATEN BANDUNG BARAT)"
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium placeholder:text-slate-400 placeholder:font-normal"
                  value={formData.pemerintah || ''}
                  onChange={(e) => setFormData({ ...formData, pemerintah: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dinas Pendidikan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Masukkan Dinas Pendidikan (Contoh: DINAS PENDIDIKAN)"
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium placeholder:text-slate-400 placeholder:font-normal"
                  value={formData.dinas || ''}
                  onChange={(e) => setFormData({ ...formData, dinas: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Resmi Sekolah (Contoh: SD NEGERI MARGAASIH)"
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-indigo-900 placeholder:text-slate-400 placeholder:font-normal"
                  value={formData.namaSekolah || ''}
                  onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  placeholder="Masukkan NPSN (Contoh: 20206123)"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono placeholder:text-slate-400 placeholder:font-normal"
                  value={formData.npsn || ''}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Akreditasi</label>
                <input
                  type="text"
                  placeholder="Masukkan Akreditasi Sekolah (Contoh: A (Sangat Baik))"
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium placeholder:text-slate-400 placeholder:font-normal"
                  value={formData.akreditasi || ''}
                  onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                />
              </div>

              {/* Table / Box Input Alamat Wilayah Sekolah */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Tabel Detail Alamat Wilayah Sekolah
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Alamat, Desa, Kecamatan, Kabupaten</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1">1. Alamat Jalan / Kampung / RT / RW</label>
                  <textarea
                    rows={2}
                    placeholder="Masukkan Alamat Jalan / Kampung / RT / RW Sekolah (Contoh: Jl. Raya Margaasih No. 12 RT 01 / RW 04)"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[65px] font-medium bg-white placeholder:text-slate-400 placeholder:font-normal"
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1">2. Desa / Kelurahan</label>
                    <input
                      type="text"
                      placeholder="Masukkan Desa / Kelurahan (Contoh: Margaasih)"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white placeholder:text-slate-400"
                      value={formData.kelurahan || ''}
                      onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1">3. Kecamatan</label>
                    <input
                      type="text"
                      placeholder="Masukkan Kecamatan (Contoh: Cipatat)"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white placeholder:text-slate-400"
                      value={formData.kecamatan || ''}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1">4. Kabupaten / Kota</label>
                    <input
                      type="text"
                      placeholder="Masukkan Kabupaten / Kota (Contoh: Kabupaten Bandung Barat)"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-medium placeholder:text-slate-400"
                      value={formData.kota || ''}
                      onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1">5. Provinsi</label>
                    <input
                      type="text"
                      placeholder="Masukkan Provinsi (Contoh: Jawa Barat)"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white placeholder:text-slate-400"
                      value={formData.provinsi || ''}
                      onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1">6. Kode Pos</label>
                    <input
                      type="text"
                      placeholder="Masukkan Kode Pos (Contoh: 40552)"
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white font-mono placeholder:text-slate-400"
                      value={formData.kodePos || ''}
                      onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  No. Telepon Sekolah <span className="text-slate-400 font-normal">(Muncul jika diisi)</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan No. Telepon Sekolah (Contoh: (022) 6865123)"
                  className="w-full border border-slate-300 rounded-lg p-2 placeholder:text-slate-400"
                  value={formData.telepon || ''}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="text"
                  placeholder="Masukkan Email Resmi (Contoh: sdnmargaasih@gmail.com)"
                  className="w-full border border-slate-300 rounded-lg p-2 placeholder:text-slate-400"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Website Sekolah</label>
                <input
                  type="text"
                  placeholder="Masukkan Website Sekolah (Contoh: www.sdnmargaasih.sch.id)"
                  className="w-full border border-slate-300 rounded-lg p-2 placeholder:text-slate-400"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload Logo Kop Surat */}
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>2. Upload Logo Kop Surat</span>
              <span className="text-[10px] text-indigo-600 lowercase font-normal">
                Disarankan PNG transparan tanpa background
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ImageUploader
                label="Logo Dinas / Pemda (Kiri Kop)"
                sublabel="Lambang Pemerintah Daerah / Tut Wuri"
                value={formData.logoLeftUrl}
                onChange={(url) => setFormData({ ...formData, logoLeftUrl: url })}
                icon={<Building2 className="w-4 h-4 text-indigo-600" />}
                aspectHint="Direkomendasikan rasio 1:1, transparan PNG"
              />

              <ImageUploader
                label="Logo Sekolah (Kanan Kop)"
                sublabel="Logo / Lambang Resmi Sekolah"
                value={formData.logoRightUrl}
                onChange={(url) => setFormData({ ...formData, logoRightUrl: url })}
                icon={<ImageIcon className="w-4 h-4 text-indigo-600" />}
                aspectHint="Direkomendasikan rasio 1:1, transparan PNG"
              />
            </div>
          </div>

          {/* Section 3: Penandatangan (Kepala Sekolah) */}
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-200">
              3. Data Kepala Sekolah (Penandatangan)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Kepala Sekolah
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Lengkap & Gelar (Contoh: AHMAD ALRIDA, S.Pd., M.Pd.)"
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold placeholder:text-slate-400 placeholder:font-normal"
                  value={formData.namaKepsek || ''}
                  onChange={(e) => setFormData({ ...formData, namaKepsek: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  placeholder="Masukkan NIP Kepala Sekolah (Contoh: 19840410 201001 1 019)"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold placeholder:text-slate-400 placeholder:font-normal"
                  value={formData.nipKepsek || ''}
                  onChange={(e) => setFormData({ ...formData, nipKepsek: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pangkat & Golongan</label>
                <input
                  type="text"
                  placeholder="Masukkan Pangkat & Golongan (Contoh: Penata Tk. I (III/d))"
                  className="w-full border border-slate-300 rounded-lg p-2 placeholder:text-slate-400"
                  value={formData.pangkatKepsek || ''}
                  onChange={(e) => setFormData({ ...formData, pangkatKepsek: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan Resmi</label>
                <input
                  type="text"
                  placeholder="Masukkan Jabatan Resmi (Contoh: Kepala Sekolah)"
                  className="w-full border border-slate-300 rounded-lg p-2 placeholder:text-slate-400"
                  value={formData.jabatanKepsek || ''}
                  onChange={(e) => setFormData({ ...formData, jabatanKepsek: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
