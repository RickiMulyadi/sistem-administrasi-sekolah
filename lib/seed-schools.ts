import { SchoolProfile, Siswa, Guru, ArchiveItem, UserAccount } from '../types';

export interface SeedSchoolInfo {
  npsn: string;
  namaSekolah: string;
  tingkat: 'SD' | 'SMP';
  wilayah: string;
  profile: SchoolProfile;
  accounts: UserAccount[];
  siswa: Siswa[];
  guru: Guru[];
  archives: ArchiveItem[];
}

// All demo/dummy school accounts removed. Clean production state.
export const SEED_SCHOOLS: SeedSchoolInfo[] = [];
