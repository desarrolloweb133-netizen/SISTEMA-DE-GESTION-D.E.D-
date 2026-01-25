import React, { useState, useEffect } from 'react';
import { Save, Palette, Users, BookOpen, Info, ChevronRight, Camera, Eye, EyeOff } from 'lucide-react';
import { ClassEntity } from '../../types';
import { PremiumTimePicker } from '../common/PremiumTimePicker';

interface ClassFormProps {
    onClose: () => void;
    onSave: (classData: Partial<ClassEntity>) => void;
    editingClass?: ClassEntity | null;
}

export const ClassForm: React.FC<ClassFormProps> = ({ onClose, onSave, editingClass }) => {
    const [formData, setFormData] = useState<Partial<ClassEntity>>({
        nombre: '',
        rango_edad: '',
        aula: '',
        horario: '08:45 AM',
        color: '#7C3AED',
        estado: 'activa',
        imagen_url: '',
        mostrar_imagen: true
    });

    useEffect(() => {
        if (editingClass) {
            setFormData(editingClass);
        }
    }, [editingClass]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imagen_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const colors = [
        { name: 'Púrpura', value: '#7C3AED' },
        { name: 'Índigo', value: '#4F46E5' },
        { name: 'Azul', value: '#3B82F6' },
        { name: 'Cian', value: '#06B6D4' },
        { name: 'Esmeralda', value: '#10B981' },
        { name: 'Jade', value: '#059669' },
        { name: 'Lima', value: '#84CC16' },
        { name: 'Ámbar', value: '#F59E0B' },
        { name: 'Naranja', value: '#F97316' },
        { name: 'Rojo', value: '#EF4444' },
        { name: 'Rosa', value: '#EC4899' },
        { name: 'Fucsia', value: '#D946EF' },
        { name: 'Pizarra', value: '#475569' },
        { name: 'Oro de la DED', value: '#D9DF21' },
        { name: 'Azul de la DED', value: '#00ADEF' },
    ];

    return (
        <div className="max-w-[1100px] mx-auto animate-fade-in">
            {/* Breadcrumb Area - Compact */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <span className="cursor-pointer hover:text-premium-purple" onClick={onClose}>Gestión Académica</span>
                <ChevronRight size={10} />
                <span className="text-gray-600">{editingClass ? 'Editar Clase' : 'Nueva Clase'}</span>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                {/* Visual Header - More Compact to avoid scroll */}
                <div className="bg-logo-blue p-3.5 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black leading-tight tracking-tight">
                                {editingClass ? 'Configuración de Clase' : 'Nueva Clase'}
                            </h2>
                            <p className="text-white/80 text-[8px] font-bold uppercase tracking-[0.2em]">Control Académico y Grupos</p>
                        </div>
                    </div>
                </div>

                {/* Form Content - Compact Padding */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Image Section - Scaled Down */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group w-full max-w-xl">
                            <div className="w-full h-40 rounded-[2rem] border-2 border-gray-50 shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center transition-all group-hover:scale-[1.01] duration-500">
                                {formData.imagen_url ? (
                                    <img src={formData.imagen_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-300">
                                        <div className="w-full h-full absolute inset-0 opacity-10" style={{ backgroundColor: formData.color }}></div>
                                        <Camera size={40} className="mb-2 relative z-10 text-gray-300" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 relative z-10">Imagen de Portada</span>
                                    </div>
                                )}
                            </div>

                            <label className="absolute -bottom-2 right-8 p-3 bg-logo-blue text-white rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-all border-2 border-white z-20">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </label>

                            {/* Visibility Toggle - More Compact */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, mostrar_imagen: !formData.mostrar_imagen })}
                                className={`absolute -bottom-2 left-8 px-4 py-3 rounded-xl cursor-pointer shadow-lg hover:scale-105 transition-all border-2 border-white z-20 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${formData.mostrar_imagen ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                            >
                                {formData.mostrar_imagen ? <Eye size={14} /> : <EyeOff size={14} />}
                                {formData.mostrar_imagen ? 'Visible' : 'Oculta'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
                        {/* LEFT COLUMN: Main Info */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-logo-blue uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-blue-50 text-logo-blue rounded-lg flex items-center justify-center border border-blue-100">
                                    <Info size={10} />
                                </div>
                                Detalles de la Clase
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre de la Clase</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                        placeholder="Ej: Primaria Menor B"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Rango de Edad</label>
                                        <div className="relative group">
                                            <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-logo-blue transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-11 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                                placeholder="6-9 años"
                                                value={formData.rango_edad}
                                                onChange={(e) => setFormData({ ...formData, rango_edad: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Aula Asignada</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                            placeholder="Salón 3"
                                            value={formData.aula}
                                            onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Schedule & Palette */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-logo-pink uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-red-50 text-logo-pink rounded-lg flex items-center justify-center border border-red-100">
                                    <Palette size={10} />
                                </div>
                                Configuración Visual
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Horario de Sesión</label>
                                    <PremiumTimePicker
                                        value={formData.horario || ''}
                                        onChange={(time) => setFormData({ ...formData, horario: time })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Color Identificador</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                        {colors.map((c) => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color: c.value })}
                                                className={`w-8 h-8 rounded-xl transition-all relative ${formData.color === c.value
                                                    ? 'scale-110 shadow-md ring-2 ring-white'
                                                    : 'opacity-40 hover:opacity-100'
                                                    }`}
                                                style={{ backgroundColor: c.value }}
                                                title={c.name}
                                            >
                                                {formData.color === c.value && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-white">
                                                        <Save size={12} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
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
                            {editingClass ? 'Actualizar Clase' : 'Guardar Clase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
