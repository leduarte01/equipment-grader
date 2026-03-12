import { useState, useEffect } from 'react';
import { Equipment, EquipmentType, EquipmentGrade, PhysicalCondition, VisualCondition, EquipmentSpecifications, GRADE_CRITERIA } from '@/types/equipment';
import { X, Monitor, Smartphone, AlertCircle, CheckCircle, Camera, Image } from 'lucide-react';
import PhotoCapture from './PhotoCapture';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function AddEquipmentModal({ isOpen, onClose, onAdd }: AddEquipmentModalProps) {
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [formData, setFormData] = useState({
    serialNumber: '',
    type: 'computer' as EquipmentType,
    brand: '',
    model: '',
    notes: '',
    photoUrl: '',
    photoData: '',
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

  // Cleanup quando o modal for fechado
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPhotoPreview('');
      setShowPhotoCapture(false);
    }
  }, [isOpen]);

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
    setPhotoPreview(photoData);
    setFormData(prev => ({ ...prev, photoUrl: photoData, photoData }));
    setShowPhotoCapture(false);
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setFormData(prev => ({ ...prev, photoUrl: '' }));
  };

  const handleSubmit = () => {
    const grade = calculateGrade();
    const equipment = {
      serialNumber: formData.serialNumber,
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      grade,
      physical: formData.physical,
      visual: formData.visual,
      specifications: formData.specifications,
      notes: formData.notes || undefined,
      photoUrl: formData.photoUrl || undefined,
      photoData: formData.photoData || undefined,
    };
    
    onAdd(equipment);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setPhotoPreview('');
    setShowPhotoCapture(false);
    setFormData({
      serialNumber: '',
      type: 'computer',
      brand: '',
      model: '',
      notes: '',
      photoUrl: '',
      photoData: '',
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
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Adicionar Equipamento</h2>
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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

              {/* Captura de Foto — só aparece quando todos os campos acima estão preenchidos */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Foto do Equipamento <span className="text-red-500">*</span></h4>
                
                {!formData.serialNumber || !formData.brand || !formData.model ? (
                  <p className="text-sm text-gray-400 italic">Preencha o número de série, marca e modelo para habilitar a foto.</p>
                ) : !photoPreview && (
                  <div className="flex justify-center">
                    <div className="w-full max-w-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                        Tirar Foto do Equipamento
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                        <button
                          type="button"
                          onClick={() => setShowPhotoCapture(true)}
                          className="cursor-pointer w-full"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <Camera className="w-12 h-12 text-gray-400" />
                            <span className="text-lg font-medium text-gray-700">
                              Usar Câmera
                            </span>
                            <span className="text-sm text-gray-500">
                              Capturar foto em tempo real
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview da Foto Capturada */}
                {(formData.serialNumber && formData.brand && formData.model) && photoPreview && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto Capturada
                      </label>
                      <img
                        src={photoPreview}
                        alt="Preview do equipamento"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Vinculada ao S/N: {formData.serialNumber || 'Não informado'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col justify-center space-y-3">
                      <button
                        type="button" 
                        onClick={() => setShowPhotoCapture(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 justify-center"
                      >
                        <Camera className="w-4 h-4" />
                        Nova Foto
                      </button>
                      
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2 justify-center"
                      >
                        <X className="w-4 h-4" />
                        Remover Foto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grade Preview em Tempo Real */}
              <div className={`p-4 rounded-lg border-2 ${gradeInfo.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <h4 className="font-medium">Grade Prevista: {currentGrade} - {gradeInfo.name}</h4>
                </div>
                <p className="text-sm">{gradeInfo.description}</p>
                <p className="text-xs text-gray-600 mt-2">
                  *Grade será atualizada conforme você preencher as condições físicas e visuais
                </p>
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

              {/* Grade Preview */}
              <div className={`p-4 rounded-lg border-2 ${gradeInfo.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <h4 className="font-medium">Grade Atual: {currentGrade} - {gradeInfo.name}</h4>
                </div>
                <p className="text-sm">{gradeInfo.description}</p>
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

              {/* Grade Preview */}
              <div className={`p-4 rounded-lg border-2 ${gradeInfo.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <h4 className="font-medium">Grade Atual: {currentGrade} - {gradeInfo.name}</h4>
                </div>
                <p className="text-sm">{gradeInfo.description}</p>
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
              <div className={`p-4 rounded-lg border-2 ${gradeInfo.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <h4 className="font-medium">Grade Final: {currentGrade} - {gradeInfo.name}</h4>
                </div>
                <p className="text-sm">{gradeInfo.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={step > 1 ? () => setStep(step - 1) : handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {step > 1 ? 'Anterior' : 'Cancelar'}
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.serialNumber || !formData.brand || !formData.model || !formData.photoData)}
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
              Cadastrar Equipamento
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