import React, { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck,
    User,
    RefreshCw,
    Zap,
    Clock,
    AlertCircle,
    Sparkles,
    ChevronRight,
    Activity,
    MapPin,
    Loader2,
    ArrowRight,
    Volume2
} from 'lucide-react';
import { GET_DED_LOGO } from '../constants/assets';
import { recordAttendance, getTeachers } from '../services/supabaseClient';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckInSuccessView } from '../components/CheckInSuccessView';
import { Teacher } from '../types';

export const CheckInPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState<string | null>(null);
    const [instruction, setInstruction] = useState('Escanea tu código QR');
    const [recognizedTeacher, setRecognizedTeacher] = useState<Teacher | null>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const isScanningRef = useRef(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const startScanning = async () => {
        if (isScanningRef.current) return;

        try {
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;
            isScanningRef.current = true;

            const config = {
                fps: 20,
                qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const size = Math.floor(minEdge * 0.85); // 85% del área para mayor rango
                    return { width: size, height: size };
                },
                aspectRatio: 1.0
            };

            await html5QrCode.start(
                { facingMode: "user" }, // Priorizar cámara frontal para terminales
                config,
                onScanSuccess,
                () => { } // Ignorar fallos silenciosos
            );

            setInstruction('Escaneando código...');
        } catch (err) {
            console.error("No se pudo iniciar la cámara automáticamente:", err);
            // Intentar con cualquier cámara disponible si la frontal falla
            try {
                await html5QrCodeRef.current?.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 280, height: 280 } },
                    onScanSuccess,
                    () => { }
                );
            } catch (retryErr) {
                setError("No se pudo acceder a la cámara. Revisa los permisos.");
                setStatus('error');
            }
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current && isScanningRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                isScanningRef.current = false;
            } catch (err) {
                console.error("Error al detener la cámara:", err);
            }
        }
    };

    useEffect(() => {
        if (status === 'scanning') {
            startScanning();
        } else if (status !== 'verifying') {
            stopScanning();
        }

        return () => {
            stopScanning();
        };
    }, [status]);

    const onScanSuccess = async (decodedText: string) => {
        if (status === 'verifying' || status === 'success') return;
        await attemptMatch(decodedText);
    };

    const playSuccessSound = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(4000, context.currentTime); // 4kHz ultra-agudo

            gainNode.gain.setValueAtTime(0, context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.1); // 100ms exactos
        } catch (e) {
            console.error("Audio error:", e);
        }
    };

    const playErrorSound = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();

            const beep = (time: number) => {
                const osc = context.createOscillator();
                const gain = context.createGain();
                osc.connect(gain);
                gain.connect(context.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, time); // 300Hz grave
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.1, time + 0.01);
                gain.gain.linearRampToValueAtTime(0, time + 0.15);
                osc.start(time);
                osc.stop(time + 0.2);
            };

            beep(context.currentTime);
            beep(context.currentTime + 0.25); // Doble pitido
        } catch (e) {
            console.error("Audio error:", e);
        }
    };

    const attemptMatch = async (qrCode: string) => {
        setStatus('verifying');
        setInstruction('Verificando QR...');

        try {
            const teachers = await getTeachers();
            const teacher = teachers.find(t => t.qr_code === qrCode && t.estado === 'activo');

            if (teacher) {
                playSuccessSound();
                await recordAttendance(teacher.id);
                setRecognizedTeacher(teacher);
                await stopScanning();
                setStatus('success');
            } else {
                playErrorSound();
                setInstruction('Código no reconocido.');
                setTimeout(() => setStatus('scanning'), 2000);
            }
        } catch (err) {
            console.error("Match error:", err);
            setError("Error en el sistema de validación.");
            setStatus('error');
        }
    };

    const reset = (autoResume = false) => {
        setStatus(autoResume ? 'scanning' : 'idle');
        setError(null);
        setInstruction('Escanea tu código QR');
        setRecognizedTeacher(null);
    };

    // Auto reset after success to allow continuous scanning
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                reset(true); // Regresar directamente al escaneo
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div className="h-[100dvh] bg-[#F8FAFC] flex flex-col items-center justify-start overflow-hidden font-sans relative text-[#414042]">
            {/* Corporate Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ADEF]/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D9DF21]/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
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
                        <p className="text-[10px] font-extrabold text-[#D9DF21] uppercase tracking-[0.2em] mt-1">Terminal de Registro QR</p>
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
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50"></div>

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

                        <p className="text-gray-400 font-bold text-sm mb-8 max-w-sm antialiased leading-relaxed">
                            Registro de asistencia instantáneo.
                            Presiona abajo para activar el lector.
                        </p>

                        <button
                            onClick={() => setStatus('scanning')}
                            className="group relative px-10 py-5 bg-[#00ADEF] rounded-[2rem] font-black text-lg text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-3"
                        >
                            <span>REGISTRAR ASISTENCIA</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full max-h-[85vh] flex flex-col md:flex-row gap-6 animate-fade-in">
                        <div className="hidden lg:flex flex-col justify-between w-64 p-6 bg-[#00ADEF] rounded-[2.5rem] shadow-xl text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2.5 mb-8">
                                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-100">Estado</span>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-1.5">Motor</p>
                                        <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#D9DF21] animate-progress w-full"></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-1.5">Lector</p>
                                        <p className="text-sm font-black text-white flex items-center gap-2.5">
                                            <span className="w-2 h-2 rounded-full bg-[#D9DF21] animate-pulse"></span>
                                            ACTIVO
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white">
                                <Volume2 className="w-6 h-6 mb-3 text-[#D9DF21]" />
                                <h4 className="font-black text-[10px] uppercase tracking-widest mb-1.5">Feedback Sonoro</h4>
                                <p className="text-[9px] font-bold leading-relaxed opacity-90">
                                    Escucharás un "Beep" al completar el registro correctamente.
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-white p-3 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-2 border-white overflow-hidden group">
                            <div id="reader" className="w-full h-full bg-slate-900 overflow-hidden rounded-[2.2rem] md:rounded-[3.2rem]"></div>

                            {/* Professional Scan UI */}
                            <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center p-4">
                                <div className="relative w-full h-full max-w-[85%] max-h-[85%]">
                                    {/* Corners */}
                                    <div className="absolute top-0 left-0 w-20 h-20 border-t-8 border-l-8 border-[#00ADEF] rounded-tl-[3.5rem] drop-shadow-[0_0_20px_rgba(0,173,239,0.6)]"></div>
                                    <div className="absolute top-0 right-0 w-20 h-20 border-t-8 border-r-8 border-[#00ADEF] rounded-tr-[3.5rem] drop-shadow-[0_0_20px_rgba(0,173,239,0.6)]"></div>
                                    <div className="absolute bottom-0 left-0 w-20 h-20 border-b-8 border-l-8 border-[#00ADEF] rounded-bl-[3.5rem] drop-shadow-[0_0_20px_rgba(0,173,239,0.6)]"></div>
                                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-8 border-r-8 border-[#00ADEF] rounded-br-[3.5rem] drop-shadow-[0_0_20px_rgba(0,173,239,0.6)]"></div>

                                    {/* Scan Line */}
                                    {(status === 'scanning' || status === 'verifying') && (
                                        <div className="absolute top-0 left-[-5%] w-[110%] h-1 bg-[#D9DF21] shadow-[0_0_20px_#D9DF21] animate-scan-vertical z-30 opacity-80"></div>
                                    )}
                                </div>
                            </div>

                            {/* Status Pill */}
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40">
                                {status === 'scanning' && (
                                    <div className="bg-white/95 backdrop-blur-2xl border-2 border-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-5 animate-slide-up">
                                        <RefreshCw size={24} className="text-[#00ADEF] animate-spin" />
                                        <div className="text-left">
                                            <p className="font-black text-sm uppercase tracking-widest text-[#414042]">{instruction}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Apunta el código al centro</p>
                                        </div>
                                    </div>
                                )}
                                {status === 'verifying' && (
                                    <div className="bg-[#D9DF21] px-12 py-6 rounded-full shadow-2xl flex items-center gap-5 animate-scale-in text-[#414042]">
                                        <Loader2 size={28} className="animate-spin" />
                                        <span className="font-black text-xl uppercase tracking-tighter">Validando Acceso</span>
                                    </div>
                                )}
                            </div>

                            {/* Hide html5-qrcode's ugly default buttons/icons */}
                            <style>{`
                                #reader button { display: none !important; }
                                #reader select { display: none !important; }
                                #reader img { display: none !important; }
                                #reader span { display: none !important; }
                                #reader video {
                                    object-fit: cover !important;
                                    width: 100% !important;
                                    height: 100% !important;
                                    border-radius: 3.5rem !important;
                                }
                                #reader__dashboard { display: none !important; }
                                #reader { border: none !important; }
                                .animate-scan-vertical {
                                    animation: scan-vertical 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                                }
                                @keyframes scan-vertical {
                                    0% { top: 0%; opacity: 0; }
                                    50% { opacity: 1; }
                                    100% { top: 100%; opacity: 0; }
                                }
                                .animate-slide-up {
                                    animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                                }
                                @keyframes slide-up {
                                    from { transform: translateY(30px); opacity: 0; }
                                    to { transform: translateY(0); opacity: 1; }
                                }
                                .animate-scale-in {
                                    animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                                }
                                @keyframes scale-in {
                                    from { transform: scale(0.85); opacity: 0; }
                                    to { transform: scale(1); opacity: 1; }
                                }
                                .animate-progress {
                                    animation: progress 2s linear infinite;
                                }
                                @keyframes progress {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(100%); }
                                }
                            `}</style>
                        </div>
                    </div>
                )}
            </main>

            {status === 'error' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center animate-scale-in">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-[#414042] mb-3">¡Atención!</h3>
                        <p className="text-gray-400 font-bold mb-8 leading-relaxed">{error}</p>
                        <button onClick={reset} className="w-full py-5 bg-[#00ADEF] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            Reintentar Ahora
                        </button>
                    </div>
                </div>
            )}

            {status === 'success' && recognizedTeacher && (
                <CheckInSuccessView teacher={recognizedTeacher} />
            )}
        </div>
    );
};
