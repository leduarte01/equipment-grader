'use client';

import { useState, useEffect } from 'react';
import { Equipment, EquipmentSearch } from '@/types/equipment';
import { EquipmentDatabase } from '@/lib/database';
import EquipmentCard from '@/components/EquipmentCard';
import AddEquipmentModal from '@/components/AddEquipmentModal';
import SearchBar from '@/components/SearchBar';
import SerialScanner from '@/components/SerialScanner';
import StatsOverview from '@/components/StatsOverview';
import { Plus, Search, Camera } from 'lucide-react';

export default function HomePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<EquipmentSearch>({});
  const [loading, setLoading] = useState(true);

  const db = EquipmentDatabase.getInstance();

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchCriteria]);

  const loadEquipment = async () => {
    try {
      const data = await db.getAllEquipment();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = async () => {
    try {
      const filtered = await db.searchEquipment(searchCriteria);
      setFilteredEquipment(filtered);
    } catch (error) {
      console.error('Failed to filter equipment:', error);
      setFilteredEquipment(equipment);
    }
  };

  const handleAddEquipment = async (newEquipment: any) => {
    try {
      await db.addEquipment(newEquipment);
      await loadEquipment();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add equipment:', error);
    }
  };

  const handleSerialFound = async (serialNumber: string) => {
    const foundEquipment = await db.getEquipmentBySerialNumber(serialNumber);
    if (foundEquipment) {
      setSearchCriteria({ query: serialNumber });
    } else {
      alert(`Equipamento com série ${serialNumber} não encontrado.`);
    }
    setIsScannerOpen(false);
  };

  const handleUpdateEquipment = async (id: string, updates: any) => {
    try {
      await db.updateEquipment(id, updates);
      await loadEquipment();
    } catch (error) {
      console.error('Failed to update equipment:', error);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      await db.deleteEquipment(id);
      await loadEquipment();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando equipamentos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Validação de Equipamentos
          </h1>
          <p className="text-gray-600">
            Gerencie e classifique computadores e smartphones com sistema de grades
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview equipment={equipment} />

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <SearchBar 
                onSearch={setSearchCriteria}
                initialCriteria={searchCriteria}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Escanear
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEquipment.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg">
                {equipment.length === 0 
                  ? 'Nenhum equipamento cadastrado ainda.'
                  : 'Nenhum equipamento encontrado com os critérios de busca.'
                }
              </div>
              {equipment.length === 0 && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Equipamento
                </button>
              )}
            </div>
          ) : (
            filteredEquipment.map((eq) => (
              <EquipmentCard
                key={eq.id}
                equipment={eq}
                onUpdate={handleUpdateEquipment}
                onDelete={handleDeleteEquipment}
              />
            ))
          )}
        </div>

        {/* Modals */}
        <AddEquipmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddEquipment}
        />

        <SerialScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onSerialFound={handleSerialFound}
        />
      </div>
    </div>
  );
}
