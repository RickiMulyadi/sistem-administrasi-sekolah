'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserSession, UserAccount, UserRole } from '../types';
import { compressImageFile } from '../lib/utils';
import { getUserAccounts, saveUserAccounts, updateSingleUserAccount } from '../lib/storage';
import {
  ShieldCheck,
  Check,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  User,
  Briefcase,
  Key,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onUpdateSession: (updated: UserSession) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateSession,
}) => {
  const [formData, setFormData] = useState<UserSession>({ ...session });
  const [usernameInput, setUsernameInput] = useState(session.username);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({ ...session });
    setUsernameInput(session.username);
    setUrlInput(session.avatarUrl || '');
    // Fetch current stored password for this user
    const accounts = getUserAccounts();
    const currentAcc = accounts.find((a) => a.username.toLowerCase() === session.username.toLowerCase());
    if (currentAcc && currentAcc.password) {
      setPasswordInput(currentAcc.password);
    } else {
      setPasswordInput('123');
    }
  }, [session, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const base64 = await compressImageFile(file, 600, 600, 0.85);
      setFormData((prev) => ({ ...prev, avatarUrl: base64 }));
    } catch (err) {
      console.error('Failed to compress avatar image', err);
      alert('Gagal memproses gambar. Silakan gunakan format PNG/JPG standar.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setFormData((prev) => ({ ...prev, avatarUrl: urlInput.trim() }));
      setIsUrlMode(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: undefined }));
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap.trim()) {
      alert('Nama lengkap tidak boleh kosong.');
      return;
    }
    if (!usernameInput.trim()) {
      alert('Username masuk tidak boleh kosong.');
      return;
    }
    if (!passwordInput.trim()) {
      alert('Kata sandi tidak boleh kosong.');
      return;
    }

    const cleanNewUsername = usernameInput.trim().toLowerCase();
    const cleanOldUsername = session.username.trim().toLowerCase();

    // Check duplicate username if username changed
    if (cleanNewUsername !== cleanOldUsername) {
      const accounts = getUserAccounts();
      const isTaken = accounts.some(
        (a) => a.username.toLowerCase() === cleanNewUsername && a.username.toLowerCase() !== cleanOldUsername
      );
      if (isTaken) {
        alert(`Username "${cleanNewUsername}" sudah digunakan oleh akun lain. Silakan gunakan username lain.`);
        return;
      }
    }

    const cleanJabatan = formData.jabatan?.trim() || (formData.role === 'Admin TU' ? 'Kepala Tata Usaha' : formData.role);

    const updatedSessionData: UserSession = {
      ...formData,
      username: cleanNewUsername,
      namaLengkap: formData.namaLengkap.trim(),
      jabatan: cleanJabatan,
    };

    // 1. Sync to stored user accounts so it persists across logouts, logins, and sessions
    updateSingleUserAccount(
      session.username,
      {
        namaLengkap: formData.namaLengkap.trim(),
        role: formData.role,
        jabatan: cleanJabatan,
        avatarUrl: formData.avatarUrl,
        password: passwordInput.trim(),
      },
      cleanNewUsername
    );

    // 2. Update session in active state
    onUpdateSession(updatedSessionData);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] font-sans">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md border border-amber-300/50">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Pengaturan Profil Pengguna Aktif
              </h3>
              <p className="text-xs text-amber-300/90 font-medium">
                Sesuaikan nama, jabatan, role akses, dan foto profil akun Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Foto Profil / Avatar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <label className="block font-bold text-slate-800 text-xs">Foto Profil / Avatar</label>

            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden flex items-center justify-center text-white font-black text-xl">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{formData.namaLengkap ? formData.namaLengkap.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCompressing ? 'Memproses...' : 'Upload Foto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUrlMode(!isUrlMode)}
                    className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Link URL</span>
                  </button>

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-500">
                  Disarankan foto rasio 1:1 format PNG / JPG beresolusi jelas.
                </p>
              </div>
            </div>

            {/* URL Input Bar */}
            {isUrlMode && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://contoh.com/foto-profil.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Data Informasi Pengguna */}
          <div className="space-y-3.5">
            {/* Nama Lengkap */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nama Lengkap Pengguna *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: RIKI MULYADI"
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
            </div>

            {/* Jabatan Pengguna */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Jabatan / Tugas Pengguna *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kepala Tata Usaha, Operator Sekolah, Guru, Staf TU"
                value={formData.jabatan || ''}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Hak Akses / Role */}
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hak Akses / Role *</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  const defaultJabatanMap: Record<string, string> = {
                    'Admin TU': 'Kepala Tata Usaha',
                    'Tenaga Administrasi': 'Tenaga Administrasi',
                  };
                  setFormData({
                    ...formData,
                    role: newRole,
                    jabatan: formData.jabatan || defaultJabatanMap[newRole] || (newRole === 'Admin TU' ? 'Kepala Tata Usaha' : 'Tenaga Administrasi'),
                  });
                }}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer bg-white"
              >
                <option value="Admin TU">Admin TU</option>
                <option value="Tenaga Administrasi">Tenaga Administrasi</option>
              </select>
            </div>

            {/* Grid 2 Columns for Username & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Username Login */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Username Masuk *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full border border-slate-300 focus:border-indigo-500 rounded-lg py-2.5 pl-8 pr-3 font-mono font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    placeholder="Username akun..."
                  />
                </div>
              </div>

              {/* Kata Sandi / Password */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kata Sandi / Password *</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full border border-slate-300 focus:border-indigo-500 rounded-lg py-2.5 pl-8 pr-9 font-mono font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    placeholder="Kata sandi baru..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-amber-600" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Perubahan username dan kata sandi akan <strong>tersimpan otomatis</strong> di database sekolah dan langsung aktif untuk sesi login berikutnya.
              </p>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Profil Pengguna</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
