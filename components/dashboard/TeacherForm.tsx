import React, { useState, useEffect } from 'react';
import { Save, GraduationCap, Phone, Info, Tag, Camera, Mail, Briefcase, ChevronRight, Lock, RefreshCw, Copy, X as CloseIcon } from 'lucide-react';
import { Teacher, ClassEntity } from '../../types';
import { getClasses } from '../../services/supabaseClient';
import { useNotification } from '../../context/NotificationContext';
import QRCode from 'qrcode';
import { ShieldCheck } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

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
        estado: 'activo',
        qr_code: ''
    });

    const [showQRPreview, setShowQRPreview] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    // --- CROPPER STATES ---
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (editingTeacher) {
            setFormData(editingTeacher);
            if (editingTeacher.qr_code) {
                generateQR(editingTeacher.qr_code);
            }
        } else {
            const newQC = `DED-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
            setFormData(prev => ({ ...prev, qr_code: newQC }));
            generateQR(newQC);
        }
    }, [editingTeacher]);

    const generateQR = async (text: string) => {
        try {
            const url = await QRCode.toDataURL(text, {
                width: 400,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrDataUrl(url);
        } catch (err) {
            console.error(err);
        }
    };

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
                setImageToCrop(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const showCroppedImage = async () => {
        try {
            if (!imageToCrop || !croppedAreaPixels) return;

            const canvas = document.createElement('canvas');
            const img = new Image();
            img.src = imageToCrop;

            await new Promise((resolve) => { img.onload = resolve; });

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                img,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            const base64Image = canvas.toDataURL('image/jpeg');
            setFormData({ ...formData, foto_url: base64Image });
            setIsCropping(false);
            setImageToCrop(null);
        } catch (e) {
            console.error(e);
            showNotification('Error al recortar la imagen', 'error');
        }
    };

    return (
        <div className="max-w-[1100px] mx-auto animate-fade-in mb-20">
            {/* Breadcrumb Area - Dynamic */}
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
                                        <div className="w-20 h-20 rounded-2xl border-2 border-gray-50 shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center transition-all group-hover:scale-105 duration-300 relative">
                                            {formData.foto_url ? (
                                                <img src={formData.foto_url} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <GraduationCap size={32} className="text-gray-300" />
                                            )}

                                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                                                <Camera size={18} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Cédula / Identificación</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                required
                                                className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-logo-blue/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 shadow-inner"
                                                placeholder="Cédula / ID..."
                                                value={formData.cedula}
                                                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowQRPreview(!showQRPreview)}
                                                className={`px-3 rounded-xl flex items-center justify-center gap-2 border-2 transition-all ${qrDataUrl ? 'bg-blue-50 border-blue-200 text-logo-blue' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                                title="Ver Código QR"
                                            >
                                                <ShieldCheck size={16} />
                                                <span className="text-[10px] font-black uppercase">
                                                    QR
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Integrated Cropper Section - Light & Modern */}
                                {isCropping && imageToCrop && (
                                    <div className="bg-blue-50/40 rounded-[2.5rem] border-2 border-white shadow-xl shadow-blue-500/5 p-6 animate-fade-in relative overflow-hidden">
                                        {/* Background Decor */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="text-[11px] font-black text-[#414042] uppercase tracking-widest">Encuadre de Fotografía</h4>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ajusta la imagen para el perfil oficial</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsCropping(false); setImageToCrop(null); }}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm hover:bg-red-50 hover:text-red-500 transition-all text-gray-400"
                                                >
                                                    <CloseIcon size={16} />
                                                </button>
                                            </div>

                                            <div className="relative h-72 bg-gray-50 rounded-3xl overflow-hidden border border-white shadow-inner">
                                                <Cropper
                                                    image={imageToCrop}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={1 / 1}
                                                    onCropChange={setCrop}
                                                    onCropComplete={onCropComplete}
                                                    onZoomChange={setZoom}
                                                    classes={{
                                                        containerClassName: "rounded-3xl",
                                                        mediaClassName: "rounded-3xl"
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-6 flex flex-col gap-6">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span>Zoom de Imagen</span>
                                                        <span className="text-logo-blue">{Math.round(zoom * 100)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        value={zoom}
                                                        min={1}
                                                        max={3}
                                                        step={0.1}
                                                        onChange={(e) => setZoom(Number(e.target.value))}
                                                        className="w-full h-1.5 bg-white rounded-lg appearance-none cursor-pointer accent-logo-blue border border-gray-100"
                                                    />
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={showCroppedImage}
                                                        className="flex-1 py-4 bg-logo-blue text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all active:scale-95"
                                                    >
                                                        Aplicar Recorte Final
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* QR Preview Area */}
                                {showQRPreview && qrDataUrl && (
                                    <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 animate-fade-in flex flex-col items-center">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm mb-3">
                                            <img src={qrDataUrl} alt="QR Code" className="w-32 h-32" />
                                        </div>
                                        <p className="text-[9px] font-black text-logo-blue uppercase tracking-widest mb-3">Identificador: {formData.qr_code}</p>
                                        <a
                                            href={qrDataUrl}
                                            download={`QR_${formData.nombre}_${formData.apellido}.png`}
                                            className="px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md flex items-center gap-2"
                                        >
                                            <Copy size={12} />
                                            Descargar Credencial QR
                                        </a>
                                    </div>
                                )}

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
