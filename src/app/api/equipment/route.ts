import { NextRequest, NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

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

export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type');
    const grade = searchParams.get('grade');
    const brand = searchParams.get('brand');

    let sql = 'SELECT * FROM equipment WHERE 1=1';
    const params: any[] = [];
    let i = 1;

    if (query) {
      sql += ` AND (serial_number ILIKE $${i} OR brand ILIKE $${i} OR model ILIKE $${i} OR notes ILIKE $${i})`;
      params.push(`%${query}%`);
      i++;
    }
    if (type) {
      sql += ` AND type = $${i++}`;
      params.push(type);
    }
    if (grade) {
      sql += ` AND grade = $${i++}`;
      params.push(grade);
    }
    if (brand) {
      sql += ` AND brand ILIKE $${i++}`;
      params.push(`%${brand}%`);
    }

    sql += ' ORDER BY updated_at DESC';

    const result = await pool.query(sql, params);
    return NextResponse.json(result.rows.map(mapRow));
  } catch (error: any) {
    console.error('GET /api/equipment error:', error);
    // Return empty list when DB is unavailable (e.g., local dev without Postgres)
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const {
      serialNumber, type, brand, model, grade,
      notes, photosData, photoData, // photosData is new array; photoData kept for compat
      physical, visual, specifications,
    } = body;

    // Normalise to array (support both new photosData[] and legacy single photoData)
    const photos: string[] = Array.isArray(photosData) && photosData.length > 0
      ? photosData
      : (photoData ? [photoData] : []);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    const result = await pool.query(
      `INSERT INTO equipment
        (serial_number, type, brand, model, grade, notes, photo_data, photos, photo_url, physical_condition, visual_condition, specifications)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        serialNumber, type, brand, model, grade,
        notes || null,
        photos[0] || null,           // first photo in legacy column
        JSON.stringify(photos),       // all photos in new column
        null,                         // photo_url set after we have the id
        JSON.stringify(physical),
        JSON.stringify(visual),
        JSON.stringify(specifications),
      ]
    );

    const row = result.rows[0];

    // Set the photo_url with the real id now that we have it
    if (photos.length > 0) {
      const photoUrl = `${baseUrl}/api/equipment/${row.id}/photos/0`;
      await pool.query('UPDATE equipment SET photo_url = $1 WHERE id = $2', [photoUrl, row.id]);
      row.photo_url = photoUrl;
    }

    return NextResponse.json(mapRow(row), { status: 201 });
  } catch (error: any) {
    console.error('POST /api/equipment error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Número de série já cadastrado.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
