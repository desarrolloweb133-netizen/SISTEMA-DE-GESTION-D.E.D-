import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface ClassFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    ageFilter: string;
    onAgeFilterChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
}

export const ClassFilters: React.FC<ClassFiltersProps> = ({
    searchTerm,
    onSearchChange,
    ageFilter,
    onAgeFilterChange,
    sortBy,
    onSortChange,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Búsqueda rápida</label>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#00ADEF] transition-colors" />
                    <input
                        type="text"
                        placeholder="Nombre de la clase..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#00ADEF]/10 focus:border-[#00ADEF] focus:bg-white transition-all font-medium"
                    />
                </div>
            </div>

            {/* Age Filter */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Rango de Edad</label>
                <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#D9DF21] transition-colors" />
                    <select
                        value={ageFilter}
                        onChange={(e) => onAgeFilterChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#D9DF21]/10 focus:border-[#D9DF21] focus:bg-white transition-all appearance-none font-medium cursor-pointer"
                    >
                        <option value="">Todas las edades</option>
                        <option value="0-2">Cunero (0-2 años)</option>
                        <option value="3-5">Pre-escolares (3-5 años)</option>
                        <option value="6-9">Primaria menor (6-9 años)</option>
                        <option value="10-14">Primaria mayor (10-14 años)</option>
                        <option value="15+">Adolescentes (15+ años)</option>
                    </select>
                </div>
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ordenar por</label>
                <div className="relative group">
                    <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#BE1E2D] transition-colors" />
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#BE1E2D]/10 focus:border-[#BE1E2D] focus:bg-white transition-all appearance-none font-medium cursor-pointer"
                    >
                        <option value="nombre">Orden Alfabético</option>
                        <option value="alumnos">Mayor cantidad de alumnos</option>
                        <option value="asistencia">Mejor asistencia</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
