import React, { useState, useEffect } from 'react';
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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
            {/* Sidebar - Desktop */}
            {/* Sidebar - Desktop */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-[#00ADEF] border-r border-white/10 transition-all duration-300 ease-in-out lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'w-20' : 'w-64'}`}
            >
                <div className="h-full flex flex-col bg-[#00ADEF] overflow-hidden">
                    {/* Logo */}
                    <div className={`p-4 border-b border-white/10 flex items-center h-[73px] transition-all duration-300 ${collapsed ? 'justify-center' : 'justify-start gap-3'}`}>
                        <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 p-1">
                            <img src={GET_DED_LOGO()} alt="Logo" className="w-full h-auto" />
                        </div>
                        <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            <h1 className="text-xl font-extrabold text-white leading-tight">DED</h1>
                            <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">Portal Docente</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-3 overflow-y-auto px-3 space-y-0.5">
                        <NavLink
                            to="/teacher/inicio"
                            className={({ isActive }) => `w-full flex items-center h-[46px] rounded-xl transition-all duration-300 group ${isActive ? 'bg-[#D9DF21] text-[#414042] shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                            onClick={() => setMobileMenuOpen(false)}
                            title={collapsed ? 'Dashboard' : ''}
                        >
                            <LayoutDashboard className={`w-5 h-5 min-w-[20px] flex-shrink-0 transition-all duration-300`} />
                            <span className={`font-bold text-sm tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                Dashboard
                            </span>
                        </NavLink>
                        <NavLink
                            to="/teacher/class-manager"
                            className={({ isActive }) => `w-full flex items-center h-[46px] rounded-xl transition-all duration-300 group ${isActive ? 'bg-[#D9DF21] text-[#414042] shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                            onClick={() => setMobileMenuOpen(false)}
                            title={collapsed ? 'Alumnos' : ''}
                        >
                            <Users className={`w-5 h-5 min-w-[20px] flex-shrink-0 transition-all duration-300`} />
                            <span className={`font-bold text-sm tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                Alumnos
                            </span>
                        </NavLink>
                        <NavLink
                            to="/teacher/reports"
                            className={({ isActive }) => `w-full flex items-center h-[46px] rounded-xl transition-all duration-300 group ${isActive ? 'bg-[#D9DF21] text-[#414042] shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                            onClick={() => setMobileMenuOpen(false)}
                            title={collapsed ? 'Reportes' : ''}
                        >
                            <FileText className={`w-5 h-5 min-w-[20px] flex-shrink-0 transition-all duration-300`} />
                            <span className={`font-bold text-sm tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                Reportes
                            </span>
                        </NavLink>
                    </nav>

                    {/* User & Logout */}
                    <div className="mt-auto space-y-1 p-3">
                        <div className={`flex items-center gap-3 mb-2 px-2 transition-all duration-300 rounded-xl hover:bg-white/5 py-2 ${collapsed ? 'justify-center' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 flex-shrink-0">
                                <span className="text-xs font-black text-white">
                                    {user.email?.substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                <p className="text-xs font-bold text-white truncate max-w-[140px]">{user.email}</p>
                                <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Docente</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center transition-all duration-300 text-white/80 hover:bg-red-500/20 hover:text-white rounded-xl h-[46px] ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                            title={collapsed ? 'Cerrar Sesión' : ''}
                        >
                            <LogOut className={`w-5 h-5 min-w-[20px] flex-shrink-0 transition-all duration-300`} />
                            <span className={`font-bold text-sm tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                Cerrar Sesión
                            </span>
                        </button>

                        {/* Collapse Toggle (Desktop) */}
                        <div className="hidden lg:block pt-1 border-t border-white/10 mt-1">
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className={`w-full flex items-center transition-all duration-300 rounded-xl h-[46px] text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                                title={collapsed ? 'Expandir' : 'Colapsar'}
                            >
                                {collapsed ? (
                                    <ChevronLeft className="w-5 h-5 flex-shrink-0 rotate-180" />
                                ) : (
                                    <>
                                        <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap overflow-hidden max-w-[200px] opacity-100">
                                            Colapsar
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
            >
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
