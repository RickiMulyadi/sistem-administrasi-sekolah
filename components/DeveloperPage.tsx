import React, { useState, useEffect } from 'react';
import { UserAccount, SchoolProfile, UserSession, UserRole, PasswordResetRequest } from '../types';
import {
  getUserAccounts,
  saveUserAccounts,
  getSchoolProfile,
  saveSchoolProfile,
  getDeveloperBg,
  saveDeveloperBg,
  DEFAULT_DEVELOPER_BG,
  getPasswordResetRequests,
  savePasswordResetRequests,
  markPasswordResetResolved,
  deletePasswordResetRequest,
  resetUserAccountToDefault,
  pushDeveloperDataToServer,
  syncDeveloperDataFromServer,
} from '../lib/storage';
import { compressImageFile, compressWallpaperFile } from '../lib/utils';
import {
  ShieldCheck,
  User,
  Lock,
  Trash2,
  UserPlus,
  AlertCircle,
  Sparkles,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  UserCheck,
  Briefcase,
  Image as ImageIcon,
  Palette,
  Check,
  CheckCircle2,
  MonitorPlay,
  UploadCloud,
  FileUp,
  Settings,
  School,
  Hash,
  MapPin,
  Terminal,
  Pencil,
  X,
  Bell,
  RotateCcw,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  CloudLightning,
} from 'lucide-react';
import { motion } from 'motion/react';
import { showToast } from '../lib/toast';

interface DeveloperPageProps {
  onBackToDashboard: () => void;
  profile?: SchoolProfile | null;
  session?: UserSession | null;
  onUpdateProfile?: (profile: SchoolProfile) => void;
  onUpdateSession?: (session: UserSession) => void;
  initialTab?: 'create' | 'db' | 'profile' | 'requests';
}

export const DeveloperPage: React.FC<DeveloperPageProps> = ({
  onBackToDashboard,
  profile: propProfile,
  session,
  onUpdateProfile,
  onUpdateSession,
  initialTab = 'create',
}) => {
  // Get initial states from Storage
  const profile = propProfile || getSchoolProfile();
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    if (typeof window === 'undefined') return [];
    return getUserAccounts();
  });

  // Password Reset Requests State
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>(() => {
    if (typeof window === 'undefined') return [];
    return getPasswordResetRequests();
  });
  const [showResetRequestsModal, setShowResetRequestsModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleRequestsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<PasswordResetRequest[]>;
      if (customEvent.detail) {
        setResetRequests(customEvent.detail);
      } else {
        setResetRequests(getPasswordResetRequests());
      }
    };
    window.addEventListener('password-reset-request-updated', handleRequestsUpdate);
    return () => {
      window.removeEventListener('password-reset-request-updated', handleRequestsUpdate);
    };
  }, []);

  const pendingRequestsCount = resetRequests.filter((r) => r.status === 'pending').length;

  // Cloud Server Sync State
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const pushed = await pushDeveloperDataToServer();
      const pulled = await syncDeveloperDataFromServer();
      if (pushed || pulled) {
        const updatedAccounts = getUserAccounts();
        setAccounts(updatedAccounts);
        setResetRequests(getPasswordResetRequests());
        showToast('Data Developer, akun, dan wallpaper berhasil disinkronisasi ke server pusat!', 'success', 'Sinkronisasi Berhasil');
      } else {
        showToast('Data tersimpan secara lokal dan siap digunakan.', 'info', 'Tersimpan');
      }
    } catch (err) {
      showToast('Gagal menghubungkan ke server sinkronisasi.', 'error', 'Gagal');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Account creation states
  const [username, setUsername] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin TU');
  const [jabatanInput, setJabatanInput] = useState('Kepala Tata Usaha');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // New detailed school profile integration states
  const [npsn, setNpsn] = useState('');
  const [namaSekolah, setNamaSekolah] = useState('');
  const [alamat, setAlamat] = useState('');
  const [desa, setDesa] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kabupaten, setKabupaten] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const [logoSekolahUrl, setLogoSekolahUrl] = useState('');
  const [dragActiveSchoolLogo, setDragActiveSchoolLogo] = useState(false);
  const [dragActiveAdminPhoto, setDragActiveAdminPhoto] = useState(false);
  const [dragActiveDevAvatar, setDragActiveDevAvatar] = useState(false);
  const [dragActiveEditSchoolLogo, setDragActiveEditSchoolLogo] = useState(false);
  const [dragActiveEditAdminPhoto, setDragActiveEditAdminPhoto] = useState(false);

  // Active developer main tab: 'create' | 'db' | 'profile' | 'requests'
  const [activeDevTab, setActiveDevTab] = useState<'create' | 'db' | 'profile' | 'requests'>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveDevTab(initialTab);
  }

  const [prevProfile, setPrevProfile] = useState(propProfile);
  if (propProfile && propProfile !== prevProfile) {
    setPrevProfile(propProfile);
  }

  // Admin Developer Profile states
  const [devName, setDevName] = useState(() => {
    const devAcc = accounts.find((a) => a.username === 'developer');
    return devAcc ? devAcc.namaLengkap : 'Admin Developer';
  });
  
  const [devPassword, setDevPassword] = useState(() => {
    const devAcc = accounts.find((a) => a.username === 'developer');
    return devAcc ? devAcc.password : '123';
  });

  const [devAvatar, setDevAvatar] = useState(() => {
    const devAcc = accounts.find((a) => a.username === 'developer');
    return devAcc ? devAcc.avatarUrl : 'https://picsum.photos/seed/developer-avatar/150/150';
  });

  const [devBgUrl, setDevBgUrl] = useState(() => getDeveloperBg());
  const [dragActiveDevBg, setDragActiveDevBg] = useState(false);
  const [showDevPassword, setShowDevPassword] = useState(false);

  // Confirmation state for deleting account
  const [accountToDelete, setAccountToDelete] = useState<{ username: string; role: string; namaLengkap: string } | null>(null);

  // Edit account modal states
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [originalEditKey, setOriginalEditKey] = useState<{ username: string; role: string } | null>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const handleOpenEditAccount = (acc: UserAccount) => {
    setEditingAccount({ ...acc });
    setOriginalEditKey({ username: acc.username, role: acc.role });
    setShowEditPassword(false);
  };

  const handleSaveEditedAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !originalEditKey) return;

    if (!editingAccount.namaLengkap.trim()) {
      showToast('Nama lengkap tidak boleh kosong.', 'error', 'Validasi Gagal');
      return;
    }
    if (!editingAccount.username.trim()) {
      showToast('Username tidak boleh kosong.', 'error', 'Validasi Gagal');
      return;
    }

    const cleanUsername = editingAccount.username.trim().toLowerCase();
    
    // Check duplicate
    const isDuplicate = accounts.some(
      (a) =>
        a.username.toLowerCase() === cleanUsername &&
        a.role === editingAccount.role &&
        !(a.username.toLowerCase() === originalEditKey.username.toLowerCase() && a.role === originalEditKey.role)
    );

    if (isDuplicate) {
      showToast(`Username "${cleanUsername}" dengan role ${editingAccount.role} sudah ada.`, 'error', 'Duplikasi Akun');
      return;
    }

    const updated = accounts.map((acc) => {
      if (acc.username.toLowerCase() === originalEditKey.username.toLowerCase() && acc.role === originalEditKey.role) {
        return {
          ...editingAccount,
          username: cleanUsername,
          namaLengkap: editingAccount.namaLengkap.trim(),
          jabatan: editingAccount.jabatan?.trim() || (editingAccount.role === 'Admin TU' ? 'Kepala Tata Usaha' : editingAccount.role),
          namaSekolah: editingAccount.namaSekolah?.trim() || '',
          npsn: editingAccount.npsn?.trim() || '',
          logoSekolahUrl: editingAccount.logoSekolahUrl?.trim() || '',
          avatarUrl: editingAccount.avatarUrl?.trim() || '',
        };
      }
      return acc;
    });

    saveUserAccounts(updated);
    setAccounts(updated);

    // Sync to School Profile for instant dashboard and navbar reflect!
    const currentBase = propProfile || getSchoolProfile();
    const cleanNpsn = editingAccount.npsn?.trim() || currentBase.npsn;
    const cleanNamaSekolah = editingAccount.namaSekolah?.trim() || currentBase.namaSekolah;
    const newSchoolLogo = editingAccount.logoSekolahUrl?.trim() || currentBase.logoRightUrl || currentBase.logoLeftUrl;
    const newAdminPhoto = editingAccount.avatarUrl?.trim() || currentBase.operatorAvatarUrl;

    const updatedProfile: SchoolProfile = {
      ...currentBase,
      namaSekolah: cleanNamaSekolah,
      npsn: cleanNpsn,
      alamat: editingAccount.alamat?.trim() || currentBase.alamat,
      kelurahan: editingAccount.desa?.trim() || currentBase.kelurahan,
      kecamatan: editingAccount.kecamatan?.trim() || currentBase.kecamatan,
      kota: editingAccount.kabupaten?.trim() || currentBase.kota,
      provinsi: editingAccount.provinsi?.trim() || currentBase.provinsi,
      logoLeftUrl: newSchoolLogo || undefined,
      logoRightUrl: newSchoolLogo || undefined,
      operatorAvatarUrl: newAdminPhoto || undefined,
      operatorName: editingAccount.namaLengkap.trim(),
    };

    saveSchoolProfile(updatedProfile, cleanNpsn || undefined);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('school-profile-saved-bg', { detail: updatedProfile }));
    }
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }

    // If active session is being edited or matches this account, update session live
    if (session && onUpdateSession) {
      if (
        session.username.toLowerCase() === originalEditKey.username.toLowerCase() ||
        session.username.toLowerCase() === cleanUsername.toLowerCase() ||
        session.npsn === cleanNpsn
      ) {
        onUpdateSession({
          ...session,
          username: cleanUsername,
          namaLengkap: editingAccount.namaLengkap.trim(),
          role: editingAccount.role,
          jabatan: editingAccount.jabatan?.trim() || (editingAccount.role === 'Admin TU' ? 'Kepala Tata Usaha' : editingAccount.role),
          avatarUrl: editingAccount.avatarUrl || session.avatarUrl,
          npsn: cleanNpsn || session.npsn,
        });
      }
    }

    showToast(`Data akun "${editingAccount.namaLengkap}" berhasil diperbarui dan disinkronkan ke Dashboard!`, 'success', 'Berhasil Disimpan');
    setEditingAccount(null);
    setOriginalEditKey(null);
  };

  // File upload reader helper
  type ImageUploadTarget = 'dev_avatar' | 'school_logo' | 'admin_photo' | 'edit_school_logo' | 'edit_admin_photo' | 'dev_bg';

  const handleImageFile = async (file: File, type: ImageUploadTarget) => {
    if (!file.type.startsWith('image/')) {
      showToast('File yang diunggah harus berupa gambar (JPEG, PNG, SVG, WebP, dll).', 'error', 'Format Tidak Sesuai');
      return;
    }

    try {
      let base64Data: string;
      if (type === 'dev_bg') {
        base64Data = await compressWallpaperFile(file);
      } else {
        base64Data = await compressImageFile(file, 400, 400, 0.75);
      }

      if (type === 'school_logo') {
        setLogoSekolahUrl(base64Data);
        showToast('Logo sekolah berhasil dimuat!', 'success', 'Logo Dimuat');
      } else if (type === 'admin_photo') {
        setAvatarUrl(base64Data);
        showToast('Foto admin berhasil dimuat!', 'success', 'Foto Dimuat');
      } else if (type === 'dev_avatar') {
        setDevAvatar(base64Data);
        showToast('Foto profil Developer berhasil dimuat!', 'success', 'Foto Dimuat');
      } else if (type === 'edit_school_logo') {
        setEditingAccount((prev) => prev ? { ...prev, logoSekolahUrl: base64Data } : null);
        showToast('Logo sekolah berhasil diunggah untuk akun ini!', 'success', 'Logo Dimuat');
      } else if (type === 'edit_admin_photo') {
        setEditingAccount((prev) => prev ? { ...prev, avatarUrl: base64Data } : null);
        showToast('Foto admin/pengelola berhasil diunggah!', 'success', 'Foto Dimuat');
      } else if (type === 'dev_bg') {
        setDevBgUrl(base64Data);
        saveDeveloperBg(base64Data);
        showToast('Latar belakang developer berhasil diunggah dan disimpan otomatis!', 'success', 'Latar Belakang Tersimpan');
      }
    } catch (err) {
      console.error('Failed to compress image:', err);
      showToast('Gagal memproses gambar. Silakan gunakan file gambar standar.', 'error', 'Gagal Memproses');
    }
  };

  const handleDrag = (e: React.DragEvent, type: ImageUploadTarget) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === 'dev_avatar') setDragActiveDevAvatar(true);
      if (type === 'school_logo') setDragActiveSchoolLogo(true);
      if (type === 'admin_photo') setDragActiveAdminPhoto(true);
      if (type === 'edit_school_logo') setDragActiveEditSchoolLogo(true);
      if (type === 'edit_admin_photo') setDragActiveEditAdminPhoto(true);
      if (type === 'dev_bg') setDragActiveDevBg(true);
    } else if (e.type === "dragleave") {
      if (type === 'dev_avatar') setDragActiveDevAvatar(false);
      if (type === 'school_logo') setDragActiveSchoolLogo(false);
      if (type === 'admin_photo') setDragActiveAdminPhoto(false);
      if (type === 'edit_school_logo') setDragActiveEditSchoolLogo(false);
      if (type === 'edit_admin_photo') setDragActiveEditAdminPhoto(false);
      if (type === 'dev_bg') setDragActiveDevBg(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: ImageUploadTarget) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'dev_avatar') setDragActiveDevAvatar(false);
    if (type === 'school_logo') setDragActiveSchoolLogo(false);
    if (type === 'admin_photo') setDragActiveAdminPhoto(false);
    if (type === 'edit_school_logo') setDragActiveEditSchoolLogo(false);
    if (type === 'edit_admin_photo') setDragActiveEditAdminPhoto(false);
    if (type === 'dev_bg') setDragActiveDevBg(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0], type);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: ImageUploadTarget) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0], type);
    }
  };



  // Background presets for quick selection
  const bgPresets = [
    {
      name: 'Cartoon Office (Default)',
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1600',
      thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Dynamic Geometry',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Classic Library',
      url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1600',
      thumbnail: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=200',
    },
    {
      name: 'Minimalist Workspace',
      url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1600',
      thumbnail: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=200',
    },
  ];

  // Logo presets for quick selection
  const logoPresets = [
    {
      name: 'Popsy School Cap',
      url: 'https://illustrations.popsy.co/indigo/academic-cap.svg',
    },
    {
      name: 'Popsy Teacher Desk',
      url: 'https://illustrations.popsy.co/indigo/work-from-home.svg',
    },
    {
      name: 'Popsy Back to School',
      url: 'https://illustrations.popsy.co/indigo/back-to-school.svg',
    },
  ];

  // Handle generation of random custom avatar URLs
  const handleGenerateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://picsum.photos/seed/${randomSeed}/150/150`);
  };

  // Create new school account
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername) {
      showToast('Username tidak boleh kosong.', 'error', 'Validasi Gagal');
      return;
    }

    if (!namaLengkap.trim()) {
      showToast('Nama Lengkap tidak boleh kosong.', 'error', 'Validasi Gagal');
      return;
    }

    if (!password || password.length < 3) {
      showToast('Sandi minimal 3 karakter untuk keamanan.', 'error', 'Validasi Gagal');
      return;
    }

    // Check duplication
    const duplicate = accounts.some(
      (acc) => acc.username.toLowerCase() === cleanUsername && acc.role === selectedRole
    );

    if (duplicate) {
      showToast(`Username "${cleanUsername}" dengan jabatan "${selectedRole}" sudah terdaftar.`, 'error', 'Duplikasi Akun');
      return;
    }

    const cleanNpsn = npsn.trim();
    const cleanNamaSekolah = namaSekolah.trim();

    if (!cleanNpsn) {
      showToast('NPSN sekolah tidak boleh kosong.', 'error', 'Validasi Gagal');
      return;
    }
    if (!cleanNamaSekolah) {
      showToast('Nama Sekolah tidak boleh kosong.', 'error', 'Validasi Gagal');
      return;
    }

    const newAccount: UserAccount = {
      username: cleanUsername,
      namaLengkap: namaLengkap.trim(),
      role: selectedRole,
      password: password,
      avatarUrl: avatarUrl.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      npsn: cleanNpsn,
      namaSekolah: cleanNamaSekolah,
      alamat: alamat.trim(),
      desa: desa.trim(),
      kecamatan: kecamatan.trim(),
      kabupaten: kabupaten.trim(),
      provinsi: provinsi.trim(),
      logoSekolahUrl: logoSekolahUrl.trim() || 'https://illustrations.popsy.co/indigo/academic-cap.svg',
      jabatan: jabatanInput.trim() || (selectedRole === 'Admin TU' ? 'Kepala Tata Usaha' : selectedRole),
    };

    const updated = [newAccount, ...accounts];
    saveUserAccounts(updated);
    setAccounts(updated);

    // Initialize and automatically sync school profile for this newly created school
    const currentBase = propProfile || getSchoolProfile();
    const customProfile: SchoolProfile = {
      ...currentBase,
      namaSekolah: cleanNamaSekolah,
      npsn: cleanNpsn,
      alamat: alamat.trim(),
      kelurahan: desa.trim(),
      kecamatan: kecamatan.trim(),
      kota: kabupaten.trim(),
      provinsi: provinsi.trim(),
      namaKepsek: selectedRole === 'Kepala Sekolah' ? namaLengkap.trim() : (currentBase.namaKepsek || '-'),
      logoLeftUrl: logoSekolahUrl.trim() || 'https://illustrations.popsy.co/indigo/academic-cap.svg',
      logoRightUrl: logoSekolahUrl.trim() || 'https://illustrations.popsy.co/indigo/academic-cap.svg',
      operatorAvatarUrl: avatarUrl.trim() || undefined,
      operatorName: selectedRole === 'Admin TU' ? namaLengkap.trim() : undefined,
    };

    // Save to isolated school slot
    saveSchoolProfile(customProfile, cleanNpsn || undefined);

    if (onUpdateProfile) {
      onUpdateProfile(customProfile);
    }

    // Automatically login as the newly created school account for instant connection!
    const newSession: UserSession = {
      isAuthenticated: true,
      username: newAccount.username,
      namaLengkap: newAccount.namaLengkap,
      role: newAccount.role,
      avatarUrl: newAccount.avatarUrl || `https://picsum.photos/seed/${newAccount.username}/100/100`,
      jabatan: newAccount.jabatan,
      npsn: newAccount.npsn,
    };

    if (onUpdateSession) {
      onUpdateSession(newSession);
    }

    // Redirect directly to dashboard
    onBackToDashboard();

    // Reset Form
    setUsername('');
    setNamaLengkap('');
    setJabatanInput('Kepala Sekolah');
    setPassword('');
    setAvatarUrl('');
    setNpsn('');
    setNamaSekolah('');
    setAlamat('');
    setDesa('');
    setKecamatan('');
    setKabupaten('');
    setProvinsi('');
    setLogoSekolahUrl('');
    showToast(`Akun "${newAccount.namaLengkap}" untuk "${newAccount.namaSekolah}" berhasil dibuat!`, 'success', 'Akun Ditambahkan');
  };

  // Delete school account (triggers custom popup instead of window.confirm)
  const handleDeleteAccount = (usernameToDelete: string, roleToDelete: string, namaLengkapToDelete: string) => {
    if (usernameToDelete === 'developer') {
      showToast('Akun bawaan sistem (developer) tidak dapat dihapus.', 'warning', 'Tidak Diizinkan');
      return;
    }

    setAccountToDelete({
      username: usernameToDelete,
      role: roleToDelete,
      namaLengkap: namaLengkapToDelete,
    });
  };

  // Perform actual deletion once user confirms inside our popup
  const confirmDeleteAccount = () => {
    if (!accountToDelete) return;
    const { username: u, role: r } = accountToDelete;

    const updated = accounts.filter(
      (acc) => !(acc.username === u && acc.role === r)
    );
    saveUserAccounts(updated);
    setAccounts(updated);
    showToast(`Akun "${u}" berhasil dihapus.`, 'warning', 'Akun Dihapus');
    setAccountToDelete(null);
  };

  // Direct 1-Click Reset Account Password from Table
  const handleDirectResetAccount = (acc: UserAccount) => {
    const res = resetUserAccountToDefault(acc.username);
    if (res.success) {
      const updated = getUserAccounts();
      setAccounts(updated);
      showToast(
        `Kata sandi akun "${acc.namaLengkap}" (@${acc.username}) berhasil di-reset ke default "${res.defaultPassword}"!`,
        'success',
        'Sandi Akun Ter-reset'
      );
    } else {
      showToast('Gagal mereset sandi akun.', 'error', 'Reset Gagal');
    }
  };

  // Resolve password reset request from school & reset account credentials
  const handleResetRequestFromSchool = (req: PasswordResetRequest) => {
    const res = resetUserAccountToDefault(req.username);
    markPasswordResetResolved(req.id);
    const updatedReqs = getPasswordResetRequests();
    setResetRequests(updatedReqs);

    const updatedAccs = getUserAccounts();
    setAccounts(updatedAccs);

    showToast(
      `Permintaan dari "${req.namaSekolah}" (@${req.username}) telah diproses! Kata sandi di-reset ke "${res.defaultPassword}".`,
      'success',
      'Akun Sekolah Ter-reset'
    );
  };

  // Delete / Remove password reset request
  const handleDeleteResetRequest = (id: string) => {
    deletePasswordResetRequest(id);
    const updated = getPasswordResetRequests();
    setResetRequests(updated);
    showToast('Permintaan reset berhasil dihapus dari daftar.', 'info', 'Dihapus');
  };

  // Generate random avatar for developer settings
  const handleGenerateRandomDevAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setDevAvatar(`https://picsum.photos/seed/${randomSeed}/150/150`);
  };

  // Save updated developer profile settings
  const handleSaveDevProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = devName.trim();
    if (!cleanName) {
      showToast('Nama Lengkap Developer tidak boleh kosong.', 'error', 'Validasi Gagal');
      return;
    }

    if (!devPassword || devPassword.length < 3) {
      showToast('Sandi minimal 3 karakter demi keamanan.', 'error', 'Validasi Gagal');
      return;
    }

    // Find and update developer account in database list
    const updatedAccounts = accounts.map((acc) => {
      if (acc.username === 'developer') {
        return {
          ...acc,
          namaLengkap: cleanName,
          password: devPassword,
          avatarUrl: devAvatar,
        };
      }
      return acc;
    });

    saveUserAccounts(updatedAccounts);
    setAccounts(updatedAccounts);

    // If active session is logged in as 'developer' or has Developer role, sync on the fly!
    if (session && (session.username.toLowerCase() === 'developer' || session.role === 'Developer') && onUpdateSession) {
      onUpdateSession({
        ...session,
        namaLengkap: cleanName,
        avatarUrl: devAvatar,
      });
    }

    // Save developer full screen background
    if (devBgUrl) {
      saveDeveloperBg(devBgUrl);
    }

    showToast('Profil & Latar Belakang Developer berhasil disimpan!', 'success', 'Perubahan Disimpan');
  };

  const roleBadgeConfig = {
    'Admin TU': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Tenaga Administrasi': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    'Kepala Sekolah': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Operator PIP': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Guru': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    'Super Admin': 'text-purple-400 bg-purple-500/10 border-purple-400/20',
    'Developer': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="min-h-full bg-[#070b12]/80 backdrop-blur-xl text-slate-100 rounded-3xl overflow-hidden border border-slate-800/80 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative font-sans flex flex-col p-4 sm:p-6 md:p-8">
      
      {/* 3D Visual Mesh Background Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-3xl opacity-30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full flex-1">
        
        {/* Navigation & Header with Modern 3D Card Look */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-800/80 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBackToDashboard}
              className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-slate-600 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  DEVELOPER PLATFORM
                </span>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  3D CONSOLE V2.0
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight leading-none">
                Studio Pengembang & Database Akun
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Tombol Cloud Server Sync (Sinkronisasi Lintas Browser) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleManualCloudSync}
              disabled={isSyncingCloud}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-md group disabled:opacity-50"
              title="Sinkronisasikan seluruh data Developer ke server pusat (agar tersimpan di semua browser/Google akun)"
            >
              <CloudLightning className={`w-4 h-4 text-emerald-400 ${isSyncingCloud ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} />
              <span className="hidden sm:inline font-black text-[11px] uppercase tracking-wider text-emerald-300">
                {isSyncingCloud ? 'Menyinkronkan...' : 'Sinkron Cloud'}
              </span>
            </motion.button>

            {/* Notifikasi Lonceng Permintaan Reset Password */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setShowResetRequestsModal(true)}
              className="relative w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-amber-500/60 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-all cursor-pointer shadow-md group"
              title="Notifikasi Permintaan Reset Sandi Sekolah"
            >
              <Bell className={`w-5 h-5 transition-colors ${pendingRequestsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400 group-hover:text-amber-400'}`} />
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 border-2 border-slate-950 animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBackToDashboard}
              className="text-xs font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500/5 border-2 border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer shadow-md tracking-wider uppercase"
            >
              <span>Kembali Ke Dashboard Utama</span>
              <ArrowLeft className="w-4 h-4 rotate-180 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>

        {/* Premium Tab Buttons placed right below Font/Header Dashboard Overview */}
        <div className="flex flex-wrap gap-3 mb-8 z-10">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActiveDevTab('create')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
              activeDevTab === 'create'
                ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-indigo-500/10'
                : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Buat Akun Sekolah</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActiveDevTab('db')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
              activeDevTab === 'db'
                ? 'bg-purple-500/15 border-purple-500 text-purple-300 shadow-purple-500/10'
                : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Database Akun</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActiveDevTab('requests')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] relative ${
              activeDevTab === 'requests'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-amber-500/10'
                : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className={`w-4 h-4 ${pendingRequestsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <span>Permintaan Reset</span>
            {pendingRequestsCount > 0 && (
              <span className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-md">
                {pendingRequestsCount}
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setActiveDevTab('profile')}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
              activeDevTab === 'profile'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-amber-500/10'
                : 'bg-[#0b0f19] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Profil Admin Developer</span>
          </motion.button>
        </div>

        {/* 3D Bento-Grid Dashboard Layout - Refactored as Beautiful Centered Tabbed Sections */}
        <div className="w-full max-w-3xl mx-auto flex-1 pb-10">
          
          {/* COLUMN 1: ACCOUNT CREATOR CARD */}
          {activeDevTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between transform transition-all hover:border-indigo-500/30 w-full"
            >
              {/* Animated Glow Border top */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400" />
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border-2 border-indigo-500/20 text-indigo-400 shadow-md">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white tracking-wide uppercase">
                      Buat Akun Sekolah
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Registrasi Akses Pengguna
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateAccount} className="space-y-6">
                  {/* SECTION 1: AKSES LOG MASUK */}
                  <div className="space-y-4 border-b border-slate-800 pb-5">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
                      1. Akses Log Masuk (Account Access)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Username Input */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          Username Akun / NIP
                        </label>
                        <div className="relative">
                          <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none font-mono tracking-wider focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="Masukan Username atau NIP..."
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          Kata Sandi Akun
                        </label>
                        <div className="relative">
                          <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none font-mono focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="Masukan Kata Sandi Akun (Bisa menggunakan NPSN Sekolah)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-indigo-400 mt-1.5 font-medium">
                          *Bisa menggunakan NPSN sekolah sebagai kata sandi akun
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: IDENTITAS & ALAMAT SEKOLAH */}
                  <div className="space-y-4 border-b border-slate-800 pb-5">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
                      2. Identitas & Alamat Lengkap Sekolah
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* NPSN */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          NPSN Sekolah
                        </label>
                        <div className="relative">
                          <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                            <Hash className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            value={npsn}
                            onChange={(e) => setNpsn(e.target.value)}
                            className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none font-mono tracking-wider focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="Masukan NPSN Sekolah"
                          />
                        </div>
                      </div>

                      {/* Nama Sekolah */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          Nama Sekolah
                        </label>
                        <div className="relative">
                          <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                            <School className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            value={namaSekolah}
                            onChange={(e) => setNamaSekolah(e.target.value)}
                            className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            placeholder="Masukan Nama Sekolah"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                        Alamat Jalan / No
                      </label>
                      <div className="relative">
                        <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={alamat}
                          onChange={(e) => setAlamat(e.target.value)}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Masukan Alamat Jalan / No"
                        />
                      </div>
                    </div>

                    {/* Desa & Kecamatan */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          Desa / Kelurahan
                        </label>
                        <input
                          type="text"
                          required
                          value={desa}
                          onChange={(e) => setDesa(e.target.value)}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Masukan Desa / Kelurahan"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          Kecamatan
                        </label>
                        <input
                          type="text"
                          required
                          value={kecamatan}
                          onChange={(e) => setKecamatan(e.target.value)}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Masukan Kecamatan"
                        />
                      </div>
                    </div>

                    {/* Kabupaten & Provinsi */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          Kabupaten / Kota
                        </label>
                        <input
                          type="text"
                          required
                          value={kabupaten}
                          onChange={(e) => setKabupaten(e.target.value)}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Masukan Kabupaten / Kota"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                          Provinsi
                        </label>
                        <input
                          type="text"
                          required
                          value={provinsi}
                          onChange={(e) => setProvinsi(e.target.value)}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Masukan Provinsi"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: NAMA PENGELOLA & MEDIA UPLOAD */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full inline-block" />
                      3. Nama Pengelola & Berkas Media
                    </h3>

                    {/* Full Name Input */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                        Nama Lengkap Pengelola & Gelar
                      </label>
                      <div className="relative">
                        <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={namaLengkap}
                          onChange={(e) => setNamaLengkap(e.target.value)}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Masukan Nama Lengkap Pengelola & Gelar"
                        />
                      </div>
                    </div>

                    {/* Role Selection Dropdown */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                        Hak Akses / Role
                      </label>
                      <div className="relative">
                        <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <select
                          value={selectedRole}
                          onChange={(e: any) => {
                            const val = e.target.value as UserRole;
                            setSelectedRole(val);
                            if (val === 'Admin TU') {
                              setJabatanInput('Kepala Tata Usaha');
                            } else if (val === 'Tenaga Administrasi') {
                              setJabatanInput('Tenaga Administrasi');
                            } else {
                              setJabatanInput(val);
                            }
                          }}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-10 text-xs text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                        >
                          <option value="Admin TU">Admin TU</option>
                          <option value="Tenaga Administrasi">Tenaga Administrasi</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>

                    {/* Custom Jabatan Input */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                        Nama Jabatan / Posisi (Menyesuaikan)
                      </label>
                      <div className="relative">
                        <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-indigo-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          value={jabatanInput}
                          onChange={(e) => setJabatanInput(e.target.value)}
                          className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="Contoh: Kepala Sekolah, Kepala Tata Usaha, Operator Sekolah, Guru"
                        />
                      </div>
                    </div>

                    {/* Upload grid columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Upload Logo Sekolah */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                          Logo Sekolah
                        </label>
                        <div 
                          onDragEnter={(e) => handleDrag(e, 'school_logo')}
                          onDragOver={(e) => handleDrag(e, 'school_logo')}
                          onDragLeave={(e) => handleDrag(e, 'school_logo')}
                          onDrop={(e) => handleDrop(e, 'school_logo')}
                          className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer h-32 ${
                            dragActiveSchoolLogo 
                              ? 'border-indigo-500 bg-indigo-500/10' 
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
                          }`}
                          onClick={() => document.getElementById('school-logo-input')?.click()}
                        >
                          <input 
                            id="school-logo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileInputChange(e, 'school_logo')}
                          />
                          {logoSekolahUrl ? (
                            <div className="flex flex-col items-center gap-1">
                              <img
                                src={logoSekolahUrl}
                                alt="Logo Sekolah"
                                className="w-12 h-12 object-contain rounded-lg border border-slate-850 bg-slate-950 p-1 shadow-md"
                                referrerPolicy="no-referrer"
                              />
                              <p className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> Terunggah
                              </p>
                            </div>
                          ) : (
                            <>
                              <UploadCloud className="w-6 h-6 text-indigo-400" />
                              <div>
                                <p className="text-[10px] font-extrabold text-white">Unggah Logo Sekolah</p>
                                <p className="text-[8px] text-slate-500 font-semibold">Seret/Taruh atau klik</p>
                              </div>
                            </>
                          )}
                        </div>
                        <input
                          type="text"
                          value={logoSekolahUrl.startsWith('data:') ? '--- File Logo Lokal Terupload ---' : logoSekolahUrl}
                          onChange={(e) => {
                            if (e.target.value !== '--- File Logo Lokal Terupload ---') {
                              setLogoSekolahUrl(e.target.value);
                            }
                          }}
                          disabled={logoSekolahUrl.startsWith('data:')}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-1 px-2 text-[9px] text-slate-300 placeholder-slate-600 focus:outline-none font-mono"
                          placeholder="Atau tempel URL logo..."
                        />
                      </div>

                      {/* Upload Foto Admin */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                          Foto Admin / Pengelola
                        </label>
                        <div 
                          onDragEnter={(e) => handleDrag(e, 'admin_photo')}
                          onDragOver={(e) => handleDrag(e, 'admin_photo')}
                          onDragLeave={(e) => handleDrag(e, 'admin_photo')}
                          onDrop={(e) => handleDrop(e, 'admin_photo')}
                          className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer h-32 ${
                            dragActiveAdminPhoto 
                              ? 'border-indigo-500 bg-indigo-500/10' 
                              : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
                          }`}
                          onClick={() => document.getElementById('admin-photo-input')?.click()}
                        >
                          <input 
                            id="admin-photo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileInputChange(e, 'admin_photo')}
                          />
                          {avatarUrl ? (
                            <div className="flex flex-col items-center gap-1">
                              <img
                                src={avatarUrl}
                                alt="Foto Admin"
                                className="w-12 h-12 object-cover rounded-full border border-slate-850 bg-slate-950 shadow-md"
                                referrerPolicy="no-referrer"
                              />
                              <p className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> Terunggah
                              </p>
                            </div>
                          ) : (
                            <>
                              <UploadCloud className="w-6 h-6 text-indigo-400" />
                              <div>
                                <p className="text-[10px] font-extrabold text-white">Unggah Foto Admin</p>
                                <p className="text-[8px] text-slate-500 font-semibold">Seret/Taruh atau klik</p>
                              </div>
                            </>
                          )}
                        </div>
                        <input
                          type="text"
                          value={avatarUrl.startsWith('data:') ? '--- File Foto Admin Terupload ---' : avatarUrl}
                          onChange={(e) => {
                            if (e.target.value !== '--- File Foto Admin Terupload ---') {
                              setAvatarUrl(e.target.value);
                            }
                          }}
                          disabled={avatarUrl.startsWith('data:')}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-1 px-2 text-[9px] text-slate-300 placeholder-slate-600 focus:outline-none font-mono"
                          placeholder="Atau tempel URL foto..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit 3D Button */}
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_5px_0_rgba(67,56,202,1),0_10px_20px_rgba(0,0,0,0.4)] hover:shadow-indigo-500/20 border border-indigo-400/20 active:shadow-none flex items-center justify-center gap-2 mt-4"
                  >
                    <UserPlus className="w-4.5 h-4.5 stroke-[2.5]" />
                    <span>Daftarkan Akun Sekolah</span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {/* COLUMN 2: ACCOUNT LIST DATABASE */}
          {activeDevTab === 'db' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between h-full min-h-[500px] w-full"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/20 text-purple-400 shadow-md">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white tracking-wide uppercase">
                        Database Akun
                      </h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Daftar Akses Terdaftar
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-slate-950 border-2 border-slate-800 px-3 py-1.5 rounded-xl text-amber-400">
                    {accounts.length} Akun
                  </span>
                </div>

                {/* Interactive List Scrollbox */}
                <div className="overflow-x-auto w-full border border-slate-800 rounded-2xl bg-slate-950/60 shadow-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/90 text-slate-400 font-bold text-[9px] uppercase tracking-widest select-none">
                        <th className="py-3 px-4 text-slate-300 font-black">NPSN & Sekolah</th>
                        <th className="py-3 px-4 text-slate-300 font-black">Pengelola & Jabatan</th>
                        <th className="py-3 px-4 text-slate-300 font-black">Kredensial Masuk</th>
                        <th className="py-3 px-4 text-slate-300 font-black">Alamat Lengkap</th>
                        <th className="py-3 px-4 text-center text-slate-300 font-black">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {accounts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-600 font-bold text-xs">
                            Tidak ada akun sekolah terdaftar.
                          </td>
                        </tr>
                      ) : (
                        accounts.map((acc, idx) => {
                          const isSystemAccount = acc.username === 'developer';
                          
                          // Fallbacks for empty/older accounts
                          const schoolNpsn = acc.npsn || (isSystemAccount ? 'SYSTEM' : 'N/A');
                          const schoolName = acc.namaSekolah || (isSystemAccount ? 'Admin Developer' : 'SD Presets / Manual');
                          
                          // Format address string
                          let addressString = '-';
                          if (acc.alamat || acc.desa || acc.kecamatan || acc.kabupaten || acc.provinsi) {
                            addressString = [
                              acc.alamat,
                              acc.desa ? `Desa ${acc.desa}` : '',
                              acc.kecamatan ? `Kec. ${acc.kecamatan}` : '',
                              acc.kabupaten,
                              acc.provinsi
                            ].filter(Boolean).join(', ');
                          } else if (isSystemAccount) {
                            addressString = 'Sistem Internal';
                          }

                          const schoolLogo = acc.logoSekolahUrl || (isSystemAccount ? 'https://illustrations.popsy.co/indigo/academic-cap.svg' : 'https://illustrations.popsy.co/indigo/academic-cap.svg');

                          return (
                            <tr
                              key={`${acc.username}-${acc.role}-${idx}`}
                              className="hover:bg-slate-900/40 transition-all text-xs"
                            >
                              {/* NPSN & SEKOLAH */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-900 p-0.5 flex items-center justify-center">
                                    {isSystemAccount ? (
                                      <Terminal className="w-5 h-5 text-rose-400" />
                                    ) : (
                                      <img
                                        src={schoolLogo}
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-extrabold text-white leading-tight truncate max-w-[150px]">
                                      {schoolName}
                                    </p>
                                    <span className="text-[9px] font-mono font-bold text-indigo-400 block mt-0.5">
                                      NPSN: {schoolNpsn}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* PENGELOLA & JABATAN */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 shrink-0 bg-slate-900/80 flex items-center justify-center">
                                    {acc.avatarUrl && !acc.avatarUrl.includes('developer-avatar') ? (
                                      <img
                                        src={acc.avatarUrl}
                                        alt={acc.namaLengkap}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : isSystemAccount ? (
                                      <Terminal className="w-4 h-4 text-rose-400" />
                                    ) : (
                                      <User className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-100 leading-tight text-[11px] truncate max-w-[120px]">
                                      {acc.namaLengkap}
                                    </p>
                                    <p className="text-[10px] text-indigo-300 font-extrabold truncate max-w-[120px] leading-tight mt-0.5">
                                      {acc.jabatan || acc.role}
                                    </p>
                                    <span
                                      className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 mt-1 rounded border inline-block ${
                                        roleBadgeConfig[acc.role as keyof typeof roleBadgeConfig] || 'text-slate-400 border-slate-800'
                                      }`}
                                    >
                                      {acc.role}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* KREDENSIAL MASUK */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 w-fit">
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="text-slate-500 font-bold">User:</span>
                                    <span className="font-mono font-bold text-slate-200">{acc.username}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="text-slate-500 font-bold">Sandi:</span>
                                    <span className="font-mono font-bold text-amber-400">{acc.password}</span>
                                  </div>
                                </div>
                              </td>

                              {/* ALAMAT */}
                              <td className="py-3.5 px-4 text-[10px] text-slate-300 leading-relaxed max-w-[180px] truncate" title={addressString}>
                                {addressString}
                              </td>

                              {/* AKSI */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => handleDirectResetAccount(acc)}
                                    className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-md inline-flex items-center justify-center"
                                    title={`Reset Sandi Akun "${acc.namaLengkap}" ke Default (123)`}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => handleOpenEditAccount(acc)}
                                    className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:text-slate-950 hover:bg-amber-400 transition-all cursor-pointer shadow-md inline-flex items-center justify-center"
                                    title="Edit Data Akun Sekolah"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </motion.button>

                                  {!isSystemAccount && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      type="button"
                                      onClick={() => handleDeleteAccount(acc.username, acc.role, acc.namaLengkap)}
                                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-all cursor-pointer shadow-md inline-flex items-center justify-center"
                                      title="Hapus Akun Sekolah"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </motion.button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Slogan Footer card bottom */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[8px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Penyimpanan Lokal Aman</span>
                </span>
                <span className="font-mono">SIM-SEC V2</span>
              </div>
            </motion.div>
          )}

          {/* COLUMN 3: PERMINTAAN RESET PASSWORD DARI SEKOLAH */}
          {activeDevTab === 'requests' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between transform transition-all hover:border-amber-500/30 w-full"
            >
              {/* Top Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                      <Bell className={`w-6 h-6 ${pendingRequestsCount > 0 ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-wide uppercase">
                        Permintaan Reset Sandi Sekolah
                      </h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Notifikasi Permintaan Reset Masuk Dari Halaman Login
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Total:</span>
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-slate-200 border border-slate-700">
                      {resetRequests.length} Permintaan
                    </span>
                    {pendingRequestsCount > 0 && (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg text-xs font-bold animate-pulse">
                        {pendingRequestsCount} Tertunda
                      </span>
                    )}
                  </div>
                </div>

                {resetRequests.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Belum Ada Permintaan Reset
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Semua akun sekolah berfungsi normal. Permintaan reset yang diajukan sekolah melalui tombol &quot;Lupa Kata Sandi&quot; akan otomatis muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {resetRequests.map((req) => {
                      const isPending = req.status === 'pending';
                      return (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isPending
                              ? 'bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/5'
                              : 'bg-slate-950/40 border-slate-800 opacity-75'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                    isPending
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  }`}
                                >
                                  {isPending ? '⏳ Menunggu Reset' : '✓ Selesai Di-reset'}
                                </span>
                                {req.npsn && (
                                  <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                    NPSN: {req.npsn}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {new Date(req.requestedAt).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <School className="w-4 h-4 text-amber-400 shrink-0" />
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                  {req.namaSekolah}
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-300">
                                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-indigo-400" />
                                  <div>
                                    <span className="text-[9px] text-slate-500 block">Username:</span>
                                    <span className="font-mono font-bold text-amber-300 text-[11px]">@{req.username}</span>
                                  </div>
                                </div>

                                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                                  <div>
                                    <span className="text-[9px] text-slate-500 block">Pemohon:</span>
                                    <span className="font-bold text-slate-200 text-[11px]">{req.namaPengaju || '-'}</span>
                                  </div>
                                </div>

                                {req.kontakHp && (
                                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                    <div>
                                      <span className="text-[9px] text-slate-500 block">Kontak WA:</span>
                                      <a
                                        href={`https://wa.me/${req.kontakHp.replace(/^0/, '62').replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono font-bold text-emerald-400 hover:underline text-[11px]"
                                      >
                                        {req.kontakHp}
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {req.catatan && (
                                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <p className="italic">&quot;{req.catatan}&quot;</p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
                              {isPending ? (
                                <button
                                  type="button"
                                  onClick={() => handleResetRequestFromSchool(req)}
                                  className="flex-1 lg:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                                >
                                  <KeyRound className="w-4 h-4" />
                                  <span>Reset Akun Sekarang</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleResetRequestFromSchool(req)}
                                  className="flex-1 lg:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Reset Ulang</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteResetRequest(req.id)}
                                className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                                title="Hapus dari daftar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Slogan Footer card bottom */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[8px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Sistem Otomasi Reset Sandi</span>
                </span>
                <span className="font-mono">SIM-SEC V2</span>
              </div>
            </motion.div>
          )}

          {/* COLUMN 4: PROFILE SETTINGS FOR ADMIN DEVELOPER */}
          {activeDevTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border-2 border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between transform transition-all hover:border-amber-500/30 w-full"
            >
              {/* Animated Glow Border top */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-400" />
              
              <form onSubmit={handleSaveDevProfile} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/20 text-amber-400 shadow-md">
                    <Settings className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white tracking-wide uppercase">
                      Profil Admin Developer
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Ubah Nama, Foto, & Sandi Akun Developer
                    </p>
                  </div>
                </div>

                {/* Profile Avatar Upload with Drag & Drop */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-2">
                    Foto Profil / Avatar
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-950/40 p-5 rounded-2xl border-2 border-slate-800">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-lg relative flex items-center justify-center">
                        {devAvatar && !devAvatar.includes('developer-avatar') ? (
                          <img
                            src={devAvatar}
                            alt="Developer Avatar"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Terminal className="w-8 h-8 text-rose-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateRandomDevAvatar}
                        className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-500 border border-amber-400 text-slate-950 hover:bg-amber-400 shadow-lg transition-all"
                        title="Acak Foto Profil"
                      >
                        <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      <div
                        onDragEnter={(e) => handleDrag(e, 'dev_avatar')}
                        onDragOver={(e) => handleDrag(e, 'dev_avatar')}
                        onDragLeave={(e) => handleDrag(e, 'dev_avatar')}
                        onDrop={(e) => handleDrop(e, 'dev_avatar')}
                        onClick={() => document.getElementById('dev-avatar-file')?.click()}
                        className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                          dragActiveDevAvatar
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <input
                          id="dev-avatar-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileInputChange(e, 'dev_avatar')}
                        />
                        <UploadCloud className="w-6 h-6 text-amber-400 mx-auto mb-1 animate-pulse" />
                        <span className="block text-[10px] font-extrabold text-white">Seret atau Klik untuk Unggah Foto</span>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={(devAvatar || '').startsWith('data:') ? '--- File Foto Terupload ---' : (devAvatar || '')}
                          onChange={(e) => {
                            if (e.target.value !== '--- File Foto Terupload ---') {
                              setDevAvatar(e.target.value);
                            }
                          }}
                          disabled={(devAvatar || '').startsWith('data:')}
                          className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3.5 text-[10px] text-white placeholder-slate-600 focus:outline-none font-mono disabled:opacity-60"
                          placeholder="Atau tempel tautan URL gambar..."
                        />
                        {(devAvatar || '').startsWith('data:') && (
                          <button
                            type="button"
                            onClick={() => setDevAvatar('https://picsum.photos/seed/developer-avatar/150/150')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-wider"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Full Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                    Nama Lengkap Developer
                  </label>
                  <div className="relative">
                    <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={devName}
                      onChange={(e) => setDevName(e.target.value)}
                      className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-12 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-semibold"
                      placeholder="Masukkan nama lengkap developer..."
                    />
                  </div>
                </div>

                {/* Edit Password */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1.5">
                    Kata Sandi Baru (Password)
                  </label>
                  <div className="relative">
                    <div className="w-9 h-9 absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showDevPassword ? 'text' : 'password'}
                      required
                      value={devPassword}
                      onChange={(e) => setDevPassword(e.target.value)}
                      className="w-full bg-slate-950/50 border-2 border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-12 pr-12 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-mono"
                      placeholder="Masukkan sandi baru..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowDevPassword(!showDevPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showDevPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Developer Full-Screen Wallpaper / Background Upload */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-slate-400 tracking-widest uppercase">
                      Latar Belakang Layar Penuh (Developer Wallpaper)
                    </label>
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      Tersimpan Otomatis & Permanen
                    </span>
                  </div>

                  <div className="space-y-3 bg-slate-950/40 p-5 rounded-2xl border-2 border-slate-800">
                    {/* Live Preview & Drag Drop Container */}
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      {/* 16:9 Mini Screen Preview */}
                      <div className="w-full md:w-48 h-28 rounded-xl overflow-hidden border-2 border-amber-500/30 bg-slate-950 relative shadow-xl shrink-0 group">
                        <img
                          src={devBgUrl || DEFAULT_DEVELOPER_BG}
                          alt="Latar Belakang Developer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[9px] font-black text-white flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> Pratinjau Layar
                          </span>
                        </div>
                      </div>

                      {/* Drag & Drop Upload Zone */}
                      <div
                        onDragEnter={(e) => handleDrag(e, 'dev_bg')}
                        onDragOver={(e) => handleDrag(e, 'dev_bg')}
                        onDragLeave={(e) => handleDrag(e, 'dev_bg')}
                        onDrop={(e) => handleDrop(e, 'dev_bg')}
                        onClick={() => document.getElementById('dev-bg-file')?.click()}
                        className={`flex-1 w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[112px] ${
                          dragActiveDevBg
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <input
                          id="dev-bg-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileInputChange(e, 'dev_bg')}
                        />
                        <UploadCloud className="w-6 h-6 text-amber-400 mb-1 animate-pulse" />
                        <span className="block text-[11px] font-black text-white">
                          Unggah Gambar Wallpaper Layar Penuh
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          Seret & lepas file gambar atau klik untuk memilih
                        </span>
                      </div>
                    </div>

                    {/* Presets Quick Picker */}
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Pilihan Tema Cepat (Presets):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          {
                            name: 'Tema Sekolah (Default)',
                            url: '/login-operator-bg.jpg',
                            thumb: '/login-operator-bg.jpg',
                          },
                          {
                            name: 'Dark Grid Code',
                            url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1600',
                            thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=200',
                          },
                          {
                            name: 'Cyber Matrix',
                            url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600',
                            thumb: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200',
                          },
                          {
                            name: 'Deep Space Nebula',
                            url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=1600',
                            thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=200',
                          },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setDevBgUrl(preset.url);
                              saveDeveloperBg(preset.url);
                              showToast(`Tema "${preset.name}" diterapkan!`, 'success', 'Wallpaper Diterapkan');
                            }}
                            className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              devBgUrl === preset.url
                                ? 'border-amber-500 bg-amber-500/20 text-white'
                                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <img
                              src={preset.thumb}
                              alt={preset.name}
                              className="w-7 h-7 rounded-lg object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-[9px] font-bold truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* URL Input & Reset */}
                    <div className="relative flex items-center gap-2">
                      <input
                        type="text"
                        value={(devBgUrl || '').startsWith('data:') ? '--- File Gambar Lokal Terupload ---' : (devBgUrl || '')}
                        onChange={(e) => {
                          if (e.target.value !== '--- File Gambar Lokal Terupload ---') {
                            setDevBgUrl(e.target.value);
                            saveDeveloperBg(e.target.value);
                          }
                        }}
                        disabled={(devBgUrl || '').startsWith('data:')}
                        className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3.5 text-[10px] text-white placeholder-slate-600 focus:outline-none font-mono disabled:opacity-60"
                        placeholder="Atau tempel URL gambar latar belakang..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDevBgUrl(DEFAULT_DEVELOPER_BG);
                          saveDeveloperBg(DEFAULT_DEVELOPER_BG);
                          showToast('Latar belakang direset ke default', 'info', 'Reset Wallpaper');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                      >
                        Reset Default
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit / Save Profile settings */}
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 1 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_5px_0_rgba(245,158,11,1),0_10px_20px_rgba(0,0,0,0.4)] hover:shadow-amber-500/20 active:shadow-none flex items-center justify-center gap-2 mt-4"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>Simpan Perubahan Profil</span>
                </motion.button>
              </form>
            </motion.div>
          )}

        </div>

      </div>

      {/* Custom 3D Warning Delete Confirmation Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-[#0d121f] border-2 border-red-500/30 rounded-3xl p-6 shadow-[0_20px_50px_rgba(239,68,68,0.15)] relative overflow-hidden"
          >
            {/* Top warning line accent */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-red-500 via-rose-600 to-red-400 animate-pulse" />
            
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 text-red-400 shadow-md animate-bounce">
                <AlertCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wider uppercase">
                  🚨 KONFIRMASI HAPUS AKUN
                </h3>
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">
                  Tindakan Permanen & Berbahaya
                </p>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mb-6 text-xs text-slate-300 leading-relaxed">
              <p className="mb-2">
                Apakah Anda yakin ingin menghapus akun berikut dari basis data sekolah?
              </p>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-200 font-mono text-[11px] mb-2">
                <div>Nama: <span className="text-white font-bold">{accountToDelete.namaLengkap}</span></div>
                <div>Username: <span className="text-indigo-300">@{accountToDelete.username}</span></div>
                <div>Jabatan: <span className="text-amber-400">{accountToDelete.role}</span></div>
              </div>
              <p className="text-red-400 font-bold text-[10px] uppercase tracking-wider">
                ⚠️ PERINGATAN: Semua data pendaftaran atau riwayat untuk akun ini akan dihapus secara otomatis dan tingkat keamanan akan diatur ulang!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-bold py-3 px-4 rounded-xl border-2 border-slate-800 text-xs uppercase tracking-wider cursor-pointer transition-all text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.2)] hover:shadow-red-500/30 transition-all text-center border border-red-400/20"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3D Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-[#0d121f] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden my-auto"
          >
            {/* Top golden accent line */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-400" />

            <button
              type="button"
              onClick={() => setEditingAccount(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-6 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/30 text-amber-400 shadow-md">
                <Pencil className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-wide uppercase">
                  Edit Data Akun Pengguna
                </h3>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Database Akun Sekolah & Hak Akses Sistem
                </p>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditedAccount} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Nama Lengkap *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={editingAccount.namaLengkap}
                      onChange={(e) => setEditingAccount({ ...editingAccount, namaLengkap: e.target.value })}
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Nama lengkap pengelola..."
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Username Masuk *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={editingAccount.username}
                      onChange={(e) => setEditingAccount({ ...editingAccount, username: e.target.value })}
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Username..."
                    />
                  </div>
                </div>

                {/* Kata Sandi */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      value={editingAccount.password}
                      onChange={(e) => setEditingAccount({ ...editingAccount, password: e.target.value })}
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Kata sandi..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role / Hak Akses */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Hak Akses / Role *
                  </label>
                  <select
                    value={editingAccount.role}
                    onChange={(e) => {
                      const newRole = e.target.value as any;
                      const defaultJabatanMap: Record<string, string> = {
                        'Admin TU': 'Kepala Tata Usaha',
                        'Tenaga Administrasi': 'Tenaga Administrasi',
                      };
                      setEditingAccount({
                        ...editingAccount,
                        role: newRole,
                        jabatan: defaultJabatanMap[newRole] || (newRole === 'Admin TU' ? 'Kepala Tata Usaha' : 'Tenaga Administrasi'),
                      });
                    }}
                    className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                  >
                    <option value="Admin TU">Admin TU</option>
                    <option value="Tenaga Administrasi">Tenaga Administrasi</option>
                  </select>
                </div>

                {/* Jabatan Pengelola */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Jabatan Pengelola
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={editingAccount.jabatan || ''}
                      onChange={(e) => setEditingAccount({ ...editingAccount, jabatan: e.target.value })}
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Contoh: Kepala Tata Usaha..."
                    />
                  </div>
                </div>

                {/* NPSN */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    NPSN Sekolah
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={editingAccount.npsn || ''}
                      onChange={(e) => setEditingAccount({ ...editingAccount, npsn: e.target.value })}
                      className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      placeholder="8 digit NPSN..."
                    />
                  </div>
                </div>
              </div>

              {/* Nama Sekolah */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Satuan Pendidikan / Sekolah
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={editingAccount.namaSekolah || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, namaSekolah: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="Contoh: SD NEGERI MARGAASIH..."
                  />
                </div>
              </div>

              {/* Alamat Sekolah */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Alamat Lengkap Sekolah
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={editingAccount.alamat || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, alamat: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="Jalan, Desa, Kecamatan, Kab/Kota..."
                  />
                </div>
              </div>

              {/* Upload Logo Sekolah & Foto Admin di Edit Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Upload Logo Sekolah */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Logo Sekolah
                  </label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'edit_school_logo')}
                    onDragOver={(e) => handleDrag(e, 'edit_school_logo')}
                    onDragLeave={(e) => handleDrag(e, 'edit_school_logo')}
                    onDrop={(e) => handleDrop(e, 'edit_school_logo')}
                    onClick={() => document.getElementById('edit-school-logo-input')?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-3 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer h-28 ${
                      dragActiveEditSchoolLogo
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <input
                      id="edit-school-logo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, 'edit_school_logo')}
                    />
                    {editingAccount.logoSekolahUrl ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={editingAccount.logoSekolahUrl}
                          alt="Logo Sekolah"
                          className="w-10 h-10 object-contain rounded-lg border border-slate-700 bg-slate-900 p-0.5 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Terunggah
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-[10px] font-extrabold text-white">Unggah Logo Sekolah</p>
                          <p className="text-[8px] text-slate-500 font-semibold">Seret/Taruh atau klik</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editingAccount.logoSekolahUrl?.startsWith('data:') ? '--- File Logo Lokal Terupload ---' : (editingAccount.logoSekolahUrl || '')}
                    onChange={(e) => {
                      if (e.target.value !== '--- File Logo Lokal Terupload ---') {
                        setEditingAccount({ ...editingAccount, logoSekolahUrl: e.target.value });
                      }
                    }}
                    disabled={editingAccount.logoSekolahUrl?.startsWith('data:')}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-1 px-2 text-[9px] text-slate-300 placeholder-slate-600 focus:outline-none font-mono disabled:opacity-60"
                    placeholder="Atau tempel URL logo..."
                  />
                </div>

                {/* Upload Foto Admin / Pengelola */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Foto Admin / Pengelola
                  </label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'edit_admin_photo')}
                    onDragOver={(e) => handleDrag(e, 'edit_admin_photo')}
                    onDragLeave={(e) => handleDrag(e, 'edit_admin_photo')}
                    onDrop={(e) => handleDrop(e, 'edit_admin_photo')}
                    onClick={() => document.getElementById('edit-admin-photo-input')?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-3 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer h-28 ${
                      dragActiveEditAdminPhoto
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <input
                      id="edit-admin-photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, 'edit_admin_photo')}
                    />
                    {editingAccount.avatarUrl && !editingAccount.avatarUrl.includes('developer-avatar') ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={editingAccount.avatarUrl}
                          alt="Foto Admin"
                          className="w-10 h-10 object-cover rounded-full border border-slate-700 bg-slate-900 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-[9px] font-black text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" /> Terunggah
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-[10px] font-extrabold text-white">Unggah Foto Admin</p>
                          <p className="text-[8px] text-slate-500 font-semibold">Seret/Taruh atau klik</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editingAccount.avatarUrl?.startsWith('data:') ? '--- File Foto Admin Terupload ---' : (editingAccount.avatarUrl || '')}
                    onChange={(e) => {
                      if (e.target.value !== '--- File Foto Admin Terupload ---') {
                        setEditingAccount({ ...editingAccount, avatarUrl: e.target.value });
                      }
                    }}
                    disabled={editingAccount.avatarUrl?.startsWith('data:')}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-1 px-2 text-[9px] text-slate-300 placeholder-slate-600 focus:outline-none font-mono disabled:opacity-60"
                    placeholder="Atau tempel URL foto..."
                  />
                </div>
              </div>

              {/* Tombol Reset Sandi & Username Akun Pengguna */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-300 block uppercase tracking-wider">
                      Reset Sandi & Username Akun
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Otomatis reset kata sandi menjadi default &quot;123&quot;
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const defaultPass = editingAccount.username === 'developer' ? '23011995' : '123';
                    setEditingAccount({
                      ...editingAccount,
                      password: defaultPass,
                    });
                    showToast(
                      `Kata sandi akun "${editingAccount.username}" di-reset ke default "${defaultPass}"! Klik "Simpan Perubahan Akun" untuk menerapkan.`,
                      'warning',
                      'Sandi Ter-reset'
                    );
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Reset Sandi Ke 123</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold py-3 px-4 rounded-xl border border-slate-700 text-xs uppercase tracking-wider cursor-pointer transition-all text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-600/30 transition-all text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Simpan Perubahan Akun</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Popup Modal for Bell Icon (Permintaan Reset Sandi Sekolah) */}
      {showResetRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(245,158,11,0.25)] relative overflow-hidden font-sans max-h-[85vh] flex flex-col"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

            <button
              onClick={() => setShowResetRequestsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 border-b border-slate-800 pb-4 mb-5 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
                <Bell className={`w-6 h-6 ${pendingRequestsCount > 0 ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-400/30 inline-block mb-1">
                  Pemberitahuan Developer
                </span>
                <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                  Permintaan Reset Kata Sandi & Username Sekolah
                </h3>
              </div>
            </div>

            {/* Content list scrollable */}
            <div className="overflow-y-auto space-y-3.5 pr-1 flex-1">
              {resetRequests.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    Tidak Ada Permintaan Reset
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Belum ada sekolah yang mengajukan reset password.
                  </p>
                </div>
              ) : (
                resetRequests.map((req) => {
                  const isPending = req.status === 'pending';
                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPending
                          ? 'bg-amber-500/5 border-amber-500/30 shadow-md shadow-amber-500/5'
                          : 'bg-slate-950/40 border-slate-800 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                                isPending
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {isPending ? '⏳ Menunggu Reset' : '✓ Selesai'}
                            </span>
                            {req.npsn && (
                              <span className="text-[8px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                NPSN: {req.npsn}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(req.requestedAt).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-white uppercase truncate">
                            {req.namaSekolah}
                          </h4>

                          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-amber-300 font-bold text-[11px]">
                              @{req.username}
                            </span>
                            {req.namaPengaju && (
                              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300 text-[11px]">
                                {req.namaPengaju}
                              </span>
                            )}
                            {req.kontakHp && (
                              <a
                                href={`https://wa.me/${req.kontakHp.replace(/^0/, '62').replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40 text-[11px] font-bold hover:underline"
                              >
                                {req.kontakHp}
                              </a>
                            )}
                          </div>

                          {req.catatan && (
                            <p className="text-[10px] text-slate-400 italic bg-slate-950/40 p-2 rounded-xl border border-slate-800/50">
                              &quot;{req.catatan}&quot;
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => handleResetRequestFromSchool(req)}
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Reset Sekarang</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleResetRequestFromSchool(req)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer border border-slate-700 flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset Ulang</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteResetRequest(req.id)}
                            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer modal */}
            <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0 mt-3">
              <button
                type="button"
                onClick={() => setShowResetRequestsModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Tutup Notifikasi
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
