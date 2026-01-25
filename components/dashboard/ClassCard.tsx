import React, { useState, useRef } from 'react';
import { Users, TrendingUp, BookOpen, MoreVertical } from 'lucide-react';
import { ClassEntity } from '../../types';

interface ClassCardProps {
    classData: ClassEntity;
    stats?: {
        total_alumnos: number;
        asistencia_promedio: number;
        docente_nombre?: string;
    };
    onClick: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ classData, stats, onClick }) => {
    const backgroundColor = classData.color || '#3B82F6';
    const isActive = classData.estado === 'activa';

    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const bounds = cardRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative rounded-[2rem] p-[2px] bg-gray-100 hover:bg-transparent shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer active:scale-[0.99] overflow-hidden"
        >
            {/* Hover Gradient Blob */}
            {isHovered && (
                <div
                    className="pointer-events-none absolute blur-[80px] bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#D9DF21] opacity-60 w-80 h-80 z-0 transition-opacity duration-500"
                    style={{
                        top: mousePos.y - 160,
                        left: mousePos.x - 160,
                    }}
                />
            )}

            {/* Inner Content Card */}
            <div className="relative z-10 bg-white rounded-[calc(2rem-2px)] overflow-hidden flex flex-col w-full">
                {/* Header Image/Color */}
                <div
                    className="h-40 relative overflow-hidden"
                    style={{
                        background: (classData.imagen_url && (classData.mostrar_imagen ?? true))
                            ? `url(${classData.imagen_url}) center/cover`
                            : `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`,
                    }}
                >
                    {/* Overlay for better text readability */}
                    <div className={`absolute inset-0 transition-colors duration-500 ${(classData.imagen_url && (classData.mostrar_imagen ?? true)) ? 'bg-black/20 group-hover:bg-black/10' : ''}`}></div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <span
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${isActive
                                ? 'bg-[#D9DF21] text-[#414042]'
                                : 'bg-gray-500/80 text-white'
                                }`}
                        >
                            {isActive ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <h3 className="text-white font-black text-xl leading-tight group-hover:translate-y-[-2px] transition-transform duration-500">{classData.nombre}</h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* Age Range & Details */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl text-gray-500 border border-gray-100">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{classData.rango_edad}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-auto grid grid-cols-2 gap-4">
                        {/* Students Count */}
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-[#00ADEF]/20 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-3.5 h-3.5 text-[#00ADEF]" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alumnos</p>
                            </div>
                            <p className="text-xl font-black text-[#414042]">{stats?.total_alumnos || 0}</p>
                        </div>

                        {/* Attendance Average */}
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-[#D9DF21]/20 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-3.5 h-3.5 text-[#D9DF21]" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asistencia</p>
                            </div>
                            <p className="text-xl font-black text-[#414042]">
                                {stats?.asistencia_promedio ? `${stats.asistencia_promedio}%` : '0%'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
