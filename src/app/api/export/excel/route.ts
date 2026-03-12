import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as XLSX from 'xlsx';

// ─── helpers ─────────────────────────────────────────────────────────────────
const yn = (b: boolean | undefined) => (b ? 'Sim' : 'Não');

const CONDITION: Record<string, string> = {
  excellent: 'Excelente', good: 'Boa', fair: 'Regular', poor: 'Ruim',
};
const APPEARANCE: Record<string, string> = {
  'like-new': 'Como Novo', excellent: 'Excelente', good: 'Boa', fair: 'Regular', poor: 'Ruim',
};
const CLEANLINESS: Record<string, string> = {
  pristine: 'Impecável', clean: 'Limpa', dirty: 'Suja', 'very-dirty': 'Muito Suja',
};
const WEAR: Record<string, string> = {
  none: 'Nenhum', minimal: 'Mínimo', moderate: 'Moderado', heavy: 'Pesado',
};
const DAMAGE: Record<string, string> = {
  none: 'Nenhum', minor: 'Leve', moderate: 'Moderado', severe: 'Severo',
};

function tr(map: Record<string, string>, val: string | undefined) {
  return val ? (map[val] ?? val) : '';
}

function autoFit(ws: XLSX.WorkSheet, rows: Record<string, any>[]) {
  if (!rows.length) return;
  ws['!cols'] = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').length)) + 2,
  }));
}

function addHyperlinks(
  ws: XLSX.WorkSheet,
  rows: Record<string, any>[],
  colNames: string[],
) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  for (const col of colNames) {
    const colIdx = keys.indexOf(col);
    if (colIdx < 0) continue;
    const colLetter = XLSX.utils.encode_col(colIdx);
    rows.forEach((row, ri) => {
      const url: string = row[col];
      if (!url) return;
      const cellRef = `${colLetter}${ri + 2}`; // +2 = header row + 1-based index
      if (ws[cellRef]) ws[cellRef].l = { Target: url, Tooltip: 'Abrir foto' };
    });
  }
}

// ─── route handler ────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM equipment ORDER BY updated_at DESC');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

    // Determine max photos across all rows (for dynamic column count)
    const maxPhotos = result.rows.reduce((max, row) => {
      const count = Array.isArray(row.photos) && row.photos.length > 0
        ? row.photos.length
        : (row.photo_data ? 1 : 0);
      return Math.max(max, count);
    }, 0);

    // ── Sheet 1: Informações Básicas ──────────────────────────────────────────
    const photoColNames: string[] = Array.from(
      { length: Math.max(maxPhotos, 1) },
      (_, i) => (maxPhotos <= 1 ? 'Link da Foto' : `Foto ${i + 1}`),
    );

    const basicRows = result.rows.map((row) => {
      const photosArr: string[] = Array.isArray(row.photos) && row.photos.length > 0
        ? row.photos
        : (row.photo_data ? [row.photo_data] : []);
      const photosCount = photosArr.length;

      const photoLinks: Record<string, string> = {};
      photoColNames.forEach((colName, i) => {
        photoLinks[colName] = i < photosCount
          ? `${baseUrl}/api/equipment/${row.id}/photos/${i}`
          : '';
      });

      return {
        'Número de Série': row.serial_number,
        'Tipo': row.type === 'computer' ? 'Computador' : 'Smartphone',
        'Marca': row.brand,
        'Modelo': row.model,
        'Grade': row.grade,
        'Observações': row.notes || '',
        ...photoLinks,
        'Cadastrado em': new Date(row.created_at).toLocaleDateString('pt-BR'),
        'Atualizado em': new Date(row.updated_at).toLocaleDateString('pt-BR'),
      };
    });

    const wsBasic = XLSX.utils.json_to_sheet(basicRows);
    addHyperlinks(wsBasic, basicRows, photoColNames);
    autoFit(wsBasic, basicRows);

    // ── Sheet 2: Condição Física ──────────────────────────────────────────────
    const physicalRows = result.rows.map((row) => {
      const p = row.physical_condition || {};
      const dmg = p.physicalDamage || {};
      return {
        'Número de Série': row.serial_number,
        'Funcionando': yn(p.functioning),
        'Liga': yn(p.powerOn),
        'Portas OK': yn(p.allPortsWorking),
        'Condição da Tela': tr(CONDITION, p.screenCondition),
        'Condição do Teclado': tr(CONDITION, p.keyboardCondition),
        'Saúde da Bateria (%)': p.batteryHealth ?? '',
        'Riscos': tr(DAMAGE, dmg.scratches),
        'Amassados': tr(DAMAGE, dmg.dents),
        'Rachaduras': tr(DAMAGE, dmg.cracks),
      };
    });
    const wsPhysical = XLSX.utils.json_to_sheet(physicalRows);
    autoFit(wsPhysical, physicalRows);

    // ── Sheet 3: Aparência Visual ─────────────────────────────────────────────
    const visualRows = result.rows.map((row) => {
      const v = row.visual_condition || {};
      return {
        'Número de Série': row.serial_number,
        'Aparência Geral': tr(APPEARANCE, v.overallAppearance),
        'Limpeza da Tela': tr(CLEANLINESS, v.screenCleanliness),
        'Desgaste do Corpo': tr(WEAR, v.bodyWear),
        'Desbotamento da Cor': yn(v.colorFading),
        'Adesivos': yn(v.stickers),
        'Personalizações': yn(v.customizations),
      };
    });
    const wsVisual = XLSX.utils.json_to_sheet(visualRows);
    autoFit(wsVisual, visualRows);

    // ── Sheet 4: Especificações e Revisão ─────────────────────────────────────
    const specsRows = result.rows.map((row) => {
      const s = row.specifications || {};
      return {
        'Número de Série': row.serial_number,
        'Processador': s.processor || '',
        'RAM': s.ram || '',
        'Armazenamento': s.storage || '',
        'Sistema Operacional': s.operatingSystem || '',
        'Placa de Vídeo': s.graphicsCard || '',
        'Tamanho da Tela': s.screenSize || '',
        'Câmera': s.cameraResolution || '',
        'Bateria': s.batteryCapacity || '',
      };
    });
    const wsSpecs = XLSX.utils.json_to_sheet(specsRows);
    autoFit(wsSpecs, specsRows);

    // ── Assemble workbook ─────────────────────────────────────────────────────
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, wsBasic, 'Informações Básicas');
    XLSX.utils.book_append_sheet(workbook, wsPhysical, 'Condição Física');
    XLSX.utils.book_append_sheet(workbook, wsVisual, 'Aparência Visual');
    XLSX.utils.book_append_sheet(workbook, wsSpecs, 'Especificações e Revisão');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `inventario_equipamentos_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export excel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
