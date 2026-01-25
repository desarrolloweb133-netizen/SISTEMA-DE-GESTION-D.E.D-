import React from 'react';
import { Settings, Shield, Bell, Database, Globe, Moon, User, Save } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const SettingsPage: React.FC = () => {
    const { showNotification } = useNotification();

    const sections = [
        {
            title: 'Sistema y Apariencia',
            icon: Settings,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            items: [
                { label: 'Modo Oscuro', description: 'Cambiar el tema de la aplicación', type: 'toggle', value: false },
                { label: 'Idioma', description: 'Español (Colombia)', type: 'select', options: ['Español', 'English'] },
            ]
        },
        {
            title: 'Notificaciones',
            icon: Bell,
            color: 'text-logo-pink',
            bg: 'bg-red-50',
            items: [
                { label: 'Alertas de Asistencia', description: 'Notificar cuando un docente registre asistencia', type: 'toggle', value: true },
                { label: 'Sonido de Notificación', description: 'Emitir sonido al recibir alertas', type: 'toggle', value: true },
            ]
        },
        {
            title: 'Seguridad',
            icon: Shield,
            color: 'text-green-500',
            bg: 'bg-green-50',
            items: [
                { label: 'Cambiar Contraseña', description: 'Actualizar tus credenciales de acceso', type: 'button' },
                { label: 'Autenticación en dos pasos', description: 'Añadir una capa extra de seguridad', type: 'toggle', value: false },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#414042]">Configuración</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Ajustes del Sistema • Preferencias Globales</p>
                </div>
                <button
                    onClick={() => showNotification('Configuración guardada correctamente', 'success')}
                    className="flex items-center gap-2 bg-logo-blue text-white px-8 py-3.5 rounded-2xl hover:bg-logo-blue/90 transition-all shadow-lg shadow-blue-500/10 font-bold text-sm uppercase tracking-widest active:scale-95"
                >
                    <Save size={18} />
                    Guardar Cambios
                </button>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className={`p-6 border-b border-gray-50 flex items-center gap-4 ${section.bg}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm ${section.color}`}>
                                <section.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-800 tracking-tight">{section.title}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ajustes de sección</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-gray-800 group-hover:text-logo-blue transition-colors">{item.label}</p>
                                        <p className="text-xs text-gray-400 font-medium">{item.description}</p>
                                    </div>

                                    {item.type === 'toggle' && (
                                        <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${item.value ? 'bg-logo-blue' : 'bg-gray-200'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${item.value ? 'translate-x-6' : 'translate-x-0 shadow-sm'}`}></div>
                                        </div>
                                    )}

                                    {item.type === 'select' && (
                                        <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-logo-blue/20 outline-none cursor-pointer">
                                            {item.options?.map(opt => <option key={opt}>{opt}</option>)}
                                        </select>
                                    )}

                                    {item.type === 'button' && (
                                        <button className="text-xs font-bold text-logo-blue hover:underline">Gestionar</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* System Info Card */}
                <div className="bg-gradient-to-br from-[#414042] to-[#2D2D2E] rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-gray-200">
                    <div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20">
                            <Database size={28} />
                        </div>
                        <h3 className="text-2xl font-black mb-2 tracking-tight">Estado del Sistema</h3>
                        <p className="text-white/60 text-sm font-medium leading-relaxed">
                            Todos los servicios están operando normalmente. Conectado a la base de datos de Supabase en tiempo real.
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>Versión del Software</span>
                            <span className="text-white/80">v2.4.0-premium</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                            <span>Última Sincronización</span>
                            <span className="text-[#D9DF21]">Hace 2 minutos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
