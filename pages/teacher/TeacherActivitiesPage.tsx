import React, { useEffect, useState } from 'react';
import { User, CalendarEvent } from '../../types';
import { getEventsByClass, getClasses, supabase } from '../../services/supabaseClient';
import { Calendar, Clock, MapPin, Tag, AlertCircle } from 'lucide-react';

export const TeacherActivitiesPage: React.FC<{ user: User }> = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [classId, setClassId] = useState<string | null>(null);

    useEffect(() => {
        loadActivities();
    }, [user]);

    const loadActivities = async () => {
        try {
            setLoading(true);

            // Get teacher's class
            const { data: teacher } = await supabase
                .from('docentes')
                .select('clase')
                .eq('email', user.email)
                .single();

            if (teacher?.clase) {
                // Get class ID
                const { data: classData } = await supabase
                    .from('clases')
                    .select('id')
                    .eq('nombre', teacher.clase)
                    .single();

                // Build query for class events OR global events
                let query = supabase.from('eventos_calendario').select('*');

                if (classData) {
                    setClassId(classData.id);
                    query = query.or(`clase_id.eq.${classData.id},clase_id.is.null`).neq('tipo', 'asistencia');
                } else {
                    query = query.filter('clase_id', 'is', null).neq('tipo', 'asistencia');
                }

                const { data: allEvents, error } = await query.order('fecha_inicio', { ascending: true });

                if (error) throw error;
                setEvents(allEvents || []);
            }
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventStyles = (tipo: string) => {
        switch (tipo) {
            case 'clase':
                return 'bg-[#D9DF21]/10 border-[#D9DF21]/20 text-[#AAB01A]';
            case 'evento_especial':
                return 'bg-[#BE1E2D]/10 border-[#BE1E2D]/20 text-[#BE1E2D]';
            case 'actividad':
                return 'bg-[#00ADEF]/10 border-[#00ADEF]/20 text-[#00ADEF]';
            default:
                return 'bg-gray-100 border-gray-200 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-[#00ADEF] border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Sincronizando Agenda...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#414042]">Actividades y Eventos</h1>
                    <p className="text-gray-400 font-bold mt-1 uppercase tracking-wider text-[10px]">
                        Cronograma de actividades y eventos especiales
                    </p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                    <div className="w-2 h-2 bg-[#D9DF21] rounded-full animate-pulse"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Agenda Actualizada</span>
                </div>
            </div>

            {/* Events List */}
            {events.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-24 text-center border border-gray-100 shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-50">
                        <Calendar className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-[#414042] mb-4 tracking-tight">No hay actividades programadas</h3>
                    <p className="text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
                        Aún no hay actividades o eventos configurados para tu clase o a nivel global. El administrador te notificará pronto.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                            {/* Date Badge */}
                            <div className="flex items-center gap-3 mb-8 relative z-10">
                                <div className="flex flex-col items-center min-w-[54px] py-2 bg-gray-50 rounded-2xl group-hover:bg-[#00ADEF] group-hover:text-white transition-all duration-300 border border-gray-50">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                        {new Date(event.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' })}
                                    </span>
                                    <span className="text-xl font-black">
                                        {new Date(event.fecha_inicio).getDate()}
                                    </span>
                                </div>
                                <div className="h-10 w-px bg-gray-100 mt-2 mx-1"></div>
                                <div className="flex-1">
                                    <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getEventStyles(event.tipo)}`}>
                                        {event.tipo === 'evento_especial' ? 'Especial' : event.tipo}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                                        <Clock size={12} className="text-[#D9DF21]" />
                                        <span>{formatTime(event.fecha_inicio)} HRS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Event Title */}
                            <h3 className="text-2xl font-black text-[#414042] mb-4 relative z-10 group-hover:text-[#00ADEF] transition-colors line-clamp-2 leading-tight">
                                {event.titulo}
                            </h3>

                            {/* Event Description */}
                            {event.descripcion && (
                                <p className="text-gray-400 font-medium mb-8 relative z-10 line-clamp-3 text-sm leading-relaxed flex-1">
                                    {event.descripcion}
                                </p>
                            )}

                            {/* Event Details */}
                            <div className="space-y-3 pt-6 border-t border-gray-50 relative z-10">
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                    <MapPin size={14} className="text-[#D9DF21]" />
                                    <span>{event.aula || 'Aula por definir'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5 text-[#00ADEF]" />
                                    <span>{formatDate(event.fecha_inicio)}</span>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="mt-8 pt-4 flex flex-col gap-2 relative z-10">
                                <div className="h-0.5 w-12 bg-[#00ADEF]/20 rounded-full group-hover:w-full transition-all duration-700"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Detalles de Actividad</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
