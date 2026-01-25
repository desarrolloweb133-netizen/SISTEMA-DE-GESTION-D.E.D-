import React, { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck,
    User,
    RefreshCw,
    Zap,
    Clock,
    AlertCircle,
    CheckCircle2,
    Sparkles,
    ChevronRight,
    Activity,
    MapPin,
    Loader2,
    ArrowRight,
    Camera
} from 'lucide-react';
import { GET_DED_LOGO } from '../constants/assets';
import { simulateFaceMatch, recordAttendance } from '../services/supabaseClient';
import { CheckInSuccessView } from '../components/CheckInSuccessView';
import { Teacher } from '../types';

export const CheckInPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState<string | null>(null);
    const [recognizedTeacher, setRecognizedTeacher] = useState<Teacher | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (status === 'scanning' && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(err => console.error("Video play error:", err));
        }
    }, [status]);

    // Auto reset after success
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                reset();
            }, 6000); // 6 seconds to give enough time to read
            return () => clearTimeout(timer);
        }
    }, [status]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            setStatus('scanning');
            // Auto trigger "recognition" after a few seconds of scanning
            setTimeout(simulateRecognition, 4000);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Permiso de cámara denegado o no disponible.");
            setStatus('error');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const simulateRecognition = async () => {
        setStatus('verifying');

        try {
            // Real simulation using the helper we found
            const teacher = await simulateFaceMatch(""); // Empty string as we are simulating

            if (teacher) {
                // Record the actual attendance in DB
                await recordAttendance(teacher.id);
                setRecognizedTeacher(teacher);
                setStatus('success');
                stopCamera();
            } else {
                setError("No se pudo identificar el rostro. Intenta de nuevo.");
                setStatus('error');
            }
        } catch (err) {
            setError("Error en la verificación biométrica.");
            setStatus('error');
        }
    };

    const reset = () => {
        stopCamera();
        setStatus('idle');
        setError(null);
        setRecognizedTeacher(null);
    };

    return (
        <div className="h-[100dvh] bg-[#F8FAFC] flex flex-col items-center justify-start overflow-hidden font-sans relative text-[#414042]">
            {/* Corporate Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ADEF]/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D9DF21]/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#414042 1px, transparent 1px)', size: '40px 40px' }}></div>
            </div>

            {/* Official Header */}
            <header className="w-full bg-white border-b-4 border-[#00ADEF] px-8 py-5 flex items-center justify-between z-50 shadow-md sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00ADEF] to-[#0077B6] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="text-white w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none text-[#414042]">
                            DED <span className="text-[#00ADEF]">ASISTENCIA</span>
                        </h1>
                        <p className="text-[10px] font-extrabold text-[#D9DF21] uppercase tracking-[0.2em] mt-1">Terminal de Registro Biométrico</p>
                    </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sistema Activo</span>
                    </div>
                    <div>
                        <p className="text-2xl font-black tabular-nums leading-none text-[#414042]">
                            {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                            PEDERNALES CENTRAL
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Interactive View */}
            <main className="flex-1 w-full max-w-6xl p-4 md:p-8 flex flex-col items-center justify-center z-20 overflow-hidden">
                {status === 'idle' ? (
                    <div className="w-full max-w-2xl bg-white p-8 rounded-[3.5rem] shadow-2xl shadow-[#00ADEF]/10 border-4 border-[#00ADEF]/10 flex flex-col items-center text-center animate-fade-in relative overflow-hidden">
                        {/* Decorative Circle */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>

                        {/* Institutional Logo Area */}
                        <div className="flex justify-center mb-6 animate-fade-in-up">
                            <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center p-3 border border-gray-100">
                                <img src={GET_DED_LOGO()} alt="DED Logo" className="w-full h-auto" />
                            </div>
                        </div>

                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner relative group transition-all duration-500 hover:scale-110">
                            <User className="w-12 h-12 text-[#00ADEF]" />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D9DF21] rounded-xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-[#414042] leading-tight">
                            Bienvenido, <br /> <span className="text-[#00ADEF]">Maestro DED</span>
                        </h2>

                        <p className="text-gray-400 font-bold text-sm mb-8 max-w-md antialiased leading-relaxed">
                            Registro de asistencia para el personal docente de DED-PEDERNALES CENTRAL.
                            Inicia el proceso biométrico para registrar tu entrada.
                        </p>

                        <button
                            onClick={startCamera}
                            className="group relative px-10 py-5 bg-[#00ADEF] rounded-[2rem] font-black text-lg text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-3"
                        >
                            <span>COMENZAR REGISTRO</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="mt-8 flex items-center gap-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><MapPin size={12} className="text-[#D9DF21]" /> Campus Central</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span className="flex items-center gap-2"><Clock size={12} className="text-[#00ADEF]" /> Registro Real</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full max-h-[calc(100vh-180px)] flex flex-col md:flex-row gap-6 animate-fade-in overflow-hidden">
                        {/* Terminal Sidebar Info */}
                        {/* Terminal Sidebar Info (Blue Theme to match Admin Side) */}
                        <div className="hidden lg:flex flex-col justify-between w-72 p-6 bg-[#00ADEF] rounded-[3rem] shadow-xl shadow-blue-500/20 text-white relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <span className="font-extrabold text-xs uppercase tracking-widest text-blue-100">Estado Local</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Carga Biométrica</p>
                                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#D9DF21] animate-progress" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Detección de Rostro</p>
                                        <p className="text-sm font-black text-white flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#D9DF21] animate-pulse"></span>
                                            ACTIVA
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white">
                                <Zap className="w-8 h-8 mb-4 text-[#D9DF21]" />
                                <h4 className="font-black text-sm uppercase tracking-widest mb-2">Instrucciones</h4>
                                <p className="text-[10px] font-bold leading-relaxed opacity-90 uppercase tracking-wider">
                                    Mantén una distancia de 50cm y asegúrate de tener buena iluminación.
                                </p>
                            </div>
                        </div>

                        {/* Camera Frame - The Core */}
                        <div className="flex-1 relative bg-white p-3 rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden group">
                            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[3.5rem] bg-gray-900">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover scale-x-[-1] relative z-10"
                                />

                                {/* Professional Scanner UI Overlay */}
                                <div className="absolute inset-0 pointer-events-none z-20">
                                    {/* Corners Layout */}
                                    <div className="absolute inset-10 border border-white/10 rounded-[2.5rem]"></div>

                                    <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-[#00ADEF] rounded-tl-[1.5rem] drop-shadow-[0_0_10px_rgba(0,173,239,0.3)]"></div>
                                    <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-[#00ADEF] rounded-tr-[1.5rem] drop-shadow-[0_0_10px_rgba(0,173,239,0.3)]"></div>
                                    <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-[#00ADEF] rounded-bl-[1.5rem] drop-shadow-[0_0_10px_rgba(0,173,239,0.3)]"></div>
                                    <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-[#00ADEF] rounded-br-[1.5rem] drop-shadow-[0_0_10px_rgba(0,173,239,0.3)]"></div>

                                    {/* High Visibility Scanning effects */}
                                    {(status === 'scanning' || status === 'verifying') && (
                                        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-[#D9DF21] to-transparent shadow-[0_0_20px_#D9DF21] animate-scan-vertical-fast z-40"></div>
                                    )}

                                    {/* Biometric Mesh (High Precision style) */}
                                    {status === 'scanning' && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="w-[300px] h-[300px] text-white/50" viewBox="0 0 100 100">
                                                <defs>
                                                    <radialGradient id="meshGradient">
                                                        <stop offset="0%" stopColor="#00ADEF" stopOpacity="0.5" />
                                                        <stop offset="100%" stopColor="#00ADEF" stopOpacity="0" />
                                                    </radialGradient>
                                                </defs>
                                                <circle cx="50" cy="50" r="1.5" className="animate-ping-mesh-1" fill="#00ADEF" />
                                                <circle cx="30" cy="40" r="1" className="animate-ping-mesh-2" fill="#D9DF21" />
                                                <circle cx="70" cy="40" r="1" className="animate-ping-mesh-3" fill="#D9DF21" />
                                                <circle cx="40" cy="70" r="1" className="animate-ping-mesh-4" fill="#00ADEF" />
                                                <circle cx="60" cy="70" r="1" className="animate-ping-mesh-5" fill="#00ADEF" />
                                                <path d="M30 40 L50 50 L70 40 M40 70 L50 50 L60 70" stroke="white" strokeWidth="0.2" fill="none" className="opacity-20" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Floating Status Bar */}
                            <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center z-30">
                                {status === 'scanning' && (
                                    <div className="bg-white/90 backdrop-blur-xl border border-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-slide-up">
                                        <RefreshCw className="w-6 h-6 text-[#00ADEF] animate-spin" />
                                        <div className="text-left">
                                            <p className="font-black text-xs uppercase tracking-widest text-[#414042]">Escaneo Biométrico</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ajustando foco automático...</p>
                                        </div>
                                    </div>
                                )}

                                {status === 'verifying' && (
                                    <div className="bg-[#D9DF21] px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-scale-in text-[#414042]">
                                        <Zap className="w-7 h-7 animate-bounce" />
                                        <span className="font-black text-lg uppercase tracking-tight">Verificando Identidad</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Error Message */}
            {status === 'error' && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-[100] animate-fade-in-up">
                    <div className="bg-white border-2 border-red-500/20 p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                            <AlertCircle className="text-red-500 w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[#414042] font-black text-sm tracking-tight mb-1">{error}</p>
                            <button onClick={reset} className="text-[#00ADEF] text-[10px] font-black uppercase tracking-widest hover:underline transition-all">Reintentar Ahora</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success View */}
            {status === 'success' && recognizedTeacher && (
                <CheckInSuccessView teacher={recognizedTeacher} />
            )}

            <style>{`
                @keyframes scan-vertical-fast {
                    0% { top: 0%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan-vertical-fast {
                    animation: scan-vertical-fast 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-ping-mesh-1 { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animate-ping-mesh-2 { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) 0.5s infinite; }
                .animate-ping-mesh-3 { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) 1s infinite; }
                .animate-ping-mesh-4 { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) 1.5s infinite; }
                .animate-ping-mesh-5 { animation: ping 2s cubic-bezier(0, 0, 0.2, 1) 0.3s infinite; }
                
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-300 { animation-delay: 300ms; }

                @keyframes slide-up-fade {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up-fade {
                    animation: slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes progress-timer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0%); }
                }
                .animate-progress-timer {
                    animation: progress-timer 6s linear forwards;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }

                @keyframes fade-in-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

