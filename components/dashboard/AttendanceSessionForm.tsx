import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Info, Save, X, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { CalendarEvent, ClassEntity } from '../../types';
import { getClasses } from '../../services/supabaseClient';
import { PremiumDatePicker } from '../common/PremiumDatePicker';

interface AttendanceSessionFormProps {
    onClose: () => void;
    onSave: (data: Partial<CalendarEvent>) => void;
    initialData?: CalendarEvent | null;
}

export const AttendanceSessionForm: React.FC<AttendanceSessionFormProps> = ({
    onClose, onSave, initialData
}) => {
    const [formData, setFormData] = useState<Partial<CalendarEvent>>({
        titulo: '',
        descripcion: 'Registro de asistencia',
        fecha_inicio: new Date().toISOString().split('T')[0],
        tipo: 'asistencia',
        clase_id: '',
        habilitado: false
    });

    // Separate time state for easier management
    const [startTime, setStartTime] = useState('09:00');

    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(true);

    useEffect(() => {
        loadClasses();
        if (initialData) {
            const date = new Date(initialData.fecha_inicio);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            setFormData({
                ...initialData,
                fecha_inicio: initialData.fecha_inicio.split('T')[0]
            });
            setStartTime(`${hours}:${minutes}`);
        }
    }, [initialData]);

    const loadClasses = async () => {
        try {
            const data = await getClasses();
            setClasses(data);
        } catch (error) {
            console.error("Error loading classes:", error);
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Combine date and time
        const combinedDateTime = `${formData.fecha_inicio}T${startTime}:00`;

        const finalData = {
            ...formData,
            fecha_inicio: combinedDateTime,
            clase_id: formData.clase_id === 'todas' || !formData.clase_id ? null : formData.clase_id
        };

        onSave(finalData);
    };

    return (
        <div className="w-full animate-fade-in pb-12">
            {/* Breadcrumb Area */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">
                <span>Gestión de Asistencias</span>
                <ChevronRight size={10} className="text-gray-300" />
                <span className="text-gray-600">{initialData ? 'Editar Sesión' : 'Programar Sesión'}</span>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-logo-blue p-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black leading-tight tracking-tight">
                                {initialData ? 'Editar Sesión de Asistencia' : 'Programar Nueva Sesión'}
                            </h2>
                            <p className="text-white/80 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">Control y planificación dominical</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side: Session Info */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-logo-blue uppercase tracking-[2px] flex items-center gap-2 mb-4">
                                <span className="w-5 h-5 bg-blue-50 text-logo-blue rounded-lg flex items-center justify-center border border-blue-100 italic">i</span>
                                Información de Sesión
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Título de la Sesión</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Registro Dominical Principal"
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-logo-blue/10 focus:bg-white outline-none transition-all font-bold text-sm text-gray-700 shadow-inner"
                                        value={formData.titulo}
                                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Vincular a Clase</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-logo-blue/10 focus:bg-white outline-none transition-all font-bold text-sm text-gray-700 shadow-inner cursor-pointer appearance-none"
                                            value={formData.clase_id || ''}
                                            onChange={(e) => setFormData({ ...formData, clase_id: e.target.value })}
                                        >
                                            <option value="">Seleccionar Clase...</option>
                                            <option value="todas">Todas las Clases (Sesión Global)</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <ChevronRight size={14} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Date & Time */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-logo-blue uppercase tracking-[2px] flex items-center gap-2 mb-4">
                                <span className="w-5 h-5 bg-blue-50 text-logo-blue rounded-lg flex items-center justify-center border border-blue-100 italic">@</span>
                                Programación Temporal
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Fecha</label>
                                    <PremiumDatePicker
                                        value={formData.fecha_inicio || ''}
                                        onChange={(date) => setFormData({ ...formData, fecha_inicio: date })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Hora de Inicio</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-5 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/10 focus:bg-white outline-none transition-all font-bold text-sm text-gray-700 shadow-inner appearance-none"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                                            <Clock size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-blue-50/30 rounded-3xl border border-blue-100/50 flex items-start gap-4">
                                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-logo-blue shadow-sm border border-blue-100 shrink-0">
                                    <Info size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-logo-blue uppercase tracking-widest mb-0.5">Estado de Activación</p>
                                    <p className="text-[10px] text-gray-500 font-bold leading-tight">
                                        {initialData
                                            ? "Los cambios se guardarán pero el estado de habilitación se mantendrá como está actualmente."
                                            : "La sesión se guardará como deshabilitada por defecto para que puedas activarla cuando estés listo."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-8 pt-4 border-t border-gray-50 flex flex-col sm:flex-row justify-end items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-8 py-3 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-3 bg-[#D9DF21] text-[#414042] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#D9DF21]/20 hover:scale-[1.02] hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-3 active:scale-98"
                        >
                            <Save size={16} />
                            {initialData ? 'ACTUALIZAR SESIÓN' : 'PROGRAMAR Y GUARDAR SESIÓN'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
