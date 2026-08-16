'use client';

import React, { useState } from 'react';
import { LetterCategory } from '../types';
import { LETTER_CATEGORIES_META } from './Sidebar';
import {
  X,
  Search,
  FilePlus,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface CreateLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: LetterCategory) => void;
}

export const CreateLetterModal: React.FC<CreateLetterModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  if (!isOpen) return null;

  const categories = LETTER_CATEGORIES_META;

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.shortLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.badge.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTag = true;
    if (filterTag === 'siswa') {
      matchesTag = cat.badge.toLowerCase().includes('siswa') || cat.id.includes('belajar') || cat.id.includes('mutasi');
    } else if (filterTag === 'pip') {
      matchesTag = cat.badge.toLowerCase().includes('pip');
    } else if (filterTag === 'guru') {
      matchesTag =
        cat.badge.toLowerCase().includes('guru') ||
        cat.badge.toLowerCase().includes('kepegawaian') ||
        cat.id.includes('mengajar') ||
        cat.id.includes('tugas');
    } else if (filterTag === 'dinas') {
      matchesTag = cat.badge.toLowerCase().includes('dinas') || cat.badge.toLowerCase().includes('sk');
    }

    return matchesSearch && matchesTag;
  });

  const handleSelect = (catId: LetterCategory) => {
    onSelectCategory(catId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative transition-all my-auto">
        {/* Decorative Top Ambient Glow */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-500" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-slate-800 flex items-start justify-between gap-4 relative z-10 bg-slate-900/80">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pilih Dokumen Formal Sekolah</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <FilePlus className="w-6 h-6 text-indigo-400" />
              <span>Buat Surat Resmi Baru</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Filter Bar & Cards */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto relative z-10">
          {/* Search & Quick Filter Chips */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari surat mutasi, PIP, tugas, SPD, atau aktif mengajar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterTag('all')}
                className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  filterTag === 'all'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Semua (9)
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('siswa')}
                className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  filterTag === 'siswa'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Siswa
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('pip')}
                className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  filterTag === 'pip'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                PIP
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('guru')}
                className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  filterTag === 'guru'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Guru / Tendik
              </button>
              <button
                type="button"
                onClick={() => setFilterTag('dinas')}
                className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  filterTag === 'dinas'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                Dinas / SK
              </button>
            </div>
          </div>

          {/* Letter Choice Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-semibold">Tidak ada jenis surat yang cocok dengan pencarian.</p>
                <p className="text-[11px] text-slate-500 mt-1">Coba gunakan kata kunci lain.</p>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const IconComponent = cat.icon;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelect(cat.id)}
                    className="group relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 hover:from-slate-800 hover:to-indigo-950/80 border border-slate-700/80 hover:border-amber-400/80 rounded-2xl p-4.5 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-950/80 hover:-translate-y-1 transform"
                  >
                    <div>
                      {/* Badge & Icon */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black tracking-wide px-2.5 py-0.5 rounded-full shadow-xs ${cat.badgeBg}`}>
                          {cat.badge}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 group-hover:bg-amber-400 text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-all shadow-md group-hover:scale-110">
                          <IconComponent className="w-4.5 h-4.5 stroke-[2.2]" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-slate-100 text-xs sm:text-sm group-hover:text-amber-300 transition-colors leading-snug">
                        {cat.title}
                      </h3>
                    </div>

                    {/* Action Link Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-black text-amber-400 group-hover:text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pilih & Buat Surat</span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-7 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Format Resmi Times New Roman & Kop Otomatis</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
