import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { LogOut } from 'lucide-react';
import { getUnreadNotificationsCount } from '../../services/supabaseClient';


import { useNavigate, useLocation } from 'react-router-dom';


interface LayoutProps {
    children: React.ReactNode;
    user: { email: string; role: string } | null;
    onLogout: () => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    user,
    onLogout,
    searchQuery,
    onSearchChange
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeView = location.pathname.split('/')[2] || 'inicio';

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleNavigate = (view: string) => {
        navigate(`/admin/${view}`);
    };

    // Listen for logout request from sidebar
    useEffect(() => {
        const handleRequestLogout = () => setShowLogoutModal(true);
        window.addEventListener('request-logout', handleRequestLogout);
        return () => window.removeEventListener('request-logout', handleRequestLogout);
    }, []);

    // Poll for unread notifications count (every 30 seconds)
    useEffect(() => {
        const loadUnreadCount = async () => {
            const count = await getUnreadNotificationsCount();
            setUnreadCount(count);
        };

        loadUnreadCount(); // Initial load
        const interval = setInterval(loadUnreadCount, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, []);

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        onLogout();
    };


    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Sidebar Overlay - Mobile only */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-[70] transform lg:translate-x-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
                <Sidebar
                    activeView={activeView}
                    onNavigate={handleNavigate}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    onCloseMobile={() => setSidebarOpen(false)}
                />
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 min-h-screen flex flex-col ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Header */}
                <Header
                    user={user}
                    onLogout={onLogout}
                    onOpenSidebar={() => setSidebarOpen(true)}
                    activeView={activeView}
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    unreadNotifications={unreadCount}
                    onNotificationClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    isOpen={showNotificationPanel}
                    onClose={() => setShowNotificationPanel(false)}
                    onUnreadCountChange={setUnreadCount}
                />


                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Notification Panel moved to Header */}

            {/* Global Logout Confirmation Modal */}

            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fade-in"
                        onClick={() => setShowLogoutModal(false)}
                    ></div>
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 animate-scale-up border border-gray-100">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <LogOut className="w-10 h-10 text-[#BE1E2D]" />
                        </div>
                        <h3 className="text-2xl font-black text-center text-[#414042] mb-3 tracking-tight">¿Cerrar Sesión ahora?</h3>
                        <p className="text-gray-500 text-center mb-10 font-semibold leading-relaxed">
                            Tu sesión actual se cerrará de forma segura. ¿Estás listo para salir del sistema?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="flex-1 py-4 rounded-2xl font-bold text-white bg-[#BE1E2D] hover:bg-[#a11926] transition-all shadow-[0_8px_20px_rgba(190,30,45,0.3)] active:scale-95"
                            >
                                Sí, Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
