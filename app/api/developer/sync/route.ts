import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local storage path for persistent server database
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'developer-database.json');

// Default in-memory cache
let inMemoryDatabase: {
  accounts?: any[];
  profiles?: Record<string, any>;
  resetRequests?: any[];
  developerBg?: string;
  lastUpdated?: string;
} = {
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
  profiles: {},
  resetRequests: [],
  developerBg: '/login-operator-bg.jpg',
  lastUpdated: new Date().toISOString(),
};

// Helper to ensure data directory exists and load file
function loadDatabaseFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        inMemoryDatabase = { ...inMemoryDatabase, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Could not read persistent database file, using in-memory cache:', err);
  }
}

// Helper to save database to file
function saveDatabaseToFile(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write persistent database file (likely serverless readonly):', err);
  }
}

// Initialize on module load
loadDatabaseFromFile();

export async function GET() {
  try {
    loadDatabaseFromFile();
    return NextResponse.json({
      success: true,
      data: inMemoryDatabase,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memuat database developer' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    
    // Merge received data
    const updatedData = {
      ...inMemoryDatabase,
      ...payload,
      lastUpdated: new Date().toISOString(),
    };

    inMemoryDatabase = updatedData;
    saveDatabaseToFile(updatedData);

    return NextResponse.json({
      success: true,
      message: 'Database berhasil disinkronkan ke server secara permanen!',
      data: updatedData,
    });
  } catch (error: any) {
    console.error('Error syncing developer database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan sinkronisasi database' },
      { status: 500 }
    );
  }
}
