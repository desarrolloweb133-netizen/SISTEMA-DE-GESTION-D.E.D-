import React from 'react';
import { X, User, Calendar, Phone, Mail, FileText } from 'lucide-react';
import { Student } from '../../types';

interface StudentDetailModalProps {
    student: Student | null;
    onClose: () => void;
    className?: string;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose, className }) => {
    if (!student) return null;

    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return student.edad || 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={onClose}></div>

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full pointer-events-auto animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="relative p-8 border-b border-gray-100">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <div className="flex items-center gap-6">
                            {/* Photo */}
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00ADEF] to-[#0090C1] flex items-center justify-center text-white shadow-lg overflow-hidden">
                                {student.foto_url ? (
                                    <img src={student.foto_url} alt={student.nombre} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                        <User size={48} />
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <h2 className="text-3xl font-black text-gray-800 mb-1">
                                    {student.nombre} {student.apellido}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${student.estado === 'activo'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {student.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                    </span>
                                    {className && (
                                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-600">
                                            {className}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Personal Info */}
                        <div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-[#00ADEF]" />
                                        <p className="text-xs font-bold text-gray-400 uppercase">Edad</p>
                                    </div>
                                    <p className="text-lg font-black text-gray-800">{calculateAge(student.fecha_nacimiento)} años</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-[#00ADEF]" />
                                        <p className="text-xs font-bold text-gray-400 uppercase">Fecha de Nacimiento</p>
                                    </div>
                                    <p className="text-lg font-black text-gray-800">
                                        {student.fecha_nacimiento
                                            ? new Date(student.fecha_nacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : 'No especificada'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tutor Info */}
                        {(student.tutor_nombre || student.tutor_telefono || student.tutor_email) && (
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Información del Tutor</h3>
                                <div className="space-y-3">
                                    {student.tutor_nombre && (
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                                <User className="w-5 h-5 text-[#00ADEF]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Nombre</p>
                                                <p className="text-sm font-bold text-gray-800">{student.tutor_nombre}</p>
                                            </div>
                                        </div>
                                    )}

                                    {student.tutor_telefono && (
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-[#00ADEF]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Teléfono</p>
                                                <p className="text-sm font-bold text-gray-800">{student.tutor_telefono}</p>
                                            </div>
                                        </div>
                                    )}

                                    {student.tutor_email && (
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-[#00ADEF]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                                                <p className="text-sm font-bold text-gray-800">{student.tutor_email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Observations */}
                        {student.observaciones && (
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Observaciones</h3>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-[#00ADEF] flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700 leading-relaxed">{student.observaciones}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
