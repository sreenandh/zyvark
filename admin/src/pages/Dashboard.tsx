import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { TrendingUp, Users, Clock, CheckCircle, AlertTriangle, DollarSign, Activity, Package } from 'lucide-react';

interface Stats {
    total: number;
    pending: number;
    active: number;
    completed: number;
    disputed: number;
    todayOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    platformFeePercent: number;
}

interface RecentEmergency {
    id: string;
    status: string;
    category: { name: string; icon: string };
    user: { name: string; phone: string };
    provider?: { name: string };
    totalPrice: number;
    quotedPrice: number;
    platformFee: number;
    createdAt: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentEmergency[]>([]);

    useEffect(() => {
        loadStats();
        loadRecent();
    }, []);

    const loadStats = async () => {
        try {
            const res = await adminAPI.getDashboardStats();
            setStats(res.data);
        } catch {
            setStats({ total: 0, pending: 0, active: 0, completed: 0, disputed: 0, todayOrders: 0, totalRevenue: 0, todayRevenue: 0, platformFeePercent: 10 });
        }
    };

    const loadRecent = async () => {
        try {
            const res = await adminAPI.getEmergencies(1);
            setRecentOrders((res.data?.emergencies || res.data || []).slice(0, 10));
        } catch { }
    };

    const cards = stats ? [
        { label: "Today's Orders", value: stats.todayOrders, icon: <Package size={24} />, bg: 'bg-indigo-50', text: 'text-indigo-600' },
        { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, bg: 'bg-cyan-50', text: 'text-cyan-600' },
        { label: 'Total Emergencies', value: stats.total, icon: <Activity size={24} />, bg: 'bg-red-50', text: 'text-red-600' },
        { label: 'Pending', value: stats.pending, icon: <Clock size={24} />, bg: 'bg-yellow-50', text: 'text-yellow-600' },
        { label: 'Active', value: stats.active, icon: <Activity size={24} />, bg: 'bg-blue-50', text: 'text-blue-600' },
        { label: 'Completed', value: stats.completed, icon: <CheckCircle size={24} />, bg: 'bg-green-50', text: 'text-green-600' },
        { label: 'Disputed', value: stats.disputed, icon: <AlertTriangle size={24} />, bg: 'bg-orange-50', text: 'text-orange-600' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    ] : [];

    const statusColor: Record<string, string> = {
        pending: 'text-yellow-600 bg-yellow-50',
        accepted: 'text-blue-600 bg-blue-50',
        arrived: 'text-cyan-600 bg-cyan-50',
        in_progress: 'text-orange-600 bg-orange-50',
        completed: 'text-green-600 bg-green-50',
        confirmed: 'text-emerald-600 bg-emerald-50',
        disputed: 'text-red-600 bg-red-50',
        cancelled: 'text-gray-500 bg-gray-100',
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-500 font-medium">Platform fee: <span className="text-black font-bold">{stats?.platformFeePercent || 10}%</span></p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {cards.map((card) => (
                    <div key={card.label} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-4 rounded-2xl ${card.bg} ${card.text} group-hover:scale-110 transition-transform duration-300`}>
                                {card.icon}
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                            <p className="text-gray-400 text-sm font-medium">Latest incoming orders</p>
                        </div>
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Service</th>
                                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Customer</th>
                                    <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Status</th>
                                    <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Amount</th>
                                    <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">No orders found</td>
                                    </tr>
                                ) : recentOrders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg bg-gray-100 w-8 h-8 flex items-center justify-center rounded-lg">{order.category?.icon}</span>
                                                <span className="text-sm font-bold text-gray-900">{order.category?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{order.user?.name || 'Guest'}</span>
                                                <span className="text-xs text-gray-400">{order.user?.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor[order.status] || 'text-gray-500 bg-gray-100'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-sm font-bold text-gray-900">{order.totalPrice ? `₹${order.totalPrice}` : '—'}</span>
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs font-medium text-gray-400">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-black text-white rounded-[2rem] p-8 shadow-xl shadow-black/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gray-800 rounded-full blur-[80px] -mr-16 -mt-16 opacity-50 pointer-events-none" />

                    <h2 className="text-xl font-bold text-white mb-6 relative z-10">System Health</h2>
                    <div className="space-y-6 relative z-10">
                        {[
                            { name: 'API Server', status: 'Operational', color: 'bg-green-500' },
                            { name: 'Database', status: 'Operational', color: 'bg-green-500' },
                            { name: 'Real-time Gateway', status: 'Active', color: 'bg-green-500' },
                            { name: 'Notifications', status: 'Dev Mode', color: 'bg-yellow-500' },
                            { name: 'SMS Gateway', status: 'Dev Mode', color: 'bg-yellow-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-gray-300 font-medium text-sm">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.color} animate-pulse`} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-xs text-gray-500 font-medium">Last check: {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
