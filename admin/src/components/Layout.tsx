import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Siren, Scale, LogOut, Menu, Settings, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAuth } from '../utils/authStorage';
import { ROUTES } from '../utils/routes';

const NAV_ITEMS = [
    { path: ROUTES.adminDashboard, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: ROUTES.adminProviders, label: 'Providers', icon: <UserCog size={20} /> },
    { path: ROUTES.adminUsers, label: 'Users', icon: <Users size={20} /> },
    { path: ROUTES.adminEmergencies, label: 'Emergencies', icon: <Siren size={20} /> },
    { path: ROUTES.adminDisputes, label: 'Disputes', icon: <Scale size={20} /> },
    { path: ROUTES.adminSettings, label: 'Settings', icon: <Settings size={20} /> },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        clearAuth();
        navigate(ROUTES.home);
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
                {/* Premium Brand Header */}
                <div className="px-6 pt-8 pb-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/60 rounded-2xl p-5 flex flex-col items-center border border-gray-100/80">
                        <img src="/zyvark-logo.png" alt="Zyvark" className="w-14 h-14 rounded-2xl shadow-xl shadow-black/10 object-contain ring-2 ring-white" />
                        <h1 className="text-xl font-outfit font-black text-gray-900 tracking-tight mt-3">Zyvark</h1>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-0">Menu</p>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'text-white bg-black shadow-lg shadow-black/20 font-bold'
                                    : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-black'
                                }`
                            }
                        >
                            <span className="relative z-10 transition-transform group-hover:scale-110 duration-300">{item.icon}</span>
                            <span className="relative z-10">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-5 border-t border-gray-100">
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Logout</span>
                    </button>
                    <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                        <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-[0.15em]">a auxstel product</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative bg-[#F8FAFC]">
                {/* Mesh Background */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-50/50 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 p-8 h-full overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden relative z-10 p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="text-red-500" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Logout?</h3>
                            <p className="text-gray-500 font-medium mb-8">
                                Are you sure you want to log out of the admin panel?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
