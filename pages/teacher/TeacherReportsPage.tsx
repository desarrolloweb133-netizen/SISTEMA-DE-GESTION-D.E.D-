import React, { useState, useEffect } from 'react';
import {
    BarChart2, TrendingUp, Users, Calendar,
    Download, FileText, Award
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { getClasses, getAllStudents } from '../../services/supabaseClient';
import { ClassEntity, Student } from '../../types';

export const TeacherReportsPage: React.FC = () => {
    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [classesData, studentsData] = await Promise.all([
                getClasses(),
                getAllStudents()
            ]);
            // Filter to show only active classes (teacher's classes)
            setClasses(classesData.filter(c => c.estado === 'activa'));
            setStudents(studentsData);
        } catch (error) {
            console.error('Error loading reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived data for charts
    const studentsPerClass = classes.map(c => ({
        name: c.nombre,
        total: students.filter(s => s.clase_id === c.id).length
    }));

    const attendanceStats = [
        { name: 'Lun', asistencia: 85 },
        { name: 'Mar', asistencia: 78 },
        { name: 'Mié', asistencia: 92 },
        { name: 'Jue', asistencia: 88 },
        { name: 'Vie', asistencia: 95 },
        { name: 'Sáb', asistencia: 80 },
        { name: 'Dom', asistencia: 98 },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#414042]">Reportes de Asistencia</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Métricas • Estadísticas • Análisis</p>
                </div>
                <button className="flex items-center gap-2 bg-[#D9DF21] text-[#414042] px-8 py-3.5 rounded-2xl font-bold hover:bg-[#C4CB1D] transition-all shadow-lg shadow-yellow-500/10 text-sm">
                    <Download size={20} />
                    Exportar Reporte
                </button>
            </div>

            {/* Class Filter */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">Filtrar por Clase</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full md:w-auto px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all font-medium text-sm"
                >
                    <option value="all">Todas las Clases</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Total Alumnos', value: students.length, icon: Users, color: '#00ADEF', bg: 'rgba(0, 173, 239, 0.08)' },
                    { label: 'Asistencia Promedio', value: '92%', icon: TrendingUp, color: '#D9DF21', bg: 'rgba(217, 223, 33, 0.08)' },
                    { label: 'Clases Activas', value: classes.length, icon: Calendar, color: '#BE1E2D', bg: 'rgba(190, 30, 45, 0.08)' },
                    { label: 'Nivel de Retención', value: 'Óptimo', icon: Award, color: '#414042', bg: 'rgba(65, 64, 66, 0.08)' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: stat.bg, color: stat.color }}>
                            <stat.icon size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[2px]">{stat.label}</p>
                            <p className="text-2xl font-black text-[#414042] mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Students per Class Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-[#414042] flex items-center gap-3">
                            <Users className="text-[#00ADEF] w-6 h-6" />
                            Alumnos por Clase
                        </h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={studentsPerClass}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                                    cursor={{ fill: 'rgba(0, 173, 239, 0.03)' }}
                                />
                                <Bar dataKey="total" fill="#00ADEF" radius={[12, 12, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Trend Line Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-[#414042] flex items-center gap-3">
                            <TrendingUp className="text-[#D9DF21] w-6 h-6" />
                            Evolución de Asistencia
                        </h3>
                        <div className="flex bg-gray-50 p-1 rounded-xl">
                            <button className="px-3 py-1 text-[9px] font-black uppercase tracking-tighter bg-white rounded-lg shadow-sm text-[#414042]">Semana</button>
                            <button className="px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-gray-400">Mes</button>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={attendanceStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="asistencia"
                                    stroke="#D9DF21"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: '#D9DF21', strokeWidth: 3, stroke: '#fff' }}
                                    activeDot={{ r: 8, stroke: '#D9DF21', strokeWidth: 4, fill: '#fff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Reports Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h3 className="text-xl font-black text-[#414042]">Reportes Generados</h3>
                    <button className="text-[#00ADEF] text-xs font-black uppercase tracking-widest hover:underline">Ver Todos</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reporte</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clase</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-[#00ADEF]/10 group-hover:text-[#00ADEF] transition-all">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <span className="font-extrabold text-[#414042] text-sm group-hover:text-[#00ADEF] transition-colors line-clamp-1">Reporte Asistencia Semanal</span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">RT-00{i}-26X</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-500">1{i} Enero, 2026</td>
                                    <td className="px-8 py-6 text-sm font-extrabold text-[#414042]">{i === 1 ? 'Kinder' : 'Juveniles'}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-[#00ADEF] hover:text-white rounded-xl transition-all text-[#00ADEF] shadow-sm">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
