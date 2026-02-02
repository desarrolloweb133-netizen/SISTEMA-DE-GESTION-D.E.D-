import React, { useState, useEffect } from 'react';
import { ExternalLink, ClipboardCheck, Monitor, Smartphone, ShieldCheck, ArrowRight, BookOpen, Calendar, Search, ChevronRight, Clock } from 'lucide-react';
import { PremiumDatePicker } from '../components/common/PremiumDatePicker';
import { ClassEntity, CalendarEvent } from '../types';
import { getClasses, getStudentAttendanceByClassAndDate, getStudentsByClass, getAttendanceEvents, updateEventStatus, addCalendarEvent, updateCalendarEvent } from '../services/supabaseClient';
import { AttendanceSessionForm } from '../components/dashboard/AttendanceSessionForm';
import { useNotification } from '../context/NotificationContext';

export const AttendanceAdminPage: React.FC = () => {
    const { showNotification } = useNotification();
    const checkInUrl = `${window.location.origin}/check-in`;
    const [activeTab, setActiveTab] = useState<'terminal' | 'students' | 'sessions'>('terminal');

    // Students Tab State
    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'classes' | 'detail'>('classes');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [classStatuses, setClassStatuses] = useState<Record<string, 'pendiente' | 'listo'>>({});

    // Sessions Tab State
    const [attendanceEvents, setAttendanceEvents] = useState<CalendarEvent[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        const data = await getClasses();
        setClasses(data);
    };

    const loadClassStatuses = async (date: string) => {
        setLoading(true);
        try {
            const statuses: Record<string, 'pendiente' | 'listo'> = {};
            for (const cls of classes) {
                const att = await getStudentAttendanceByClassAndDate(cls.id, date);
                statuses[cls.id] = att.length > 0 ? 'listo' : 'pendiente';
            }
            setClassStatuses(statuses);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadAttendance = async (classId: string) => {
        if (!classId || !selectedDate) return;
        setLoading(true);
        try {
            const attendance = await getStudentAttendanceByClassAndDate(classId, selectedDate);
            const students = await getStudentsByClass(classId);

            const mapped = students.map(student => {
                const record = attendance.find(a => a.alumno_id === student.id);
                return {
                    id: student.id,
                    nombre: `${student.nombre} ${student.apellido}`,
                    image_url: student.foto_url,
                    status: record?.estado || 'no_registrado',
                    time: record?.created_at ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
                };
            });
            setAttendanceData(mapped);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadSessions = async () => {
        setSessionsLoading(true);
        try {
            const data = await getAttendanceEvents();
            setAttendanceEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleToggleEvent = async (eventId: string, currentStatus: boolean) => {
        try {
            await updateEventStatus(eventId, !currentStatus);
            setAttendanceEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, habilitado: !currentStatus } : ev));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveSession = async (data: Partial<CalendarEvent>) => {
        try {
            const finalData = {
                ...data,
                clase_id: data.clase_id === 'todas' || !data.clase_id ? null : data.clase_id
            };

            if (editingEvent) {
                await updateCalendarEvent(editingEvent.id, finalData);
            } else {
                await addCalendarEvent(finalData as Omit<CalendarEvent, 'id' | 'created_at'>);
            }

            setIsFormOpen(false);
            setEditingEvent(null);
            loadSessions();
        } catch (error) {
            console.error('Error saving session:', error);
            showNotification('Error al guardar la sesión. Verifica los datos.', 'error');
        }
    };

    useEffect(() => {
        if (activeTab === 'students') {
            if (viewMode === 'classes') {
                loadClassStatuses(selectedDate);
            } else if (selectedClassId) {
                loadAttendance(selectedClassId);
            }
        } else if (activeTab === 'sessions') {
            loadSessions();
        }
    }, [activeTab, selectedDate, viewMode, selectedClassId, classes.length]);

    const openTerminal = () => {
        window.open(checkInUrl, '_blank');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#414042]">Control de Asistencia</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Gestión y Monitoreo</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('terminal')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'terminal' ? 'bg-white text-[#00ADEF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Monitor size={16} />
                        Terminal Acceso
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <BookOpen size={16} />
                        Alumnos
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sessions' ? 'bg-white text-[#D9DF21] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Calendar size={16} />
                        Sesiones
                    </button>
                </div>
            </div>

            {activeTab === 'terminal' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                    {/* Left Side: Gateway Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500">
                        <div className="w-24 h-24 bg-[#00ADEF]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                            <ClipboardCheck size={48} className="text-[#00ADEF]" />
                        </div>

                        <h2 className="text-3xl font-black text-[#414042] mb-4">Terminal Pública</h2>
                        <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-sm">
                            Accede a la interface de registro facial diseñada para ser utilizada en tablets o computadoras en la entrada.
                        </p>

                        <div className="w-full bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100 flex items-center justify-between gap-4">
                            <div className="text-left overflow-hidden">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Enlace de Registro</p>
                                <p className="text-sm font-bold text-[#00ADEF] truncate">{checkInUrl}</p>
                            </div>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(checkInUrl);
                                }}
                                className="p-3 bg-white hover:bg-[#00ADEF] hover:text-white rounded-xl transition-all shadow-sm border border-gray-100 shrink-0"
                                title="Copiar enlace"
                            >
                                <ExternalLink size={18} />
                            </button>
                        </div>

                        <button
                            onClick={openTerminal}
                            className="w-full flex items-center justify-center gap-3 bg-[#D9DF21] text-[#414042] py-5 rounded-2xl hover:bg-[#C4CB1D] transition-all shadow-lg shadow-yellow-500/10 font-black text-lg group/btn"
                        >
                            Abrir Terminal Ahora
                            <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Right Side: Info & Features */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-[#414042] mb-6 flex items-center gap-3">
                                <ShieldCheck className="text-[#00ADEF]" />
                                Características del Sistema
                            </h3>

                            <div className="space-y-6">
                                {[
                                    {
                                        icon: Monitor,
                                        title: 'Diseño Pantalla Completa',
                                        desc: 'Interfaz optimizada para verse increíble en cualquier monitor o Smart TV.'
                                    },
                                    {
                                        icon: Smartphone,
                                        title: 'Responsive & Móvil',
                                        desc: 'Ideal para ser utilizada en iPads, Tablets o Smartphones corporativos.'
                                    },
                                    {
                                        icon: ClipboardCheck,
                                        title: 'Sincronización Live',
                                        desc: 'Los registros se ven reflejados instantáneamente en el panel administrativo.'
                                    }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-5">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <feature.icon className="text-[#00ADEF]" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#414042] leading-none mb-1">{feature.title}</p>
                                            <p className="text-sm text-gray-500">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#414042] rounded-2xl p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <h4 className="text-lg font-black mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#D9DF21] animate-pulse"></span>
                                Próximamente
                            </h4>
                            <p className="text-sm text-white/70 leading-relaxed font-medium">
                                Estamos trabajando en la generación de códigos QR personalizados para que cada docente pueda registrarse escaneando desde su propio móvil.
                            </p>
                        </div>
                    </div>
                </div>
            ) : activeTab === 'sessions' ? (
                <div className="space-y-6 animate-fade-in-up">
                    {/* View Switcher: List or Form */}
                    {!isFormOpen ? (
                        <>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="bg-[#D9DF21] text-[#414042] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Calendar size={16} />
                                    Programar Nueva Sesión
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/80 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#414042] uppercase tracking-widest">Sesión</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#414042] uppercase tracking-widest">Clase / Grupo</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-[#414042] uppercase tracking-widest">Fecha y Hora</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black text-[#414042] uppercase tracking-widest">Estado</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black text-[#414042] uppercase tracking-widest">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sessionsLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">Cargando sesiones...</td>
                                                </tr>
                                            ) : attendanceEvents.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">No hay sesiones programadas.</td>
                                                </tr>
                                            ) : (
                                                attendanceEvents.map(event => (
                                                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2.5 rounded-xl ${event.habilitado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                    <Calendar size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-[#414042] text-sm leading-tight">{event.titulo}</p>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sesión de Asistencia</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-3 py-1 bg-blue-50 text-logo-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                                {!event.clase_id ? 'Global' : classes.find(c => c.id === event.clase_id)?.nombre || 'Específica'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={14} className="text-gray-300" />
                                                                    {new Date(event.fecha_inicio).toLocaleDateString()}
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock size={14} className="text-gray-300" />
                                                                    {new Date(event.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center">
                                                                <label className="relative inline-flex items-center cursor-pointer gap-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="sr-only peer"
                                                                        checked={event.habilitado}
                                                                        onChange={() => handleToggleEvent(event.id, event.habilitado || false)}
                                                                    />
                                                                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-logo-blue transition-colors duration-200 shadow-inner"></div>
                                                                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-6 shadow-sm"></span>
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingEvent(event);
                                                                    setIsFormOpen(true);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-logo-blue hover:bg-blue-50 rounded-xl transition-all"
                                                                title="Editar sesión"
                                                            >
                                                                <ExternalLink size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <AttendanceSessionForm
                            onClose={() => {
                                setIsFormOpen(false);
                                setEditingEvent(null);
                            }}
                            onSave={handleSaveSession}
                            initialData={editingEvent}
                        />
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Filters Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <PremiumDatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="w-full md:w-auto"
                        />

                        {viewMode === 'detail' && (
                            <button
                                onClick={() => setViewMode('classes')}
                                className="text-xs font-black text-logo-blue uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
                            >
                                <ChevronRight size={14} className="rotate-180" />
                                Volver al Listado
                            </button>
                        )}

                        <div className="ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {viewMode === 'classes' ? `${classes.length} Clases Totales` : `${attendanceData.length} Alumnos en Clase`}
                        </div>
                    </div>

                    {viewMode === 'classes' ? (
                        /* LIST VIEW: All Classes with Status */
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/80 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Clase</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Rango de Edad</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Estado</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {classes.map(cls => {
                                            const status = classStatuses[cls.id] || 'pendiente';
                                            return (
                                                <tr
                                                    key={cls.id}
                                                    onClick={() => {
                                                        setSelectedClassId(cls.id);
                                                        setViewMode('detail');
                                                    }}
                                                    className="hover:bg-blue-50/50 transition-all group relative border-l-4 border-transparent hover:border-[#00ADEF] cursor-pointer"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-logo-blue transition-colors">
                                                                <BookOpen size={20} />
                                                            </div>
                                                            <span className="text-lg font-black text-[#414042]">{cls.nombre}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{cls.rango_edad || 'Sin rango edad'}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit
                                                            ${status === 'listo' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600 border border-yellow-200'}
                                                        `}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'listo' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                                                            {status === 'listo' ? 'Listo' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="p-2 text-gray-400 hover:text-logo-blue hover:bg-blue-50 rounded-xl transition-all">
                                                            <ArrowRight size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* DETAIL VIEW: Students list with Summary Stats */
                        <div className="space-y-6">
                            {/* Summary Header */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Presentes', value: attendanceData.filter(a => a.status === 'presente' || a.status === 'tarde').length, color: 'text-green-600', bg: 'bg-green-50' },
                                    { label: 'Ausentes', value: attendanceData.filter(a => a.status === 'ausente').length, color: 'text-red-600', bg: 'bg-red-50' },
                                    { label: 'Inasistencias', value: attendanceData.filter(a => a.status === 'no_registrado').length, color: 'text-gray-400', bg: 'bg-gray-50' },
                                    { label: 'Total Registros', value: attendanceData.length, color: 'text-logo-blue', bg: 'bg-blue-50' },
                                ].map((stat, i) => (
                                    <div key={i} className={`${stat.bg} p-4 rounded-3xl border border-gray-100/50 flex flex-col items-center justify-center`}>
                                        <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/80 border-b border-gray-100">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Alumno</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Estado</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Hora Reg.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-medium italic">
                                                        Cargando asistencia...
                                                    </td>
                                                </tr>
                                            ) : attendanceData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-medium italic">
                                                        No hay alumnos registrados en esta clase.
                                                    </td>
                                                </tr>
                                            ) : (
                                                attendanceData.map((record) => (
                                                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group relative border-l-4 border-transparent hover:border-gray-300">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs text-gray-400 uppercase">
                                                                    {record.nombre.substring(0, 2)}
                                                                </div>
                                                                <span className="font-bold text-[#414042]">{record.nombre}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest
                                                                ${record.status === 'presente' ? 'bg-green-100 text-green-700' :
                                                                    record.status === 'ausente' ? 'bg-red-100 text-red-700' :
                                                                        record.status === 'tarde' ? 'bg-yellow-100 text-yellow-700' :
                                                                            record.status === 'justificado' ? 'bg-blue-100 text-blue-700' :
                                                                                'bg-gray-100 text-gray-400'
                                                                }
                                                            `}>
                                                                {record.status === 'no_registrado' ? 'Sin Registro' : record.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-sm font-black text-gray-400">
                                                            {record.time}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
