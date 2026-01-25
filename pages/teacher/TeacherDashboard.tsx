import React, { useEffect, useState } from 'react';
import { User, ClassEntity, Student } from '../../types';
import { getClasses, getStudents, supabase } from '../../services/supabaseClient';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClassCard } from '../../components/dashboard/ClassCard';


export const TeacherDashboard: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const [teacherClasses, setTeacherClasses] = useState<ClassEntity[]>([]);
    const [classStats, setClassStats] = useState<Map<string, { total_alumnos: number; asistencia_promedio: number }>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeacherData();

        // Listen for class assignment updates
        const handleClassUpdate = () => {
            loadTeacherData();
        };

        window.addEventListener('teacher-class-updated', handleClassUpdate);

        return () => {
            window.removeEventListener('teacher-class-updated', handleClassUpdate);
        };
    }, [user]);

    const loadTeacherData = async () => {
        try {
            setLoading(true);
            // Get all classes
            const classes = await getClasses();

            console.log('Teacher user:', user);
            console.log('All classes:', classes);

            // Filter to show ONLY the teacher's assigned class
            let assignedClass: ClassEntity | null = null;

            // Try to find by assignedClass name first
            if (user.assignedClass) {
                assignedClass = classes.find(c =>
                    c.nombre.toLowerCase() === user.assignedClass?.toLowerCase() &&
                    c.estado === 'activa'
                ) || null;
            }

            // If not found, try to find by teacher email in docentes table
            if (!assignedClass) {
                // Get teacher info from docentes table
                const { data: teacherData } = await supabase
                    .from('docentes')
                    .select('clase')
                    .eq('email', user.email)
                    .single();

                if (teacherData?.clase) {
                    assignedClass = classes.find(c =>
                        c.nombre.toLowerCase() === teacherData.clase.toLowerCase() &&
                        c.estado === 'activa'
                    ) || null;
                }
            }

            console.log('Assigned class found:', assignedClass);

            // Set only the assigned class (or empty array if none)
            setTeacherClasses(assignedClass ? [assignedClass] : []);

            // Use the stats already fetched in assignedClass
            if (assignedClass?.stats) {
                const statsMap = new Map();
                statsMap.set(assignedClass.id, assignedClass.stats);
                setClassStats(statsMap);
            }
        } catch (error) {
            console.error('Error loading teacher data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800">¡Hola, Docente! 👋</h1>
                    <p className="text-gray-500 font-medium">Bienvenido a tu panel de gestión académica.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-2xl font-black text-[#00ADEF]">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Hoy</p>
                </div>
            </div>

            {/* Teacher's Assigned Class - MOVED TO TOP */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 border-4 border-[#00ADEF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-medium mt-4">Cargando tu clase...</p>
                </div>
            ) : teacherClasses.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Class Card */}
                    <div className="lg:col-span-1 max-w-md">
                        <h2 className="text-xl font-black text-gray-800 mb-4">Mi Clase Asignada</h2>
                        <ClassCard
                            classData={teacherClasses[0]}
                            stats={classStats.get(teacherClasses[0].id) || { total_alumnos: 0, asistencia_promedio: 0 }}
                            onClick={() => navigate('/teacher/class-manager')}
                        />
                    </div>

                    {/* Upcoming Events - NEW SECTION */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-black text-gray-800">Próximos Eventos</h2>
                            <button
                                onClick={() => navigate('/teacher/activities')}
                                className="text-xs font-black text-[#00ADEF] uppercase tracking-widest hover:underline"
                            >
                                Ver Todo
                            </button>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
                            <TeacherUpcomingEvents user={user} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Calendar size={18} className="text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay clase asignada</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Aún no tienes una clase asignada. Contacta al administrador para más información.
                    </p>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6">
                <button
                    onClick={() => navigate('/teacher/activities')}
                    className="group bg-[#414042] rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl cursor-pointer relative overflow-hidden transition-all text-left text-white"
                >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                                <Calendar size={32} className="text-[#D9DF21]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black mb-1">Agenda Completa</h2>
                                <p className="text-white/60 font-medium">Explora todas las actividades y eventos programados.</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[#D9DF21] group-hover:text-[#414042] transition-all">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

// Sub-component for events to keep it clean
const TeacherUpcomingEvents: React.FC<{ user: User }> = ({ user }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch events - for now global ones or class specific
                const { data: teacher } = await supabase.from('docentes').select('clase').eq('email', user.email).single();

                let query = supabase.from('eventos_calendario')
                    .select('*')
                    .gte('fecha_inicio', new Date().toISOString())
                    .neq('tipo', 'asistencia'); // EXCLUDE attendance sessions

                if (teacher?.clase) {
                    const { data: classData } = await supabase.from('clases').select('id').eq('nombre', teacher.clase).single();
                    if (classData) {
                        query = query.or(`clase_id.is.null,clase_id.eq.${classData.id}`);
                    } else {
                        query = query.filter('clase_id', 'is', null);
                    }
                } else {
                    query = query.filter('clase_id', 'is', null);
                }

                const { data } = await query.order('fecha_inicio', { ascending: true }).limit(3);
                setEvents(data || []);
            } catch (error) {
                console.error('Error fetching teacher events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-[#00ADEF] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (events.length === 0) return (
        <div className="flex flex-col items-center justify-center h-full opacity-30">
            <Calendar size={48} className="mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Sin eventos pendientes</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {events.map(event => (
                <div key={event.id} className="flex gap-6 items-center group">
                    <div className="flex flex-col items-center min-w-[64px] py-3 bg-gray-50 rounded-2xl group-hover:bg-[#00ADEF] group-hover:text-white transition-all duration-300 border border-gray-100 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {new Date(event.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black leading-none">
                            {new Date(event.fecha_inicio).getDate()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${event.tipo === 'clase' ? 'bg-[#D9DF21]/10 text-[#AAB01A] border-[#D9DF21]/20' :
                                event.tipo === 'evento_especial' ? 'bg-[#BE1E2D]/10 text-[#BE1E2D] border-[#BE1E2D]/20' :
                                    'bg-[#00ADEF]/10 text-[#00ADEF] border-[#00ADEF]/20'
                                }`}>
                                {event.tipo}
                            </span>
                            <span className="text-[10px] font-bold text-gray-300">•</span>
                            <span className="text-[10px] font-bold text-gray-400">
                                {new Date(event.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} HRS
                            </span>
                        </div>
                        <h4 className="text-lg font-black text-[#414042] truncate group-hover:text-[#00ADEF] transition-colors leading-tight">{event.titulo}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
};
