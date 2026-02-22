import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { User, Phone, Mail, Calendar, Search } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await adminAPI.getUsers();
            setUsers(res.data.users || []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Users</h1>
                    <p className="text-gray-500 font-medium">Manage registered customers</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-100 focus:border-black outline-none font-medium text-sm w-64 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">User Details</th>
                                <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Contact Info</th>
                                <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider px-8 py-4">Joined On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg shadow-inner">
                                                {u.name ? u.name.charAt(0).toUpperCase() : <User size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{u.name || 'Unnamed User'}</p>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                                <Phone size={14} className="text-gray-400" /> {u.phone}
                                            </div>
                                            {u.email && (
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Mail size={14} className="text-gray-400" /> {u.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-500 text-sm font-medium">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-20 text-gray-400">
                                        {loading ? (
                                            <div className="flex justify-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" /></div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                    <User size={24} className="text-gray-300" />
                                                </div>
                                                <p className="font-medium">No users found</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
