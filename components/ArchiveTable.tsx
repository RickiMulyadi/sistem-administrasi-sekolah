'use client';

import React, { useState } from 'react';
import { ArchiveItem, LetterCategory } from '../types';
import { Archive, Search, Printer, Trash2, Calendar, User, FileText, Download } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface ArchiveTableProps {
  archiveList: ArchiveItem[];
  onReopenArchiveItem: (item: ArchiveItem) => void;
  onDeleteArchiveItem: (id: string) => void;
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({
  archiveList,
  onReopenArchiveItem,
  onDeleteArchiveItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<ArchiveItem | null>(null);

  const filteredList = archiveList.filter((item) => {
    const matchesSearch =
      item.nomorSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.penerimaAtauSubjek.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archiveList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `arsip_surat_sekolah_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-500" />
            <span>Arsip Surat Keluar Sekolah</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          Ekspor Backup (JSON)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor surat, nama siswa, guru, atau penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">-- Semua Jenis Surat --</option>
            <option value="mutasi">Surat Mutasi Siswa</option>
            <option value="keterangan_pip">Surat Keterangan PIP</option>
            <option value="penerimaan_pindahan">Penerimaan Pindahan</option>
            <option value="surat_tugas">Surat Tugas</option>
            <option value="aktif_mengajar">Surat Aktif Mengajar</option>
            <option value="pembagian_tugas">SK Pembagian Tugas</option>
            <option value="perjalanan_dinas">Surat Perjalanan Dinas</option>
            <option value="kuasa_pip">Surat Kuasa PIP</option>
            <option value="aktif_belajar">Surat Aktif Belajar</option>
          </select>
        </div>
      </div>

      {/* Archive List Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="p-3 w-10 text-center">No</th>
              <th className="p-3">Jenis & Judul Surat</th>
              <th className="p-3">Nomor Surat Resmi</th>
              <th className="p-3">Penerima / Subjek</th>
              <th className="p-3">Tanggal Cetak</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Belum ada arsip surat yang sesuai dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredList.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.categoryTitle}</div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-indigo-900">{item.nomorSurat}</td>
                  <td className="p-3 font-medium text-slate-800">{item.penerimaAtauSubjek}</td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.tanggalCetak}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onReopenArchiveItem(item)}
                        className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded text-[11px] border border-indigo-200 cursor-pointer"
                        title="Buka & Cetak Ulang Dokumen A4 Ini"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Ulang</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item)}
                        className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors cursor-pointer"
                        title="Hapus Dari Arsip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3D Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        variant="danger"
        title="Peringatan Hapus Arsip Dokumen"
        description="Apakah Anda yakin ingin menghapus data arsip surat ini? Dokumen yang telah dihapus tidak dapat dipulihkan."
        itemName={itemToDelete ? `${itemToDelete.nomorSurat} — ${itemToDelete.categoryTitle} (${itemToDelete.penerimaAtauSubjek})` : undefined}
        confirmText="Ya, Hapus Arsip"
        cancelText="Batal"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteArchiveItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
