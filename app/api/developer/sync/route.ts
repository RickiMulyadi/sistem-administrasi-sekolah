import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface DeveloperSyncPayload {
  accounts?: any[];
  developerProfile?: {
    namaLengkap: string;
    password?: string;
    avatarUrl?: string;
  };
  developerBg?: string;
  resetRequests?: any[];
  schoolProfiles?: Record<string, any>;
  lastSyncedAt?: string;
}

// In-memory fallback
let inMemoryData: DeveloperSyncPayload = {
  accounts: [
    {
      username: 'developer',
      namaLengkap: 'Admin Developer',
      role: 'Developer',
      password: '23011995',
      avatarUrl: 'https://picsum.photos/seed/developer-avatar/150/150',
      createdAt: '2026-08-01',
      jabatan: 'Admin Developer',
    },
  ],
  developerProfile: {
    namaLengkap: 'Admin Developer',
    password: '23011995',
    avatarUrl: 'https://picsum.photos/seed/developer-avatar/150/150',
  },
  developerBg: '/login-operator-bg.jpg',
  resetRequests: [],
  schoolProfiles: {},
  lastSyncedAt: new Date().toISOString(),
};

function getStorageFilePath(): string {
  const primaryDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    return path.join(primaryDir, 'developer-sync.json');
  } catch {
    const tmpDir = path.join('/tmp', 'admin-sekolah-data');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return path.join(tmpDir, 'developer-sync.json');
  }
}

function readStoredData(): DeveloperSyncPayload {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      inMemoryData = { ...inMemoryData, ...parsed };
      return inMemoryData;
    }
  } catch (err) {
    console.error('Error reading developer sync file, using in-memory cache:', err);
  }
  return inMemoryData;
}

function writeStoredData(data: DeveloperSyncPayload): void {
  try {
    inMemoryData = {
      ...inMemoryData,
      ...data,
      lastSyncedAt: new Date().toISOString(),
    };
    const filePath = getStorageFilePath();
    fs.writeFileSync(filePath, JSON.stringify(inMemoryData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing developer sync file:', err);
  }
}

export async function GET() {
  const data = readStoredData();
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<DeveloperSyncPayload>;
    const current = readStoredData();

    const merged: DeveloperSyncPayload = {
      ...current,
      ...body,
      accounts: body.accounts || current.accounts,
      developerProfile: body.developerProfile
        ? { ...current.developerProfile, ...body.developerProfile }
        : current.developerProfile,
      developerBg: body.developerBg !== undefined ? body.developerBg : current.developerBg,
      resetRequests: body.resetRequests || current.resetRequests,
      schoolProfiles: body.schoolProfiles
        ? { ...current.schoolProfiles, ...body.schoolProfiles }
        : current.schoolProfiles,
      lastSyncedAt: new Date().toISOString(),
    };

    writeStoredData(merged);

    return NextResponse.json({
      success: true,
      message: 'Data developer berhasil disinkronisasi ke server pusat!',
      data: merged,
      timestamp: merged.lastSyncedAt,
    });
  } catch (err: any) {
    console.error('Failed to sync developer data:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to sync data' },
      { status: 500 }
    );
  }
}
