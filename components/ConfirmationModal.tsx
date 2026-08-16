'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  LogOut,
  Trash2,
  X,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'logout';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  itemName,
  confirmText,
  cancelText = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
      glow: 'shadow-[0_20px_60px_rgba(244,63,94,0.3)]',
      border: 'border-rose-500/40',
      btnBg: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30',
      defaultConfirm: 'Ya, Hapus Permanen',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
      glow: 'shadow-[0_20px_60px_rgba(245,158,11,0.3)]',
      border: 'border-amber-500/40',
      btnBg: 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-600/30',
      defaultConfirm: 'Lanjutkan',
    },
    logout: {
      icon: LogOut,
      iconBg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
      glow: 'shadow-[0_20px_60px_rgba(99,102,241,0.3)]',
      border: 'border-indigo-500/40',
      btnBg: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30',
      defaultConfirm: 'Ya, Keluar Sekarang',
    },
  };

  const style = config[variant] || config.danger;
  const IconComponent = style.icon;
  const finalConfirmText = confirmText || style.defaultConfirm;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop with strong blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* 3D Embossed Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 25, rotateX: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className={`relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border ${style.border} rounded-3xl p-6 text-white ${style.glow} overflow-hidden shadow-2xl z-10 select-none`}
        >
          {/* 3D Highlight Sheen Line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            {/* Animated 3D Badge Icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${style.iconBg} shadow-inner shadow-black/40`}
            >
              <IconComponent className="w-8 h-8 drop-shadow-md" />
            </motion.div>

            {/* Title & Description */}
            <div className="space-y-1.5 px-2">
              <h3 className="text-lg font-black text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Item Name highlight card if provided */}
            {itemName && (
              <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Item yang dipilih:
                </span>
                <span className="text-xs font-bold text-amber-300 font-mono break-all">
                  {itemName}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all cursor-pointer"
              >
                {cancelText}
              </button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  onConfirm();
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${style.btnBg}`}
              >
                {finalConfirmText}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
