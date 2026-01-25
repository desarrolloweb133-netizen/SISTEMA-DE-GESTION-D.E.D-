import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, GraduationCap, ChevronLeft, Menu, FileText } from 'lucide-react';
import { User } from '../../types';
import { GET_DED_LOGO } from '../../constants/assets';

interface TeacherLayoutProps {
    user: User;
    onLogout: () => void;
    children: React.ReactNode;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({ user, onLogout, children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        onLogout();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-santander">
            {/* Sidebar - Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-[#00ADEF] border-r border-white/10 transition-all duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <div className={`flex items-center gap-3 mb-10 px-2 ${collapsed ? 'justify-center' : ''}`}>
                        {!collapsed ? (
                            <>
                                <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 p-1">
                                    <img src={GET_DED_LOGO()} alt="Logo" className="w-full h-auto" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black tracking-tight text-white leading-none">DED</h1>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Portal Docente</p>
                                </div>
                            </>
                        ) : (
                            <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center p-1">
                                <img src={GET_DED_LOGO()} alt="Logo" className="w-full h-auto" />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2 flex-1">
                        <NavLink
                            to="/teacher/dashboard"
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-[#D9DF21] text-[#414042]' : 'text-white/80 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-0' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                            title={collapsed ? 'Dashboard' : ''}
                        >
                            <LayoutDashboard size={18} />
                            {!collapsed && 'Dashboard'}
                        </NavLink>
                        <NavLink
                            to="/teacher/class-manager"
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-[#D9DF21] text-[#414042]' : 'text-white/80 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-0' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                            title={collapsed ? 'Alumnos' : ''}
                        >
                            <Users size={18} />
                            {!collapsed && 'Alumnos'}
                        </NavLink>
                        <NavLink
                            to="/teacher/reports"
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-[#D9DF21] text-[#414042]' : 'text-white/80 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-0' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                            title={collapsed ? 'Reportes' : ''}
                        >
                            <FileText size={18} />
                            {!collapsed && 'Reportes'}
                        </NavLink>
                    </nav>

                    {/* User & Logout */}
                    <div className="pt-6 border-t border-white/10">
                        {!collapsed && (
                            <div className="flex items-center gap-3 mb-4 px-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
                                    <span className="text-sm font-black text-white">
                                        {user.email?.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Docente</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-white rounded-xl transition-all font-bold text-xs ${collapsed ? 'px-0' : ''}`}
                            title={collapsed ? 'Cerrar Sesión' : ''}
                        >
                            <LogOut size={14} />
                            {!collapsed && 'Cerrar Sesión'}
                        </button>

                        {/* Collapse Toggle (Desktop) */}
                        <div className="hidden lg:block pt-3 border-t border-white/10 mt-3">
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className={`w-full flex items-center justify-center gap-3 p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/20 ${collapsed ? 'px-0' : ''}`}
                                title={collapsed ? 'Expandir' : 'Colapsar'}
                            >
                                {collapsed ? (
                                    <ChevronLeft className="w-5 h-5 flex-shrink-0 rotate-180" />
                                ) : (
                                    <>
                                        <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Colapsar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-[#00ADEF] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5 flex-shrink-0">
                            <img src={GET_DED_LOGO()} alt="Logo" className="w-full h-auto" />
                        </div>
                        <div>
                            <span className="font-black text-white text-sm tracking-tight leading-none block">DED</span>
                            <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">Portal Docente</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 text-white/80 hover:text-white transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Page Content */}
                <div className="p-4 lg:p-10">
                    {children}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-fade-in">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <LogOut className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 text-center mb-3">¿Cerrar Sesión?</h3>
                        <p className="text-gray-500 text-center mb-8">
                            ¿Estás seguro de que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                            >
                                Sí, Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};
