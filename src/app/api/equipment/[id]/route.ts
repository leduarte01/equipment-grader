import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

function mapRow(row: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const photosArr: string[] = Array.isArray(row.photos) ? row.photos : [];
  const photosCount = photosArr.length > 0 ? photosArr.length : (row.photo_data ? 1 : 0);
  const photoUrls = Array.from({ length: photosCount }, (_, i) => `${baseUrl}/api/equipment/${row.id}/photos/${i}`);
  return {
    id: row.id,
    serialNumber: row.serial_number,
    type: row.type,
    brand: row.brand,
    model: row.model,
    grade: row.grade,
    notes: row.notes,
    photoUrl: photoUrls[0] || row.photo_url || null,
    photoUrls,
    physical: row.physical_condition,
    visual: row.visual_condition,
    specifications: row.specifications,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query('SELECT * FROM equipment WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(mapRow(result.rows[0]));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      serialNumber, type, brand, model, grade,
      notes, photosData, photoData,
      physical, visual, specifications,
    } = body;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (serialNumber !== undefined) { updates.push(`serial_number = $${i++}`); values.push(serialNumber); }
    if (type !== undefined) { updates.push(`type = $${i++}`); values.push(type); }
    if (brand !== undefined) { updates.push(`brand = $${i++}`); values.push(brand); }
    if (model !== undefined) { updates.push(`model = $${i++}`); values.push(model); }
    if (grade !== undefined) { updates.push(`grade = $${i++}`); values.push(grade); }
    if (notes !== undefined) { updates.push(`notes = $${i++}`); values.push(notes); }
    if (photosData !== undefined) {
      const photos: string[] = Array.isArray(photosData) ? photosData : [];
      updates.push(`photos = $${i++}`); values.push(JSON.stringify(photos));
      updates.push(`photo_data = $${i++}`); values.push(photos[0] || null);
      updates.push(`photo_url = $${i++}`); values.push(photos.length > 0 ? `${baseUrl}/api/equipment/${id}/photos/0` : null);
    } else if (photoData !== undefined) {
      updates.push(`photo_data = $${i++}`); values.push(photoData);
      updates.push(`photos = $${i++}`); values.push(JSON.stringify(photoData ? [photoData] : []));
      updates.push(`photo_url = $${i++}`); values.push(photoData ? `${baseUrl}/api/equipment/${id}/photos/0` : null);
    }
    if (physical !== undefined) { updates.push(`physical_condition = $${i++}`); values.push(JSON.stringify(physical)); }
    if (visual !== undefined) { updates.push(`visual_condition = $${i++}`); values.push(JSON.stringify(visual)); }
    if (specifications !== undefined) { updates.push(`specifications = $${i++}`); values.push(JSON.stringify(specifications)); }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE equipment SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }
    return NextResponse.json(mapRow(result.rows[0]));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query('DELETE FROM equipment WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
