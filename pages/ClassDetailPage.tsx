import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Users, Calendar, BarChart2, Settings,
    Plus, Search, Mail, Phone, MoreVertical, Save, User
} from 'lucide-react';
import { ClassEntity, Student, StudentAttendance, AttendanceStatus } from '../types';
import {
    getClasses, getStudentsByClass, addStudent, updateStudent,
    getStudentAttendanceByClassAndDate, saveStudentAttendance, getClassById
} from '../services/supabaseClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotification } from '../context/NotificationContext';
import { StudentForm } from '../components/dashboard/StudentForm';
import { ClassSettings } from '../components/dashboard/ClassSettings';

interface ClassDetailPageProps {
    onDataChange?: () => void;
}

export const ClassDetailPage: React.FC<ClassDetailPageProps> = ({ onDataChange }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<ClassEntity | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'reports' | 'settings'>('students');

    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const { showNotification, triggerSuccess } = useNotification();

    // Attendance state
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
    const [savingAttendance, setSavingAttendance] = useState(false);
    const location = useLocation();
    const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const highlight = params.get('highlight');
        if (highlight && students.length > 0) {
            setHighlightedStudentId(highlight);
            setTimeout(() => {
                const element = document.getElementById(`student-${highlight}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                // Clear highlight after 5 seconds
                setTimeout(() => setHighlightedStudentId(null), 5000);
            }, 500);
        }
    }, [location.search, students]);

    useEffect(() => {
        if (id) {
            loadClassData(id);
        }
    }, [id]);

    useEffect(() => {
        if (activeTab === 'attendance' && id) {
            loadAttendance(id, selectedDate);
        }
    }, [activeTab, selectedDate, id]);

    const loadAttendance = async (classId: string, date: string) => {
        const data = await getStudentAttendanceByClassAndDate(classId, date);
        const map: Record<string, AttendanceStatus> = {};
        data.forEach(att => {
            map[att.alumno_id] = att.estado;
        });
        setAttendanceData(map);
    };

    const loadClassData = async (classId: string) => {
        try {
            setLoading(true);

            // Parallel fetch for better performance
            const [classResult, studentsResult] = await Promise.all([
                getClassById(classId),
                getStudentsByClass(classId)
            ]);

            if (classResult) {
                setClassData(classResult);
                setStudents(studentsResult);
            } else {
                console.error("Class not found", classId);
                navigate('/admin/inicio');
            }
        } catch (error) {
            console.error('Error loading class detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStudent = async (data: Partial<Student>) => {
        try {
            if (editingStudent) {
                await updateStudent(editingStudent.id, data);
            } else {
                await addStudent({
                    ...data,
                    clase_id: id || ''
                } as Omit<Student, 'id' | 'created_at'>);
            }
            if (id) loadClassData(id);
            if (onDataChange) onDataChange();

            if (editingStudent) {
                showNotification('Alumno actualizado correctamente', 'success');
            } else {
                triggerSuccess('Alumno inscrito correctamente');
            }

            setView('list');
        } catch (error) {
            console.error('Error saving student:', error);
            showNotification('Error al guardar el alumno', 'error');
        }
    };

    const handleToggleAttendance = (studentId: string, status: AttendanceStatus) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === status ? 'ausente' : status
        }));
    };

    const handleSaveAllAttendance = async () => {
        if (!id) return;
        try {
            setSavingAttendance(true);
            const attendancePayload = students.map(student => ({
                alumno_id: student.id,
                clase_id: id,
                fecha: selectedDate,
                estado: attendanceData[student.id] || 'ausente',
                registrado_por: 'admin' // TODO: Get current user
            }));

            await saveStudentAttendance(attendancePayload);
            showNotification('Asistencia guardada correctamente', 'success');
        } catch (error) {
            console.error('Error saving attendance:', error);
            showNotification('Error al guardar asistencia', 'error');
        } finally {
            setSavingAttendance(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3AED]"></div>
            </div>
        );
    }

    if (view === 'form') {
        return (
            <StudentForm
                onClose={() => setView('list')}
                onSave={handleSaveStudent}
                editingStudent={editingStudent}
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/inicio')}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm text-[#00ADEF] group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-extrabold text-[#414042] tracking-tight">{classData.nombre}</h1>
                            <span
                                className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20"
                                style={{ backgroundColor: classData.color || '#00ADEF' }}
                            >
                                {classData.rango_edad}
                            </span>
                        </div>
                        <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Aula: {classData.aula} • {classData.horario}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setEditingStudent(null);
                            setView('form');
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-[#00ADEF] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#0090C1] transition-all shadow-lg shadow-blue-500/20 text-sm"
                    >
                        <Plus size={20} />
                        Inscribir Alumno
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 gap-2">
                {[
                    { id: 'students', label: 'Lista de Alumnos', icon: Users },
                    { id: 'attendance', label: 'Control Asistencia', icon: Calendar },
                    { id: 'reports', label: 'Analíticas', icon: BarChart2 },
                    { id: 'settings', label: 'Configuración', icon: Settings }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-[#00ADEF] text-white shadow-md'
                            : 'text-gray-400 hover:text-[#00ADEF] hover:bg-blue-50/50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                {activeTab === 'students' && (
                    <div className="p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-[#414042]">Matrícula Activa</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total: {students.length} Miembros Inscritos</p>
                            </div>
                            <div className="relative w-full sm:w-80 group">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00ADEF] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Localizar registro..."
                                    className="w-full pl-12 pr-6 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        {students.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="px-6 pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Perfil Alumno</th>
                                            <th className="px-6 pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Edad</th>
                                            <th className="px-6 pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Referencia Tutor</th>
                                            <th className="px-6 pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                                            <th className="px-6 pb-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {students.map((student) => (
                                            <tr
                                                key={student.id}
                                                id={`student-${student.id}`}
                                                className={`hover:bg-blue-50/30 transition-all group ${highlightedStudentId === student.id ? 'bg-[#D9DF21]/20 animate-pulse border-l-4 border-[#D9DF21]' : ''}`}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shadow-sm group-hover:bg-[#00ADEF] group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                                            {student.foto_url ? (
                                                                <img src={student.foto_url} alt={student.nombre} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-white">
                                                                    <User size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-[#414042] group-hover:text-[#00ADEF] transition-colors">{student.nombre} {student.apellido}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-bold text-gray-500">{student.edad} Años</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-sm font-extrabold text-[#414042]">{student.tutor_nombre}</p>
                                                        <div className="flex items-center gap-2 text-[#D9DF21]">
                                                            <Phone size={12} strokeWidth={3} />
                                                            <span className="text-[10px] font-black tracking-widest">{student.tutor_telefono}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${student.estado === 'activo'
                                                        ? 'bg-green-50 text-green-600 border-green-100'
                                                        : 'bg-red-50 text-red-600 border-red-100'
                                                        }`}>
                                                        {student.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setEditingStudent(student);
                                                            setView('form');
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-[#00ADEF] hover:text-white rounded-xl transition-all text-gray-400 shadow-sm"
                                                    >
                                                        <Settings size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-24 flex flex-col items-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-6">
                                    <Users size={48} />
                                </div>
                                <h4 className="text-xl font-black text-[#414042]">Sin Registros</h4>
                                <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto mt-2">Esta clase aún no cuenta con alumnos inscritos. Comienza agregando el primero.</p>
                                <button
                                    onClick={() => {
                                        setEditingStudent(null);
                                        setView('form');
                                    }}
                                    className="mt-8 text-[#00ADEF] font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform"
                                >
                                    + Inscribir Primer Alumno
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="p-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-[#414042]">Gestión de Registro</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 bg-[#D9DF21] rounded-full"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {format(new Date(selectedDate + 'T12:00:00'), "EEEE, d MMMM yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                                <div className="relative group flex-1 sm:min-w-[200px]">
                                    <input
                                        type="date"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-xs uppercase"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleSaveAllAttendance}
                                    disabled={savingAttendance}
                                    className="flex items-center justify-center gap-3 bg-[#00ADEF] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#0090C1] transition-all shadow-lg shadow-blue-500/20 text-sm disabled:opacity-50"
                                >
                                    {savingAttendance ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {savingAttendance ? 'Sincronizando...' : 'Publicar Registro'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 rounded-[2rem] border border-gray-100 overflow-hidden shadow-inner">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identidad Alumno</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Selector de Estatus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map(student => (
                                        <tr key={student.id} className="bg-white/40 hover:bg-white transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center group-hover:bg-[#00ADEF]/10 transition-colors">
                                                        {student.foto_url ? (
                                                            <img src={student.foto_url} alt={student.nombre} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[#00ADEF]">
                                                                <User size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-extrabold text-[#414042] group-hover:text-[#00ADEF] transition-colors">{student.nombre} {student.apellido}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center flex-wrap gap-2">
                                                    {[
                                                        { id: 'presente', label: 'PRESENTE', activeClass: 'bg-[#D9DF21] text-white shadow-[#D9DF21]/30' },
                                                        { id: 'tarde', label: 'TARDE', activeClass: 'bg-orange-400 text-white shadow-orange-400/30' },
                                                        { id: 'justificado', label: 'JUSTIFICADO', activeClass: 'bg-[#00ADEF] text-white shadow-[#00ADEF]/30' },
                                                        { id: 'ausente', label: 'AUSENTE', activeClass: 'bg-[#BE1E2D] text-white shadow-[#BE1E2D]/30' }
                                                    ].map((status) => (
                                                        <button
                                                            key={status.id}
                                                            onClick={() => handleToggleAttendance(student.id, status.id as any)}
                                                            className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${(attendanceData[student.id] === status.id || (!attendanceData[student.id] && status.id === 'ausente'))
                                                                ? `${status.activeClass} scale-105 shadow-lg`
                                                                : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100 hover:border-gray-200'
                                                                }`}
                                                        >
                                                            {status.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="p-24 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-8 border border-dashed border-gray-200">
                            <BarChart2 size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-[#414042]">Módulo en Desarrollo</h3>
                        <p className="text-sm text-gray-500 mt-4 max-w-sm font-medium">
                            Estamos optimizando las funcionalidades de analíticas avanzadas para brindarte una mejor experiencia de gestión. Próximamente disponible.
                        </p>
                    </div>
                )}

                {activeTab === 'settings' && classData && (
                    <div className="p-8">
                        <ClassSettings
                            classData={classData}
                            onUpdate={() => {
                                loadClassData(classData.id);
                                if (onDataChange) onDataChange();
                            }}
                            onDelete={() => {
                                if (onDataChange) onDataChange();
                                navigate('/dashboard');
                            }}
                        />
                    </div>
                )}
            </div>

        </div>
    );
};
