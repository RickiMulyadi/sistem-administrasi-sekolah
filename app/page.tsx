'use client';

import React, { useState, useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

import {
  SchoolProfile,
  Siswa,
  Guru,
  ArchiveItem,
  UserSession,
  LetterCategory,
  SuratMutasiPayload,
  SuratKeteranganPIPPayload,
  SuratPenerimaanPindahanPayload,
  SuratTugasPayload,
  SuratAktifMengajarPayload,
  SuratPembagianTugasPayload,
  SuratPerjalananDinasPayload,
  SuratKuasaPIPPayload,
  SuratAktifBelajarPayload,
} from '@/types';

import {
  getSchoolProfile,
  saveSchoolProfile,
  getSiswaList,
  saveSiswaList,
  getGuruList,
  saveGuruList,
  getArchiveList,
  addArchiveItem,
  deleteArchiveItem,
  getUserSession,
  saveUserSession,
  clearUserSession,
  getUserAccounts,
  getCurrentTab,
  saveCurrentTab,
  clearCurrentTab,
  getDeveloperBg,
} from '@/lib/storage';

import {
  DEFAULT_MUTASI_PAYLOAD,
  DEFAULT_PIP_PAYLOAD,
  DEFAULT_PENERIMAAN_PINDAHAN_PAYLOAD,
  DEFAULT_SURAT_TUGAS_PAYLOAD,
  DEFAULT_AKTIF_MENGAJAR_PAYLOAD,
  DEFAULT_PEMBAGIAN_TUGAS_PAYLOAD,
  DEFAULT_PERJALANAN_DINAS_PAYLOAD,
  DEFAULT_KUASA_PIP_PAYLOAD,
  DEFAULT_AKTIF_BELAJAR_PAYLOAD,
} from '@/lib/initial-data';

import { Navbar } from '@/components/Navbar';
import { Sidebar, LETTER_CATEGORIES_META } from '@/components/Sidebar';
import { LetterForm } from '@/components/LetterForm';
import { LetterPreview } from '@/components/LetterPreview';
import { LoginPage } from '@/components/LoginPage';
import { SchoolProfileModal } from '@/components/SchoolProfileModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { CreateLetterModal } from '@/components/CreateLetterModal';
import { BerkasUjianModal } from '@/components/BerkasUjianModal';
import { ArchiveTable } from '@/components/ArchiveTable';
import { MasterDataPage } from '@/components/MasterDataPage';
import { DashboardOverview } from '@/components/DashboardOverview';
import { PersyaratanMutasiPage } from '@/components/PersyaratanMutasiPage';
import { FormulirPPDBPage } from '@/components/FormulirPPDBPage';
import { DeveloperPage } from '@/components/DeveloperPage';
import { NotificationToastContainer } from '@/components/NotificationToast';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { LoginSuccessModal } from '@/components/LoginSuccessModal';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Check, UserCog, Building2, Sparkles } from 'lucide-react';

export default function SchoolAdminApp() {
  // Session & Profile States initialized lazily with safety fallback
  const [session, setSession] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const activeSession = getUserSession();
      if (activeSession && activeSession.isAuthenticated) {
        const accounts = getUserAccounts();
        const matched = accounts.find(
          (acc) => acc.username.toLowerCase() === activeSession.username.toLowerCase()
        );
        if (matched) {
          return {
            ...activeSession,
            namaLengkap: matched.namaLengkap || activeSession.namaLengkap,
            role: matched.role || activeSession.role,
            jabatan: matched.jabatan || activeSession.jabatan,
            avatarUrl: matched.avatarUrl || activeSession.avatarUrl,
          };
        }
      }
      return activeSession;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState<SchoolProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const baseProfile = getSchoolProfile();
      const activeSession = getUserSession();
      if (activeSession && baseProfile) {
        const accounts = getUserAccounts();
        const matched = accounts.find((acc) => acc.username.toLowerCase() === activeSession.username.toLowerCase());
        if (matched && matched.namaSekolah) {
          return {
            ...baseProfile,
            namaSekolah: matched.namaSekolah,
            npsn: matched.npsn || baseProfile.npsn,
            alamat: matched.alamat || baseProfile.alamat,
            kelurahan: matched.desa || baseProfile.kelurahan,
            kecamatan: matched.kecamatan || baseProfile.kecamatan,
            kota: matched.kabupaten || baseProfile.kota,
            provinsi: matched.provinsi || baseProfile.provinsi,
            logoLeftUrl: matched.logoSekolahUrl || baseProfile.logoLeftUrl,
            logoRightUrl: matched.logoSekolahUrl || baseProfile.logoRightUrl,
          };
        }
      }
      return baseProfile;
    } catch {
      return null;
    }
  });

  const isSyncClient = useIsClient();
  const [mounted, setMounted] = useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isClientLoaded = isSyncClient || mounted;

  // Master Data & Archive
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return getSiswaList();
    } catch {
      return [];
    }
  });

  const [guruList, setGuruList] = useState<Guru[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return getGuruList();
    } catch {
      return [];
    }
  });

  const [archiveList, setArchiveList] = useState<ArchiveItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return getArchiveList();
    } catch {
      return [];
    }
  });

  // Navigation States
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    try {
      const activeSession = getUserSession();
      if (!activeSession || !activeSession.isAuthenticated) {
        return 'dashboard';
      }
      const savedTab = getCurrentTab();
      if (savedTab) return savedTab;
      return activeSession?.role === 'Developer' ? 'developer' : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [developerSubTab, setDeveloperSubTab] = useState<'create' | 'db' | 'profile'>('create');
  const [activeCategory, setActiveCategory] = useState<LetterCategory>('mutasi');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState<boolean>(false);
  const [isGlobalCreateModalOpen, setIsGlobalCreateModalOpen] = useState<boolean>(false);
  const [isBerkasUjianModalOpen, setIsBerkasUjianModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState<boolean>(false);

  // Letter Payloads Map
  const [payloads, setPayloads] = useState<{
    mutasi: SuratMutasiPayload;
    keterangan_pip: SuratKeteranganPIPPayload;
    penerimaan_pindahan: SuratPenerimaanPindahanPayload;
    surat_tugas: SuratTugasPayload;
    aktif_mengajar: SuratAktifMengajarPayload;
    pembagian_tugas: SuratPembagianTugasPayload;
    perjalanan_dinas: SuratPerjalananDinasPayload;
    kuasa_pip: SuratKuasaPIPPayload;
    aktif_belajar: SuratAktifBelajarPayload;
  }>({
    mutasi: DEFAULT_MUTASI_PAYLOAD,
    keterangan_pip: DEFAULT_PIP_PAYLOAD,
    penerimaan_pindahan: DEFAULT_PENERIMAAN_PINDAHAN_PAYLOAD,
    surat_tugas: DEFAULT_SURAT_TUGAS_PAYLOAD,
    aktif_mengajar: DEFAULT_AKTIF_MENGAJAR_PAYLOAD,
    pembagian_tugas: DEFAULT_PEMBAGIAN_TUGAS_PAYLOAD,
    perjalanan_dinas: DEFAULT_PERJALANAN_DINAS_PAYLOAD,
    kuasa_pip: DEFAULT_KUASA_PIP_PAYLOAD,
    aktif_belajar: DEFAULT_AKTIF_BELAJAR_PAYLOAD,
  });

  const [developerBg, setDeveloperBg] = useState<string>(() => {
    if (typeof window === 'undefined') return '/login-operator-bg.jpg';
    return getDeveloperBg();
  });
  const [savedAlert, setSavedAlert] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBgSave = (e: Event) => {
      const customEvent = e as CustomEvent<SchoolProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      }
    };
    const handleDevBgSave = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setDeveloperBg(customEvent.detail);
      }
    };
    window.addEventListener('school-profile-saved-bg', handleBgSave);
    window.addEventListener('developer-bg-saved', handleDevBgSave);
    return () => {
      window.removeEventListener('school-profile-saved-bg', handleBgSave);
      window.removeEventListener('developer-bg-saved', handleDevBgSave);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (session && session.isAuthenticated && currentTab) {
      saveCurrentTab(currentTab);
    }
  }, [currentTab, session]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    // Real-time synchronization and total isolation of school-specific datasets (deferred to avoid cascading renders)
    const timer = setTimeout(() => {
      try {
        setSiswaList(getSiswaList());
        setGuruList(getGuruList());
        setArchiveList(getArchiveList());
        setProfile(getSchoolProfile());
      } catch (err) {
        console.error('Failed to sync local data:', err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [session?.username, session?.npsn]);

  if (!isClientLoaded) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3.5">
          <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Memuat Aplikasi Administrasi Sekolah...</span>
        </div>
      </div>
    );
  }

  // Handle Login / Logout
  const handleLoginSuccess = (user: UserSession) => {
    saveUserSession(user);
    setSession(user);
    
    // Explicitly load this specific school's isolated datasets immediately
    const targetSchoolKey = user.npsn || undefined;
    const currentSchoolProfile = getSchoolProfile(targetSchoolKey);
    setProfile(currentSchoolProfile);
    setSiswaList(getSiswaList(targetSchoolKey));
    setGuruList(getGuruList(targetSchoolKey));
    setArchiveList(getArchiveList(targetSchoolKey));

    if (user.role === 'Developer') {
      setCurrentTab('developer');
      saveCurrentTab('developer');
    } else {
      const savedTab = getCurrentTab();
      const target = (savedTab && savedTab !== 'developer') ? savedTab : 'dashboard';
      setCurrentTab(target);
      saveCurrentTab(target);
    }

    setShowLoginSuccessPopup(true);
  };

  const handleLogout = () => {
    clearUserSession();
    clearCurrentTab();
    setSession(null);
    setTimeout(() => {
      showToast('Anda telah berhasil keluar dari sistem administrasi sekolah.', 'info', 'Berhasil Keluar');
    }, 200);
  };

  if (!session || !session.isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (!profile) {
    return null;
  }

  // Profile Save
  const handleSaveProfile = (updatedProfile: SchoolProfile) => {
    saveSchoolProfile(updatedProfile);
    setProfile(updatedProfile);
    setIsSettingsOpen(false);
    showToast('Pengaturan Kop Surat & Profil Sekolah berhasil disimpan.', 'success', 'Berhasil Disimpan');
  };

  // Payload Updates
  const handleUpdateCurrentPayload = (updatedPayload: any) => {
    setPayloads((prev) => ({
      ...prev,
      [activeCategory]: updatedPayload,
    }));
  };

  // Master Data Updates
  const handleUpdateSiswa = (newList: Siswa[]) => {
    saveSiswaList(newList);
    setSiswaList(newList);
  };

  const handleUpdateGuru = (newList: Guru[]) => {
    saveGuruList(newList);
    setGuruList(newList);
  };

  const handlePrint = () => {
    showToast('Mempersiapkan dokumen cetak resolusi tinggi...', 'info', 'Cetak Dokumen');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleReopenArchiveItem = (item: ArchiveItem) => {
    setActiveCategory(item.category);
    setPayloads((prev) => ({
      ...prev,
      [item.category]: item.payload,
    }));
    setCurrentTab('letters');
    showToast(`Membuka kembali arsip "${item.nomorSurat}"`, 'info', 'Arsip Dimuat');
  };

  const handleDeleteArchive = (id: string) => {
    const updated = deleteArchiveItem(id);
    setArchiveList(updated);
    showToast('Surat resmi berhasil dihapus dari riwayat arsip.', 'warning', 'Berhasil Dihapus');
  };

  const activeMeta = LETTER_CATEGORIES_META.find((c) => c.id === activeCategory);

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-300 print:h-auto print:max-h-none print:overflow-visible print:block print:static relative ${currentTab === 'dashboard' || session?.role === 'Developer' || currentTab === 'developer' ? 'bg-[#030712] text-slate-100' : 'bg-slate-900/5 bg-gradient-to-br from-slate-100 via-indigo-50/20 to-slate-100'}`}>
      {/* Background Image restricted to Developer Studio only, NOT on Dashboard */}
      {currentTab === 'developer' && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transition-opacity duration-500"
          style={{ 
            backgroundImage: `url('${developerBg || profile?.loginBgUrl || '/login-operator-bg.jpg'}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Ambient Vignette & Contrast Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-950/55 to-slate-950/75 backdrop-blur-[1px]" />
        </div>
      )}

      {/* 3D Toast Notification Container */}
      <NotificationToastContainer />

      {/* Ambient Lighting Orbs */}
      <div className="fixed top-[-10%] left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <Navbar
        session={session}
        profile={profile}
        currentTab={currentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={() => setIsLogoutModalOpen(true)}
        onQuickPrint={handlePrint}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenCreateModal={() => setIsGlobalCreateModalOpen(true)}
        activeViewTitle={
          currentTab === 'dashboard'
            ? 'Dashboard Utama'
            : currentTab === 'persyaratan_mutasi'
            ? 'Persyaratan Mutasi'
            : currentTab === 'formulir_ppdb'
            ? 'Formulir PPDB'
            : currentTab === 'developer'
            ? 'Admin Developer'
            : currentTab === 'archive'
            ? 'Arsip Surat'
            : currentTab === 'master_data'
            ? 'Master Data'
            : currentTab === 'settings'
            ? 'Pengaturan Sekolah'
            : activeMeta?.title || 'Surat Resmi'
        }
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto overflow-hidden print:h-auto print:max-h-none print:overflow-visible print:block print:static print:max-w-none">
        {/* Left Sidebar */}
        <Sidebar
          session={session}
          currentTab={currentTab}
          activeCategory={activeCategory}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setCurrentTab('letters');
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenCreateModal={() => setIsGlobalCreateModalOpen(true)}
          onOpenBerkasUjianModal={() => setIsBerkasUjianModalOpen(true)}
          onOpenUserProfileModal={() => setIsUserProfileOpen(true)}
        />

        {/* Right Content View with 3D Transitions */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto overflow-x-hidden print:h-auto print:max-h-none print:overflow-visible print:block print:static print:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab + (currentTab === 'letters' ? `-${activeCategory}` : '')}
              initial={{ opacity: 0, y: 16, scale: 0.985, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, scale: 0.985, filter: 'blur(3px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >

          {/* VIEW 1: DASHBOARD OVERVIEW */}
          {currentTab === 'dashboard' && (
            <DashboardOverview
              session={session}
              profile={profile}
              archiveCount={archiveList.length}
              siswaCount={siswaList.length}
              guruCount={guruList.length}
              recentArchives={archiveList}
              siswaList={siswaList}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setCurrentTab('letters');
              }}
              onNavigateTab={(tab, subTab) => {
                setCurrentTab(tab);
                if (subTab) {
                  setDeveloperSubTab(subTab as any);
                }
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {/* VIEW 2: PERSYARATAN MUTASI DOCUMENT */}
          {currentTab === 'persyaratan_mutasi' && (
            <PersyaratanMutasiPage
              profile={profile}
              siswaList={siswaList}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {/* VIEW 2.5: FORMULIR PPDB DOCUMENT */}
          {currentTab === 'formulir_ppdb' && (
            <FormulirPPDBPage
              profile={profile}
              siswaList={siswaList}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {/* VIEW 3: GENERATOR SURAT (Interactive Split View: Form + Live Paper Preview) */}
          {currentTab === 'letters' && (
            <div className="space-y-4 print:space-y-0 print:block print:static print:h-auto print:overflow-visible">
              {/* Top Header Bar for Active Document */}
              <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      activeMeta?.badgeBg || 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {activeMeta?.badge || 'Surat'}
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {activeMeta?.title || 'Formulir Surat Resmi'}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>

              {/* Split Screen Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block print:static print:h-auto print:overflow-visible">
                {/* Form Input Area (Left 5 Cols) */}
                <div className="no-print lg:col-span-5">
                  <LetterForm
                    category={activeCategory}
                    payload={payloads[activeCategory]}
                    onChangePayload={handleUpdateCurrentPayload}
                    siswaList={siswaList}
                    guruList={guruList}
                  />
                </div>

                {/* Live A4 Paper Preview Area (Right 7 Cols) */}
                <div className="lg:col-span-7 flex print:block print:static justify-center bg-slate-200/70 p-4 sm:p-6 rounded-2xl border border-slate-300 overflow-x-auto print:border-none print:shadow-none print:p-0 print:m-0 print:bg-transparent print:rounded-none print:w-full print:max-w-none">
                  <div className="scale-90 sm:scale-100 origin-top print:transform-none print:scale-100 print:block print:static print:m-0 print:p-0 print:w-full">
                    <LetterPreview
                      profile={profile}
                      category={activeCategory}
                      payload={payloads[activeCategory]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: ARSIP SURAT */}
          {currentTab === 'archive' && (
            <ArchiveTable
              archiveList={archiveList}
              onReopenArchiveItem={handleReopenArchiveItem}
              onDeleteArchiveItem={handleDeleteArchive}
            />
          )}

          {/* VIEW 5: MASTER DATA SISWA & GURU */}
          {currentTab === 'master_data' && (
            <MasterDataPage
              siswaList={siswaList}
              guruList={guruList}
              onUpdateSiswaList={handleUpdateSiswa}
              onUpdateGuruList={handleUpdateGuru}
            />
          )}

          {/* VIEW 6: SETTINGS PAGE */}
          {currentTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                    Pusat Pengaturan Sistem & Profil
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola identitas pengguna aktif dan pengaturan kop surat resmi sekolah
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Card 1: Pengaturan Pengguna Aktif */}
                  <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                        <UserCog className="w-5 h-5" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Profil Pengguna Aktif
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Ubah Nama Lengkap ({session?.namaLengkap || 'Pengguna'}), Jabatan ({session?.jabatan || session?.role}), Hak Akses, serta Foto Profil Avatar.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsUserProfileOpen(true)}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <UserCog className="w-4 h-4" />
                      <span>Edit Profil Pengguna</span>
                    </button>
                  </div>

                  {/* Card 2: Pengaturan Kop Surat & Sekolah */}
                  <div className="bg-gradient-to-br from-amber-50/50 to-slate-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                        <Building2 className="w-5 h-5 text-slate-950" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        Kop Surat & Profil Sekolah
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Atur Nama Sekolah, NPSN, Alamat, Kontak, Logo Pemda & Tutwuri, serta Nama & NIP Kepala Sekolah.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-slate-950" />
                      <span>Buka Pengaturan Kop Surat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: DEVELOPER PAGE */}
          {currentTab === 'developer' && (
            <DeveloperPage
              profile={profile}
              session={session}
              initialTab={developerSubTab}
              onUpdateProfile={(updated) => {
                saveSchoolProfile(updated);
                setProfile(updated);
                showToast('Profil Developer berhasil disimpan.', 'success');
              }}
              onUpdateSession={(updatedSession) => {
                saveUserSession(updatedSession);
                setSession(updatedSession);
                showToast('Sesi Developer diperbarui.', 'success');
              }}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Profile Settings Modal */}
      <SchoolProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* User Profile Active Modal */}
      {session && (
        <UserProfileModal
          isOpen={isUserProfileOpen}
          onClose={() => setIsUserProfileOpen(false)}
          session={session}
          onUpdateSession={(updatedSession) => {
            saveUserSession(updatedSession);
            setSession(updatedSession);
            setSavedAlert('Profil Pengguna Aktif berhasil diperbarui.');
            setTimeout(() => setSavedAlert(null), 3000);
          }}
        />
      )}

      {/* Global Create Letter Modal */}
      <CreateLetterModal
        isOpen={isGlobalCreateModalOpen}
        onClose={() => setIsGlobalCreateModalOpen(false)}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setCurrentTab('letters');
        }}
      />

      {/* Berkas Ujian Pop Up Modal */}
      {profile && (
        <BerkasUjianModal
          isOpen={isBerkasUjianModalOpen}
          onClose={() => setIsBerkasUjianModalOpen(false)}
          profile={profile}
          siswaList={siswaList}
        />
      )}

      {/* 3D Logout Confirmation Warning Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        variant="logout"
        title="Konfirmasi Keluar Aplikasi"
        description="Apakah Anda yakin ingin keluar dari akun Sistem Administrasi Sekolah? Sesi aktif Anda akan ditutup dan disimpan dengan aman."
        itemName={session ? `${session.namaLengkap} • Jabatan: ${session.jabatan || session.role}` : undefined}
        confirmText="Ya, Keluar Sekarang"
        cancelText="Batal"
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          handleLogout();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

      {/* 3D Celebratory Login Success Pop Up */}
      <LoginSuccessModal
        isOpen={showLoginSuccessPopup}
        onClose={() => setShowLoginSuccessPopup(false)}
        session={session}
        profile={profile}
      />
    </div>
  );
}
