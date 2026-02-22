import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { ChevronDown, Check, X, Phone, Mail, FileText, User, Star, Clock, Shield } from 'lucide-react';

interface Provider {
    id: string;
    name: string;
    phone: string;
    email: string;
    photoUrl: string;
    idProofUrl: string;
    status: string;
    reliabilityScore: number;
    isOnline: boolean;
    skills: { category: { name: string; icon: string } }[];
    createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
const resolveUrl = (url: string) => url?.startsWith('http') ? url : `${API_URL}${url}`;

export default function Providers() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [tab, setTab] = useState<'pending' | 'all'>('pending');
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [rejectPopover, setRejectPopover] = useState<{ id: string; reason: string } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadProviders();
    }, [tab]);

    // Close popover on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setRejectPopover(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const loadProviders = async () => {
        setLoading(true);
        try {
            const res = tab === 'pending'
                ? await adminAPI.getPendingProviders()
                : await adminAPI.getProviders();
            setProviders(res.data.providers || []);
        } catch {
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await adminAPI.approveProvider(id);
            toast.success('Provider approved ✓');
            loadProviders();
        } catch {
            toast.error('Failed to approve');
        }
    };

    const openRejectPopover = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRejectPopover({ id, reason: '' });
    };

    const handleReject = async () => {
        if (!rejectPopover) return;
        try {
            await adminAPI.rejectProvider(rejectPopover.id);
            toast.success('Provider rejected');
            setRejectPopover(null);
            // Update provider status locally instead of removing from list
            setProviders(prev =>
                prev.map(p => p.id === rejectPopover.id ? { ...p, status: 'rejected' } : p)
            );
        } catch {
            toast.error('Failed to reject');
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            approved: 'bg-green-50 text-green-600 border border-green-100',
            pending: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
            rejected: 'bg-red-50 text-red-600 border border-red-100',
        };
        return styles[status] || 'bg-gray-100 text-gray-500';
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Providers</h1>
                    <p className="text-gray-500 font-medium">Manage service provider verification & approval</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-xl self-start">
                    {(['pending', 'all'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {t === 'pending' ? 'Waitlist' : 'All Providers'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
            ) : providers.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No {tab === 'pending' ? 'pending' : 'registered'} providers</h3>
                    <p className="text-gray-500 mt-2">When providers sign up, they will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {providers.map((p) => (
                        <div
                            key={p.id}
                            className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${expandedId === p.id
                                ? 'border-black/10 shadow-xl shadow-black/5 ring-1 ring-black/5'
                                : `border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md ${p.status === 'rejected' ? 'opacity-60' : ''}`
                                }`}
                        >
                            {/* Card Header / Summary */}
                            <div
                                className="p-6 flex items-center gap-6 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                            >
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                    {p.photoUrl ? (
                                        <img src={resolveUrl(p.photoUrl)} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-gray-300" />
                                    )}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{p.name || 'Unnamed Provider'}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusBadge(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5"><Phone size={14} /> {p.phone}</span>
                                        <span className="hidden md:flex items-center gap-1.5"><Clock size={14} /> Joined {new Date(p.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Skills Preview (Desktop) */}
                                <div className="hidden md:flex items-center gap-2">
                                    {(p.skills || []).slice(0, 3).map((s, i) => (
                                        <div key={i} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg border border-gray-100" title={s.category?.name}>
                                            {s.category?.icon}
                                        </div>
                                    ))}
                                    {(p.skills || []).length > 3 && (
                                        <span className="text-xs font-bold text-gray-400">+{p.skills.length - 3}</span>
                                    )}
                                </div>

                                {/* Toggle Arrow */}
                                <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${expandedId === p.id ? 'rotate-180 bg-black text-white' : 'text-gray-400'}`}>
                                    <ChevronDown size={16} />
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <div className={`grid transition-all duration-300 ease-in-out ${expandedId === p.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="px-6 pb-6 pt-0">
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                                                {/* Column 1: Verification */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        <Shield size={14} /> Verification
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={16} /></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-gray-900">ID Proof</span>
                                                                    <span className="text-xs text-gray-400">{p.idProofUrl ? 'Uploaded' : 'Missing'}</span>
                                                                </div>
                                                            </div>
                                                            {p.idProofUrl && (
                                                                <a href={resolveUrl(p.idProofUrl)} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">View</a>
                                                            )}
                                                        </div>
                                                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Mail size={16} /></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-gray-900">Email</span>
                                                                    <span className="text-xs text-gray-400">{p.email || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 2: Stats */}
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        <Star size={14} /> Performance
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                                                            <p className="text-2xl font-black text-gray-900">{Number(p.reliabilityScore || 0).toFixed(1)}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Rating</p>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                                                            <p className={`text-xl font-black ${p.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                                                {p.isOnline ? 'Online' : 'Offline'}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Status</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Column 3: Actions */}
                                                <div className="space-y-4 relative">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</h4>
                                                    {p.status === 'pending' ? (
                                                        <div className="flex flex-col gap-3">
                                                            <button
                                                                onClick={(e) => handleApprove(p.id, e)}
                                                                className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                                                            >
                                                                <Check size={16} /> Approve Provider
                                                            </button>
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => openRejectPopover(p.id, e)}
                                                                    className="w-full py-3 bg-white text-red-500 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-50 transition flex items-center justify-center gap-2"
                                                                >
                                                                    <X size={16} /> Reject Application
                                                                </button>

                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                                                            <p className="text-sm font-medium text-gray-500">This provider is currently <span className="font-bold text-gray-900">{p.status}</span></p>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Global Reject Popover/Modal */}
            {rejectPopover && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setRejectPopover(null)}>
                    <div
                        ref={popoverRef}
                        className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-black text-gray-900">Reject Application</h5>
                            <button onClick={() => setRejectPopover(null)} className="text-gray-400 hover:text-gray-900 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 font-medium mb-3">Please provide a reason for rejection. This will be sent to the provider.</p>

                        <textarea
                            value={rejectPopover.reason}
                            onChange={(e) => setRejectPopover({ ...rejectPopover, reason: e.target.value })}
                            placeholder="e.g. Incomplete documents, ID mismatch..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-red-500/20 focus:bg-white outline-none text-sm text-gray-900 transition-all placeholder:text-gray-400 resize-none mb-6"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRejectPopover(null)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition shadow-lg shadow-red-500/20"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
