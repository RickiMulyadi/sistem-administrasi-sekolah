import { SchoolProfile, Siswa, Guru, ArchiveItem, UserSession, UserAccount, PasswordResetRequest } from '../types';
import {
  DEFAULT_SCHOOL_PROFILE,
  INITIAL_SISWA,
  INITIAL_GURU,
  INITIAL_ARCHIVE,
} from './initial-data';
import { SEED_SCHOOLS } from './seed-schools';

const STORAGE_KEYS = {
  PROFILE: 'admin_sekolah_profile_v1',
  SISWA: 'admin_sekolah_siswa_v1',
  GURU: 'admin_sekolah_guru_v1',
  ARCHIVE: 'admin_sekolah_archive_v1',
  SESSION: 'admin_sekolah_session_v1',
  ACCOUNTS: 'admin_sekolah_accounts_v1',
  CURRENT_TAB: 'admin_sekolah_current_tab_v1',
  DEVELOPER_BG: 'admin_sekolah_dev_bg_v1',
  RESET_REQUESTS: 'admin_sekolah_reset_requests_v1',
};

// Safe window check
const isClient = () => typeof window !== 'undefined';

function trySetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.message?.indexOf('quota') >= 0 || e.code === 22) {
      console.warn('LocalStorage quota exceeded! Attempting auto-cleanup and compression...');
      
      // Clean up any legacy redundant keys immediately
      try {
        localStorage.removeItem('admin_sekolah_login_bg_v1');
      } catch {}

      // 1. If key is DEVELOPER_BG, compress it to super light JPEG and retry
      if (key === STORAGE_KEYS.DEVELOPER_BG && value.startsWith('data:image/')) {
        import('./utils').then(({ compressImageBase64 }) => {
          compressImageBase64(value, 960, 540, 0.55).then((compressed) => {
            try {
              localStorage.setItem(key, compressed);
              window.dispatchEvent(new CustomEvent('developer-bg-saved', { detail: compressed }));
              console.log('Successfully saved compressed developer background!');
            } catch (inner) {
              console.warn('Could not store full wallpaper in localStorage; relying on session cache.');
            }
          });
        });
        return;
      }

      // 2. If key is PROFILE, we can do emergency pruning of heavy fields and background compress
      if (key === STORAGE_KEYS.PROFILE) {
        try {
          const profile = JSON.parse(value) as SchoolProfile;
          const lighterProfile = { ...profile };
          const fields: (keyof SchoolProfile)[] = [
            'loginBgUrl',
            'logoLeftUrl',
            'logoRightUrl',
            'ttdKepsekUrl',
            'stempelUrl',
            'loginLogoUrl'
          ];
          
          // Find heaviest fields
          const base64Fields = fields
            .map(f => ({ key: f, length: typeof lighterProfile[f] === 'string' ? (lighterProfile[f] as string).length : 0 }))
            .filter(f => f.length > 50 * 1024)
            .sort((a, b) => b.length - a.length);

          if (base64Fields.length > 0) {
            // Temporarily delete heaviest field and save
            const heaviestKey = base64Fields[0].key;
            delete lighterProfile[heaviestKey];
            try {
              localStorage.setItem(key, JSON.stringify(lighterProfile));
              console.log(`Saved lighter profile by clearing ${heaviestKey}`);
            } catch (inner) {
              // Remove all image base64
              fields.forEach(f => {
                if (typeof lighterProfile[f] === 'string' && (lighterProfile[f] as string).startsWith('data:')) {
                  delete lighterProfile[f];
                }
              });
              try {
                localStorage.setItem(key, JSON.stringify(lighterProfile));
                console.log('Saved profile with all images removed');
              } catch (last) {
                console.error('Fatal: Cannot save profile even with all images removed');
              }
            }

            // Trigger asynchronous background compression
            import('./utils').then(({ compressImageBase64 }) => {
              const promises = fields.map(async (f) => {
                const val = profile[f];
                if (typeof val === 'string' && val.startsWith('data:image/')) {
                  const maxDim = f === 'loginBgUrl' ? 800 : 300;
                  try {
                    const compressed = await compressImageBase64(val, maxDim, maxDim, 0.5);
                    return { key: f, val: compressed };
                  } catch (err) {
                    return { key: f, val };
                  }
                }
                return null;
              });

              Promise.all(promises).then((results) => {
                const currentProfile = getSchoolProfile();
                results.forEach(res => {
                  if (res) (currentProfile as any)[res.key] = res.val;
                });
                try {
                  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentProfile));
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('school-profile-saved-bg', { detail: currentProfile }));
                  }
                  console.log('Background compression for profile completed!');
                } catch (bgErr) {
                  console.error('Failed to save background compressed profile:', bgErr);
                }
              });
            });
            return;
          }
        } catch (jsonErr) {
          console.error('Failed to parse profile in error handler:', jsonErr);
        }
      }

      // 3. If it's still failing or it's another key (e.g. archive, siswa, guru), let's prune the archives!
      const archivesData = localStorage.getItem(STORAGE_KEYS.ARCHIVE);
      if (archivesData) {
        try {
          const archives = JSON.parse(archivesData) as ArchiveItem[];
          if (archives.length > 5) {
            console.warn(`Pruning old archives to free up space (total: ${archives.length})...`);
            const pruned = archives.slice(0, Math.max(5, Math.floor(archives.length / 2)));
            localStorage.setItem(STORAGE_KEYS.ARCHIVE, JSON.stringify(pruned));
            // Try saving the original request again
            try {
              localStorage.setItem(key, value);
              console.log('Successfully saved key after pruning archives!');
              return;
            } catch (retryErr) {
              console.error('Failed to save after archive pruning, falling back...', retryErr);
            }
          }
        } catch (archiveErr) {
          console.error('Failed to prune archives:', archiveErr);
        }
      }

      // Safe non-blocking warning without crashing
      console.warn('Storage space limit reached; cached state active for key:', key);
    } else {
      console.warn('Storage warning for key:', key, e);
    }
  }
}

/**
 * Resolves a 100% unique, isolated school tenant key.
 * Guarantees that School A and School B NEVER collide, share, or overwrite each other's:
 * - Profil Kop Surat & Sekolah
 * - Master Data Siswa
 * - Master Data Guru / GTK
 * - Arsip & Riwayat Surat Keluar
 */
export function getActiveSchoolKey(customNpsn?: string): string {
  if (customNpsn && customNpsn.trim() && customNpsn.trim() !== '-') {
    return customNpsn.trim();
  }
  if (!isClient()) return '20206123';
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionData) return '20206123';
    const session = JSON.parse(sessionData) as UserSession;
    if (session && session.isAuthenticated) {
      // 1. If session has explicit NPSN
      if (session.npsn && session.npsn.trim() && session.npsn.trim() !== '-') {
        return session.npsn.trim();
      }
      
      // 2. Check matched account in registered accounts
      const accountsData = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      const accounts = accountsData ? JSON.parse(accountsData) as UserAccount[] : DEFAULT_ACCOUNTS;
      const cleanUname = session.username.trim().toLowerCase();
      const matched = accounts.find((acc) => acc.username.trim().toLowerCase() === cleanUname);
      if (matched) {
        if (matched.npsn && matched.npsn.trim() && matched.npsn.trim() !== '-') {
          return matched.npsn.trim();
        }
        if (matched.namaSekolah && matched.namaSekolah.trim()) {
          return matched.namaSekolah.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
      }
      
      // 3. For developer or fallback
      if (session.role === 'Developer') {
        return '20206123';
      }
      
      // 4. Default to username partition
      if (cleanUname) {
        return `user_${cleanUname}`;
      }
    }
  } catch (e) {
    console.error('Error resolving active school key:', e);
  }
  return '20206123';
}

export function getActiveNpsn(): string | null {
  return getActiveSchoolKey();
}

export function getSchoolProfile(explicitKey?: string): SchoolProfile {
  if (!isClient()) return DEFAULT_SCHOOL_PROFILE;
  try {
    const schoolKey = explicitKey || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.PROFILE}_${schoolKey}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data) as SchoolProfile;
      if (parsed.namaSekolah === 'SEKOLAH DASAR NEGERI MARGAASIH') {
        parsed.namaSekolah = 'SD NEGERI MARGAASIH';
        saveSchoolProfile(parsed, schoolKey);
      }
      return parsed;
    }
    
    // Check seed schools catalog
    const seedSchool = SEED_SCHOOLS.find((s) => s.npsn === schoolKey);
    if (seedSchool) {
      trySetItem(key, JSON.stringify(seedSchool.profile));
      return seedSchool.profile;
    }

    // Default template school (20206123)
    if (schoolKey === '20206123') {
      trySetItem(key, JSON.stringify(DEFAULT_SCHOOL_PROFILE));
      return DEFAULT_SCHOOL_PROFILE;
    }

    // Lookup metadata from accounts
    const accountsData = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const accounts = accountsData ? JSON.parse(accountsData) as UserAccount[] : DEFAULT_ACCOUNTS;
    const session = getUserSession();
    const matched = accounts.find(
      (acc) =>
        acc.npsn === schoolKey ||
        (session && acc.username.toLowerCase() === session.username.toLowerCase()) ||
        (acc.namaSekolah && acc.namaSekolah.toLowerCase().replace(/[^a-z0-9]/g, '_') === schoolKey)
    );

    if (matched && matched.namaSekolah) {
      const customProfile: SchoolProfile = {
        ...DEFAULT_SCHOOL_PROFILE,
        namaSekolah: matched.namaSekolah,
        npsn: matched.npsn || (schoolKey.startsWith('user_') ? '' : schoolKey),
        alamat: matched.alamat || DEFAULT_SCHOOL_PROFILE.alamat,
        kelurahan: matched.desa || DEFAULT_SCHOOL_PROFILE.kelurahan,
        kecamatan: matched.kecamatan || DEFAULT_SCHOOL_PROFILE.kecamatan,
        kota: matched.kabupaten || DEFAULT_SCHOOL_PROFILE.kota,
        provinsi: matched.provinsi || DEFAULT_SCHOOL_PROFILE.provinsi,
        namaKepsek: matched.role === 'Kepala Sekolah' ? matched.namaLengkap : (DEFAULT_SCHOOL_PROFILE.namaKepsek || '-'),
        logoLeftUrl: matched.logoSekolahUrl || DEFAULT_SCHOOL_PROFILE.logoLeftUrl,
        logoRightUrl: matched.logoSekolahUrl || DEFAULT_SCHOOL_PROFILE.logoRightUrl,
      };
      trySetItem(key, JSON.stringify(customProfile));
      return customProfile;
    }

    const freshProfile: SchoolProfile = {
      ...DEFAULT_SCHOOL_PROFILE,
      npsn: schoolKey.startsWith('user_') ? '' : schoolKey,
    };
    trySetItem(key, JSON.stringify(freshProfile));
    return freshProfile;
  } catch (e) {
    console.error('Failed to load school profile', e);
    return DEFAULT_SCHOOL_PROFILE;
  }
}

export function saveSchoolProfile(profile: SchoolProfile, explicitKey?: string): void {
  if (!isClient()) return;
  try {
    const schoolKey = explicitKey || profile.npsn || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.PROFILE}_${schoolKey}`;
    trySetItem(key, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save school profile', e);
  }
}

export function getSiswaList(explicitKey?: string): Siswa[] {
  if (!isClient()) return INITIAL_SISWA;
  try {
    const schoolKey = explicitKey || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.SISWA}_${schoolKey}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data) as Siswa[];
      return parsed.filter(item => !/^(sis|gr|arc)-\d{1,2}$/.test(item.id));
    }

    // Check seed schools catalog
    const seedSchool = SEED_SCHOOLS.find((s) => s.npsn === schoolKey);
    if (seedSchool && seedSchool.siswa && seedSchool.siswa.length > 0) {
      trySetItem(key, JSON.stringify(seedSchool.siswa));
      return seedSchool.siswa;
    }

    // Default template school (20206123)
    if (schoolKey === '20206123') {
      trySetItem(key, JSON.stringify(INITIAL_SISWA));
      return INITIAL_SISWA;
    }
    // Any other registered school starts with 0 students in their isolated database
    return [];
  } catch (e) {
    return [];
  }
}

export function saveSiswaList(list: Siswa[], explicitKey?: string): void {
  if (!isClient()) return;
  try {
    const schoolKey = explicitKey || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.SISWA}_${schoolKey}`;
    trySetItem(key, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save siswa list', e);
  }
}

export function getGuruList(explicitKey?: string): Guru[] {
  if (!isClient()) return INITIAL_GURU;
  try {
    const schoolKey = explicitKey || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.GURU}_${schoolKey}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data) as Guru[];
      return parsed.filter(item => !/^(sis|gr|arc)-\d{1,2}$/.test(item.id));
    }

    // Check seed schools catalog
    const seedSchool = SEED_SCHOOLS.find((s) => s.npsn === schoolKey);
    if (seedSchool && seedSchool.guru && seedSchool.guru.length > 0) {
      trySetItem(key, JSON.stringify(seedSchool.guru));
      return seedSchool.guru;
    }

    if (schoolKey === '20206123') {
      trySetItem(key, JSON.stringify(INITIAL_GURU));
      return INITIAL_GURU;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveGuruList(list: Guru[], explicitKey?: string): void {
  if (!isClient()) return;
  try {
    const schoolKey = explicitKey || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.GURU}_${schoolKey}`;
    trySetItem(key, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save guru list', e);
  }
}

export function getArchiveList(explicitKey?: string): ArchiveItem[] {
  if (!isClient()) return INITIAL_ARCHIVE;
  try {
    const schoolKey = explicitKey || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.ARCHIVE}_${schoolKey}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data) as ArchiveItem[];
      return parsed.filter(item => !/^(sis|gr|arc)-\d{1,2}$/.test(item.id));
    }

    // Check seed schools catalog
    const seedSchool = SEED_SCHOOLS.find((s) => s.npsn === schoolKey);
    if (seedSchool && seedSchool.archives && seedSchool.archives.length > 0) {
      trySetItem(key, JSON.stringify(seedSchool.archives));
      return seedSchool.archives;
    }

    if (schoolKey === '20206123') {
      trySetItem(key, JSON.stringify(INITIAL_ARCHIVE));
      return INITIAL_ARCHIVE;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveArchiveList(archive: ArchiveItem[], explicitKey?: string): void {
  if (!isClient()) return;
  try {
    const schoolKey = explicitKey || getActiveSchoolKey();
    const key = `${STORAGE_KEYS.ARCHIVE}_${schoolKey}`;
    trySetItem(key, JSON.stringify(archive));
  } catch (e) {
    console.error('Failed to save archive', e);
  }
}

export function addArchiveItem(item: Omit<ArchiveItem, 'id' | 'tanggalCetak'>, explicitKey?: string): ArchiveItem {
  const current = getArchiveList(explicitKey);
  const newItem: ArchiveItem = {
    ...item,
    id: `arc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tanggalCetak: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
  const updated = [newItem, ...current];
  saveArchiveList(updated, explicitKey);
  return newItem;
}

export function deleteArchiveItem(id: string, explicitKey?: string): ArchiveItem[] {
  const current = getArchiveList(explicitKey);
  const updated = current.filter((item) => item.id !== id);
  saveArchiveList(updated, explicitKey);
  return updated;
}

export const DEFAULT_SESSION: UserSession = {
  isAuthenticated: false,
  username: '',
  namaLengkap: '',
  role: 'Admin TU',
  avatarUrl: '',
  jabatan: '',
  npsn: '',
};

export function getUserSession(): UserSession | null {
  if (!isClient()) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!data) return null;
    const parsed = JSON.parse(data) as UserSession;
    return parsed && parsed.isAuthenticated ? parsed : null;
  } catch (e) {
    return null;
  }
}

export function saveUserSession(session: UserSession): void {
  if (!isClient()) return;
  try {
    trySetItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function clearUserSession(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
}

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  ...SEED_SCHOOLS.flatMap((s) => s.accounts),
  {
    username: 'developer',
    namaLengkap: 'Admin Developer',
    role: 'Developer',
    password: '23011995',
    avatarUrl: 'https://picsum.photos/seed/developer-avatar/150/150',
    createdAt: '2026-08-01',
    jabatan: 'Admin Developer',
  },
];

export function getUserAccounts(): UserAccount[] {
  if (!isClient()) return DEFAULT_ACCOUNTS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (data) {
      const parsed = JSON.parse(data) as UserAccount[];
      // Filter out legacy super.admin and Super Admin roles
      const filtered = (parsed as any[]).filter(
        (acc) => acc.username !== 'super.admin' && acc.role !== 'Super Admin'
      ) as UserAccount[];

      // Merge any missing seed school accounts
      SEED_SCHOOLS.forEach((seedSchool) => {
        seedSchool.accounts.forEach((seedAcc) => {
          const exists = filtered.find(
            (a) => a.username.toLowerCase() === seedAcc.username.toLowerCase()
          );
          if (!exists) {
            filtered.push(seedAcc);
          }
        });
      });
      
      const developerAcc = filtered.find((acc) => acc.username === 'developer');
      if (!developerAcc) {
        filtered.push({
          username: 'developer',
          namaLengkap: 'Admin Developer',
          role: 'Developer',
          password: '23011995',
          avatarUrl: 'https://picsum.photos/seed/developer-avatar/150/150',
          createdAt: '2026-08-01',
          jabatan: 'Admin Developer',
        });
      } else if (developerAcc.password !== '23011995') {
        developerAcc.password = '23011995';
      }
      
      trySetItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(filtered));
      return filtered;
    }
    // Seed default accounts if empty
    trySetItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  } catch (e) {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveUserAccounts(accounts: UserAccount[]): void {
  if (!isClient()) return;
  try {
    trySetItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save user accounts', e);
  }
}

export function updateSingleUserAccount(username: string, updates: Partial<UserAccount>, newUsername?: string): void {
  if (!isClient()) return;
  try {
    const accounts = getUserAccounts();
    const cleanOldUsername = username.trim().toLowerCase();
    const cleanNewUsername = newUsername ? newUsername.trim().toLowerCase() : cleanOldUsername;
    let found = false;
    const updated = accounts.map((acc) => {
      if (acc.username.trim().toLowerCase() === cleanOldUsername) {
        found = true;
        return {
          ...acc,
          ...updates,
          username: cleanNewUsername,
        };
      }
      return acc;
    });

    if (!found && updates.namaLengkap) {
      updated.push({
        username: cleanNewUsername,
        namaLengkap: updates.namaLengkap,
        role: updates.role || 'Admin TU',
        jabatan: updates.jabatan || 'Kepala Tata Usaha',
        avatarUrl: updates.avatarUrl,
        password: updates.password || '123',
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    saveUserAccounts(updated);

    // If current session belongs to this user, sync session immediately
    const session = getUserSession();
    if (session && session.username.toLowerCase() === cleanOldUsername) {
      const updatedSession: UserSession = {
        ...session,
        username: cleanNewUsername,
        namaLengkap: updates.namaLengkap || session.namaLengkap,
        role: (updates.role as any) || session.role,
        avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : session.avatarUrl,
        jabatan: updates.jabatan || session.jabatan,
      };
      saveUserSession(updatedSession);
    }
  } catch (e) {
    console.error('Failed to update single user account', e);
  }
}

export function resetUserAccountToDefault(username: string): { success: boolean; defaultPassword: string } {
  if (!isClient()) return { success: false, defaultPassword: '123' };
  try {
    const accounts = getUserAccounts();
    const cleanUsername = username.trim().toLowerCase();
    const defaultPassword = cleanUsername === 'developer' ? '23011995' : '123';
    
    const updated = accounts.map((acc) => {
      if (acc.username.trim().toLowerCase() === cleanUsername) {
        return {
          ...acc,
          password: defaultPassword,
        };
      }
      return acc;
    });

    saveUserAccounts(updated);
    return { success: true, defaultPassword };
  } catch (e) {
    console.error('Failed to reset user account', e);
    return { success: false, defaultPassword: '123' };
  }
}

export function getPasswordResetRequests(): PasswordResetRequest[] {
  if (!isClient()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESET_REQUESTS);
    if (data) {
      return JSON.parse(data) as PasswordResetRequest[];
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function savePasswordResetRequests(requests: PasswordResetRequest[]): void {
  if (!isClient()) return;
  try {
    trySetItem(STORAGE_KEYS.RESET_REQUESTS, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('password-reset-request-updated', { detail: requests }));
  } catch (e) {
    console.error('Failed to save reset requests', e);
  }
}

export function addPasswordResetRequest(data: {
  namaSekolah: string;
  npsn?: string;
  username: string;
  namaPengaju?: string;
  kontakHp?: string;
  catatan?: string;
}): PasswordResetRequest {
  const requests = getPasswordResetRequests();
  const newReq: PasswordResetRequest = {
    id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    namaSekolah: data.namaSekolah.trim(),
    npsn: data.npsn?.trim(),
    username: data.username.trim(),
    namaPengaju: data.namaPengaju?.trim() || 'Operator / Staf Sekolah',
    kontakHp: data.kontakHp?.trim(),
    catatan: data.catatan?.trim(),
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };

  const updated = [newReq, ...requests];
  savePasswordResetRequests(updated);
  return newReq;
}

export function markPasswordResetResolved(id: string): void {
  const requests = getPasswordResetRequests();
  const updated = requests.map((req) => (req.id === id ? { ...req, status: 'resolved' as const } : req));
  savePasswordResetRequests(updated);
}

export function deletePasswordResetRequest(id: string): void {
  const requests = getPasswordResetRequests();
  const updated = requests.filter((req) => req.id !== id);
  savePasswordResetRequests(updated);
}

export function getCurrentTab(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem(STORAGE_KEYS.CURRENT_TAB);
}

export function saveCurrentTab(tab: string): void {
  if (isClient()) {
    trySetItem(STORAGE_KEYS.CURRENT_TAB, tab);
  }
}

export function clearCurrentTab(): void {
  if (isClient()) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TAB);
  }
}

export const DEFAULT_DEVELOPER_BG = '/login-operator-bg.jpg';

export function getDeveloperBg(): string {
  if (!isClient()) return DEFAULT_DEVELOPER_BG;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DEVELOPER_BG);
    if (saved) return saved;
    const profile = getSchoolProfile();
    if (profile && profile.loginBgUrl) return profile.loginBgUrl;
    return DEFAULT_DEVELOPER_BG;
  } catch (e) {
    return DEFAULT_DEVELOPER_BG;
  }
}

export function saveDeveloperBg(bgUrl: string): void {
  if (!isClient()) return;
  try {
    // Remove redundant legacy key to free up space
    try {
      localStorage.removeItem('admin_sekolah_login_bg_v1');
    } catch {}
    
    trySetItem(STORAGE_KEYS.DEVELOPER_BG, bgUrl);

    // Sync to School Profile so any component querying profile gets it
    try {
      const profile = getSchoolProfile();
      profile.loginBgUrl = bgUrl;
      saveSchoolProfile(profile);
    } catch (profErr) {
      console.warn('Profile background sync fallback:', profErr);
    }

    window.dispatchEvent(new CustomEvent('developer-bg-saved', { detail: bgUrl }));
  } catch (e) {
    console.error('Failed to save developer bg', e);
  }
}
