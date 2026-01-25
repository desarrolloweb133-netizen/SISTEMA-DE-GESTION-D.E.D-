import React, { useState, useEffect } from 'react';
import { Save, GraduationCap, Phone, Info, Trash2, Camera, UserPlus, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { ClassEntity, Teacher } from '../../types';
import { getTeachers, updateTeacher, updateClass, deleteClass } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

interface ClassSettingsProps {
    classData: ClassEntity;
    onUpdate: () => void;
    onDelete: () => void;
}

export const ClassSettings: React.FC<ClassSettingsProps> = ({ classData, onUpdate, onDelete }) => {
    const { showNotification, triggerSuccess } = useNotification();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<ClassEntity>>({
        nombre: classData.nombre,
        rango_edad: classData.rango_edad,
        aula: classData.aula || '',
        horario: classData.horario || '',
        imagen_url: classData.imagen_url || '',
        color: classData.color || '#3B82F6',
        mostrar_imagen: classData.mostrar_imagen ?? true
    });

    // Danger Zone State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        const data = await getTeachers();
        setTeachers(data);
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await updateClass(classData.id, formData);
            showNotification('Configuración de clase actualizada', 'success');
            onUpdate();
        } catch (error) {
            console.error('Error updating class:', error);
            showNotification('Error al actualizar la clase', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTeacher = async (teacherId: string) => {
        try {
            await updateTeacher(teacherId, { clase: classData.nombre });
            showNotification('Docente asignado correctamente', 'success');
            loadTeachers();
        } catch (error) {
            console.error('Error assigning teacher:', error);
            showNotification('Error al asignar docente', 'error');
        }
    };

    const handleRemoveTeacher = async (teacherId: string) => {
        if (!window.confirm('¿Seguro de remover este docente de la clase?')) return;
        try {
            await updateTeacher(teacherId, { clase: '' });
            showNotification('Docente removido de la clase', 'success');
            loadTeachers();
        } catch (error) {
            console.error('Error removing teacher:', error);
            showNotification('Error al remover docente', 'error');
        }
    };

    const handleDeleteClass = async () => {
        try {
            setLoading(true);
            await deleteClass(classData.id);
            // Additionally, unassign all teachers from this class
            const assignedTeachers = teachers.filter(t => t.clase === classData.nombre);
            for (const t of assignedTeachers) {
                await updateTeacher(t.id, { clase: '' });
            }
            onDelete();
        } catch (error) {
            console.error('Error deleting class:', error);
            showNotification('Error al eliminar la clase', 'error');
            setLoading(false);
        }
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

    const assignedTeachers = teachers.filter(t => t.clase === classData.nombre);
    const availableTeachers = teachers.filter(t => !t.clase || t.clase === '' || t.clase === 'General');

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
        <div className="space-y-12 animate-fade-in pb-12">

            {/* General Info Section */}
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Info size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black leading-tight">Información General</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Detalles Principales</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdateDetails} className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Photo */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2rem] border-4 border-gray-50 shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                                {formData.imagen_url ? (
                                    <img src={formData.imagen_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full" style={{ backgroundColor: formData.color || '#3B82F6' }}></div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-3 bg-[#00ADEF] text-white rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-all border-4 border-white z-10">
                                <Camera size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </label>

                            {/* Visibility Toggle */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, mostrar_imagen: !formData.mostrar_imagen })}
                                className={`absolute -bottom-2 -left-2 p-3 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-all border-4 border-white z-10 ${formData.mostrar_imagen ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}
                                title={formData.mostrar_imagen ? 'Imagen visible en tarjeta' : 'Imagen oculta en tarjeta'}
                            >
                                {formData.mostrar_imagen ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[2px]">Foto de Portada</p>
                    </div>

                    {/* Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nombre de la Clase</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Rango de Edad</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    value={formData.rango_edad}
                                    onChange={(e) => setFormData({ ...formData, rango_edad: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Aula Asignada</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    value={formData.aula}
                                    onChange={(e) => setFormData({ ...formData, aula: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Horario Regular</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    value={formData.horario}
                                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Color Identificador</label>
                                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 shadow-inner">
                                    {colors.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: c.value })}
                                            className={`w-10 h-10 rounded-xl transition-all relative ${formData.color === c.value
                                                ? 'scale-110 shadow-md ring-2 ring-white z-10'
                                                : 'opacity-40 hover:opacity-100'
                                                }`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        >
                                            {formData.color === c.value && (
                                                <div className="absolute inset-0 flex items-center justify-center text-white">
                                                    <Save size={14} strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-[#00ADEF] text-white rounded-2xl hover:bg-[#0090C1] transition-all font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 uppercase tracking-wide disabled:opacity-50"
                            >
                                <Save size={16} />
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            {/* Teacher Management Section */}
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black leading-tight">Cuerpo Docente</h3>
                            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Maestros Asignados</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Add Teacher Area */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <h4 className="text-sm font-black text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <UserPlus size={16} />
                            Inscribir Nuevo Docente
                        </h4>
                        <div className="flex gap-4">
                            <select
                                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none font-medium text-sm text-gray-600 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.value) handleAssignTeacher(e.target.value);
                                    e.target.value = '';
                                }}
                            >
                                <option value="">Seleccionar un docente disponible...</option>
                                {availableTeachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido} - {t.rol}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Assigned Teachers List */}
                    <div className="space-y-4">
                        {assignedTeachers.length > 0 ? (
                            assignedTeachers.map(teacher => (
                                <div key={teacher.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shadow-sm">
                                            {teacher.foto_url ? (
                                                <img src={teacher.foto_url} alt={teacher.nombre} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-purple-500 font-black">{teacher.nombre[0]}</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{teacher.nombre} {teacher.apellido}</p>
                                            <p className="text-xs text-gray-400 capitalize">{teacher.rol}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveTeacher(teacher.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Remover de la clase"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-gray-400 text-sm font-medium italic">No hay docentes asignados a esta clase actualmente.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-red-900 mb-1">Zona de Peligro</h3>
                        <p className="text-sm text-red-700/80 mb-6">
                            Eliminar esta clase borrará toda la información asociada, pero no eliminará a los docentes (serán desasignados). Esta acción no se puede deshacer.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-6 py-3 bg-white border border-red-200 text-red-600 font-bold text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm uppercase tracking-wide"
                            >
                                Eliminar Clase Permanentemente
                            </button>
                        ) : (
                            <div className="flex items-center gap-4 animate-scale-in">
                                <span className="text-sm font-bold text-red-800">¿Estás absolutamente seguro?</span>
                                <button
                                    onClick={handleDeleteClass}
                                    className="px-6 py-3 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-all shadow-lg uppercase tracking-wide"
                                >
                                    Sí, Eliminar
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-3 text-red-600 font-bold text-xs hover:bg-red-100 rounded-xl transition-all uppercase tracking-wide"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};
