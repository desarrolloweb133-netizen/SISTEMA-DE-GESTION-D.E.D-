import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Users, Info, Save, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { getClasses } from '../../services/supabaseClient';
import { PremiumDatePicker } from '../common/PremiumDatePicker';

interface EventFormProps {
    onClose: () => void;
    onSave: (data: Partial<CalendarEvent>) => void;
    editingEvent?: CalendarEvent | null;
    initialDate?: Date | null;
}

export const EventForm: React.FC<EventFormProps> = ({
    onClose, onSave, editingEvent, initialDate
}) => {
    const [formData, setFormData] = useState<Partial<CalendarEvent>>({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        tipo: 'clase',
        clase_id: '',
        habilitado: false
    });

    const [classes, setClasses] = useState<{ id: string, nombre: string }[]>([]);

    useEffect(() => {
        loadClasses();
        if (editingEvent) {
            setFormData({
                ...editingEvent,
                fecha_inicio: editingEvent.fecha_inicio.split('T')[0],
                habilitado: editingEvent.habilitado ?? false
            });
        } else if (initialDate) {
            const year = initialDate.getFullYear();
            const month = String(initialDate.getMonth() + 1).padStart(2, '0');
            const day = String(initialDate.getDate()).padStart(2, '0');
            setFormData({
                titulo: '',
                descripcion: '',
                fecha_inicio: `${year}-${month}-${day}`,
                tipo: 'clase',
                clase_id: '',
                habilitado: false
            });
        }
    }, [editingEvent, initialDate]);

    const loadClasses = async () => {
        const data = await getClasses();
        setClasses(data.map(c => ({ id: c.id, nombre: c.nombre })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fecha_inicio) {
            alert('Por favor selecciona una fecha de ejecución.');
            return;
        }

        const finalData = {
            ...formData,
            clase_id: formData.clase_id === 'todas' || !formData.clase_id ? null : formData.clase_id
        };

        onSave(finalData);
    };

    return (
        <div className="max-w-[1100px] mx-auto animate-fade-in">
            {/* Breadcrumb Area - Compact */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <span className="cursor-pointer hover:text-premium-purple" onClick={onClose}>Calendario Local</span>
                <ChevronRight size={10} />
                <span className="text-gray-600">{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</span>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                {/* Visual Header - More Compact to avoid scroll */}
                <div className="bg-logo-blue p-3.5 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black leading-tight tracking-tight">
                                {editingEvent ? 'Gestión de Evento' : 'Programar Evento'}
                            </h2>
                            <p className="text-white/80 text-[8px] font-bold uppercase tracking-[0.2em]">Planificación y Estratégica</p>
                        </div>
                    </div>
                </div>

                {/* Form Content - Compact Padding */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
                        {/* LEFT COLUMN: Main Info */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-logo-blue uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-blue-50 text-logo-blue rounded-lg flex items-center justify-center border border-blue-100">
                                    <Info size={10} />
                                </div>
                                Detalles Primarios
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Título del Evento</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                        placeholder="Ej: Retiro Espiritual"
                                        value={formData.titulo}
                                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Fecha de Ejecución</label>
                                    <PremiumDatePicker
                                        value={formData.fecha_inicio || ''}
                                        onChange={(date) => setFormData({ ...formData, fecha_inicio: date })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Classification */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-logo-pink uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-red-50 text-logo-pink rounded-lg flex items-center justify-center border border-red-100">
                                    <Tag size={10} />
                                </div>
                                Clasificación
                            </h3>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Categoría</label>
                                        <div className="relative group">
                                            <select
                                                required
                                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 appearance-none shadow-inner cursor-pointer"
                                                value={formData.tipo}
                                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                            >
                                                <option value="clase">Clase</option>
                                                <option value="asistencia">Sesión de Asistencia</option>
                                                <option value="evento_especial">Evento</option>
                                                <option value="actividad">Actividad</option>
                                            </select>
                                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Clase Vinculada</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 appearance-none shadow-inner cursor-pointer"
                                                value={formData.clase_id || ''}
                                                onChange={(e) => setFormData({ ...formData, clase_id: e.target.value })}
                                            >
                                                <option value="">Ninguna</option>
                                                <option value="todas">Todas las clases</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                                ))}
                                            </select>
                                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {formData.tipo === 'asistencia' && (
                                    <div className="flex items-center justify-between p-4 bg-logo-blue/5 rounded-2xl border border-logo-blue/10">
                                        <div>
                                            <p className="text-sm font-black text-logo-blue">Activar Sesión</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Permitir registros ahora</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, habilitado: !formData.habilitado })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.habilitado ? 'bg-logo-blue' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.habilitado ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Descripción del Evento</label>
                                    <textarea
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all h-20 resize-none font-bold text-sm text-gray-600 shadow-inner placeholder:font-normal"
                                        placeholder="Información relevante, ubicación..."
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Area - Compact */}
                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-logo-blue text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] transition-all shadow-xl shadow-blue-200 flex items-center gap-2 active:scale-[0.98]"
                        >
                            <Save size={16} />
                            {editingEvent ? 'Actualizar Evento' : 'Guardar Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
