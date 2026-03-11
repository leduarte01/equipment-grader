import { Equipment } from '@/types/equipment';
import { Monitor, Smartphone, TrendingUp, Package } from 'lucide-react';

interface StatsOverviewProps {
  equipment: Equipment[];
}

export default function StatsOverview({ equipment }: StatsOverviewProps) {
  const stats = {
    total: equipment.length,
    computers: equipment.filter(eq => eq.type === 'computer').length,
    smartphones: equipment.filter(eq => eq.type === 'smartphone').length,
    functional: equipment.filter(eq => eq.physical.functioning).length,
    byGrade: {
      'A+': equipment.filter(eq => eq.grade === 'A+').length,
      'A': equipment.filter(eq => eq.grade === 'A').length,
      'B': equipment.filter(eq => eq.grade === 'B').length,
      'C': equipment.filter(eq => eq.grade === 'C').length,
    }
  };

  const gradeColors = {
    'A+': 'bg-green-100 text-green-800 border-green-200',
    'A': 'bg-green-50 text-green-700 border-green-200',
    'B': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'C': 'bg-orange-50 text-orange-700 border-orange-200',
  };

  if (equipment.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Inventário</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Equipment */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mx-auto mb-2">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>

        {/* Computers */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mx-auto mb-2">
            <Monitor className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.computers}</div>
          <div className="text-sm text-gray-600">Computadores</div>
        </div>

        {/* Smartphones */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mx-auto mb-2">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.smartphones}</div>
          <div className="text-sm text-gray-600">Smartphones</div>
        </div>

        {/* Functional */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg mx-auto mb-2">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.functional}</div>
          <div className="text-sm text-gray-600">Funcionais</div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Distribuição por Grades</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(stats.byGrade).map(([grade, count]) => (
            <div
              key={grade}
              className={`px-3 py-2 rounded-lg border text-sm font-medium ${gradeColors[grade as keyof typeof gradeColors]}`}
            >
              Grade {grade}: {count}
            </div>
          ))}
        </div>

        {/* Percentage bar */}
        <div className="mt-3">
          <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
            {Object.entries(stats.byGrade).map(([grade, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const colors = {
                'A+': 'bg-green-500',
                'A': 'bg-green-400',
                'B': 'bg-yellow-400',
                'C': 'bg-orange-400',
              };
              
              return percentage > 0 ? (
                <div
                  key={grade}
                  className={colors[grade as keyof typeof colors]}
                  style={{ width: `${percentage}%` }}
                  title={`Grade ${grade}: ${count} (${percentage.toFixed(1)}%)`}
                />
              ) : null;
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Melhor qualidade</span>
            <span>Menor qualidade</span>
          </div>
        </div>
      </div>
    </div>
  );
}