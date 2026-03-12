import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(_req: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM equipment ORDER BY updated_at DESC');

    const rows = result.rows.map((row) => {
      const physical = row.physical_condition || {};
      const visual = row.visual_condition || {};
      const specs = row.specifications || {};

      return {
        'Número de Série': row.serial_number,
        'Tipo': row.type === 'computer' ? 'Computador' : 'Smartphone',
        'Marca': row.brand,
        'Modelo': row.model,
        'Grade': row.grade,
        'Processador': specs.processor || '',
        'RAM': specs.ram || '',
        'Armazenamento': specs.storage || '',
        'Sistema Operacional': specs.operatingSystem || '',
        'Placa de Vídeo': specs.graphicsCard || '',
        'Tamanho da Tela': specs.screenSize || '',
        'Câmera': specs.cameraResolution || '',
        'Bateria': specs.batteryCapacity || '',
        'Funcionando': physical.functioning ? 'Sim' : 'Não',
        'Liga': physical.powerOn ? 'Sim' : 'Não',
        'Portas OK': physical.allPortsWorking ? 'Sim' : 'Não',
        'Condição Tela': physical.screenCondition || '',
        'Arranhões': physical.physicalDamage?.scratches || '',
        'Amassados': physical.physicalDamage?.dents || '',
        'Rachaduras': physical.physicalDamage?.cracks || '',
        'Aparência Geral': visual.overallAppearance || '',
        'Desgaste': visual.bodyWear || '',
        'Observações': row.notes || '',
        'Link da Foto': row.photo_url || '',
        'Cadastrado em': new Date(row.created_at).toLocaleDateString('pt-BR'),
        'Atualizado em': new Date(row.updated_at).toLocaleDateString('pt-BR'),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Convert photo URL column to hyperlinks
    const photoColIndex = Object.keys(rows[0] || {}).indexOf('Link da Foto');
    if (photoColIndex >= 0) {
      const colLetter = XLSX.utils.encode_col(photoColIndex);
      rows.forEach((row, i) => {
        const url = row['Link da Foto'];
        if (url) {
          const cellRef = `${colLetter}${i + 2}`; // +2: header row + 1-based
          worksheet[cellRef].l = { Target: url, Tooltip: 'Abrir foto' };
        }
      });
    }

    // Auto-fit columns
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String((r as any)[key] || '').length)) + 2,
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário');

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
