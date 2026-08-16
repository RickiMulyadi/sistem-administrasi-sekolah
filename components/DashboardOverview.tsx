'use client';

import React, { useState } from 'react';
import { LetterCategory, ArchiveItem, SchoolProfile, UserSession, Siswa } from '../types';
import { LETTER_CATEGORIES_META } from './Sidebar';
import { CreateLetterModal } from './CreateLetterModal';
import { BerkasUjianModal } from './BerkasUjianModal';
import { getUserAccounts } from '../lib/storage';
import {
  FileText,
  Printer,
  Archive,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  School,
  Building2,
  FileCheck,
  Settings,
  ChevronRight,
  Database,
  FilePlus,
  ClipboardList,
  ShieldCheck,
  Cpu,
  Layers,
  Settings2,
  Terminal,
  Activity,
  Server,
  CloudLightning,
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardOverviewProps {
  session: UserSession;
  profile: SchoolProfile;
  archiveCount: number;
  siswaCount: number;
  guruCount: number;
  recentArchives: ArchiveItem[];
  siswaList?: Siswa[];
  onSelectCategory: (cat: LetterCategory) => void;
  onNavigateTab: (tab: string, subTab?: string) => void;
  onOpenSettings: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  session,
  profile,
  archiveCount,
  siswaCount,
  guruCount,
  recentArchives,
  siswaList = [],
  onSelectCategory,
  onNavigateTab,
  onOpenSettings,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBerkasUjianModalOpen, setIsBerkasUjianModalOpen] = useState(false);

  // If the logged in user is a Developer, render a gorgeous 3D Developer Control Panel
  if (session?.role === 'Developer') {
    const accounts = typeof window !== 'undefined' ? getUserAccounts() : [];
    // Count all administrator/user accounts (excluding developer if preferred, or just count them)
    const adminCount = accounts.filter(acc => acc.role !== 'Developer').length;
    const schoolCount = 1; // 1 Active SD Negeri Margaasih School Instance

    return (
      <div className="space-y-8 font-sans pb-8 text-slate-100 relative">
        {/* Futuristic 3D Developer Glass Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Animated Glow Spotlights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              <span>Sistem Manajemen Multi-Sekolah Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">
              Konsol Pengembang Utama
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Anda sedang masuk menggunakan hak akses <span className="text-indigo-400 font-extrabold">Developer</span>. Halaman utama Anda telah disederhanakan dan dioptimalkan secara eksklusif untuk memantau infrastruktur sekolah dan akun administratif sistem.
            </p>
          </div>

          <div className="shrink-0 relative z-10">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 1 }}
              className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_10px_25px_rgba(79,70,229,0.4),inset_0_2px_1px_rgba(255,255,255,0.3)] border border-indigo-400/20"
            >
              <Terminal className="w-8 h-8 text-white stroke-[2.5]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Dynamic 3D Stat Blocks Grid - ONLY Shows Jumlah Sekolah & Jumlah Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* STAT 1: JUMLAH SEKOLAH */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative rounded-3xl bg-[#0d1527]/90 border-2 border-slate-800 p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_2px_1.5px_rgba(255,255,255,0.05)] hover:border-indigo-500/40 transition-all overflow-hidden cursor-default flex flex-col justify-between min-h-[220px]"
          >
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400" />
            <div className="absolute right-0 bottom-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-300" />

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">
                  Total Institusi Sekolah
                </p>
                <h3 className="text-sm font-extrabold text-slate-300">
                  Jumlah Sekolah Aktif
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {schoolCount}
              </span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-300 block bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                  SDN Margaasih
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold pl-1">
                  100% Online & Terdaftar
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Database Server Utama</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Connected
              </span>
            </div>
          </motion.div>

          {/* STAT 2: JUMLAH ADMIN */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -8 }}
            className="group relative rounded-3xl bg-[#0d1527]/90 border-2 border-slate-800 p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5),inset_0_2px_1.5px_rgba(255,255,255,0.05)] hover:border-emerald-500/40 transition-all overflow-hidden cursor-default flex flex-col justify-between min-h-[220px]"
          >
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-400" />
            <div className="absolute right-0 bottom-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-300" />

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                  Total Pengguna Administratif
                </p>
                <h3 className="text-sm font-extrabold text-slate-300">
                  Jumlah Admin Terdaftar
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {adminCount}
              </span>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-300 block bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  Akses Terdaftar
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold pl-1">
                  Kepsek, TU, Operator & Guru
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Keamanan Hak Akses</span>
              <span className="text-indigo-400">Enkripsi SHA256</span>
            </div>
          </motion.div>

        </div>

        {/* Console Quick Launch Center Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900/40 border-2 border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col justify-between min-h-[300px]"
        >
          {/* Decorative floating grids */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.05),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-800/60 pb-6">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                Pusat Kontrol Konsol
              </span>
              <h2 className="text-xl font-black text-white tracking-tight leading-none pt-1">
                Akses Fitur Kustomisasi Pengembang
              </h2>
              <p className="text-xs text-slate-400">
                Pilih salah satu fungsionalitas di bawah ini untuk mengelola portal sekolah atau menyesuaikan halaman login.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 border-2 border-slate-800/60 px-4 py-3 rounded-2xl shadow-inner">
              <Server className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div className="text-left font-mono">
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-none">Status Enjin</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-1 leading-none">SIM-SEC v2 Active</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 relative z-10">
            {/* ACTION 1: CREATE ACCOUNT */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => onNavigateTab('developer', 'create')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/50 border-2 border-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <FilePlus className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-extrabold text-white text-sm group-hover:text-indigo-300 transition-colors">
                  Buat Akun Sekolah
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Registrasi akun baru untuk Kepala Sekolah, Tata Usaha, Guru, atau Operator PIP dengan akses terenkripsi.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                <span>Buka Registrator Akun</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* ACTION 2: DATABASE ACCOUNTS */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => onNavigateTab('developer', 'db')}
              className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950/50 border-2 border-slate-800 hover:border-purple-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-extrabold text-white text-sm group-hover:text-purple-300 transition-colors">
                  Database Akun Sekolah
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Kelola seluruh kredensial akun terdaftar, ubah data/sandi pengelola, dan audit izin akses sistem secara instan.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-black text-purple-400 uppercase tracking-wider">
                <span>Buka Database Akun</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[8.5px]">
              <CloudLightning className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Infrastruktur Cloud Run & LocalStorage Sinkron</span>
            </span>
            <span className="font-mono">BUILD-ID: AIS-PRE-VM2-V2</span>
          </div>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Hero with 3D Gradient Depth */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border border-slate-700/80 text-white rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-500" />
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2.5 max-w-2xl sm:max-w-[70%]">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>APP Sistem Administrasi Sekolah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-snug drop-shadow-md">
            Selamat Datang
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Kelola dokumen resmi, arsip surat keluar, pendaftaran siswa, dan kelengkapan ujian sekolah secara praktis.
          </p>
        </div>

        {/* Floating custom 3D operator avatar if available */}
        {(profile.operatorAvatarUrl || session.avatarUrl) && (
          <div className="absolute right-8 bottom-0 top-0 hidden md:flex items-center z-10">
            <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950/60 shadow-2xl transform hover:scale-105 hover:-rotate-2 transition-all duration-300">
              <img 
                src={profile.operatorAvatarUrl || session.avatarUrl} 
                alt="Avatar Pengelola" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards Grid with 3D Elevation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-950/75 backdrop-blur-xl hover:bg-slate-900/90 p-5 rounded-2xl border border-slate-700/80 hover:border-indigo-500/60 flex items-center gap-4 group transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Layanan Surat</p>
            <p className="text-lg sm:text-xl font-black text-white mt-0.5">9 Modul Utama</p>
          </div>
        </div>

        <div className="bg-slate-950/75 backdrop-blur-xl hover:bg-slate-900/90 p-5 rounded-2xl border border-slate-700/80 hover:border-amber-500/60 flex items-center gap-4 group transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Surat Dicetak</p>
            <p className="text-lg sm:text-xl font-black text-white mt-0.5">{archiveCount} Dokumen</p>
          </div>
        </div>

        <div className="bg-slate-950/75 backdrop-blur-xl hover:bg-slate-900/90 p-5 rounded-2xl border border-slate-700/80 hover:border-emerald-500/60 flex items-center gap-4 group transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Master Data Siswa</p>
            <p className="text-lg sm:text-xl font-black text-white mt-0.5">{siswaCount} Siswa</p>
          </div>
        </div>

        <div className="bg-slate-950/75 backdrop-blur-xl hover:bg-slate-900/90 p-5 rounded-2xl border border-slate-700/80 hover:border-purple-500/60 flex items-center gap-4 group transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Master Data Guru</p>
            <p className="text-lg sm:text-xl font-black text-white mt-0.5">{guruCount} Pegawai</p>
          </div>
        </div>
      </div>

      {/* PENGELOLAAN & DATABASE SECTION */}
      <div className="bg-slate-950/80 backdrop-blur-2xl rounded-3xl border border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80">
          <h3 className="font-black text-base text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 shadow-inner">
              <Database className="w-4 h-4" />
            </div>
            <span>Pengelolaan & Database</span>
          </h3>
          <span className="text-xs text-slate-400 font-bold tracking-wide">Fungsionalitas Utama</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {/* Berkas Ujian Highlight Card (POP UP) */}
          <div
            onClick={() => setIsBerkasUjianModalOpen(true)}
            className="p-5 rounded-2xl border border-indigo-500/30 bg-slate-900/70 hover:bg-slate-850 hover:border-indigo-400/80 hover:shadow-[0_12px_30px_rgba(99,102,241,0.25)] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-white group-hover:text-indigo-300 transition-colors leading-tight">
                Berkas Ujian
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Kartu Ujian, Denah Tempat Duduk, dan Absensi / Daftar Hadir Ujian.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-black text-indigo-400 group-hover:text-indigo-300 uppercase tracking-wider">
              <span>Buka Pop Up</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Persyaratan Mutasi Highlight Card */}
          <div
            onClick={() => onNavigateTab('persyaratan_mutasi')}
            className="p-5 rounded-2xl border border-sky-500/30 bg-slate-900/70 hover:bg-slate-850 hover:border-sky-400/80 hover:shadow-[0_12px_30px_rgba(14,165,233,0.25)] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-white group-hover:text-sky-300 transition-colors leading-tight">
                Persyaratan Mutasi
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Formulir Pendaftaran Siswa Pindahan (Mutasi) Sekolah Dasar (SD) lengkap dan cetak dokumen A4.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-black text-sky-400 group-hover:text-sky-300 uppercase tracking-wider">
              <span>Buka Dokumen</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Formulir PPDB Highlight Card */}
          <div
            onClick={() => onNavigateTab('formulir_ppdb')}
            className="p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/70 hover:bg-slate-850 hover:border-emerald-400/80 hover:shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-white group-hover:text-emerald-300 transition-colors leading-tight">
                Formulir PPDB
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Formulir Pendaftaran Peserta Didik Baru (PPDB) Sekolah Dasar (SD) lengkap dan cetak A4.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-black text-emerald-400 group-hover:text-emerald-300 uppercase tracking-wider">
              <span>Buka Formulir</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Arsip Surat Card */}
          <div
            onClick={() => onNavigateTab('archive')}
            className="p-5 rounded-2xl border border-amber-500/30 bg-slate-900/70 hover:bg-slate-850 hover:border-amber-400/80 hover:shadow-[0_12px_30px_rgba(245,158,11,0.25)] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform">
                <Archive className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors leading-tight">
                Arsip Surat Keluar
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Riwayat dan database seluruh dokumen/surat resmi yang telah dicetak.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-black text-amber-400 group-hover:text-amber-300 uppercase tracking-wider">
              <span>Lihat Arsip ({archiveCount})</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Master Data Card */}
          <div
            onClick={() => onNavigateTab('master_data')}
            className="p-5 rounded-2xl border border-teal-500/30 bg-slate-900/70 hover:bg-slate-850 hover:border-teal-400/80 hover:shadow-[0_12px_30px_rgba(20,184,166,0.25)] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-white group-hover:text-teal-300 transition-colors leading-tight">
                Data Siswa & Guru
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Database induk siswa, NISN, dan data pegawai guru/tendik.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-black text-teal-400 group-hover:text-teal-300 uppercase tracking-wider">
              <span>Kelola Data ({siswaCount + guruCount})</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Profil Sekolah & Kop */}
          <div
            onClick={() => onNavigateTab('settings')}
            className="p-5 rounded-2xl border border-purple-500/30 bg-slate-900/70 hover:bg-slate-850 hover:border-purple-400/80 hover:shadow-[0_12px_30px_rgba(168,85,247,0.25)] transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-white group-hover:text-purple-300 transition-colors leading-tight">
                Profil Sekolah & Kop
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Pengaturan nama sekolah, logo kop surat, dan data Kepala Sekolah.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-black text-purple-400 group-hover:text-purple-300 uppercase tracking-wider">
              <span>Pengaturan Kop</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Archives Section with 3D Depth */}
      <div className="bg-slate-950/80 backdrop-blur-2xl rounded-3xl border border-slate-700/80 p-6 space-y-4 shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h3 className="font-black text-base text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Archive className="w-4 h-4" />
            </div>
            <span>Arsip Surat Keluar Terbaru</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('archive')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer transition-colors"
          >
            <span>Lihat Semua Arsip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentArchives.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada arsip surat keluar.</p>
          ) : (
            recentArchives.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-900/70 hover:bg-slate-800/80 rounded-2xl border border-slate-800 hover:border-slate-700 hover:shadow-lg flex items-center justify-between text-xs transition-all duration-200"
              >
                <div>
                  <p className="font-extrabold text-white text-xs sm:text-sm">{item.categoryTitle}</p>
                  <p className="text-[11px] font-mono text-indigo-300 font-semibold mt-0.5">
                    {item.nomorSurat} &bull; Subjek: {item.penerimaAtauSubjek}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-3 py-1 rounded-full shadow-inner shrink-0">
                  {item.tanggalCetak}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modern Pop-Up Selection Modal */}
      <CreateLetterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelectCategory={onSelectCategory}
      />

      {/* Pop-Up Berkas Ujian (Kartu Ujian, Denah Tempat Duduk, Absensi) */}
      <BerkasUjianModal
        isOpen={isBerkasUjianModalOpen}
        onClose={() => setIsBerkasUjianModalOpen(false)}
        profile={profile}
        siswaList={siswaList}
      />
    </div>
  );
};
