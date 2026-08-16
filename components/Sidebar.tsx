'use client';

import React from 'react';
import { LetterCategory, UserSession } from '../types';
import {
  LayoutDashboard,
  FileText,
  Users,
  Archive,
  Settings,
  ArrowRightLeft,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  FileCheck2,
  Send,
  ShieldCheck,
  ChevronRight,
  FilePlus,
  Sparkles,
  FileCheck,
  ClipboardList,
  Terminal,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  session?: UserSession;
  currentTab: string; // 'dashboard' | 'letters' | 'archive' | 'master_data' | 'settings' | 'persyaratan_mutasi'
  activeCategory: LetterCategory;
  onSelectTab: (tab: string) => void;
  onSelectCategory: (cat: LetterCategory) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenCreateModal?: () => void;
  onOpenBerkasUjianModal?: () => void;
  onOpenUserProfileModal?: () => void;
}

export const LETTER_CATEGORIES_META: {
  id: LetterCategory;
  title: string;
  shortLabel: string;
  badge: string;
  badgeBg: string;
  icon: any;
}[] = [
  {
    id: 'mutasi',
    title: 'Surat Mutasi Siswa',
    shortLabel: '1. Mutasi Siswa (Pindah Out)',
    badge: 'Siswa',
    badgeBg: 'bg-blue-100 text-blue-800',
    icon: ArrowRightLeft,
  },
  {
    id: 'keterangan_pip',
    title: 'Surat Keterangan PIP',
    shortLabel: '2. Surat Keterangan PIP',
    badge: 'Bantuan PIP',
    badgeBg: 'bg-amber-100 text-amber-800',
    icon: Award,
  },
  {
    id: 'penerimaan_pindahan',
    title: 'Surat Penerimaan Siswa Pindahan',
    shortLabel: '3. Penerimaan Pindahan (In)',
    badge: 'Siswa',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    icon: GraduationCap,
  },
  {
    id: 'surat_tugas',
    title: 'Surat Tugas',
    shortLabel: '4. Surat Tugas Guru/Tendik',
    badge: 'Kepegawaian',
    badgeBg: 'bg-purple-100 text-purple-800',
    icon: Briefcase,
  },
  {
    id: 'aktif_mengajar',
    title: 'Surat Keterangan Aktif Mengajar',
    shortLabel: '5. Surat Aktif Mengajar',
    badge: 'Guru',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    icon: BookOpen,
  },
  {
    id: 'pembagian_tugas',
    title: 'SK Pembagian Tugas Mengajar',
    shortLabel: '6. SK Pembagian Tugas',
    badge: 'SK Kepsek',
    badgeBg: 'bg-rose-100 text-rose-800',
    icon: FileCheck2,
  },
  {
    id: 'perjalanan_dinas',
    title: 'Surat Perjalanan Dinas (SPD)',
    shortLabel: '7. Surat Perjalanan Dinas (SPD)',
    badge: 'Dinas',
    badgeBg: 'bg-teal-100 text-teal-800',
    icon: Send,
  },
  {
    id: 'kuasa_pip',
    title: 'Surat Kuasa PIP',
    shortLabel: '8. Surat Kuasa PIP',
    badge: 'Bantuan PIP',
    badgeBg: 'bg-amber-100 text-amber-800',
    icon: ShieldCheck,
  },
  {
    id: 'aktif_belajar',
    title: 'Surat Keterangan Aktif Belajar',
    shortLabel: '9. Surat Aktif Belajar',
    badge: 'Siswa',
    badgeBg: 'bg-sky-100 text-sky-800',
    icon: GraduationCap,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  session,
  currentTab,
  activeCategory,
  onSelectTab,
  onSelectCategory,
  isOpenMobile,
  onCloseMobile,
  onOpenCreateModal,
  onOpenBerkasUjianModal,
  onOpenUserProfileModal,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`no-print fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 text-slate-300 flex flex-col justify-between transition-transform duration-200 shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* User Profile Info Card (3D Glossy Card) */}
          {session && (
            <div
              onClick={onOpenUserProfileModal}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center gap-3 shadow-lg relative overflow-hidden group cursor-pointer hover:border-amber-400/50 hover:shadow-indigo-500/10 transition-all"
              title="Klik untuk membuka Pengaturan Profil Pengguna Aktif (Nama, Jabatan, Foto)"
            >
              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center text-slate-950 font-black text-base shrink-0 shadow-md border border-amber-300/50 overflow-hidden group-hover:scale-105 transition-transform">
                {session.role === 'Developer' && (!session.avatarUrl || session.avatarUrl.includes('developer-avatar')) ? (
                  <Terminal className="w-5 h-5 text-slate-950" />
                ) : session.avatarUrl ? (
                  <img
                    src={session.avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  session.namaLengkap ? session.namaLengkap.charAt(0) : 'A'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">Pengguna Aktif</span>
                  </div>
                  <span className="text-[9px] text-slate-400 group-hover:text-amber-300 transition-colors lowercase font-normal">
                    edit ✎
                  </span>
                </div>
                <h3 className="text-xs font-extrabold text-white truncate leading-tight mt-0.5 drop-shadow-xs group-hover:text-amber-200 transition-colors">
                  {session.namaLengkap}
                </h3>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  Jabatan: <span className="text-amber-300 font-bold">{session.jabatan || session.role}</span>
                </p>
              </div>
            </div>
          )}

          {/* Dashboard & Primary Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                onSelectTab('dashboard');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-300" />
                <span>Dashboard Overview</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </motion.button>

            {session?.role !== 'Developer' && (
              <>
                {/* Tombol Buat Surat Baru (3D Glossy Amber Button) */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    if (onOpenCreateModal) {
                      onOpenCreateModal();
                    } else {
                      onSelectTab('letters');
                    }
                    onCloseMobile();
                  }}
                  className="btn-3d-amber w-full flex items-center justify-center gap-2 text-slate-950 font-black px-4 py-3.5 rounded-xl text-xs sm:text-sm border border-amber-300 cursor-pointer tracking-wide shadow-lg hover:shadow-amber-500/30 transition-shadow"
                >
                  <FilePlus className="w-4.5 h-4.5 text-slate-950 stroke-[2.8]" />
                  <span>Buat Surat</span>
                </motion.button>

                {/* Tombol BERKAS UJIAN - Direct under Buat Surat */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    if (onOpenBerkasUjianModal) {
                      onOpenBerkasUjianModal();
                    }
                    onCloseMobile();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black px-4 py-3.5 rounded-xl text-xs sm:text-sm border border-indigo-400/50 shadow-lg hover:shadow-indigo-500/20 cursor-pointer tracking-wide transition-all"
                >
                  <ClipboardList className="w-4.5 h-4.5 text-indigo-200 stroke-[2.5]" />
                  <span>BERKAS UJIAN</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Master Data & Archive Section */}
          <div>
            {session?.role !== 'Developer' && (
              <>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 block mb-2 opacity-80">
                  Pengelolaan & Database
                </span>

                <div className="space-y-1.5 mb-4">
                  {/* PERSYARATAN MUTASI BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      onSelectTab('persyaratan_mutasi');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'persyaratan_mutasi'
                        ? 'bg-slate-800 text-white border border-sky-500/30 shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                      <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <span>Persyaratan Mutasi</span>
                  </motion.button>

                  {/* FORMULIR PPDB BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      onSelectTab('formulir_ppdb');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'formulir_ppdb'
                        ? 'bg-slate-800 text-white border border-emerald-500/30 shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>Formulir PPDB</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      onSelectTab('archive');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'archive'
                        ? 'bg-slate-800 text-white border border-amber-500/30 shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span>Arsip Surat Keluar</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      onSelectTab('master_data');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'master_data'
                        ? 'bg-slate-800 text-white border border-emerald-500/30 shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span>Data Siswa & Guru</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      onSelectTab('settings');
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'settings'
                        ? 'bg-slate-800 text-white border border-indigo-500/30 shadow-md'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span>Profil Sekolah & Kop Surat</span>
                  </motion.button>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              {/* Developer Dashboard Section */}
              {session?.role === 'Developer' && (
                <motion.button
                  whileHover={{ scale: 1.02, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    onSelectTab('developer');
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentTab === 'developer'
                      ? 'bg-slate-850 text-white border border-purple-500/30 shadow-md shadow-purple-500/10'
                      : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <span>Admin Developer</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-center text-center select-none">
          <span className="font-bold tracking-wider text-slate-400 hover:text-amber-300 transition-colors">
            @{new Date().getFullYear()} CREATED BY RICKI MULYADI
          </span>
        </div>
      </aside>
    </>
  );
};
