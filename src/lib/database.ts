import { Equipment, EquipmentSearch, EquipmentGrade } from '@/types/equipment';

const STORAGE_KEY = 'equipment-grader-data';

export class EquipmentDatabase {
  private static instance: EquipmentDatabase;
  private equipment: Equipment[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): EquipmentDatabase {
    if (!EquipmentDatabase.instance) {
      EquipmentDatabase.instance = new EquipmentDatabase();
    }
    return EquipmentDatabase.instance;
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        try {
          this.equipment = JSON.parse(data).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }));
        } catch (error) {
          console.error('Failed to load equipment data:', error);
          this.equipment = [];
        }
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.equipment));
    }
  }

  public async getAllEquipment(): Promise<Equipment[]> {
    return [...this.equipment];
  }

  public async getEquipmentById(id: string): Promise<Equipment | null> {
    return this.equipment.find(eq => eq.id === id) || null;
  }

  public async getEquipmentBySerialNumber(serialNumber: string): Promise<Equipment | null> {
    return this.equipment.find(eq => eq.serialNumber.toLowerCase() === serialNumber.toLowerCase()) || null;
  }

  public async searchEquipment(criteria: EquipmentSearch): Promise<Equipment[]> {
    let results = [...this.equipment];

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(eq => 
        eq.serialNumber.toLowerCase().includes(query) ||
        eq.brand.toLowerCase().includes(query) ||
        eq.model.toLowerCase().includes(query) ||
        eq.notes?.toLowerCase().includes(query)
      );
    }

    if (criteria.type) {
      results = results.filter(eq => eq.type === criteria.type);
    }

    if (criteria.grade) {
      results = results.filter(eq => eq.grade === criteria.grade);
    }

    if (criteria.brand) {
      results = results.filter(eq => eq.brand.toLowerCase().includes(criteria.brand!.toLowerCase()));
    }

    return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public async addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipment> {
    const newEquipment: Equipment = {
      ...equipment,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.equipment.push(newEquipment);
    this.saveToStorage();
    return newEquipment;
  }

  public async updateEquipment(id: string, updates: Partial<Omit<Equipment, 'id' | 'createdAt'>>): Promise<Equipment | null> {
    const index = this.equipment.findIndex(eq => eq.id === id);
    if (index === -1) return null;

    this.equipment[index] = {
      ...this.equipment[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveToStorage();
    return this.equipment[index];
  }

  public async deleteEquipment(id: string): Promise<boolean> {
    const index = this.equipment.findIndex(eq => eq.id === id);
    if (index === -1) return false;

    this.equipment.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  public async getStatistics(): Promise<{
    total: number;
    byType: Record<string, number>;
    byGrade: Record<EquipmentGrade, number>;
  }> {
    const total = this.equipment.length;
    const byType: Record<string, number> = {};
    const byGrade: Record<EquipmentGrade, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0 };

    this.equipment.forEach(eq => {
      byType[eq.type] = (byType[eq.type] || 0) + 1;
      byGrade[eq.grade]++;
    });

    return { total, byType, byGrade };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Utility methods
  public async exportData(): Promise<string> {
    return JSON.stringify(this.equipment, null, 2);
  }

  public async importData(data: string): Promise<{ success: boolean; message: string }> {
    try {
      const importedEquipment = JSON.parse(data);
      
      if (!Array.isArray(importedEquipment)) {
        return { success: false, message: 'Invalid data format' };
      }

      // Validate structure
      for (const item of importedEquipment) {
        if (!item.id || !item.serialNumber || !item.type || !item.grade) {
          return { success: false, message: 'Missing required fields in data' };
        }
      }

      this.equipment = importedEquipment.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));

      this.saveToStorage();
      return { success: true, message: `Successfully imported ${importedEquipment.length} equipment records` };
    } catch (error) {
      return { success: false, message: 'Failed to parse import data' };
    }
  }
}