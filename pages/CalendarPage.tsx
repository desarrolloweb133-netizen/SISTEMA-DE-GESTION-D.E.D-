import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    Plus, Search, Clock, MapPin, Users
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '../types';
import { getCalendarEvents, addCalendarEvent } from '../services/supabaseClient';
import { EventForm } from '../components/dashboard/EventForm';
import { useNotification } from '../context/NotificationContext';

export const CalendarPage: React.FC = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const { showNotification, triggerSuccess } = useNotification();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await getCalendarEvents();
            setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvent = async (data: Partial<CalendarEvent>) => {
        try {
            // TODO: Implement update logic if editingEvent exists
            await addCalendarEvent(data as Omit<CalendarEvent, 'id' | 'created_at'>);
            loadEvents();
            triggerSuccess('Evento programado correctamente');
            setView('list');
        } catch (error) {
            console.error('Error saving event:', error);
            showNotification(
                '❌ No se pudo guardar el evento\n\n' +
                'Ocurrió un problema al registrar el evento. Verifica que todos los campos estén completos correctamente e inténtalo nuevamente.\n\n' +
                'Si el problema persiste, contacta al administrador del sistema.',
                'error'
            );
        }
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setEditingEvent(null);
        setView('form');
    };

    if (view === 'form') {
        return (
            <EventForm
                onClose={() => setView('list')}
                onSave={handleSaveEvent}
                editingEvent={editingEvent}
                initialDate={selectedDate}
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#414042]">Calendario Local</h1>
                        <p className="text-gray-400 font-bold mt-1 uppercase tracking-wider text-[9px]">Planificación Estratégica • Escuela Dominical</p>
                    </div>

                    {/* Navigation Controls - Moved next to title as per image */}
                    <div className="flex items-center bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-50 rounded-lg transition-all text-[#BE1E2D]"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-3 py-1 font-bold text-[#414042] min-w-[120px] text-center capitalize text-xs tracking-wide">
                            {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </div>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-gray-50 rounded-lg transition-all text-[#BE1E2D]"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
                    <button
                        onClick={() => {
                            setSelectedDate(new Date());
                            setEditingEvent(null);
                            setView('form');
                        }}
                        className="flex items-center justify-center gap-2 bg-[#BE1E2D] text-white px-6 py-3 rounded-xl font-black hover:bg-[#A31A27] transition-all shadow-xl shadow-red-500/20 text-[10px] uppercase tracking-widest active:scale-95"
                    >
                        <Plus size={16} />
                        Nuevo Evento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 xl:gap-6">
                {/* Main Calendar Section */}
                <div className="lg:col-span-3">
                    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[550px]">
                        {/* Internal Header (Current Month) */}
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-[#00ADEF]/10 hover:text-[#00ADEF] transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <h2 className="text-xl font-black text-[#414042]">
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </h2>
                        </div>

                        {/* Day Labels */}
                        <div className="grid grid-cols-7 mb-2 border-b border-gray-50">
                            {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map((day, index) => (
                                <div key={index} className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {loading ? (
                            <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <div className="w-10 h-10 border-4 border-gray-100 border-t-[#00ADEF] rounded-full animate-spin mb-4"></div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sincronizando agenda...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-px bg-gray-50 border border-gray-100 rounded-2xl shadow-inner overflow-hidden">
                                {eachDayOfInterval({
                                    start: startOfWeek(startOfMonth(currentMonth)),
                                    end: endOfWeek(endOfMonth(currentMonth))
                                }).map((day, index) => {
                                    const monthStart = startOfMonth(currentMonth);
                                    const isCurrentMonth = isSameMonth(day, monthStart);
                                    const isToday = isSameDay(day, new Date());
                                    const dayEvents = events.filter(event => isSameDay(new Date(event.fecha_inicio), day));

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleDateClick(day)}
                                            className={`min-h-[70px] sm:min-h-[85px] bg-white p-1.5 transition-all cursor-pointer hover:bg-blue-50/50 flex flex-col group ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : 'text-gray-700 font-bold'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isToday
                                                    ? 'bg-[#00ADEF] text-white shadow-md shadow-blue-500/20'
                                                    : 'text-gray-400 group-hover:bg-[#00ADEF]/10 group-hover:text-[#00ADEF]'
                                                    }`}>
                                                    {format(day, 'd')}
                                                </span>
                                            </div>
                                            <div className="space-y-0.5 overflow-hidden">
                                                {dayEvents.map(event => (
                                                    <div
                                                        key={event.id}
                                                        className={`text-[7px] px-1.5 py-0.5 rounded-md border-l-2 truncate font-black uppercase tracking-wider transition-all hover:scale-[1.02] ${event.tipo === 'clase' ? 'bg-[#D9DF21]/10 border-[#D9DF21] text-[#AAB01A]' :
                                                            event.tipo === 'evento_especial' ? 'bg-[#BE1E2D]/10 border-[#BE1E2D] text-[#BE1E2D]' :
                                                                'bg-[#00ADEF]/10 border-[#00ADEF] text-[#00ADEF]'
                                                            }`}
                                                    >
                                                        {event.titulo}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Event Selection Popover / List (Visualizar eventos registrados) */}
                        {selectedDate && !editingEvent && view === 'list' && events.filter(e => isSameDay(new Date(e.fecha_inicio), selectedDate)).length > 0 && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col p-8 animate-in fade-in zoom-in-95 duration-300 rounded-3xl">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-[#414042]">Eventos para el {format(selectedDate, 'd MMMM', { locale: es })}</h3>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-0.5">Actividades Programadas</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-xs font-bold"
                                    >
                                        Cerrar Vista
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                    {events.filter(e => isSameDay(new Date(e.fecha_inicio), selectedDate)).map(event => (
                                        <div
                                            key={event.id}
                                            className="bg-white border border-gray-100 p-4 rounded-[1.5rem] hover:border-[#00ADEF] hover:shadow-lg transition-all group"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingEvent(event);
                                                setView('form');
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${event.tipo === 'clase' ? 'bg-[#D9DF21]/10 text-[#AAB01A] border-[#D9DF21]/20' :
                                                    event.tipo === 'evento_especial' ? 'bg-[#BE1E2D]/10 text-[#BE1E2D] border-[#BE1E2D]/20' :
                                                        'bg-[#00ADEF]/10 text-[#00ADEF] border-[#00ADEF]/20'
                                                    }`}>
                                                    {event.tipo}
                                                </span>
                                                <Clock size={14} className="text-gray-300 group-hover:text-[#00ADEF] transition-colors" />
                                            </div>
                                            <h4 className="text-lg font-black text-[#414042] mb-1 leading-tight">{event.titulo}</h4>
                                            <p className="text-xs text-gray-400 font-medium mb-3 line-clamp-2">{event.descripcion || 'Sin descripción adicional'}</p>
                                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                <MapPin size={10} className="text-[#D9DF21]" />
                                                <span>{event.aula || 'Aula por definir'} • {format(new Date(event.fecha_inicio), 'HH:mm')} HRS</span>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Quick Add Button */}
                                    <button
                                        onClick={() => setView('form')}
                                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-6 hover:border-[#00ADEF] hover:bg-blue-50/30 transition-all text-gray-300 hover:text-[#00ADEF] group"
                                    >
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#00ADEF] group-hover:text-white transition-all">
                                            <Plus size={20} />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-[10px]">Programar Nuevo</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Info Section */}
                <div className="space-y-4 xl:space-y-6">
                    {/* Next Events Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#00ADEF] shadow-sm">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#414042] leading-tight">Próximos</h3>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Eventos de {format(currentMonth, 'MMMM', { locale: es })}</p>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {events.length > 0 ? (
                                events
                                    .filter(e => new Date(e.fecha_inicio) >= new Date())
                                    .slice(0, 4)
                                    .map(event => (
                                        <div key={event.id} className="group cursor-pointer" onClick={() => {
                                            setEditingEvent(event);
                                            setView('form');
                                        }}>
                                            <div className="flex gap-3 items-center">
                                                <div className="flex flex-col items-center min-w-[50px] py-2 bg-gray-50 rounded-xl group-hover:bg-[#00ADEF] group-hover:text-white transition-all duration-300 border border-gray-50 shadow-sm">
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                                        {format(new Date(event.fecha_inicio), 'MMM', { locale: es })}
                                                    </span>
                                                    <span className="text-xl font-black leading-none">
                                                        {format(new Date(event.fecha_inicio), 'd')}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-black text-[#414042] truncate group-hover:text-[#00ADEF] transition-colors">{event.titulo}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Clock size={10} className="text-[#D9DF21]" />
                                                        <span className="text-[9px] font-bold text-gray-400">
                                                            {format(new Date(event.fecha_inicio), 'HH:mm')} HRS • {event.tipo}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center px-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                        <CalendarIcon size={30} className="text-gray-400" />
                                    </div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Sin Eventos</h4>
                                    <p className="text-[9px] font-medium leading-tight">No hay actividades programadas.</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => window.print()}
                            className="w-full mt-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#00ADEF] bg-blue-50/50 rounded-xl hover:bg-[#00ADEF] hover:text-white transition-all duration-300 shadow-sm"
                        >
                            Imprimir Agenda
                        </button>
                    </div>

                    {/* Summary Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#414042] to-[#2D2D2E] p-6 rounded-3xl shadow-xl shadow-gray-100 text-white group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        <h3 className="font-black text-lg mb-1 relative z-10 tracking-tight">Resumen Global</h3>
                        <p className="text-white/60 text-xs mb-4 font-medium relative z-10 leading-tight">Total de {events.length} eventos registrados en el sistema central.</p>
                        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-md relative z-10 border border-white/5 group-hover:bg-white/20 transition-all font-black text-[9px] uppercase tracking-widest">
                            <Users size={16} className="text-[#D9DF21]" />
                            <span>Control Administrativo</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
