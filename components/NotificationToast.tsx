'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastItem, ToastType } from '../lib/toast';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles,
  X,
  BellRing,
} from 'lucide-react';

export const NotificationToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        setToasts((prev) => [customEvent.detail, ...prev].slice(0, 3));
      }
    };

    window.addEventListener('show-school-toast', handleToastEvent);
    return () => {
      window.removeEventListener('show-school-toast', handleToastEvent);
    };
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="no-print fixed top-6 inset-x-0 z-[99999] flex flex-col items-center gap-3 pointer-events-none px-4 w-full select-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 3800;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const config: Record<
    ToastType,
    {
      bgGradient: string;
      borderColor: string;
      shadow: string;
      iconBg: string;
      iconColor: string;
      textColor: string;
      icon: any;
      barColor: string;
    }
  > = {
    success: {
      bgGradient: 'from-slate-950 via-emerald-950/95 to-slate-950',
      borderColor: 'border-emerald-500/50',
      shadow: 'shadow-[0_20px_50px_rgba(16,185,129,0.3),0_0_25px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400',
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-300',
      icon: CheckCircle2,
      barColor: 'bg-gradient-to-r from-emerald-400 to-teal-300',
    },
    info: {
      bgGradient: 'from-slate-950 via-indigo-950/95 to-slate-950',
      borderColor: 'border-indigo-500/50',
      shadow: 'shadow-[0_20px_50px_rgba(99,102,241,0.3),0_0_25px_rgba(99,102,241,0.15)]',
      iconBg: 'bg-indigo-500/20 border-indigo-400/50 text-indigo-400',
      iconColor: 'text-indigo-400',
      textColor: 'text-indigo-300',
      icon: Info,
      barColor: 'bg-gradient-to-r from-indigo-400 to-purple-400',
    },
    warning: {
      bgGradient: 'from-slate-950 via-amber-950/95 to-slate-950',
      borderColor: 'border-amber-500/50',
      shadow: 'shadow-[0_20px_50px_rgba(245,158,11,0.3),0_0_25px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/20 border-amber-400/50 text-amber-400',
      iconColor: 'text-amber-400',
      textColor: 'text-amber-300',
      icon: AlertTriangle,
      barColor: 'bg-gradient-to-r from-amber-400 to-orange-400',
    },
    error: {
      bgGradient: 'from-slate-950 via-rose-950/95 to-slate-950',
      borderColor: 'border-rose-500/50',
      shadow: 'shadow-[0_20px_50px_rgba(244,63,94,0.3),0_0_25px_rgba(244,63,94,0.15)]',
      iconBg: 'bg-rose-500/20 border-rose-400/50 text-rose-400',
      iconColor: 'text-rose-400',
      textColor: 'text-rose-300',
      icon: AlertCircle,
      barColor: 'bg-gradient-to-r from-rose-400 to-red-500',
    },
    ai: {
      bgGradient: 'from-slate-950 via-purple-950/95 to-slate-950',
      borderColor: 'border-purple-500/50',
      shadow: 'shadow-[0_20px_50px_rgba(168,85,247,0.3),0_0_25px_rgba(168,85,247,0.15)]',
      iconBg: 'bg-purple-500/20 border-purple-400/50 text-purple-400',
      iconColor: 'text-purple-400',
      textColor: 'text-purple-300',
      icon: Sparkles,
      barColor: 'bg-gradient-to-r from-purple-400 to-pink-400',
    },
  };

  const style = config[toast.type || 'success'] || config.success;
  const IconComponent = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -45, scale: 0.85, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -30, filter: 'blur(4px)', transition: { duration: 0.22 } }}
      transition={{ type: 'spring', damping: 18, stiffness: 320 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`pointer-events-auto w-full max-w-md relative overflow-hidden rounded-2xl bg-gradient-to-r ${style.bgGradient} backdrop-blur-2xl border ${style.borderColor} ${style.shadow} p-4 text-white flex items-start gap-3.5 group cursor-pointer`}
      onClick={() => onDismiss(toast.id)}
    >
      {/* 3D Glossy Highlight Sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Floating Animated 3D Icon */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], rotate: [0, 6, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${style.iconBg} shadow-inner`}
      >
        <IconComponent className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-1.5">
          <h4 className={`text-xs font-black tracking-wider uppercase ${style.textColor} drop-shadow-xs`}>
            {toast.title}
          </h4>
          <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-ping" />
        </div>
        <p className="text-xs text-slate-200 font-medium leading-relaxed mt-0.5 break-words">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Countdown Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[3px] ${style.barColor} opacity-90`}
      />
    </motion.div>
  );
};
