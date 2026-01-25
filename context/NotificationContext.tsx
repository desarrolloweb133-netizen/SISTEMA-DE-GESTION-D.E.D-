import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { SuccessAnimation } from '../components/ui/SuccessAnimation';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
    triggerSuccess: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Success Animation Implementation
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 4000);
    }, [removeNotification]);

    const triggerSuccess = useCallback((message: string) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        // Auto hide after animation (approx 2s)
        setTimeout(() => {
            setShowSuccess(false);
            setSuccessMessage('');
        }, 2200);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, triggerSuccess }}>
            {children}

            {/* Global Success Animation Overlay */}
            <SuccessAnimation
                isVisible={showSuccess}
                message={successMessage}
            />

            {/* Global Notification Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map((n) => (
                    <Toast
                        key={n.id}
                        {...n}
                        onClose={() => removeNotification(n.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const Toast: React.FC<Notification & { onClose: () => void }> = ({ message, type, onClose }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const styles = {
        success: {
            container: 'bg-white border-l-4 border-[#10B981] shadow-[0_8px_30px_rgb(16,185,129,0.15)]',
            iconBg: 'bg-[#10B981]/10 text-[#10B981]',
            title: 'text-[#10B981]'
        },
        error: {
            container: 'bg-white border-l-4 border-[#EF4444] shadow-[0_8px_30px_rgb(239,68,68,0.15)]',
            iconBg: 'bg-[#EF4444]/10 text-[#EF4444]',
            title: 'text-[#EF4444]'
        },
        warning: {
            container: 'bg-white border-l-4 border-[#F59E0B] shadow-[0_8px_30px_rgb(245,158,11,0.15)]',
            iconBg: 'bg-[#F59E0B]/10 text-[#F59E0B]',
            title: 'text-[#F59E0B]'
        },
        info: {
            container: 'bg-white border-l-4 border-[#3B82F6] shadow-[0_8px_30px_rgb(59,130,246,0.15)]',
            iconBg: 'bg-[#3B82F6]/10 text-[#3B82F6]',
            title: 'text-[#3B82F6]'
        }
    };

    const currentStyle = styles[type];

    return (
        <div className={`
            min-w-[340px] max-w-sm p-4 rounded-xl flex items-start gap-4 
            animate-in slide-in-from-right-full duration-500 pointer-events-auto
            border border-gray-50 transform transition-all hover:scale-[1.02]
            ${currentStyle.container}
        `}>
            <div className={`p-2 rounded-full shrink-0 ${currentStyle.iconBg}`}>
                {icons[type]}
            </div>
            <div className="flex-1 pt-0.5">
                <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${currentStyle.title}`}>
                    {type === 'success' && '¡Éxito!'}
                    {type === 'error' && '¡Error!'}
                    {type === 'warning' && 'Atención'}
                    {type === 'info' && 'Información'}
                </h4>
                <p className="text-xs font-bold text-gray-600 leading-snug">
                    {message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="p-1.5 -mr-1 -mt-1 hover:bg-gray-100/80 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
                <X size={14} strokeWidth={3} />
            </button>
        </div>
    );
};
