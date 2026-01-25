import React, { useState, useEffect } from 'react';
import { Save, GraduationCap, Phone, Info, Tag, Camera, Mail, Briefcase, ChevronRight, Lock, RefreshCw, Copy } from 'lucide-react';
import { Teacher, ClassEntity } from '../../types';
import { getClasses } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

interface TeacherFormProps {
    onClose: () => void;
    onSave: (teacherData: Partial<Teacher>) => void;
    editingTeacher?: Teacher | null;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
    onClose, onSave, editingTeacher
}) => {
    const { showNotification } = useNotification();
    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [formData, setFormData] = useState<Partial<Teacher>>({
        nombre: '',
        apellido: '',
        cedula: '',
        clase: '',
        rol: 'docente',
        telefono: '',
        email: '',
        foto_url: '',
        password: '',
        estado: 'activo'
    });

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (editingTeacher) {
            setFormData(editingTeacher);
        } else {
            setFormData({
                nombre: '',
                apellido: '',
                cedula: '',
                clase: '',
                rol: 'docente',
                telefono: '',
                email: '',
                foto_url: '',
                password: '',
                estado: 'activo'
            });
        }
    }, [editingTeacher]);

    const loadClasses = async () => {
        const data = await getClasses();
        setClasses(data);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, foto_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-[1100px] mx-auto animate-fade-in">
            {/* Breadcrumb Area - Compact */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <span className="cursor-pointer hover:text-premium-purple" onClick={onClose}>Cuerpo Docente</span>
                <ChevronRight size={10} />
                <span className="text-gray-600">{editingTeacher ? 'Editar Docente' : 'Nuevo Docente'}</span>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                {/* Visual Header - More Compact to avoid scroll */}
                <div className="bg-logo-blue p-3.5 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black leading-tight tracking-tight">
                                {editingTeacher ? 'Editar Docente' : 'Nuevo Docente'}
                            </h2>
                            <p className="text-white/80 text-[8px] font-bold uppercase tracking-[0.2em]">Gestión de Personal Docente</p>
                        </div>
                    </div>
                </div>

                {/* Form Content - Compact Padding */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">

                        {/* LEFT COLUMN: Photo, Personal Data, Access(Password) */}
                        <div className="flex-1 space-y-4">

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-logo-blue uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-blue-50 text-logo-blue rounded-lg flex items-center justify-center border border-blue-100">
                                        <Info size={10} />
                                    </div>
                                    Identidad y Datos
                                </h3>

                                {/* Photo + Identity Block - Compact */}
                                <div className="flex gap-4 items-center">
                                    <div className="relative group shrink-0">
                                        <div className="w-20 h-20 rounded-2xl border-2 border-gray-50 shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-all group-hover:scale-105 duration-300">
                                            {formData.foto_url ? (
                                                <img src={formData.foto_url} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <GraduationCap size={32} className="text-gray-300" />
                                            )}
                                        </div>
                                        <label className="absolute -bottom-1 -right-1 p-2 bg-logo-blue text-white rounded-xl cursor-pointer shadow-lg border-2 border-white hover:scale-110 transition-transform">
                                            <Camera size={12} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Cédula / Identificación</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                            placeholder="Cédula / ID..."
                                            value={formData.cedula}
                                            onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                            placeholder="Nombres..."
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Apellido</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                            placeholder="Apellidos..."
                                            value={formData.apellido}
                                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Access Section - Compact */}
                            <div className="pt-4 border-t border-gray-50">
                                <h3 className="text-[10px] font-black text-logo-blue uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-blue-50 text-logo-blue rounded-lg flex items-center justify-center border border-blue-100">
                                        <Lock size={10} />
                                    </div>
                                    Acceso al Sistema
                                </h3>
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-inner">
                                    <div className="flex-1">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Contraseña</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 outline-none transition-all font-mono text-xs text-logo-blue font-bold tracking-wider shadow-sm"
                                            placeholder="-- Sin Asignar --"
                                            value={formData.password || ''}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const randomPass = Math.random().toString(36).slice(-8) + new Date().getFullYear();
                                                setFormData({ ...formData, password: randomPass });
                                            }}
                                            className="p-2 bg-logo-blue text-white rounded-xl hover:scale-110 transition-all shadow-md"
                                            title="Generar Automática"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                        {formData.password && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(formData.password || '');
                                                    showNotification('¡Contraseña copiada!', 'success');
                                                }}
                                                className="p-2 bg-white border border-blue-100 text-logo-blue rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                                                title="Copiar"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Assignment, Role, Contacts */}
                        <div className="flex-1 space-y-4 flex flex-col">

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-logo-pink uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 bg-red-50 text-logo-pink rounded-lg flex items-center justify-center border border-red-100">
                                        <Briefcase size={10} />
                                    </div>
                                    Asignación Laboral
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Rol</label>
                                        <div className="relative group">
                                            <select
                                                required
                                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 appearance-none shadow-inner cursor-pointer"
                                                value={formData.rol}
                                                onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                                            >
                                                <option value="docente">Docente</option>
                                                <option value="coordinador">Coordinador</option>
                                                <option value="administrador">Admin</option>
                                            </select>
                                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Clase Principal</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 appearance-none shadow-inner cursor-pointer"
                                                value={formData.clase}
                                                onChange={(e) => setFormData({ ...formData, clase: e.target.value })}
                                            >
                                                <option value="">-- General --</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                                                ))}
                                            </select>
                                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 rotate-90 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-1">
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Teléfono Móvil</label>
                                        <div className="relative group">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-logo-pink transition-colors" />
                                            <input
                                                type="tel"
                                                className="w-full pl-12 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                                placeholder="Número de contacto..."
                                                value={formData.telefono}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-logo-pink uppercase tracking-widest mb-1 ml-1 flex items-center gap-1">
                                            Usuario / Email <span className="p-1 bg-red-50 rounded-lg text-[8px] font-bold leading-none ml-1">(LOGIN)</span>
                                        </label>
                                        <div className="relative group">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-logo-pink transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-12 pr-4 py-2.5 bg-red-50/30 border border-red-100 rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-black text-xs text-gray-700 shadow-sm"
                                                placeholder="correo@ejemplo.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1"></div>

                            {/* Actions Area - Compact */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
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
                                    {editingTeacher ? 'Actualizar Docente' : 'Guardar Docente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
