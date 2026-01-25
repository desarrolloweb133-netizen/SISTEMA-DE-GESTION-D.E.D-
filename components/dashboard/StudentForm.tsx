import React, { useState, useEffect, useRef } from 'react';
import { Save, User as UserIcon, Phone, Calendar, Info, Tag, ChevronRight, Camera, ChevronDown, Check, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { Student, ClassEntity } from '../../types';
import { getClasses } from '../../services/supabaseClient';
import { PremiumDatePicker } from '../common/PremiumDatePicker';

interface StudentFormProps {
    onClose: () => void;
    onSave: (studentData: Partial<Student>) => void;
    editingStudent?: Student | null;
    initialClassId?: string;
}

export const StudentForm: React.FC<StudentFormProps> = ({
    onClose, onSave, editingStudent, initialClassId
}) => {
    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<Partial<Student>>({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        clase_id: initialClassId || '',
        tutor_nombre: '',
        tutor_telefono: '',
        estado: 'activo',
        observaciones: ''
    });

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (editingStudent) {
            setFormData(editingStudent);
        } else {
            setFormData({
                nombre: '',
                apellido: '',
                fecha_nacimiento: '',
                clase_id: initialClassId || '',
                tutor_nombre: '',
                tutor_telefono: '',
                estado: 'activo',
                observaciones: ''
            });
        }
    }, [editingStudent, initialClassId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadClasses = async () => {
        const data = await getClasses();
        setClasses(data);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const getClassName = (id: string | undefined) => {
        const classObj = classes.find(c => c.id === id);
        return classObj ? classObj.nombre : 'Seleccionar clase...';
    };

    const getClassObj = (id: string | undefined) => {
        return classes.find(c => c.id === id);
    };

    return (
        <div className="max-w-[1100px] mx-auto animate-fade-in">
            {/* Breadcrumb Area */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <span className="cursor-pointer hover:text-premium-purple" onClick={onClose}>Gestión de Alumnos</span>
                <ChevronRight size={10} />
                <span className="text-gray-600">{editingStudent ? 'Editar Alumno' : 'Nuevo Alumno'}</span>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-logo-blue p-3.5 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                            <UserIcon size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black leading-tight tracking-tight">
                                {editingStudent ? 'Editar Alumno' : 'Nuevo Alumno'}
                            </h2>
                            <p className="text-white/80 text-[8px] font-bold uppercase tracking-[0.2em]">Registro de Estudiantes</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-gray-50 shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                {formData.foto_url ? (
                                    <img src={formData.foto_url} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={40} className="text-gray-300" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2.5 bg-[#00ADEF] text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-all border-4 border-white z-20">
                                <Camera size={16} />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, foto_url: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Foto del Alumno</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-logo-blue uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-blue-50 text-logo-blue rounded-lg flex items-center justify-center border border-blue-100">
                                    <Info size={10} />
                                </div>
                                Datos Personales
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 placeholder:text-gray-300 shadow-inner"
                                        placeholder="Introduce los nombres..."
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Apellido</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 placeholder:text-gray-300 shadow-inner"
                                        placeholder="Introduce los apellidos..."
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Fecha de Nacimiento</label>
                                    <PremiumDatePicker
                                        value={formData.fecha_nacimiento || ''}
                                        onChange={(date) => setFormData({ ...formData, fecha_nacimiento: date })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-logo-pink uppercase tracking-[2px] flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-red-50 text-logo-pink rounded-lg flex items-center justify-center border border-red-100">
                                    <Tag size={10} />
                                </div>
                                Asignación y Tutor
                            </h3>

                            <div className="space-y-4">
                                {/* CUSTOM PREMIUM CLASS SELECTOR (BAR STYLE) */}
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Clase Asignada</label>

                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative" ref={dropdownRef}>
                                        <div className="flex-1 min-w-[120px]">
                                            <div className="flex items-center gap-2 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                                                <div className="w-8 h-8 bg-[#D9DF21]/20 text-[#C4CB1D] border border-[#D9DF21]/30 rounded-lg flex items-center justify-center font-black text-base">
                                                    {formData.clase_id ? getClassName(formData.clase_id).charAt(0) : '?'}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h4 className="font-bold text-[#414042] text-[11px] leading-tight truncate">{getClassName(formData.clase_id)}</h4>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Previa</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center text-gray-200">
                                            <ArrowRight size={16} />
                                        </div>

                                        <div className="flex-[1.5] relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${isDropdownOpen ? 'border-[#00ADEF] ring-1 ring-[#00ADEF] bg-blue-50/20' : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                            >
                                                <span className={`text-[11px] font-bold truncate ${formData.clase_id ? 'text-[#414042]' : 'text-gray-400'}`}>
                                                    {formData.clase_id ? getClassName(formData.clase_id) : 'Elegir destino...'}
                                                </span>
                                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 max-h-48 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
                                                    {classes.map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, clase_id: c.id });
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors ${formData.clase_id === c.id ? 'bg-blue-50/50' : ''
                                                                }`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[9px] ${formData.clase_id === c.id ? 'bg-[#00ADEF] text-white' : 'bg-gray-100 text-gray-400'
                                                                }`}>
                                                                {formData.clase_id === c.id ? <Check size={10} /> : c.nombre.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h5 className={`text-[10px] font-bold ${formData.clase_id === c.id ? 'text-[#00ADEF]' : 'text-[#414042]'}`}>
                                                                    {c.nombre}
                                                                </h5>
                                                                <p className="text-[7px] font-medium text-gray-400 uppercase tracking-tight">{c.rango_edad}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre del Tutor</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 placeholder:text-gray-300 shadow-inner"
                                        placeholder="Padre/Madre/Tutor responsable"
                                        value={formData.tutor_nombre}
                                        onChange={(e) => setFormData({ ...formData, tutor_nombre: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Teléfono Tutor</label>
                                    <div className="relative group">
                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-logo-pink transition-colors" />
                                        <input
                                            type="tel"
                                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-pink/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 placeholder:text-gray-300 shadow-inner"
                                            placeholder="Número de contacto..."
                                            value={formData.tutor_telefono}
                                            onChange={(e) => setFormData({ ...formData, tutor_telefono: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Observaciones / Notas Médicas</label>
                        <textarea
                            className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all h-20 resize-none font-bold text-sm text-gray-600 placeholder:text-gray-300 shadow-inner"
                            placeholder="Alergias, necesidades especiales..."
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 p-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-logo-blue text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:scale-[1.02] transition-all shadow-xl shadow-blue-200 flex items-center gap-2 active:scale-[0.98]"
                        >
                            <Save size={16} />
                            {editingStudent ? 'Actualizar Alumno' : 'Guardar Nuevo Alumno'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
