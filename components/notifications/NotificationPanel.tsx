import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, UserPlus, UserX, Edit3, Clock } from 'lucide-react';
import { NotificationData } from '../../types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/supabaseClient';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    unreadCount: number;
    onUnreadCountChange: (count: number) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, unreadCount, onUnreadCountChange }) => {
    const navigate = useNavigate();
    const panelRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications();
            // Filter to show only unread by default if "ya no deberia aparecer mas" implies persistent storage of "read" = "hidden"
            // For now, let's load all but visually we will remove them when user marks as read manually.
            const unreadOnly = data.filter(n => !n.leida);
            setNotifications(unreadOnly);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string, event?: React.MouseEvent) => {
        event?.stopPropagation(); // Prevent navigation trigger
        await markNotificationAsRead(notificationId);
        // Remove from list
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update global count
        onUnreadCountChange(Math.max(0, unreadCount - 1));
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications([]);
        onUnreadCountChange(0);
    };

    const getNotificationIcon = (tipo: string) => {
        switch (tipo) {
            case 'alumno_creado':
                return <UserPlus className="w-4 h-4 text-green-500" />;
            case 'alumno_eliminado':
                return <UserX className="w-4 h-4 text-red-500" />;
            case 'alumno_actualizado':
                return <Edit3 className="w-4 h-4 text-blue-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const getNotificationText = (notif: NotificationData) => {
        switch (notif.tipo) {
            case 'alumno_creado':
                return `creó al alumno ${notif.alumno_nombre}`;
            case 'alumno_eliminado':
                return `eliminó al alumno ${notif.alumno_nombre}`;
            case 'alumno_actualizado':
                return `actualizó los datos de ${notif.alumno_nombre}`;
            default:
                return 'realizó una acción';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    if (!isOpen) return null;

    return (
        <div ref={panelRef} className="fixed top-20 right-6 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-5 duration-300 border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00ADEF]/10 rounded-xl flex items-center justify-center">
                            <Bell className="w-5 h-5 text-[#00ADEF]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Notificaciones</h3>
                            <p className="text-xs text-gray-500 font-medium">
                                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 text-xs font-bold text-[#00ADEF] hover:text-[#0090C1] transition-colors"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 border-4 border-[#00ADEF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-gray-500 font-medium mt-4">Cargando...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 mb-1">No hay notificaciones</h4>
                        <p className="text-xs text-gray-500">Las acciones de los docentes aparecerán aquí</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => {
                                    if (!notif.leida) handleMarkAsRead(notif.id);
                                    // Navigation Logic
                                    if (notif.tipo === 'alumno_creado' && notif.detalles?.classId) {
                                        onClose(); // Close panel
                                        navigate(`/admin/clases/${notif.detalles.classId}?highlight=${notif.alumno_id}`);
                                    }
                                }}
                                className={`p-4 transition-all cursor-pointer hover:bg-gray-50 ${!notif.leida ? 'bg-blue-50/50' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.leida ? 'bg-white shadow-sm' : 'bg-gray-50'
                                            }`}>
                                            {getNotificationIcon(notif.tipo)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 leading-snug">
                                                <span className="font-bold">{notif.docente_nombre}</span>{' '}
                                                <span className="font-medium">{getNotificationText(notif)}</span>
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {formatTimestamp(notif.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {!notif.leida && (
                                        <button
                                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                                            className="p-1.5 rounded-lg bg-blue-100/50 text-[#00ADEF] hover:bg-[#00ADEF] hover:text-white transition-all shadow-sm"
                                            title="Marcar como leída y ocultar"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
