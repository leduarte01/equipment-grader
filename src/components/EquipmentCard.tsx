import { Equipment, GRADE_CRITERIA } from '@/types/equipment';
import { useState } from 'react';
import { Smartphone, Monitor, Edit, Trash2, Eye, EyeOff, Image } from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
  onUpdate: (id: string, updates: Partial<Equipment>) => void;
  onDelete: (id: string) => void;
  onEdit: (equipment: Equipment) => void;
}

export default function EquipmentCard({ equipment, onUpdate, onDelete, onEdit }: EquipmentCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const grade = GRADE_CRITERIA[equipment.grade];

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${equipment.brand} ${equipment.model}?`)) {
      onDelete(equipment.id);
    }
  };

  const getPhysicalConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'fair': return 'text-orange-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex items-center gap-2">
              {equipment.type === 'smartphone' ? (
                <Smartphone className="w-5 h-5 text-blue-600" />
              ) : (
                <Monitor className="w-5 h-5 text-green-600" />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">
                  {equipment.brand} {equipment.model}
                </h3>
                <p className="text-xs text-gray-500">{equipment.serialNumber}</p>
              </div>
            </div>
            
            {/* Equipment Photo */}
            {equipment.photoUrl && (
              <div className="ml-auto mr-2">
                <img
                  src={equipment.photoUrl}
                  alt={`${equipment.brand} ${equipment.model}`}
                  className="w-12 h-12 object-cover rounded-md border border-gray-200"
                />
              </div>
            )}
          </div>
          
          {/* Grade Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${grade.color} border ml-2`}>
            Grade {equipment.grade}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Funcionamento:</span>
            <span className={equipment.physical.functioning ? 'text-green-600' : 'text-red-600'}>
              {equipment.physical.functioning ? '✓ Funcional' : '✗ Defeito'}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tela:</span>
            <span className={getPhysicalConditionColor(equipment.physical.screenCondition)}>
              {equipment.physical.screenCondition.charAt(0).toUpperCase() + 
               equipment.physical.screenCondition.slice(1)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Riscos:</span>
            <span className={getPhysicalConditionColor(equipment.physical.physicalDamage.scratches)}>
              {equipment.physical.physicalDamage.scratches === 'none' ? 'Nenhum' : 
               equipment.physical.physicalDamage.scratches.charAt(0).toUpperCase() + 
               equipment.physical.physicalDamage.scratches.slice(1)}
            </span>
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Especificações:</span>
              <div className="text-gray-600 text-xs mt-1 space-y-1">
                {equipment.specifications.processor && (
                  <div>CPU: {equipment.specifications.processor}</div>
                )}
                {equipment.specifications.ram && (
                  <div>RAM: {equipment.specifications.ram}</div>
                )}
                {equipment.specifications.storage && (
                  <div>Armazenamento: {equipment.specifications.storage}</div>
                )}
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Estado Visual:</span>
              <div className="text-gray-600 text-xs mt-1">
                {equipment.visual.overallAppearance.charAt(0).toUpperCase() + 
                 equipment.visual.overallAppearance.slice(1).replace('-', ' ')}
              </div>
            </div>

            {equipment.notes && (
              <div>
                <span className="font-medium text-gray-700">Observações:</span>
                <div className="text-gray-600 text-xs mt-1">{equipment.notes}</div>
              </div>
            )}

            {equipment.photoUrl && (
              <div>
                <span className="font-medium text-gray-700">Foto:</span>
                <div className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  <span>Vinculada ao S/N: {equipment.serialNumber}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            {showDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showDetails ? 'Menos' : 'Mais'} detalhes
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(equipment)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Atualizado: {new Date(equipment.updatedAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}