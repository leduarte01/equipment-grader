import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT photo_data FROM equipment WHERE id = $1', [id]);

    if (result.rows.length === 0 || !result.rows[0].photo_data) {
      return NextResponse.json({ error: 'Foto não encontrada.' }, { status: 404 });
    }

    const photoData: string = result.rows[0].photo_data;

    // photoData is a base64 data URL like "data:image/jpeg;base64,..."
    const match = photoData.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Formato de foto inválido.' }, { status: 400 });
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
