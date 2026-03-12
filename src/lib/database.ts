import { Equipment, EquipmentSearch } from '@/types/equipment';

export class EquipmentDatabase {
  private static instance: EquipmentDatabase;

  private constructor() {}

  public static getInstance(): EquipmentDatabase {
    if (!EquipmentDatabase.instance) {
      EquipmentDatabase.instance = new EquipmentDatabase();
    }
    return EquipmentDatabase.instance;
  }

  public async getAllEquipment(): Promise<Equipment[]> {
    try {
      const res = await fetch('/api/equipment');
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }

  public async getEquipmentById(id: string): Promise<Equipment | null> {
    const res = await fetch(`/api/equipment/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Erro ao carregar equipamento');
    return res.json();
  }

  public async getEquipmentBySerialNumber(serialNumber: string): Promise<Equipment | null> {
    const res = await fetch(`/api/equipment?query=${encodeURIComponent(serialNumber)}`);
    if (!res.ok) return null;
    const list: Equipment[] = await res.json();
    return list.find(eq => eq.serialNumber.toLowerCase() === serialNumber.toLowerCase()) || null;
  }

  public async searchEquipment(criteria: EquipmentSearch): Promise<Equipment[]> {
    try {
      const params = new URLSearchParams();
      if (criteria.query) params.set('query', criteria.query);
      if (criteria.type) params.set('type', criteria.type);
      if (criteria.grade) params.set('grade', criteria.grade);
      if (criteria.brand) params.set('brand', criteria.brand);
      const res = await fetch(`/api/equipment?${params.toString()}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }

  public async addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'> & { photoData?: string }): Promise<Equipment> {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipment),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao adicionar equipamento');
    }
    return res.json();
  }

  public async updateEquipment(id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>): Promise<Equipment | null> {
    const res = await fetch(`/api/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Erro ao atualizar equipamento');
    return res.json();
  }

  public async deleteEquipment(id: string): Promise<boolean> {
    const res = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
    return res.ok;
  }

  // Legacy stub — kept to satisfy any old call-sites
  private generateId_unused(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const GRADE_CRITERIA = {
  'A+': {
    name: 'Como Novo',
    description: 'Aspeto impecável, sem marcas visíveis. Funcionamento perfeito.',
    color: 'text-green-600 bg-green-50 border-green-300',
  },
  'A': {
    name: 'Muito Bom',
    description: 'Riscos muito ligeiros e quase invisíveis. Funcionamento excelente.',
    color: 'text-green-500 bg-green-50 border-green-200',
  },
  'B': {
    name: 'Bom',
    description: 'Algumas marcas visíveis mas em bom funcionamento.',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-300',
  },
  'C': {
    name: 'Aceitável',
    description: 'Marcas visíveis, pode ter problemas menores de funcionamento.',
    color: 'text-orange-600 bg-orange-50 border-orange-300',
  },
};