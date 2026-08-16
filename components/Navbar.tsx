'use client';

import React from 'react';
import { UserSession, SchoolProfile } from '../types';
import {
  LogOut,
  Menu,
  Terminal,
} from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  session: UserSession;
  profile: SchoolProfile;
  currentTab?: string;
  onOpenSettings: () => void;
  onLogout: () => void;
  onQuickPrint: () => void;
  onToggleSidebarMobile: () => void;
  onOpenCreateModal: () => void;
  activeViewTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  profile,
  currentTab,
  onOpenSettings,
  onLogout,
  onQuickPrint,
  onToggleSidebarMobile,
  onOpenCreateModal,
  activeViewTitle,
}) => {
  const [logoHasError, setLogoHasError] = React.useState(false);
  const isDeveloper = session?.role === 'Developer' || currentTab === 'developer';

  return (
    <header className="no-print bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white sticky top-0 z-30 shadow-xl">
      {/* Metallic Gold Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 opacity-80" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Title & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {isDeveloper ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center shadow-lg border border-indigo-400/40 shadow-indigo-500/20 transform hover:scale-105 transition-transform shrink-0 p-1.5">
                <Terminal className="w-5 h-5 text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              </div>
            ) : (!logoHasError && (profile?.logoRightUrl || profile?.logoLeftUrl)) ? (
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg border border-amber-400/30 overflow-hidden transform hover:scale-105 transition-transform shrink-0 p-1">
                <img
                  src={profile.logoRightUrl || profile.logoLeftUrl}
                  alt="Logo Sekolah"
                  onError={() => setLogoHasError(true)}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300/60 transform hover:scale-105 transition-transform shrink-0 p-1.5">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  {/* Graduation Cap (Toga Sekolah) */}
                  <path
                    d="M24 6L4 16L24 26L44 16L24 6Z"
                    fill="#0f172a"
                  />
                  {/* Cap Under-Band & Ribbon */}
                  <path
                    d="M11 19.5V28C11 33.5 16.5 37 24 37C31.5 37 37 33.5 37 28V19.5L24 26L11 19.5Z"
                    fill="#1e1b4b"
                  />
                  {/* Administration Document / Book Base */}
                  <path
                    d="M15 26H33V39C33 40.7 31.7 42 30 42H18C16.3 42 15 40.7 15 39V26Z"
                    fill="#ffffff"
                  />
                  {/* Document Administration Lines */}
                  <rect x="18" y="29.5" width="12" height="2" rx="1" fill="#4f46e5" />
                  <rect x="18" y="33.5" width="12" height="2" rx="1" fill="#6366f1" />
                  <rect x="18" y="37.5" width="7" height="2" rx="1" fill="#f59e0b" />
                  {/* Tassel String & Pendant */}
                  <path
                    d="M40 18.5V29C40 30.1 39.1 31 38 31C36.9 31 36 30.1 36 29V20.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Golden Center Seal */}
                  <circle cx="24" cy="16" r="2.5" fill="#fbbf24" />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none drop-shadow-xs">
                {isDeveloper ? 'Developer Studio' : 'Sistem Administrasi Sekolah'}
              </h1>
              <p className="text-[11px] text-amber-300/90 font-semibold leading-tight mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeViewTitle}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions: Luxurious Logout Button */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-800 hover:border-red-500/40 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4 text-slate-400 hover:text-red-400" />
            <span className="hidden sm:inline">Keluar</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
