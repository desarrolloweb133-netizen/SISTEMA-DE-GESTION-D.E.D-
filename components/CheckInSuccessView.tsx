import React from 'react';
import { User, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { Teacher } from '../types';
import { GET_DED_LOGO } from '../constants/assets';

interface CheckInSuccessViewProps {
    teacher: Teacher;
    onComplete?: () => void;
}

export const CheckInSuccessView: React.FC<CheckInSuccessViewProps> = ({ teacher }) => {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-white/95 backdrop-blur-sm animate-fade-in font-sans text-[#414042]">
            {/* Main Card */}
            <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden relative animate-scale-in">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[100%] -z-0 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-50 to-transparent rounded-tr-[100%] -z-0 opacity-50"></div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col items-center">

                    {/* Header Logo */}
                    <div className="mb-8 animate-fade-in-up">
                        <img src={GET_DED_LOGO()} alt="DED Logo" className="h-12 w-auto" />
                    </div>

                    {/* Responsive Layout Grid */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

                        {/* Column 1: Photo */}
                        <div className="flex flex-col items-center md:items-end animate-fade-in-up delay-100">
                            <div className="relative group">
                                {/* Gradient Halo */}
                                <div className="absolute -inset-1 bg-gradient-to-br from-[#00ADEF] to-[#D9DF21] rounded-[2rem] blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Photo Container */}
                                <div className="relative w-48 h-48 md:w-64 md:h-64 bg-white p-1.5 rounded-[2rem] shadow-xl">
                                    <div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-gray-100">
                                        {teacher.foto_url ? (
                                            <img
                                                src={teacher.foto_url}
                                                alt={teacher.nombre}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <User size={80} strokeWidth={1} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Success Check Floating Icon */}
                                    <div className="absolute -bottom-3 -right-3 bg-white p-1 rounded-full shadow-lg">
                                        <div className="bg-[#00ADEF] rounded-full p-2 text-white">
                                            <CheckCircle size={24} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Info & Greeting */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 animate-fade-in-up delay-200">

                            {/* Greeting */}
                            <div>
                                <h2 className="text-3xl font-black text-[#00ADEF] mb-1">¡REGISTRO EXITOSO!</h2>
                                <p className="text-xl md:text-2xl font-medium text-gray-400">
                                    Buen día, <br className="md:hidden" />
                                    <span className="font-black text-[#414042] text-2xl md:text-3xl uppercase tracking-tight">
                                        {teacher.nombre} {teacher.apellido}
                                    </span>
                                </p>
                            </div>

                            {/* Info Cards */}
                            <div className="w-full grid grid-cols-1 gap-3">
                                {/* Teacher Role Card */}
                                <div className="bg-gray-50 hover:bg-blue-50 transition-colors p-3 px-4 rounded-2xl flex items-center gap-4 border border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#00ADEF]">
                                        <User size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profesor</p>
                                        <p className="font-bold text-gray-700 leading-tight">{teacher.nombre}</p>
                                    </div>
                                </div>

                                {/* Class Card */}
                                <div className="bg-gray-50 hover:bg-green-50 transition-colors p-3 px-4 rounded-2xl flex items-center gap-4 border border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#D9DF21]">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Clase Asignada</p>
                                        <p className="font-bold text-gray-700 leading-tight">{teacher.clase || 'General'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Time Status */}
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00ADEF]/10 rounded-full text-[#00ADEF] font-black text-xs uppercase tracking-widest animate-pulse-slow">
                                <Clock size={14} />
                                <span>Registro: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                        </div>
                    </div>

                    {/* Progress Bar Loader (4s) */}
                    <div className="mt-12 w-full max-w-xs flex flex-col items-center gap-3 opacity-60">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00ADEF] animate-progress-timer"></div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Regresando al inicio</p>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes progress-timer {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-progress-timer {
                    animation: progress-timer 4s linear forwards;
                }
                .animate-pulse-slow {
                    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fade-in-up {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
            `}</style>
        </div>
    );
};
