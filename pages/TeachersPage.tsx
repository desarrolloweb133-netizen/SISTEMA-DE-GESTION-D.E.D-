import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, Download,
    Phone, Mail, Trash2, Edit, GraduationCap,
    MapPin, Calendar, BookOpen
} from 'lucide-react';
import { Teacher, AttendanceRecord } from '../types';
import {
    getTeachers, addTeacher,
    updateTeacher, deleteTeacher,
    getAttendanceHistory, supabase
} from '../services/supabaseClient';
import { TeacherForm } from '../components/dashboard/TeacherForm';
import { useNotification } from '../context/NotificationContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PremiumSearch } from '../components/common/PremiumSearch';
import { PremiumSelect } from '../components/common/PremiumSelect';

interface TeachersPageProps {
    onDataChange?: () => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({ onDataChange }) => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [historyDateFilter, setHistoryDateFilter] = useState('');
    const [historyClassFilter, setHistoryClassFilter] = useState('');

    const [view, setView] = useState<'list' | 'form'>('list');
    const [activeTab, setActiveTab] = useState<'list' | 'attendance' | 'history'>('list');
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

    const { showNotification, triggerSuccess } = useNotification();

    // Derive unique classes for filter
    const uniqueClasses = Array.from(new Set(teachers.map(t => t.clase || 'General'))).sort();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'attendance' || activeTab === 'history') {
            loadAttendance();

            // Subscribe to real-time changes in asistencias table
            const channel = supabase
                .channel('realtime-attendance')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'asistencias' },
                    async (payload) => {
                        console.log('New attendance record:', payload);
                        // Fetch teacher details for the new record
                        const { data: teacher } = await supabase
                            .from('docentes')
                            .select('nombre, apellido, clase')
                            .eq('id', payload.new.docente_id)
                            .single();

                        const newRecord: AttendanceRecord = {
                            ...payload.new as any,
                            docente_nombre: teacher ? `${teacher.nombre} ${teacher.apellido}` : 'Desconocido',
                            clase: teacher?.clase || ''
                        };

                        // Update both lists
                        const today = new Date().toISOString().split('T')[0];
                        if (newRecord.fecha === today) {
                            setAttendanceRecords(prev => [newRecord, ...prev]);
                        }
                        setHistoryRecords(prev => [newRecord, ...prev]);

                        triggerSuccess(`Asistencia registrada: ${newRecord.docente_nombre}`);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [activeTab]);

    const loadAttendance = async () => {
        try {
            const data = await getAttendanceHistory();
            setHistoryRecords(data);

            // Filter only today's records for real-time view
            const today = new Date().toISOString().split('T')[0];
            const todayRecords = data.filter(r => r.fecha === today);
            setAttendanceRecords(todayRecords);
        } catch (error) {
            console.error('Error loading attendance history:', error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getTeachers();
            setTeachers(data);
        } catch (error) {
            console.error('Error loading teachers:', error);
            showNotification('Error al cargar docentes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTeacher = async (data: Partial<Teacher>) => {
        try {
            if (editingTeacher) {
                await updateTeacher(editingTeacher.id, data);

                // If updating the currently logged-in teacher, update their session
                const teacherSession = localStorage.getItem('teacher_session');
                if (teacherSession) {
                    const currentUser = JSON.parse(teacherSession);
                    if (currentUser.id === editingTeacher.id && data.clase) {
                        // Update the assignedClass in session
                        currentUser.assignedClass = data.clase;
                        localStorage.setItem('teacher_session', JSON.stringify(currentUser));
                        // Trigger page reload to reflect changes
                        window.dispatchEvent(new CustomEvent('teacher-class-updated'));
                    }
                }

                showNotification('Docente actualizado correctamente', 'success');
            } else {
                await addTeacher(data as Omit<Teacher, 'id' | 'created_at'>);
                triggerSuccess('Docente registrado correctamente');
            }
            loadData();
            if (onDataChange) onDataChange();
            setView('list');
            setEditingTeacher(null);
        } catch (error) {
            console.error('Error saving teacher:', error);
            showNotification('Error al guardar el docente', 'error');
        }
    };

    const handleDeleteClick = (id: string) => {
        setTeacherToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!teacherToDelete) return;

        try {
            await deleteTeacher(teacherToDelete);
            loadData();
            if (onDataChange) onDataChange();
            showNotification('Docente eliminado correctamente', 'success');
        } catch (error) {
            console.error('Error deleting teacher:', error);
            showNotification('Error al eliminar el docente', 'error');
        } finally {
            setDeleteModalOpen(false);
            setTeacherToDelete(null);
        }
    };

    const filteredTeachers = teachers.filter(t => {
        const matchesSearch = (t.nombre + ' ' + t.apellido).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter ? t.rol === roleFilter : true;
        return matchesSearch && matchesRole;
    });

    const filteredAttendance = attendanceRecords.filter(r =>
        r.docente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clase?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredHistory = historyRecords.filter(r => {
        const matchesSearch = r.docente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.clase?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = historyDateFilter ? r.fecha === historyDateFilter : true;
        const matchesClass = historyClassFilter ? r.clase === historyClassFilter : true;

        return matchesSearch && matchesDate && matchesClass;
    });

    if (view === 'form') {
        return (
            <TeacherForm
                onClose={() => setView('list')}
                onSave={handleSaveTeacher}
                editingTeacher={editingTeacher}
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#414042]">Cuerpo Docente</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-[10px] sm:text-xs">Administración • Gestión de Profesores</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTeacher(null);
                        setView('form');
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D9DF21] text-[#414042] px-8 py-3.5 rounded-2xl hover:bg-[#C4CB1D] transition-all shadow-lg shadow-yellow-500/10 font-bold text-sm active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Docente
                </button>
            </div>

            {/* Unified Navigation and Filters Bar */}
            <div className="bg-white p-2 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center gap-4 w-full overflow-hidden">
                {/* Tabs - Scrollable on mobile if needed */}
                <div className="flex bg-gray-50 p-1.5 rounded-3xl sm:rounded-[1.8rem] gap-1 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 ${activeTab === 'list'
                            ? 'bg-[#00ADEF] text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:text-[#00ADEF] hover:bg-white'
                            }`}
                    >
                        <Users size={16} />
                        Lista
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 ${activeTab === 'attendance'
                            ? 'bg-[#00ADEF] text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:text-[#00ADEF] hover:bg-white'
                            }`}
                    >
                        <Calendar size={16} />
                        Asistencia
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 ${activeTab === 'history'
                            ? 'bg-[#00ADEF] text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:text-[#00ADEF] hover:bg-white'
                            }`}
                    >
                        <BookOpen size={16} />
                        Historial
                    </button>
                </div>

                {/* Search and Filters - Visible only for List or adapted for both */}
                <div className="flex-1 flex flex-col md:flex-row items-center gap-3 w-full p-2 pr-4">
                    {/* Search */}
                    <div className="flex-1 w-full">
                        <PremiumSearch
                            placeholder={
                                activeTab === 'list' ? "Buscar por nombre, email..." :
                                    activeTab === 'attendance' ? "Buscar en registros de hoy..." : "Buscar por nombre o clase..."
                            }
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </div>

                    {/* Role Filter (Only for list) */}
                    {activeTab === 'list' && (
                        <div className="md:w-48 shrink-0 w-full">
                            <PremiumSelect
                                placeholder="Todos los Roles"
                                value={roleFilter}
                                onChange={setRoleFilter}
                                options={[
                                    { id: 'docente', nombre: 'Docentes' },
                                    { id: 'coordinador', nombre: 'Coordinadores' },
                                    { id: 'administrador', nombre: 'Admin' }
                                ]}
                            />
                        </div>
                    )}

                    {/* History Filters (Date and Class) */}
                    {activeTab === 'history' && (
                        <>
                            {/* Date Filter */}
                            <div className="md:w-40 relative group shrink-0 w-full">
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-[#00ADEF]/10 focus:border-[#00ADEF] focus:bg-white transition-all font-bold text-[#414042] cursor-pointer"
                                    value={historyDateFilter}
                                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                                />
                            </div>

                            {/* Class Filter */}
                            <div className="md:w-48 shrink-0 w-full">
                                <PremiumSelect
                                    placeholder="Todas las Clases"
                                    value={historyClassFilter}
                                    onChange={setHistoryClassFilter}
                                    options={uniqueClasses.map(cls => ({ id: cls, nombre: cls }))}
                                />
                            </div>
                        </>
                    )}

                    {/* Export / Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="p-2.5 rounded-2xl border border-gray-100 text-gray-400 hover:text-[#00ADEF] hover:border-[#00ADEF] hover:bg-blue-50 transition-all shadow-sm bg-white" title="Exportar datos">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'list' ? (
                <>
                    {/* Teachers Table */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 border-4 border-gray-100 border-t-[#00ADEF] rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando base de datos...</p>
                            </div>
                        ) : filteredTeachers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Docente</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Especialidad</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contacto</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredTeachers.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/10 border-2 border-white">
                                                            {teacher.foto_url ? (
                                                                <img src={teacher.foto_url} alt={teacher.nombre} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center font-black text-lg">
                                                                    {teacher.nombre[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-extrabold text-[#414042] group-hover:text-[#7C3AED] transition-colors leading-tight">
                                                                {teacher.nombre} {teacher.apellido}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 capitalize">{teacher.rol}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-block px-3 py-1 bg-purple-50 text-[#7C3AED] rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-100">
                                                        {teacher.clase || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Mail className="w-3 h-3" />
                                                            <span className="text-xs font-bold text-[#414042]">{teacher.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                            <span className="text-xs font-bold">{teacher.telefono}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${teacher.estado === 'activo'
                                                        ? 'bg-green-50 text-green-600 border border-green-100'
                                                        : 'bg-red-50 text-red-600 border border-red-100'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${teacher.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        {teacher.estado}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTeacher(teacher);
                                                                setView('form');
                                                            }}
                                                            className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-[#7C3AED] hover:text-white rounded-xl transition-all text-[#7C3AED] shadow-sm hover:shadow-lg hover:shadow-purple-500/20"
                                                            title="Editar registro"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(teacher.id)}
                                                            className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-[#BE1E2D] hover:text-white rounded-xl transition-all text-[#BE1E2D] shadow-sm hover:shadow-lg hover:shadow-red-500/20"
                                                            title="Eliminar registro"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-32 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                    <GraduationCap className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#414042] mb-2">Sin Docentes</h3>
                                <p className="text-gray-400 max-w-sm mx-auto">No se encontraron docentes con los criterios actuales.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : activeTab === 'attendance' ? (
                /* Attendance Real-time Section */
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-[#414042]">Registro de Hoy</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sincronización en tiempo real activa</p>
                            </div>
                            <div className="flex items-center gap-3 text-[#D9DF21] bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9DF21] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D9DF21]"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest">En Vivo</span>
                            </div>
                        </div>

                        {filteredAttendance.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Docente</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clase/Especialidad</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hora de Ingreso</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredAttendance.map((record) => (
                                            <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group animate-fade-in">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-[#00ADEF]/10 text-[#00ADEF] flex items-center justify-center font-black text-xs">
                                                            {record.docente_nombre?.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span className="font-extrabold text-[#414042] group-hover:text-[#00ADEF] transition-colors">
                                                            {record.docente_nombre}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-block px-3 py-1 bg-purple-50 text-[#7C3AED] rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-100">
                                                        {record.clase || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-[#00ADEF]">
                                                        <div className="w-2 h-2 rounded-full bg-[#00ADEF] animate-pulse"></div>
                                                        <span className="font-black text-sm tracking-tight">{record.hora}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-gray-400">
                                                    {record.fecha}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-32 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                    <Calendar className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#414042] mb-2">Sin registros hoy</h3>
                                <p className="text-gray-400 max-w-sm mx-auto">Los ingresos de docentes aparecerán aquí automáticamente en tiempo real.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Attendance History Section */
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-2xl font-black text-[#414042]">Historial de Asistencia</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Registros completos históricos</p>
                        </div>

                        {filteredHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Docente</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clase/Especialidad</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hora</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredHistory.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center font-black text-xs">
                                                            {record.docente_nombre?.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <span className="font-extrabold text-[#414042]">
                                                            {record.docente_nombre}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-block px-3 py-1 bg-purple-50 text-[#7C3AED] rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-100">
                                                        {record.clase || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-[#414042]">
                                                    {record.hora}
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-gray-400">
                                                    {record.fecha}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-32 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-gray-200" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#414042] mb-2">Sin registros</h3>
                                <p className="text-gray-400 max-w-sm mx-auto">No se encontraron registros de asistencia que coincidan con la búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Docente"
                message="¿Estás seguro de que deseas eliminar este docente? Esta acción eliminará también su historial de asistencia y no se puede deshacer."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                isDestructive={false}
            />
        </div>
    );
};
