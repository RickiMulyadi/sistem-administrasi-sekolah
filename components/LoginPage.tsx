'use client';

import React, { useState, useEffect } from 'react';
import { UserSession } from '../types';
import { getSchoolProfile, getUserAccounts, getDeveloperBg, addPasswordResetRequest } from '../lib/storage';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  KeyRound,
  FileText,
  Bookmark,
  Briefcase,
  Layers,
  GraduationCap,
  ChevronRight,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Bell,
  School,
  Hash,
  Send,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { showToast } from '../lib/toast';
import { NotificationToastContainer } from './NotificationToast';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const profile = getSchoolProfile();
  const [accountsList] = useState(() => getUserAccounts());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);
  const [attemptedUsername, setAttemptedUsername] = useState('');

  // Password Reset Request Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotNamaSekolah, setForgotNamaSekolah] = useState('');
  const [forgotNpsn, setForgotNpsn] = useState('');
  const [forgotUsernameInput, setForgotUsernameInput] = useState('');
  const [forgotNamaPengaju, setForgotNamaPengaju] = useState('');
  const [forgotKontak, setForgotKontak] = useState('');
  const [forgotCatatan, setForgotCatatan] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Connect Developer Wallpaper to Login Page
  const [loginBg, setLoginBg] = useState<string>(() => {
    if (typeof window === 'undefined') return '/login-operator-bg.jpg';
    return getDeveloperBg();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBgChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setLoginBg(customEvent.detail);
      }
    };
    window.addEventListener('developer-bg-saved', handleBgChange);
    return () => {
      window.removeEventListener('developer-bg-saved', handleBgChange);
    };
  }, []);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      const msg = 'Silakan isi username dan kata sandi Anda.';
      setErrorMsg(msg);
      showToast(msg, 'warning', 'Form Belum Lengkap');
      return;
    }

    const accounts = getUserAccounts();
    const matched = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    const defaultJabatanMap: Record<string, string> = {
      'Admin TU': 'Kepala Tata Usaha',
      'Kepala Sekolah': 'Kepala Sekolah',
      'Operator PIP': 'Operator PIP / Dapodik',
      'Guru': 'Guru Kelas / Wali Kelas',
      'Developer': 'Admin Developer',
    };

    if (matched) {
      if (matched.password && matched.password !== password) {
        const msg = 'Kata sandi yang Anda masukkan salah. Silakan coba kembali!';
        setErrorMsg(msg);
        showToast(msg, 'error', 'Kata Sandi Salah');
        return;
      }
      setErrorMsg('');
      onLoginSuccess({
        isAuthenticated: true,
        username: matched.username,
        namaLengkap: matched.namaLengkap,
        role: matched.role,
        avatarUrl: matched.avatarUrl || `https://picsum.photos/seed/${matched.username}/100/100`,
        jabatan: matched.jabatan || defaultJabatanMap[matched.role] || matched.role,
        npsn: matched.npsn,
      });
    } else {
      const msg = `Username "${username.trim()}" tidak ditemukan pada database sistem sekolah.`;
      setErrorMsg(msg);
      setAttemptedUsername(username.trim());
      setShowUnregisteredModal(true);
      showToast(msg, 'error', 'Username Tidak Terdaftar');
    }
  };

  const handleOpenForgotModal = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentProfile = getSchoolProfile();
    setForgotNamaSekolah(currentProfile?.namaSekolah || '');
    setForgotNpsn(currentProfile?.npsn || '');
    setForgotUsernameInput(username.trim() || '');
    setForgotNamaPengaju('');
    setForgotKontak('');
    setForgotCatatan('');
    setForgotSuccess(false);
    setShowForgotModal(true);
  };

  const handleSendResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotNamaSekolah.trim()) {
      showToast('Nama Sekolah wajib diisi.', 'error', 'Validasi Gagal');
      return;
    }
    if (!forgotUsernameInput.trim()) {
      showToast('Username Akun yang ingin di-reset wajib diisi.', 'error', 'Validasi Gagal');
      return;
    }

    addPasswordResetRequest({
      namaSekolah: forgotNamaSekolah.trim(),
      npsn: forgotNpsn.trim(),
      username: forgotUsernameInput.trim(),
      namaPengaju: forgotNamaPengaju.trim(),
      kontakHp: forgotKontak.trim(),
      catatan: forgotCatatan.trim(),
    });

    setForgotSuccess(true);
    showToast(
      `Permintaan reset kata sandi untuk "${forgotNamaSekolah}" berhasil dikirim ke Developer!`,
      'success',
      'Permintaan Terkirim'
    );
  };

  const handleQuickLogin = (
    role: 'Kepala Sekolah' | 'Admin TU' | 'Operator PIP' | 'Guru' | 'Developer',
    uname: string,
    nama: string
  ) => {
    const accounts = getUserAccounts();
    const matched =
      accounts.find(
        (acc) => acc.username.toLowerCase() === uname.toLowerCase() && acc.role === role
      ) ||
      accounts.find((acc) => acc.username.toLowerCase() === uname.toLowerCase());

    const defaultJabatanMap: Record<string, string> = {
      'Admin TU': 'Kepala Tata Usaha',
      'Kepala Sekolah': 'Kepala Sekolah',
      'Operator PIP': 'Operator PIP / Dapodik',
      'Guru': 'Guru Kelas / Wali Kelas',
      'Developer': 'Admin Developer',
    };

    const session: UserSession = {
      isAuthenticated: true,
      username: uname,
      namaLengkap: matched ? matched.namaLengkap : nama,
      role: matched?.role || role,
      avatarUrl: matched?.avatarUrl || `https://picsum.photos/seed/${uname}/100/100`,
      jabatan: matched?.jabatan || defaultJabatanMap[role] || role,
      npsn: matched?.npsn || '20206123',
    };
    onLoginSuccess(session);
  };

  // Map roles to distinctive colors and icons for the 3D tabs
  const roleConfig = {
    'Admin TU': {
      color: 'from-blue-500 to-indigo-500',
      shadow: 'shadow-blue-500/25',
      icon: <Briefcase className="w-3.5 h-3.5" />,
      tag: 'Akses Utama Administrasi',
    },
    'Kepala Sekolah': {
      color: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-500/25',
      icon: <Layers className="w-3.5 h-3.5" />,
      tag: 'Otorisasi & TTE Surat',
    },
    'Operator PIP': {
      color: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/25',
      icon: <Bookmark className="w-3.5 h-3.5" />,
      tag: 'Penyaluran Bantuan PIP',
    },
    'Guru': {
      color: 'from-sky-500 to-cyan-500',
      shadow: 'shadow-sky-500/25',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      tag: 'Pembagian Tugas & Jadwal',
    },
    'Developer': {
      color: 'from-amber-500 to-emerald-500',
      shadow: 'shadow-amber-500/25',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      tag: 'Halaman & Sistem Developer',
    },
  };

  const currentBg = loginBg || profile?.loginBgUrl || '/login-operator-bg.jpg';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 relative font-sans select-none overflow-hidden">
      {/* FULL SCREEN OPERATOR BACKGROUND IMAGE CONNECTED TO DEVELOPER WALLPAPER */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat pointer-events-none z-0 transition-all duration-700"
        style={{ 
          backgroundImage: `url('${currentBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 58%',
        }}
      >
        {/* Ambient Soft Vignette & Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-slate-950/15 to-slate-950/35 backdrop-blur-[0.5px]" />
      </div>

      {/* 3D Floating Notification Toast System */}
      <NotificationToastContainer />

      {/* Main Container with 3D Spatial Perspective & Flutter Glassmorphic Theme */}
      <div className="w-full max-w-[840px] relative z-10" style={{ perspective: 1400 }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          className="bg-slate-950/30 hover:bg-slate-950/35 backdrop-blur-2xl border border-white/20 rounded-[2.25rem] shadow-[0_30px_90px_rgba(0,0,0,0.65),inset_0_1.5px_2px_rgba(255,255,255,0.25)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-500"
        >
          
          {/* LEFT PANEL: Flutter Glass Brand Showcase */}
          <div className="lg:col-span-5 p-7 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/15 relative overflow-hidden bg-white/[0.04] backdrop-blur-xl group">
            
            {/* Glossy overlay sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-white/10 opacity-30 pointer-events-none z-10"></div>
            
            <div>
              {/* Elegant Elevated 3D Logo Block */}
              <div className="flex items-center gap-4 mb-8 relative">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.06 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-600 flex items-center justify-center shadow-[0_10px_30px_rgba(79,70,229,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.35)] border border-indigo-300/30 shrink-0 transform-style-3d cursor-pointer relative overflow-hidden group"
                >
                  {/* Subtle glossy sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-70 pointer-events-none" />
                  
                  {/* Modern Tech System Icon */}
                  <div className="relative flex items-center justify-center">
                    <svg
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-9 h-9 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                    >
                      {/* Modern Cap / Tech Portal */}
                      <path
                        d="M18 4L32 11.5L18 19L4 11.5L18 4Z"
                        fill="url(#tech-grad-1)"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      {/* Tech Ribbon & Base */}
                      <path
                        d="M9 14.5V23C9 23 13 28.5 18 28.5C23 28.5 27 23 27 23V14.5"
                        stroke="#FCD34D"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Golden tassel accent */}
                      <path
                        d="M29 13.5V25"
                        stroke="#FBBF24"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="29" cy="26" r="1.5" fill="#FBBF24" />
                      
                      {/* Digital Core Spark */}
                      <circle cx="18" cy="11.5" r="2.5" fill="#FFFFFF" />
                      <circle cx="18" cy="11.5" r="1" fill="#4F46E5" />

                      {/* Sub-geometric lines */}
                      <path
                        d="M14 21C15 22.2 16.5 23 18 23C19.5 23 21 22.2 22 21"
                        stroke="#93C5FD"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />

                      <defs>
                        <linearGradient id="tech-grad-1" x1="4" y1="4" x2="32" y2="19" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#818CF8" />
                          <stop offset="0.5" stopColor="#4F46E5" />
                          <stop offset="1" stopColor="#2563EB" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                    SISKO SIM
                  </h1>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-300/30 shadow-inner backdrop-blur-md">
                    App Administrasi Sekolah
                  </span>
                </div>
              </div>

              {/* Title Header with Modern Look */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                  Manajemen & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-emerald-300 font-black">
                    Cetak Surat Sekolah
                  </span>
                </h2>
                <p className="text-xs sm:text-[12.5px] text-slate-200/95 leading-relaxed font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  Menuju Sekolah Digital dengan Administrasi yang Lebih Cerdas.
                </p>
              </div>

              {/* Feature Cards with Flutter Glass 3D Lift */}
              <div className="space-y-2.5 mt-7 relative">
                {[
                  { label: 'Administrasi Mutasi Siswa & PPDB', icon: '📝' },
                  { label: 'Otorisasi PIP Kemdikbud (KIP / SimPel)', icon: '💳' },
                  { label: 'Surat Tugas, SPD, & Aktif Mengajar', icon: '🛡️' },
                  { label: 'Cetak Lembar Dokumen', icon: '🖨️' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * idx, duration: 0.35 }}
                    whileHover={{ x: 6, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                    className="flex items-center gap-3.5 p-3 bg-white/[0.06] hover:bg-white/[0.12] rounded-2xl border border-white/15 hover:border-indigo-300/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.15)] backdrop-blur-md cursor-default group/item"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/[0.1] border border-white/15 flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-110 transition-transform">
                      <span className="text-base">{item.icon}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-100 drop-shadow-sm">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Institutional Stamp & Footer */}
            <div className="mt-8 pt-5 border-t border-white/15 flex items-center justify-end">
              <span className="bg-white/10 text-indigo-200 text-[10px] font-black px-3 py-1 rounded-xl border border-white/20 font-mono tracking-widest uppercase shadow-sm backdrop-blur-md">
                v3.0 Premium
              </span>
            </div>
          </div>

          {/* RIGHT PANEL: Flutter Glass Modern Login Console */}
          <div className="lg:col-span-7 p-7 sm:p-8 flex flex-col justify-center relative bg-black/[0.15] backdrop-blur-xl">

            <div className="max-w-md mx-auto w-full relative z-10">

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-300/30 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-indigo-300 backdrop-blur-md mb-2.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Teknologi Administrasi Sekolah Cerdas</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">Halaman Masuk</h3>
                <p className="text-xs text-slate-300 font-medium mt-1">Gunakan kredensial yang valid untuk mengakses sistem.</p>
              </div>

              {/* Framed Slogan with Flutter Glass Card */}
              <div className="bg-white/[0.06] hover:bg-white/[0.09] border border-white/15 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl relative overflow-hidden transition-all">
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="text-left">
                  <span className="text-[9px] font-black tracking-widest uppercase text-indigo-300 block mb-0.5">Slogan Kerja</span>
                  <p className="text-xs sm:text-sm font-black text-white leading-snug tracking-wide uppercase drop-shadow-sm">
                    Kerja Cerdas • Kerja Tuntas • Kerja Ikhlas
                  </p>
                  <p className="text-[10px] text-emerald-400 font-black mt-0.5 tracking-wider drop-shadow-sm">
                    HASIL BERKUALITAS
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 text-indigo-300 shrink-0 shadow-inner">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 bg-red-500/20 border border-red-400/30 text-red-200 text-xs p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_4px_15px_rgba(239,68,68,0.2)] backdrop-blur-md"
                >
                  <ShieldCheck className="w-4 h-4 text-red-300 shrink-0 animate-bounce" />
                  <span className="font-semibold">{errorMsg}</span>
                </motion.div>
              )}

              {/* Form Input Fields with Flutter Floating Glass style */}
              <form onSubmit={handleManualLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-200 tracking-wider uppercase mb-1.5 drop-shadow-sm">
                    Username / NIP Pegawai
                  </label>
                  <div className="relative group">
                    <div className="w-10 h-10 absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl bg-white/[0.08] border border-white/15 group-focus-within:border-indigo-400/60 group-focus-within:bg-indigo-600/30 transition-all backdrop-blur-md z-10 pointer-events-none shadow-sm">
                      <User className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-200 transition-colors shrink-0" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/25 hover:bg-black/35 focus:bg-black/45 border border-white/15 hover:border-indigo-400/50 focus:border-indigo-400 rounded-2xl py-3.5 pl-14 pr-4 text-xs text-white placeholder-slate-400/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 font-mono tracking-wide transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-0"
                      placeholder="Masukkan Username / NIP Pegawai"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 tracking-wider uppercase mb-1.5 drop-shadow-sm">
                    Kata Sandi
                  </label>
                  <div className="relative group">
                    <div className="w-10 h-10 absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl bg-white/[0.08] border border-white/15 group-focus-within:border-indigo-400/60 group-focus-within:bg-indigo-600/30 transition-all backdrop-blur-md z-10 pointer-events-none shadow-sm">
                      <Lock className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-200 transition-colors shrink-0" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/25 hover:bg-black/35 focus:bg-black/45 border border-white/15 hover:border-indigo-400/50 focus:border-indigo-400 rounded-2xl py-3.5 pl-14 pr-12 text-xs text-white placeholder-slate-400/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 font-mono tracking-wide transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] backdrop-blur-md relative z-0"
                      placeholder="Masukkan Kata Sandi"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer z-20"
                      title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none font-semibold">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-lg bg-black/30 border-white/20 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                    />
                    <span className="drop-shadow-sm">Ingat Sesi Saya</span>
                  </label>
                  <a 
                    href="#reset" 
                    onClick={handleOpenForgotModal} 
                    className="text-indigo-300 hover:text-indigo-200 font-bold transition-colors drop-shadow-sm flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Lupa Kata Sandi?</span>
                  </a>
                </div>

                {/* Tactile Flutter Elevated Glass Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  type="submit"
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl text-xs tracking-wider uppercase shadow-[0_10px_30px_rgba(99,102,241,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-indigo-400/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
                >
                  <div className="absolute inset-0 w-1/2 bg-white/15 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                  <span className="drop-shadow-sm font-black">Masuk Ke App Administrasi Sekolah</span>
                  <ArrowRight className="w-4 h-4 text-indigo-100 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>

              {/* Dynamic Year Copyright Footer */}
              <div className="mt-8 text-center text-[11px] font-mono text-slate-300/70 font-bold tracking-wider select-none drop-shadow-sm">
                @{new Date().getFullYear()} CREATED BY RICKI MULYADI
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Embedded shimmer animation styling for key shimmer effect */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>

      {/* Warning Popup Modal for Unregistered Accounts */}
      {showUnregisteredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900 border-2 border-rose-500/30 rounded-2xl p-6 shadow-[0_20px_50px_rgba(239,68,68,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
            
            <button
              onClick={() => setShowUnregisteredModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border-2 border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/5 animate-pulse">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-base font-black text-white tracking-wide uppercase mb-1">
                Akun Belum Terdaftar!
              </h3>
              <p className="text-[10px] text-rose-400 font-bold tracking-widest uppercase mb-4">
                Peringatan Akses Sistem
              </p>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 w-full text-left space-y-2.5 mb-5 text-xs text-slate-300">
                <p className="leading-relaxed text-slate-300 font-medium">
                  Username <span className="font-mono text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/30 font-bold">&quot;{attemptedUsername}&quot;</span> yang Anda masukkan tidak terdaftar di database sekolah mana pun.
                </p>
                <p className="leading-relaxed text-[11px] text-slate-400">
                  Untuk mendaftarkan akun baru, silakan hubungi <span className="text-slate-200 font-bold">Administrator Developer</span> atau buat akun sekolah baru melalui menu <span className="text-indigo-400 font-bold">Developer (Username: developer)</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUnregisteredModal(false)}
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.35)] border border-rose-400/20 cursor-pointer"
              >
                Pahami & Tutup Peringatan
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pop Up Peringatan / Permintaan Reset Sandi Sekolah ke Developer */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(79,70,229,0.25)] relative overflow-hidden font-sans"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400" />

            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-400/30 inline-block mb-1">
                  Pemberitahuan Reset Sandi
                </span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Minta Developer Reset Akun Sekolah
                </h3>
              </div>
            </div>

            {forgotSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white tracking-wide">
                    Permintaan Berhasil Dikirim!
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                    Notifikasi permintaan reset sandi untuk <strong className="text-amber-300">{forgotNamaSekolah}</strong> telah dikirim ke Dashboard Developer.
                  </p>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-1.5 text-slate-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sekolah:</span>
                    <span className="text-white font-bold">{forgotNamaSekolah}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Username:</span>
                    <span className="text-amber-300 font-bold">@{forgotUsernameInput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-emerald-400 font-bold">Menunggu Konfirmasi Developer</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Tutup & Kembali Ke Halaman Login
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSendResetRequest} className="space-y-4 text-xs">
                {/* Nama Sekolah */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nama Satuan Pendidikan / Sekolah *
                  </label>
                  <div className="relative">
                    <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={forgotNamaSekolah}
                      onChange={(e) => setForgotNamaSekolah(e.target.value)}
                      placeholder="Contoh: SDN 2 NYOMPLONG"
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-400 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-600 focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Grid NPSN & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      NPSN Sekolah
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={forgotNpsn}
                        onChange={(e) => setForgotNpsn(e.target.value)}
                        placeholder="8 Digit NPSN..."
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-400 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs font-mono placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Username Masuk *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={forgotUsernameInput}
                        onChange={(e) => setForgotUsernameInput(e.target.value)}
                        placeholder="Username yang ingin di-reset..."
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-400 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs font-mono placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid Nama Pemohon & No WA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nama Pemohon / Operator
                    </label>
                    <input
                      type="text"
                      value={forgotNamaPengaju}
                      onChange={(e) => setForgotNamaPengaju(e.target.value)}
                      placeholder="Nama Anda..."
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-400 rounded-xl py-2.5 px-3 text-white text-xs placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Nomor WhatsApp / HP
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={forgotKontak}
                        onChange={(e) => setForgotKontak(e.target.value)}
                        placeholder="0812xxxx..."
                        className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-400 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs font-mono placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Catatan / Alasan Reset
                  </label>
                  <textarea
                    rows={2}
                    value={forgotCatatan}
                    onChange={(e) => setForgotCatatan(e.target.value)}
                    placeholder="Contoh: Lupa password login akun Operator TU sekolah..."
                    className="w-full bg-slate-950/70 border border-slate-700 focus:border-indigo-400 rounded-xl p-2.5 text-white text-xs placeholder-slate-600 focus:outline-none resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 px-4 rounded-xl border border-slate-700 text-xs uppercase tracking-wider cursor-pointer transition-all text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-600/30 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Ke Developer</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
