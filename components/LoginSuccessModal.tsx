'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, Sparkles, X, School, UserCheck } from 'lucide-react';
import { UserSession, SchoolProfile } from '../types';

interface LoginSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession | null;
  profile: SchoolProfile | null;
}

export const LoginSuccessModal: React.FC<LoginSuccessModalProps> = ({
  isOpen,
  onClose,
  session,
  profile,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !session) return null;

  return (
    <AnimatePresence>
      <div className="no-print fixed top-6 inset-x-0 z-[99999] flex justify-center px-4 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.85, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: -40, scale: 0.9, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', damping: 18, stiffness: 280 }}
          className="pointer-events-auto relative w-full max-w-lg bg-gradient-to-r from-slate-950 via-emerald-950/95 to-slate-950 border border-emerald-500/50 rounded-3xl p-5 text-white shadow-[0_25px_60px_rgba(16,185,129,0.35),0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-2xl overflow-hidden"
          onClick={onClose}
        >
          {/* Top 3D glossy light sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />

          <div className="flex items-center gap-4">
            {/* Animated 3D Emerald Seal */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, 6, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/40 shrink-0"
            >
              <div className="w-full h-full bg-slate-950/70 rounded-2xl flex items-center justify-center border border-emerald-300/40">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            </motion.div>

            {/* Content Info */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  BERHASIL MASUK
                </span>
                <span className="text-[11px] text-slate-400 font-medium truncate">
                  {profile?.namaSekolah || 'Sistem Administrasi'}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-1 leading-tight drop-shadow-xs">
                Selamat Datang, {session.namaLengkap}!
              </h3>

              <p className="text-xs text-slate-300 truncate mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Jabatan: </span>
                <span className="font-bold text-amber-300">{session.jabatan || session.role}</span>
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Countdown Progress Line at Bottom */}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4.2, ease: 'linear' }}
            className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-emerald-400 to-teal-300 shadow-sm"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
