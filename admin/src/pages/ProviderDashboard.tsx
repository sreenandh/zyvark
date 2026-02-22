import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Power, MapPin, Clock, DollarSign, CheckCircle, Navigation, User, ChevronRight, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface Emergency {
    id: string;
    category: { name: string; icon: string };
    user: { name: string; phone: string };
    latitude: number;
    longitude: number;
    addressText: string;
    questionnaireAnswers: any;
    status: string;
    createdAt: string;
    quotedPrice?: number;
    platformFee?: number;
    totalPrice?: number;
}

interface Earnings {
    total_jobs: string;
    total_earned: string;
    today_earned: string;
}

interface Profile {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: string;
    skills: { category: { name: string; icon: string } }[];
}

export default function ProviderDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [earnings, setEarnings] = useState<Earnings | null>(null);
    const [incomingJobs, setIncomingJobs] = useState<Emergency[]>([]);
    const [activeJob, setActiveJob] = useState<Emergency | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [quotedPrice, setQuotedPrice] = useState('');
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            const [profileRes, earningsRes, jobsRes, activeRes] = await Promise.all([
                adminAPI.getProviderProfile(),
                adminAPI.getEarnings(),
                adminAPI.getIncomingJobs(),
                adminAPI.getActiveJob(),
            ]);
            setProfile(profileRes.data);
            setEarnings(earningsRes.data);
            setIncomingJobs(jobsRes.data || []);
            setActiveJob(activeRes.data || null);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [loadData]);

    const handleToggleOnline = async () => {
        try {
            await adminAPI.toggleOnline(!isOnline);
            setIsOnline(!isOnline);
            toast.success(!isOnline ? 'You are now Online 🟢' : 'You are now Offline 🔴');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleAcceptJob = async (emergencyId: string) => {
        const price = parseInt(quotedPrice);
        if (!price || price < 100) return;
        setAcceptingId(emergencyId);
        try {
            await adminAPI.acceptJob(emergencyId, price);
            setQuotedPrice('');
            setAcceptingId(null);
            loadData();
            toast.success('Job Accepted! 🚀');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to accept');
            setAcceptingId(null);
        }
    };

    const handleArrived = async () => {
        if (!activeJob) return;
        try {
            await adminAPI.markArrived(activeJob.id);
            loadData();
            toast.success('Marked as Arrived');
        } catch { toast.error('Action failed'); }
    };

    const handleCompleted = async () => {
        if (!activeJob) return;
        try {
            await adminAPI.markCompleted(activeJob.id);
            loadData();
            toast.success('Job Completed! 🎉');
        } catch { toast.error('Action failed'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    if (profile?.status === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-[2rem] shadow-xl p-10 max-w-md text-center border border-gray-100">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User size={32} className="text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Verification Pending</h2>
                    <p className="text-gray-500 font-medium mb-8">We are reviewing your profile. You'll get an SMS once approved.</p>
                    <button onClick={() => setShowLogoutConfirm(true)} className="text-gray-400 font-bold text-sm hover:text-black transition">Sign Out</button>

                    {/* Pending Page Logout Confirm */}
                    {showLogoutConfirm && (
                        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowLogoutConfirm(false)}>
                            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Power size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Log Out?</h3>
                                <p className="text-gray-500 mb-8 font-medium">Are you sure you want to end your session?</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Cancel</button>
                                    <button onClick={handleLogout} className="flex-1 py-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30">Yes, Logout</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-gray-900 relative overflow-hidden">
            {/* Logout Confirmation Modal (Main Dashboard) */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Power size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Log Out?</h3>
                        <p className="text-gray-500 mb-8 font-medium">Are you sure you want to end your session?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Cancel</button>
                            <button onClick={handleLogout} className="flex-1 py-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30">Yes, Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mesh Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-100/60 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Provider Dashboard</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-gray-500 font-medium text-sm">Welcome back, {profile?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggleOnline}
                            className={`h-12 px-6 rounded-2xl font-bold transition-all flex items-center gap-3 shadow-lg ${isOnline
                                ? 'bg-black text-white shadow-black/20 hover:scale-105'
                                : 'bg-white text-gray-500 shadow-gray-200 hover:text-gray-900'
                                }`}
                        >
                            <Power size={18} className={isOnline ? 'text-green-400' : 'text-gray-400'} />
                            {isOnline ? 'You are Online' : 'You are Offline'}
                        </button>
                        <button onClick={() => setShowLogoutConfirm(true)} className="h-12 w-12 rounded-2xl bg-white text-gray-400 hover:text-black shadow-lg shadow-gray-100 flex items-center justify-center transition hover:scale-105 hover:shadow-xl">
                            <Power size={20} className="rotate-90" />
                        </button>
                    </div>
                </header>

                {/* Earnings Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition border border-gray-50 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-50 rounded-2xl text-green-600 group-hover:scale-110 transition-transform"><DollarSign size={24} /></div>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Today</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">₹{parseFloat(earnings?.today_earned || '0').toLocaleString()}</p>
                        <p className="text-gray-400 text-sm font-medium mt-1">Daily Revenue</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition border border-gray-50 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform"><BriefcaseIcon size={24} /></div>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">₹{parseFloat(earnings?.total_earned || '0').toLocaleString()}</p>
                        <p className="text-gray-400 text-sm font-medium mt-1">Lifetime Revenue</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition border border-gray-50 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform"><CheckCircle size={24} /></div>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Completed</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{earnings?.total_jobs || 0}</p>
                        <p className="text-gray-400 text-sm font-medium mt-1">Jobs Done</p>
                    </div>
                </div>

                {/* Active Job */}
                {activeJob && (
                    <div className="mb-10 bg-black rounded-[2.5rem] p-8 text-white shadow-2xl shadow-black/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-800 rounded-full blur-[80px] -mr-16 -mt-16 opacity-50" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-2xl">{activeJob.category?.icon}</div>
                                    <div>
                                        <h2 className="text-xl font-bold">Active Emergency</h2>
                                        <p className="text-gray-400 text-sm">Status: <span className="text-white font-bold uppercase">{activeJob.status}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm">Quoted Price</p>
                                    <p className="text-2xl font-black text-green-400">₹{activeJob.quotedPrice}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><User size={18} /></div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Customer</p>
                                            <p className="font-bold text-lg">{activeJob.user?.name || 'Guest User'}</p>
                                            <p className="text-gray-400 text-sm">{activeJob.user?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><MapPin size={18} /></div>
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Location</p>
                                            <p className="font-medium text-sm leading-relaxed text-gray-200">{activeJob.addressText || `${activeJob.latitude}, ${activeJob.longitude}`}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Job Details</h3>
                                    {activeJob.questionnaireAnswers && (
                                        <div className="space-y-3">
                                            {Object.entries(activeJob.questionnaireAnswers).map(([q, a]) => (
                                                <div key={q}>
                                                    <p className="text-gray-500 text-xs">{q}</p>
                                                    <p className="text-white font-medium">{String(a)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {activeJob.status === 'accepted' && (
                                    <button onClick={handleArrived} className="flex-1 py-4 rounded-xl bg-blue-600 font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/20">
                                        📍 Mark Arrived
                                    </button>
                                )}
                                {activeJob.status === 'arrived' && (
                                    <button onClick={handleCompleted} className="flex-1 py-4 rounded-xl bg-green-600 font-bold hover:bg-green-500 transition shadow-lg shadow-green-900/20">
                                        ✅ Mark Completed
                                    </button>
                                )}
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeJob.latitude},${activeJob.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-6 py-4 rounded-xl bg-white/10 font-bold hover:bg-white/20 transition flex items-center gap-2"
                                >
                                    <Navigation size={18} /> Maps
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Incoming Jobs */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900">Incoming Requests</h2>
                        {incomingJobs.length > 0 && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">{incomingJobs.length} New</span>}
                    </div>

                    {incomingJobs.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-gray-200 shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No requests yet</h3>
                            <p className="text-gray-500 text-sm mt-1">{isOnline ? 'Stay online to receive jobs.' : 'Go online to start receiving jobs.'}</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {incomingJobs.map(job => (
                                <div key={job.id} className="bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 hover:border-black/5 transition hover:shadow-lg relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{job.category?.icon}</span>
                                                <h3 className="font-bold text-lg text-gray-900">{job.category?.name}</h3>
                                                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1"><Clock size={10} /> New</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                <span className="flex items-center gap-1"><MapPin size={14} /> {job.addressText?.substring(0, 30)}...</span>
                                                <span className="flex items-center gap-1"><Shield size={14} /> Verified User</span>
                                            </div>

                                            {/* Q&A Snippet */}
                                            {job.questionnaireAnswers && (
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(job.questionnaireAnswers).slice(0, 3).map(([q, a]) => (
                                                        <span key={q} className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 truncate max-w-[150px]">
                                                            {String(a)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="Quote Price"
                                                    value={acceptingId === job.id ? quotedPrice : ''}
                                                    onChange={e => { setQuotedPrice(e.target.value); setAcceptingId(job.id); }}
                                                    onFocus={() => setAcceptingId(job.id)}
                                                    className="w-40 h-12 pl-8 pr-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold text-gray-900 transition text-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleAcceptJob(job.id)}
                                                disabled={acceptingId !== job.id || !quotedPrice || parseInt(quotedPrice) < 100}
                                                className="h-12 px-6 rounded-xl bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-black/20"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BriefcaseIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}
