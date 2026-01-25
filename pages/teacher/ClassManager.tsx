import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User, Student, ClassEntity, StudentAttendance, CalendarEvent } from '../../types';
import { supabase, createNotification, getTodaySessions } from '../../services/supabaseClient';
import { Search, Save, CheckCircle, XCircle, Clock, AlertCircle, Eye, Calendar, User as UserIcon, ArrowLeft, Phone, Mail, FileText, ChevronRight } from 'lucide-react';
import { getStudents, getClasses } from '../../services/supabaseClient';
import { PremiumSearch } from '../../components/common/PremiumSearch';
import { differenceInYears, parseISO } from 'date-fns';

const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return '?';
    try {
        return differenceInYears(new Date(), parseISO(birthDate));
    } catch (e) {
        return '?';
    }
};

export const ClassManager: React.FC<{ user: User }> = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [myClass, setMyClass] = useState<ClassEntity | null>(null);
    const [attendance, setAttendance] = useState<Record<string, 'presente' | 'ausente' | 'tarde' | 'justificado'>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
    const [teacherData, setTeacherData] = useState<any>(null);
    const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
    const [registrationMode, setRegistrationMode] = useState(false);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            // 1. Get Teacher Profile to find Class Name
            const { data: teacher } = await supabase.from('docentes').select('*').eq('email', user.email).single();

            if (teacher && teacher.clase) {
                setTeacherData(teacher); // Store teacher data for notifications
                // 2. Get Class ID (Case insensitive match)
                const { data: classData } = await supabase.from('clases')
                    .select('*')
                    .ilike('nombre', teacher.clase)
                    .single();

                if (classData) {
                    setMyClass(classData);
                    // 3. Get Students
                    const { data: studentsData } = await supabase.from('alumnos').select('*').eq('clase_id', classData.id);
                    if (studentsData) {
                        setStudents(studentsData);
                        const initial: Record<string, any> = {};
                        studentsData.forEach(s => initial[s.id] = 'presente'); // Default present
                        setAttendance(initial);

                        // 4. Fetch Today's Sessions (Active or Pending)
                        const todaySessions = await getTodaySessions(classData.id);
                        if (todaySessions.length > 0) {
                            setActiveEvent(todaySessions[0]);
                        }
                    }
                }
            } else {
                // Fallback: If no class assigned in profile, show all or error?
                console.log("No class assigned to teacher");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId: string, status: 'presente' | 'ausente' | 'tarde' | 'justificado') => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
        setSavedSuccess(false);
    };

    const saveAttendance = async () => {
        if (!myClass) return;
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            const records = students.map(student => ({
                alumno_id: student.id,
                clase_id: myClass.id,
                fecha: today,
                estado: attendance[student.id],
                registrado_por: user.email, // Or teacher ID if we had it handy
                evento_id: activeEvent?.id
            }));

            // Upsert (Insert or Update if exists for that student+date)
            // Supabase upsert needs a unique constraint on (alumno_id, fecha) usually.
            // Assuming table attendance_students has such logic or we delete first.

            // To be safe for MVP: Delete today's then insert.
            await supabase.from('asistencia_alumnos')
                .delete()
                .eq('clase_id', myClass.id)
                .eq('fecha', today);

            const { error } = await supabase.from('asistencia_alumnos').insert(records);

            if (error) throw error;

            setSavedSuccess(true);
            setTimeout(() => {
                setSavedSuccess(false);
                setRegistrationMode(false);
            }, 3000);
        } catch (err) {
            console.error(err);
            alert('Error al guardar asistencia');
        } finally {
            setSaving(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.apellido.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Cargando tu clase...</div>;

    if (!myClass) return (
        <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-800 mb-2">Sin Clase Asignada</h2>
            <p className="text-gray-500">No tienes una clase asignada en tu perfil. Contacta al administrador.</p>
        </div>
    );

    const generateDailyReport = () => {
        if (!myClass) return;
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

        // Header Style
        doc.setFillColor(0, 173, 239); // Logo Blue
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('D.E.D - REGISTRO DE ASISTENCIA', 15, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Departamento de Educación Digital • ${myClass.nombre}`, 15, 28);

        // Subheader Info
        doc.setTextColor(65, 64, 66);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Fecha del Registro: ${today}`, 15, 55);
        doc.text(`Docente: ${user.fullName || user.email}`, 15, 62);

        if (activeEvent) {
            doc.text(`Sesión: ${activeEvent.titulo}`, 15, 69);
        }

        const tableData = students.map((s, index) => [
            index + 1,
            `${s.nombre} ${s.apellido}`,
            attendance[s.id] ? attendance[s.id].toUpperCase() : 'NO REGISTRADO'
        ]);

        autoTable(doc, {
            startY: 80,
            head: [['#', 'Nombre del Alumno', 'Estado de Asistencia']],
            body: tableData,
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 5 },
            headStyles: { fillColor: [0, 173, 239], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 15, right: 15 }
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY + 30;
        doc.setDrawColor(200, 200, 200);
        doc.line(15, finalY, 75, finalY);
        doc.setFontSize(9);
        doc.text('Firma del Docente', 15, finalY + 5);

        doc.save(`Asistencia_${myClass.nombre}_${today}.pdf`);
    };

    // --- RENDER DETAIL VIEW ---
    if (viewMode === 'detail' && selectedStudent) {
        return (
            <div className="animate-fade-in space-y-6">
                {/* Breadcrumbs for navigation */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    <span className="cursor-pointer hover:text-[#00ADEF] transition-colors" onClick={() => setViewMode('list')}>Listado de Alumnos</span>
                    <ChevronRight size={10} />
                    <span className="text-gray-600">Perfil de Alumno</span>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header bar / Cover area */}
                    <div className="bg-logo-blue p-8 pb-12 relative overflow-hidden">
                        {/* Subtle Background pattern or color */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <button
                                onClick={() => setViewMode('list')}
                                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all group"
                            >
                                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                            </button>

                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl overflow-hidden border-4 border-white/20">
                                    {selectedStudent.foto_url ? (
                                        <img src={selectedStudent.foto_url} alt={selectedStudent.nombre} className="w-full h-full object-cover rounded-[1.8rem]" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 text-slate-300 flex items-center justify-center rounded-[1.8rem]">
                                            <UserIcon size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl font-black text-white leading-tight mb-2">
                                        {selectedStudent.nombre} {selectedStudent.apellido}
                                    </h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${selectedStudent.estado === 'activo' ? 'bg-[#D9DF21] text-[#414042]' : 'bg-white/20 text-white'
                                            }`}>
                                            {selectedStudent.estado}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 text-white backdrop-blur-md border border-white/20">
                                            {myClass.nombre}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 py-10 -mt-6 bg-white rounded-t-[3rem] relative z-20">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Personal Info Cards */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-[#00ADEF] rounded-full"></div>
                                        Información Personal
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-[#00ADEF]/30 transition-all">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-50 text-[#00ADEF] rounded-xl">
                                                    <Calendar size={18} />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Edad Actual</p>
                                            </div>
                                            <p className="text-2xl font-black text-gray-800 tracking-tight">{calculateAge(selectedStudent.fecha_nacimiento)} Años</p>
                                        </div>

                                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 group hover:border-[#00ADEF]/30 transition-all">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-50 text-[#00ADEF] rounded-xl">
                                                    <Calendar size={18} />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha de Nacimiento</p>
                                            </div>
                                            <p className="text-xl font-black text-gray-800 tracking-tight">
                                                {selectedStudent.fecha_nacimiento
                                                    ? new Date(selectedStudent.fecha_nacimiento + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : 'No registra'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Observations Area */}
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                                        Observaciones Médicas / Notas
                                    </h3>
                                    <div className="bg-yellow-50/30 p-8 rounded-3xl border border-yellow-100/50 min-h-[150px]">
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-yellow-500 shadow-sm h-fit">
                                                <FileText size={24} />
                                            </div>
                                            <p className="text-gray-700 font-medium leading-relaxed italic">
                                                {selectedStudent.observaciones || "Este alumno no cuenta con observaciones adicionales registradas hasta el momento."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar: Tutor Info */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                                        Información del Tutor
                                    </h3>
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="p-6 space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl">
                                                    <UserIcon size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.1em] mb-1">Nombre Completo</p>
                                                    <p className="text-sm font-bold text-gray-800 leading-snug">{selectedStudent.tutor_nombre || 'No registrado'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
                                                    <Phone size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.1em] mb-1">Teléfono Móvil</p>
                                                    <p className="text-sm font-bold text-gray-800 leading-snug tracking-widest">{selectedStudent.tutor_telefono || 'No registrado'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                                                    <Mail size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.1em] mb-1">Correo Electrónico</p>
                                                    <p className="text-sm font-bold text-gray-800 leading-snug">{selectedStudent.tutor_email || 'No registrado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 border-t border-gray-100">
                                            <button className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-gray-100 flex items-center justify-center gap-2">
                                                <Phone size={14} />
                                                Contactar por WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setViewMode('list')}
                                className="px-12 py-4 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
                            >
                                Volver al Listado
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Active Session Banner / Card */}
            {activeEvent ? (
                <div className={`p-4 sm:p-6 rounded-[2rem] transition-all duration-500 border ${registrationMode
                    ? 'bg-white border-gray-100 shadow-sm'
                    : activeEvent.habilitado
                        ? 'bg-[#00ADEF] text-white shadow-xl shadow-blue-500/20'
                        : 'bg-white border-blue-50 text-[#00ADEF]'
                    }`}>
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div className={`p-4 rounded-2xl shrink-0 ${registrationMode ? 'bg-blue-50 text-[#00ADEF]' : activeEvent.habilitado ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' : 'bg-gray-100 text-gray-300'}`}>
                                <Calendar size={28} />
                            </div>
                            <div>
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${registrationMode ? 'text-[#00ADEF]' : activeEvent.habilitado ? 'text-white/90 drop-shadow-sm' : 'text-[#00ADEF]/60'}`}>
                                    {registrationMode ? 'Pase de Lista Activo' : activeEvent.habilitado ? 'Sesión de Asistencia Programada' : 'Sesión en Espera'}
                                </p>
                                <h3 className={`text-xl sm:text-2xl font-black leading-tight ${registrationMode ? 'text-gray-800' : activeEvent.habilitado ? 'text-white drop-shadow-sm' : 'text-logo-blue'}`}>
                                    {activeEvent.titulo}
                                </h3>
                                {!registrationMode && (
                                    <p className={`text-xs font-medium mt-1 ${activeEvent.habilitado ? 'text-white/90' : 'text-[#00ADEF]/50'}`}>
                                        {activeEvent.habilitado
                                            ? 'Toca el botón para iniciar el registro.'
                                            : 'Esperando habilitación del administrador.'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {!registrationMode ? (
                            <button
                                onClick={() => activeEvent.habilitado && setRegistrationMode(true)}
                                disabled={!activeEvent.habilitado}
                                className={`w-full lg:w-auto px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${activeEvent.habilitado
                                    ? 'bg-white text-[#00ADEF] hover:scale-[1.05]'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                            >
                                {activeEvent.habilitado ? 'Iniciar Ahora' : 'En Espera'}
                            </button>
                        ) : (
                            /* ... same finalizado button ... */
                            <button
                                onClick={saveAttendance}
                                disabled={saving}
                                className={`w-full lg:w-auto flex items-center justify-center gap-3 px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${savedSuccess
                                    ? 'bg-green-500 text-white shadow-green-500/30'
                                    : 'bg-[#D9DF21] text-[#414042] hover:scale-105 shadow-yellow-500/30'
                                    }`}
                            >
                                {savedSuccess ? (
                                    <>
                                        <CheckCircle size={22} />
                                        ¡Datos Enviados!
                                    </>
                                ) : (
                                    <>
                                        <Save size={22} />
                                        {saving ? 'Guardando...' : 'Finalizar Registro'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Clock size={32} />
                    </div>
                    <h3 className="text-lg font-black text-gray-800">No hay sesiones activas</h3>
                    <p className="text-gray-400 text-sm font-medium">El administrador aún no ha habilitado el registro para hoy.</p>
                </div>
            )}

            {/* Always Show Student List */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                        <div>
                            <h3 className="font-extrabold text-gray-800 text-lg">Listado de Alumnos</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{myClass.nombre} • {filteredStudents.length} {filteredStudents.length === 1 ? 'Alumno' : 'Alumnos'}</p>
                        </div>
                        <button
                            onClick={generateDailyReport}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-[#BE1E2D]/5 text-gray-400 hover:text-[#BE1E2D] rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-gray-100 hover:border-[#BE1E2D]/20 shadow-sm"
                        >
                            <FileText size={16} />
                            Reporte PDF
                        </button>
                    </div>
                    <div className="w-full md:w-80">
                        <PremiumSearch
                            placeholder="Buscar por nombre o apellido..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                            <div key={student.id} className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100 shadow-sm">
                                        {student.foto_url ? (
                                            <img src={student.foto_url} alt={student.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <UserIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-extrabold text-gray-800 text-base leading-tight">{student.nombre} {student.apellido}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                            {student.fecha_nacimiento ? `${calculateAge(student.fecha_nacimiento)} Años` : 'Edad ?'}
                                        </p>
                                    </div>
                                    {!registrationMode && (
                                        <button
                                            onClick={() => {
                                                setSelectedStudent(student);
                                                setViewMode('detail');
                                            }}
                                            className="p-2.5 rounded-xl text-gray-400 hover:text-[#00ADEF] hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                            title="Ver detalles"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    )}
                                </div>

                                {registrationMode ? (
                                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                        {[
                                            { id: 'presente', label: 'Presente', icon: CheckCircle, color: 'green' },
                                            { id: 'tarde', label: 'Tarde', icon: Clock, color: 'yellow' },
                                            { id: 'ausente', label: 'Ausente', icon: XCircle, color: 'red' },
                                            { id: 'justificado', label: 'Justificado', icon: AlertCircle, color: 'blue' }
                                        ].map(status => (
                                            <button
                                                key={status.id}
                                                onClick={() => handleAttendanceChange(student.id, status.id as any)}
                                                className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${attendance[student.id] === status.id
                                                    ? `bg-${status.color}-50 border-${status.color}-200 text-${status.color}-600 shadow-sm`
                                                    : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <status.icon size={16} />
                                                    {status.label}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${student.estado === 'activo' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {student.estado}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <UserIcon size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Sin alumnos</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">No se encontraron alumnos asignados a esta clase.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
