import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, ClipboardCheck, Users, BarChart3, Search } from 'lucide-react';
import { ClassCard } from '../components/dashboard/ClassCard';
import { ClassForm } from '../components/dashboard/ClassForm';
import { ClassEntity, DashboardStats } from '../types';
import { useNotification } from '../context/NotificationContext';

interface DashboardProps {
    classes: ClassEntity[];
    stats: DashboardStats;
    onClassClick: (classId: string) => void;
    onAddClass: (classData: Partial<ClassEntity>) => void;
    onUpdateClass: (id: string, classData: Partial<ClassEntity>) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    classes,
    stats,
    onClassClick,
    onAddClass,
    onUpdateClass,
    searchTerm,
    onSearchChange
}) => {
    const [filteredClasses, setFilteredClasses] = useState<ClassEntity[]>(classes);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingClass, setEditingClass] = useState<ClassEntity | null>(null);
    const { triggerSuccess, showNotification } = useNotification();

    useEffect(() => {
        let result = [...classes];
        if (searchTerm) {
            result = result.filter((c) =>
                c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort by Age Range (Numeric)
        result.sort((a, b) => {
            const getMinAge = (range: string) => {
                if (!range) return 999;
                const match = range.match(/(\d+)/);
                return match ? parseInt(match[0]) : 999;
            };
            return getMinAge(a.rango_edad) - getMinAge(b.rango_edad);
        });

        setFilteredClasses(result);
    }, [classes, searchTerm]);

    if (view === 'form') {
        return (
            <ClassForm
                onClose={() => setView('list')}
                editingClass={editingClass}
                onSave={(data) => {
                    if (editingClass) {
                        onUpdateClass(editingClass.id, data);
                    } else {
                        onAddClass(data);
                    }
                    setView('list');
                }}
            />
        );
    }

    const statCards = [
        { label: 'Total Clases', value: stats.totalClasses, icon: LayoutDashboard, color: '#00ADEF', bg: 'rgba(0, 173, 239, 0.08)' },
        { label: 'Total Docentes', value: stats.totalTeachers, icon: ClipboardCheck, color: '#D9DF21', bg: 'rgba(217, 223, 33, 0.08)' },
        { label: 'Total Alumnos', value: stats.totalStudents, icon: Users, color: '#BE1E2D', bg: 'rgba(190, 30, 45, 0.08)' },
        { label: 'Asistencia Día', value: `${stats.attendanceRate}%`, icon: BarChart3, color: '#414042', bg: 'rgba(65, 64, 66, 0.08)' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#414042]">Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Gestión General • Escuela Dominical</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClass(null);
                        setView('form');
                    }}
                    className="flex items-center gap-2 bg-[#D9DF21] text-[#414042] px-8 py-3.5 rounded-2xl hover:bg-[#C4CB1D] transition-all shadow-lg shadow-yellow-500/10 font-bold text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Clase
                </button>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: stat.bg, color: stat.color }}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[2px]">{stat.label}</p>
                            <p className="text-3xl font-black text-[#414042] mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Classes Grid */}
            {filteredClasses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredClasses.map((classData) => (
                        <div key={classData.id} className="animate-fade-in">
                            <ClassCard
                                classData={classData}
                                stats={classData.stats}
                                onClick={() => onClassClick(classData.id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#414042] mb-2">No se encontraron clases</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        {searchTerm
                            ? 'Intenta ajustar los criterios de búsqueda para encontrar lo que buscas.'
                            : 'Parece que aún no hay clases registradas. ¡Comienza creando la primera!'}
                    </p>
                </div>
            )}

        </div>
    );
};
