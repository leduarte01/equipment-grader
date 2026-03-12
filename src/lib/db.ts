import { Pool } from 'pg';

const globalForPg = global as unknown as { pool: Pool | null };

const pool: Pool = globalForPg.pool || (process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({ max: 0 }) // dummy pool — DB not configured
);

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool;
}

export default pool;

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS equipment (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        serial_number VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        grade VARCHAR(10) NOT NULL,
        notes TEXT,
        photo_data TEXT,
        photo_url TEXT,
        photos JSONB NOT NULL DEFAULT '[]',
        physical_condition JSONB NOT NULL DEFAULT '{}',
        visual_condition JSONB NOT NULL DEFAULT '{}',
        specifications JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE equipment ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]';
    `);
  } finally {
    client.release();
  }
}
