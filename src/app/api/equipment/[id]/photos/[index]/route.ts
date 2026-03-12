import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> },
) {
  try {
    const { id, index } = await params;
    const photoIndex = parseInt(index, 10);

    if (isNaN(photoIndex) || photoIndex < 0) {
      return NextResponse.json({ error: 'Índice inválido.' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT photos, photo_data FROM equipment WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }

    const row = result.rows[0];
    const photos: string[] = Array.isArray(row.photos) ? row.photos : [];

    let photoData: string | null = null;
    if (photos.length > photoIndex) {
      photoData = photos[photoIndex];
    } else if (photoIndex === 0 && row.photo_data) {
      // Backward compat: legacy single-photo equipment
      photoData = row.photo_data;
    }

    if (!photoData) {
      return NextResponse.json({ error: 'Foto não encontrada.' }, { status: 404 });
    }

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
