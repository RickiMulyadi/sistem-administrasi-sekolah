import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { category, currentText, prompt } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY tidak dikonfigurasi.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Anda adalah asisten AI Tata Usaha Sekolah & Dinas Pendidikan Indonesia berpengalaman. Tugas Anda adalah membantu menyusun kalimat resmi, baku, formal, dan sesuai standar persuratan dinas untuk sekolah (Surat Mutasi, PIP, Tugas, Aktif Mengajar, SPD, SK Pembagian Tugas, Kuasa, dll). Berikan hasil kalimat langsung tanpa basa-basi atau kutipan ekstra.`;

    const fullPrompt = `Kategori Surat: ${category}
Konteks / Instruksi Tambahan: ${prompt || 'Buatkan draf kalimat resmi yang sopan dan baku.'}
Teks Awal (jika ada): ${currentText || '-'}

Tuliskan kalimat formal yang siap dipakai:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const resultText = response.text || '';
    return NextResponse.json({ result: resultText.trim() });
  } catch (error: any) {
    console.error('Gemini API draft error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghasilkan draf dari AI.' },
      { status: 500 }
    );
  }
}
