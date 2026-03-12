import { useState, useEffect } from 'react';
import { Equipment, EquipmentType, EquipmentGrade, PhysicalCondition, VisualCondition, EquipmentSpecifications, GRADE_CRITERIA } from '@/types/equipment';
import { X, Monitor, Smartphone, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import PhotoCapture from './PhotoCapture';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editEquipment?: Equipment;
  onUpdate?: (id: string, updates: any) => void;
}

export default function AddEquipmentModal({ isOpen, onClose, onAdd, editEquipment, onUpdate }: AddEquipmentModalProps) {
  const isEditMode = !!editEquipment;
  const [step, setStep] = useState(1);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [manualGrade, setManualGrade] = useState<EquipmentGrade | ''>('');
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    serialNumber: '',
    type: 'computer' as EquipmentType,
    brand: '',
    model: '',
    notes: '',
    photosData: [] as string[],
    physical: {
      functioning: true,
      powerOn: true,
      allPortsWorking: true,
      screenCondition: 'excellent',
      keyboardCondition: 'excellent',
      batteryHealth: 100,
      physicalDamage: {
        scratches: 'none',
        dents: 'none',
        cracks: 'none',
      }
    } as PhysicalCondition,
    visual: {
      overallAppearance: 'like-new',
      screenCleanliness: 'pristine',
      bodyWear: 'none',
      colorFading: false,
      stickers: false,
      customizations: false,
    } as VisualCondition,
    specifications: {
      processor: '',
      storage: '',
      ram: '',
      operatingSystem: '',
      graphicsCard: '',
      screenSize: '',
      cameraResolution: '',
      batteryCapacity: '',
      networkSupport: [],
    } as EquipmentSpecifications
  });

  // Populate form when opening in edit mode
  useEffect(() => {
    if (isOpen && editEquipment) {
      const urls = editEquipment.photoUrls && editEquipment.photoUrls.length > 0
        ? editEquipment.photoUrls
        : editEquipment.photoUrl ? [editEquipment.photoUrl] : [];
      setExistingPhotoUrls(urls);
      setManualGrade(editEquipment.grade);
      setFormData({
        serialNumber: editEquipment.serialNumber,
        type: editEquipment.type,
        brand: editEquipment.brand,
        model: editEquipment.model,
        notes: editEquipment.notes || '',
        photosData: [],
        physical: { ...editEquipment.physical },
        visual: { ...editEquipment.visual },
        specifications: { ...editEquipment.specifications },
      });
    } else if (!isOpen) {
      setStep(1);
      setShowPhotoCapture(false);
      setExistingPhotoUrls([]);
    }
  }, [isOpen, editEquipment?.id]);

  const calculateGrade = (): EquipmentGrade => {
    const { physical, visual } = formData;
    
    if (!physical.functioning) return 'C';
    
    // Grade A+ criteria
    if (
      physical.physicalDamage.scratches === 'none' &&
      physical.physicalDamage.dents === 'none' &&
      physical.physicalDamage.cracks === 'none' &&
      physical.screenCondition === 'excellent' &&
      visual.overallAppearance === 'like-new'
    ) {
      return 'A+';
    }
    
    // Grade A criteria
    if (
      ['none', 'minor'].includes(physical.physicalDamage.scratches) &&
      physical.physicalDamage.dents === 'none' &&
      physical.physicalDamage.cracks === 'none' &&
      ['excellent', 'good'].includes(physical.screenCondition) &&
      ['like-new', 'excellent'].includes(visual.overallAppearance)
    ) {
      return 'A';
    }
    
    // Grade B criteria
    if (
      ['none', 'minor', 'moderate'].includes(physical.physicalDamage.scratches) &&
      ['none', 'minor'].includes(physical.physicalDamage.dents) &&
      physical.physicalDamage.cracks === 'none' &&
      ['excellent', 'good'].includes(physical.screenCondition)
    ) {
      return 'B';
    }
    
    return 'C';
  };

  const handlePhotoCapture = (photoData: string) => {
    setFormData(prev => ({ ...prev, photosData: [...prev.photosData, photoData] }));
    setShowPhotoCapture(false);
  };

  const removePhotoAt = (index: number) => {
    setFormData(prev => ({ ...prev, photosData: prev.photosData.filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    const grade = manualGrade || calculateGrade();
    const payload: any = {
      serialNumber: formData.serialNumber,
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      grade,
      physical: formData.physical,
      visual: formData.visual,
      specifications: formData.specifications,
      notes: formData.notes || undefined,
    };
    if (formData.photosData.length > 0) {
      payload.photosData = formData.photosData;
    }

    if (isEditMode && editEquipment && onUpdate) {
      onUpdate(editEquipment.id, payload);
    } else {
      onAdd({ ...payload, photosData: formData.photosData });
    }
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setShowPhotoCapture(false);
    setManualGrade('');
    setFormData({
      serialNumber: '',
      type: 'computer',
      brand: '',
      model: '',
      notes: '',
      photosData: [],
      physical: {
        functioning: true,
        powerOn: true,
        allPortsWorking: true,
        screenCondition: 'excellent',
        keyboardCondition: 'excellent',
        batteryHealth: 100,
        physicalDamage: {
          scratches: 'none',
          dents: 'none',
          cracks: 'none',
        }
      } as PhysicalCondition,
      visual: {
        overallAppearance: 'like-new',
        screenCleanliness: 'pristine',
        bodyWear: 'none',
        colorFading: false,
        stickers: false,
        customizations: false,
      } as VisualCondition,
      specifications: {
        processor: '',
        storage: '',
        ram: '',
        operatingSystem: '',
        graphicsCard: '',
        screenSize: '',
        cameraResolution: '',
        batteryCapacity: '',
        networkSupport: [],
      } as EquipmentSpecifications
    });
    onClose();
  };

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const updateNestedFormData = (section: string, subSection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [subSection]: {
          ...((prev[section as keyof typeof prev] as any)[subSection] as any),
          [field]: value
        }
      }
    }));
  };

  if (!isOpen) return null;

  const currentGrade = calculateGrade();
  const gradeInfo = GRADE_CRITERIA[currentGrade];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl flex flex-col" style={{maxHeight: '90vh'}}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{isEditMode ? 'Editar Equipamento' : 'Adicionar Equipamento'}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Passo {step} de 4</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-2 border-b">
          <div className="flex items-center">
            <div className="flex-1 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Série *
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: ABC123456789"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Equipamento *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="computer"
                        checked={formData.type === 'computer'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as EquipmentType }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <Monitor className="w-4 h-4" />
                      Computador
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="smartphone"
                        checked={formData.type === 'smartphone'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as EquipmentType }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <Smartphone className="w-4 h-4" />
                      Smartphone
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Selecione a marca...</option>
                    <option value="APPLE">APPLE</option>
                    <option value="DELL">DELL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.type === 'computer' ? 'Ex: Inspiron 15 3000' : 'Ex: iPhone 13 Pro'}
                    required
                  />
                </div>
              </div>

              {/* Captura de Fotos — só aparece quando todos os campos acima estão preenchidos */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Fotos do Equipamento {!isEditMode && <span className="text-red-500">*</span>}</h4>
                
                {!formData.serialNumber || !formData.brand || !formData.model ? (
                  <p className="text-sm text-gray-400 italic">Preencha o número de série, marca e modelo para habilitar as fotos.</p>
                ) : (
                  <div className="space-y-3">
                    {/* Existing photos (edit mode) */}
                    {isEditMode && existingPhotoUrls.length > 0 && formData.photosData.length === 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Fotos atuais ({existingPhotoUrls.length})</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {existingPhotoUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 opacity-70"
                              />
                              <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                Foto {index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Capture novas fotos abaixo para substituir as atuais.</p>
                      </div>
                    )}

                    {/* Grid de thumbnails novos */}
                    {formData.photosData.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.photosData.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removePhotoAt(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              Foto {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botão adicionar foto */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowPhotoCapture(true)}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        {formData.photosData.length === 0 ? 'Tirar Foto' : 'Adicionar Foto'}
                      </button>
                    </div>

                    {!isEditMode && formData.photosData.length === 0 && (
                      <p className="text-xs text-center text-red-500">Pelo menos uma foto é obrigatória</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Physical Condition */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Condição Física</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="functioning"
                      checked={formData.physical.functioning}
                      onChange={(e) => updateFormData('physical', 'functioning', e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="functioning" className="text-sm font-medium text-gray-700">
                      Equipamento funcionando
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="powerOn"
                      checked={formData.physical.powerOn}
                      onChange={(e) => updateFormData('physical', 'powerOn', e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="powerOn" className="text-sm font-medium text-gray-700">
                      Liga normalmente
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="allPortsWorking"
                      checked={formData.physical.allPortsWorking}
                      onChange={(e) => updateFormData('physical', 'allPortsWorking', e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="allPortsWorking" className="text-sm font-medium text-gray-700">
                      Todas as portas funcionam
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condição da Tela
                    </label>
                    <select
                      value={formData.physical.screenCondition}
                      onChange={(e) => updateFormData('physical', 'screenCondition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="excellent">Excelente</option>
                      <option value="good">Boa</option>
                      <option value="fair">Regular</option>
                      <option value="poor">Ruim</option>
                    </select>
                  </div>

                  {formData.type === 'computer' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condição do Teclado
                      </label>
                      <select
                        value={formData.physical.keyboardCondition}
                        onChange={(e) => updateFormData('physical', 'keyboardCondition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="excellent">Excelente</option>
                        <option value="good">Bom</option>
                        <option value="fair">Regular</option>
                        <option value="poor">Ruim</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saúde da Bateria (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.physical.batteryHealth}
                      onChange={(e) => updateFormData('physical', 'batteryHealth', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">
                      {formData.physical.batteryHealth}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Damage */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Danos Físicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Riscos</label>
                    <select
                      value={formData.physical.physicalDamage.scratches}
                      onChange={(e) => updateNestedFormData('physical', 'physicalDamage', 'scratches', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="none">Nenhum</option>
                      <option value="minor">Leves</option>
                      <option value="moderate">Moderados</option>
                      <option value="severe">Severos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amassados</label>
                    <select
                      value={formData.physical.physicalDamage.dents}
                      onChange={(e) => updateNestedFormData('physical', 'physicalDamage', 'dents', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="none">Nenhum</option>
                      <option value="minor">Leves</option>
                      <option value="moderate">Moderados</option>
                      <option value="severe">Severos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rachaduras</label>
                    <select
                      value={formData.physical.physicalDamage.cracks}
                      onChange={(e) => updateNestedFormData('physical', 'physicalDamage', 'cracks', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="none">Nenhuma</option>
                      <option value="minor">Pequenas</option>
                      <option value="moderate">Moderadas</option>
                      <option value="severe">Grandes</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Visual Appearance */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Aparência Visual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aparência Geral
                    </label>
                    <select
                      value={formData.visual.overallAppearance}
                      onChange={(e) => updateFormData('visual', 'overallAppearance', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="like-new">Como Novo</option>
                      <option value="excellent">Excelente</option>
                      <option value="good">Boa</option>
                      <option value="fair">Regular</option>
                      <option value="poor">Ruim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limpeza da Tela
                    </label>
                    <select
                      value={formData.visual.screenCleanliness}
                      onChange={(e) => updateFormData('visual', 'screenCleanliness', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="pristine">Impecável</option>
                      <option value="clean">Limpa</option>
                      <option value="dirty">Suja</option>
                      <option value="very-dirty">Muito Suja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desgaste do Corpo
                    </label>
                    <select
                      value={formData.visual.bodyWear}
                      onChange={(e) => updateFormData('visual', 'bodyWear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="none">Nenhum</option>
                      <option value="minimal">Mínimo</option>
                      <option value="moderate">Moderado</option>
                      <option value="heavy">Pesado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="colorFading"
                      checked={formData.visual.colorFading}
                      onChange={(e) => updateFormData('visual', 'colorFading', e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="colorFading" className="text-sm font-medium text-gray-700">
                      Desbotamento da cor
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="stickers"
                      checked={formData.visual.stickers}
                      onChange={(e) => updateFormData('visual', 'stickers', e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="stickers" className="text-sm font-medium text-gray-700">
                      Adesivos presentes
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="customizations"
                      checked={formData.visual.customizations}
                      onChange={(e) => updateFormData('visual', 'customizations', e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="customizations" className="text-sm font-medium text-gray-700">
                      Personalizações/modificações
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Specifications and Review */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Especificações e Revisão</h3>
              
              {/* Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Processador
                    </label>
                    <input
                      type="text"
                      value={formData.specifications.processor}
                      onChange={(e) => updateFormData('specifications', 'processor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={formData.type === 'computer' ? 'Ex: Intel Core i5-8250U' : 'Ex: A15 Bionic'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Memória RAM
                    </label>
                    <input
                      type="text"
                      value={formData.specifications.ram}
                      onChange={(e) => updateFormData('specifications', 'ram', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Ex: 8GB, 16GB"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Armazenamento
                    </label>
                    <input
                      type="text"
                      value={formData.specifications.storage}
                      onChange={(e) => updateFormData('specifications', 'storage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Ex: 256GB SSD, 1TB HDD"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sistema Operacional
                    </label>
                    <input
                      type="text"
                      value={formData.specifications.operatingSystem}
                      onChange={(e) => updateFormData('specifications', 'operatingSystem', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={formData.type === 'computer' ? 'Ex: Windows 11, macOS' : 'Ex: iOS 15, Android 12'}
                    />
                  </div>

                  {formData.type === 'computer' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placa de Vídeo
                        </label>
                        <input
                          type="text"
                          value={formData.specifications.graphicsCard}
                          onChange={(e) => updateFormData('specifications', 'graphicsCard', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Ex: NVIDIA GTX 1650, Intel HD"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tamanho da Tela
                        </label>
                        <input
                          type="text"
                          value={formData.specifications.screenSize}
                          onChange={(e) => updateFormData('specifications', 'screenSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Ex: 15.6&quot;, 13.3&quot;"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'smartphone' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Câmera
                        </label>
                        <input
                          type="text"
                          value={formData.specifications.cameraResolution}
                          onChange={(e) => updateFormData('specifications', 'cameraResolution', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Ex: 48MP, 12MP + 12MP"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bateria
                        </label>
                        <input
                          type="text"
                          value={formData.specifications.batteryCapacity}
                          onChange={(e) => updateFormData('specifications', 'batteryCapacity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Ex: 3000mAh, 4000mAh"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações Adicionais
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                  placeholder="Informações adicionais sobre o equipamento..."
                />
              </div>

              {/* Grade Preview */}
              <div className={`p-4 rounded-lg border-2 ${(GRADE_CRITERIA[manualGrade as EquipmentGrade] || gradeInfo).color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <h4 className="font-medium">
                    Grade Final: {manualGrade || currentGrade} — {(GRADE_CRITERIA[manualGrade as EquipmentGrade] || gradeInfo).name}
                    {manualGrade && <span className="ml-2 text-xs font-normal bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Manual</span>}
                  </h4>
                </div>
                <p className="text-sm">{(GRADE_CRITERIA[manualGrade as EquipmentGrade] || gradeInfo).description}</p>
              </div>

              {/* Classificação Manual */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useManualGrade"
                    checked={manualGrade !== ''}
                    onChange={(e) => setManualGrade(e.target.checked ? currentGrade : '')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="useManualGrade" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Usar classificação manual (substitui a automática)
                  </label>
                </div>

                {manualGrade !== '' && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {(['A+', 'A', 'B', 'C'] as EquipmentGrade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setManualGrade(g)}
                        className={`py-2 rounded-lg font-bold text-sm border-2 transition-colors ${
                          manualGrade === g
                            ? GRADE_CRITERIA[g].color + ' border-current'
                            : 'border-gray-200 text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={step > 1 ? () => setStep(step - 1) : handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {step > 1 ? 'Anterior' : 'Cancelar'}
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.serialNumber || !formData.brand || !formData.model || (!isEditMode && formData.photosData.length === 0))}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!formData.serialNumber || !formData.brand || !formData.model}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isEditMode ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
            </button>
          )}
        </div>
      </div>

      {/* Componente PhotoCapture */}
      {showPhotoCapture && (
        <PhotoCapture
          isOpen={showPhotoCapture}
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}
    </div>
  );
}