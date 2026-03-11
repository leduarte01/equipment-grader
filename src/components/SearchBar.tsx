import { useState, useEffect } from 'react';
import { EquipmentSearch, EquipmentType, EquipmentGrade } from '@/types/equipment';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (criteria: EquipmentSearch) => void;
  initialCriteria: EquipmentSearch;
}

export default function SearchBar({ onSearch, initialCriteria }: SearchBarProps) {
  const [criteria, setCriteria] = useState<EquipmentSearch>(initialCriteria);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setCriteria(initialCriteria);
  }, [initialCriteria]);

  const handleSearch = () => {
    onSearch(criteria);
  };

  const handleClear = () => {
    const empty: EquipmentSearch = {};
    setCriteria(empty);
    onSearch(empty);
    setShowFilters(false);
  };

  const handleQueryChange = (query: string) => {
    const newCriteria = { ...criteria, query: query || undefined };
    setCriteria(newCriteria);
    onSearch(newCriteria);
  };

  const handleFilterChange = (key: keyof EquipmentSearch, value: string) => {
    const newCriteria = { 
      ...criteria, 
      [key]: value || undefined 
    };
    setCriteria(newCriteria);
    onSearch(newCriteria);
  };

  const hasActiveFilters = !!(criteria.type || criteria.grade || criteria.brand);

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por número de série, marca, modelo..."
            value={criteria.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {criteria.query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {[criteria.type, criteria.grade, criteria.brand].filter(Boolean).length}
            </span>
          )}
        </button>
        
        {(criteria.query || hasActiveFilters) && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Equipment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Equipamento
              </label>
              <select
                value={criteria.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="computer">Computadores</option>
                <option value="smartphone">Smartphones</option>
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                value={criteria.grade || ''}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Todas as grades</option>
                <option value="A+">Grade A+ (Como Novo)</option>
                <option value="A">Grade A (Muito Bom)</option>
                <option value="B">Grade B (Bom)</option>
                <option value="C">Grade C (Aceitável)</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                placeholder="Ex: Apple, Samsung, Dell..."
                value={criteria.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Quick filters */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Filtros Rápidos:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('grade', 'A+')}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  criteria.grade === 'A+'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Apenas A+
              </button>
              <button
                onClick={() => handleFilterChange('type', 'smartphone')}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  criteria.type === 'smartphone'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Só Smartphones
              </button>
              <button
                onClick={() => handleFilterChange('type', 'computer')}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  criteria.type === 'computer'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Só Computadores
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}