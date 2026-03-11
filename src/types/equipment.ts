export type EquipmentType = 'computer' | 'smartphone';

export type EquipmentGrade = 'A+' | 'A' | 'B' | 'C';

export interface Equipment {
  id: string;
  serialNumber: string;
  type: EquipmentType;
  brand: string;
  model: string;
  grade: EquipmentGrade;
  
  // Physical information
  physical: PhysicalCondition;
  
  // Visual information
  visual: VisualCondition;
  
  // Specifications
  specifications: EquipmentSpecifications;
  
  // Photo linked to serial number
  photoUrl?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface PhysicalCondition {
  functioning: boolean;
  powerOn: boolean;
  allPortsWorking: boolean;
  screenCondition: 'excellent' | 'good' | 'fair' | 'poor';
  keyboardCondition?: 'excellent' | 'good' | 'fair' | 'poor'; // For computers
  batteryHealth?: number; // 0-100 percentage
  physicalDamage: {
    scratches: 'none' | 'minor' | 'moderate' | 'severe';
    dents: 'none' | 'minor' | 'moderate' | 'severe';
    cracks: 'none' | 'minor' | 'moderate' | 'severe';
  };
}

export interface VisualCondition {
  overallAppearance: 'like-new' | 'excellent' | 'good' | 'fair' | 'poor';
  screenCleanliness: 'pristine' | 'clean' | 'dirty' | 'very-dirty';
  bodyWear: 'none' | 'minimal' | 'moderate' | 'heavy';
  colorFading: boolean;
  stickers: boolean;
  customizations: boolean;
}

export interface EquipmentSpecifications {
  // Common specs
  processor?: string;
  storage?: string;
  ram?: string;
  operatingSystem?: string;
  
  // Computer specific
  graphicsCard?: string;
  screenSize?: string;
  
  // Smartphone specific
  cameraResolution?: string;
  batteryCapacity?: string;
  networkSupport?: string[];
}

export interface EquipmentSearch {
  query?: string;
  type?: EquipmentType;
  grade?: EquipmentGrade;
  brand?: string;
}

// Grading criteria definitions
export const GRADE_CRITERIA = {
  'A+': {
    name: 'Como Novo',
    description: 'Aspeto impecável, sem marcas visíveis. Funcionamento perfeito.',
    color: 'text-green-600 bg-green-50',
    requirements: {
      minFunctioning: true,
      maxScratches: 'none',
      maxDents: 'none',
      maxCracks: 'none',
      minScreenCondition: 'excellent',
      minOverallAppearance: 'like-new'
    }
  },
  'A': {
    name: 'Muito Bom',
    description: 'Riscos muito ligeiros e quase invisíveis. Funcionamento excelente.',
    color: 'text-green-500 bg-green-50',
    requirements: {
      minFunctioning: true,
      maxScratches: 'minor',
      maxDents: 'none',
      maxCracks: 'none',
      minScreenCondition: 'excellent',
      minOverallAppearance: 'excellent'
    }
  },
  'B': {
    name: 'Bom',
    description: 'Marcas e riscos visíveis no corpo, mas funcionalidade completa.',
    color: 'text-yellow-600 bg-yellow-50',
    requirements: {
      minFunctioning: true,
      maxScratches: 'moderate',
      maxDents: 'minor',
      maxCracks: 'none',
      minScreenCondition: 'good',
      minOverallAppearance: 'good'
    }
  },
  'C': {
    name: 'Aceitável',
    description: 'Desgaste significativo, mas ainda funcional.',
    color: 'text-orange-600 bg-orange-50',
    requirements: {
      minFunctioning: true,
      maxScratches: 'severe',
      maxDents: 'moderate',
      maxCracks: 'minor',
      minScreenCondition: 'fair',
      minOverallAppearance: 'fair'
    }
  }
} as const;