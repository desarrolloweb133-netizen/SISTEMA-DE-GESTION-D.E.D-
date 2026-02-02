import React from 'react';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    ClipboardCheck,
    BarChart3,
    Calendar,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
    ShieldCheck,
    LogOut
} from 'lucide-react';
import { GET_DED_LOGO } from '../../constants/assets';

interface SidebarProps {
    activeView: string;
    onNavigate: (view: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    onNavigate,
    collapsed,
    onToggleCollapse,
    onCloseMobile
}) => {
    const menuItems = [
        { id: 'inicio', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'alumnos', label: 'Alumnos', icon: Users },
        { id: 'docentes', label: 'Docentes', icon: GraduationCap },
        { id: 'asistencia', label: 'Asistencia', icon: ClipboardCheck },
        { id: 'reportes', label: 'Reportes', icon: BarChart3 },
        { id: 'calendario', label: 'Calendario', icon: Calendar },
        { id: 'config', label: 'Configuración', icon: Settings },
    ];

    const handleLogoutClick = () => {
        window.dispatchEvent(new CustomEvent('request-logout'));
    };

    return (
        <div className={`h-full bg-[#00ADEF] flex flex-col shadow-2xl relative transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header / Logo Section */}
            <div className={`p-4 border-b border-gray-100 lg:border-white/10 flex items-center h-[73px] transition-all duration-300 ${collapsed ? 'justify-center' : 'justify-start gap-3'}`}>
                <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 p-1">
                    <img src={GET_DED_LOGO()} alt="Logo" className="w-full h-auto" />
                </div>

                <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <h1 className="text-xl font-extrabold text-white leading-tight">DED</h1>
                    <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">PEDERNALES CENTRAL</p>
                </div>

                {/* Close Mobile Button */}
                {!collapsed && (
                    <button
                        onClick={onCloseMobile}
                        className="lg:hidden p-2 text-white/60 hover:text-white rounded-lg transition-colors ml-auto"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 overflow-y-auto px-3 space-y-0.5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center h-[46px] rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-[#D9DF21] text-[#414042] shadow-lg'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                } ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                            title={collapsed ? item.label : ''}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
                            <span className={`font-bold text-sm tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                                {item.label}
                            </span>
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 bg-white lg:bg-[#414042] rounded-full shadow-sm animate-pulse"></div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Actions Section */}
            <div className="mt-auto space-y-1 p-3">
                {/* Logout Button */}
                <button
                    onClick={handleLogoutClick}
                    className={`w-full flex items-center transition-all duration-300 text-white/80 hover:bg-red-500/20 hover:text-white rounded-xl h-[46px] ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                    title={collapsed ? 'Cerrar Sesión' : ''}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className={`font-bold text-sm tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                        Cerrar Sesión
                    </span>
                </button>

                {/* Collapse Toggle (Desktop) */}
                <div className="hidden lg:block pt-1 border-t border-white/10">
                    <button
                        onClick={onToggleCollapse}
                        className={`w-full flex items-center transition-all duration-300 rounded-xl h-[46px] text-white/70 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 ${collapsed ? 'justify-center px-0' : 'justify-start px-4 gap-4'}`}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5 flex-shrink-0" />
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

            {/* Footer / App Version */}
            <div className={`pb-4 px-4 text-center transition-all duration-300 overflow-hidden ${collapsed ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100 mt-2'}`}>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-normal whitespace-nowrap">
                    Departamento Local | &copy; 2026
                </p>
            </div>

        </div >
    );
};
