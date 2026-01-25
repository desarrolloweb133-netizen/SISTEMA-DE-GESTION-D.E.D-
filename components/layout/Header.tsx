import React from 'react';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { GET_DED_LOGO } from '../../constants/assets';

interface HeaderProps {
    user: { email: string; role: string } | null;
    onLogout: () => void;
    onOpenSidebar: () => void;
    activeView: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    unreadNotifications?: number;
    onNotificationClick?: () => void;
}


export const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenSidebar, activeView, searchQuery, onSearchChange, unreadNotifications = 0, onNotificationClick }) => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm">
            {/* Left: Mobile Menu & Breadcrumbs/Search */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 hover:bg-gray-100 rounded-xl lg:hidden text-gray-600 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center p-1">
                        <img src={GET_DED_LOGO()} alt="Logo" className="w-full h-auto" />
                    </div>
                    <h1 className="text-xl font-extrabold text-[#414042] hidden sm:block">PEDERCENT</h1>
                </div>

                {activeView === 'dashboard' && (
                    <div className="hidden md:flex items-center flex-1 max-w-md">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#00ADEF] transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar en el sistema..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00ADEF]/20 focus:border-[#00ADEF] transition-all"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-2 lg:gap-4">
                {/* Notifications */}
                <button
                    onClick={onNotificationClick}
                    className="hidden sm:flex relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                        <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-[#BE1E2D] rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[10px] font-black text-white">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
                        </span>
                    )}
                </button>

                {/* Vertical Divider */}
                <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>

                {/* User Info */}
                {user && (
                    <div className="flex items-center gap-3 pl-2">
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold text-[#414042] line-clamp-1">{user.email}</p>
                            <p className="text-[10px] font-bold text-[#00ADEF] uppercase tracking-wider">{user.role}</p>
                        </div>
                        <div className="w-9 h-9 bg-gradient-to-br from-[#00ADEF] to-[#00709C] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
