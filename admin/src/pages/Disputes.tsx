import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

export default function Disputes() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDisputes();
    }, []);

    const loadDisputes = async () => {
        try {
            const res = await adminAPI.getDisputes();
            setDisputes(res.data.disputes || []);
        } catch {
            setDisputes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, status: string) => {
        const notes = prompt('Admin notes (optional):') || '';
        try {
            await adminAPI.resolveDispute(id, status, notes);
            toast.success(`Dispute ${status}`);
            loadDisputes();
        } catch {
            toast.error('Failed to resolve');
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Disputes</h1>
                <p className="text-gray-500 text-sm">Review and resolve user disputes</p>
            </div>

            <div className="space-y-4">
                {disputes.map((d) => (
                    <div key={d.id} className="bg-surface-light rounded-2xl border border-white/5 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${d.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                                            d.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {d.status}
                                    </span>
                                    <span className="text-gray-500 text-xs">Raised by {d.raisedBy}</span>
                                </div>
                                <p className="text-white font-medium">{d.reason}</p>
                            </div>
                            <span className="text-gray-500 text-xs">
                                {new Date(d.createdAt).toLocaleDateString('en-IN')}
                            </span>
                        </div>

                        {d.evidenceUrls?.length > 0 && (
                            <p className="text-gray-500 text-xs mb-3">📎 {d.evidenceUrls.length} evidence file(s)</p>
                        )}

                        {d.adminNotes && (
                            <p className="text-gray-400 text-sm bg-navy-dark rounded-lg p-3 mb-3">
                                <span className="text-gray-500">Admin notes:</span> {d.adminNotes}
                            </p>
                        )}

                        {d.status === 'open' && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => handleResolve(d.id, 'resolved')}
                                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition"
                                >
                                    ✓ Resolve (Refund User)
                                </button>
                                <button
                                    onClick={() => handleResolve(d.id, 'rejected')}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition"
                                >
                                    ✕ Reject Dispute
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {disputes.length === 0 && (
                    <div className="bg-surface-light rounded-2xl border border-white/5 p-12 text-center">
                        <p className="text-4xl mb-2">✅</p>
                        <p className="text-gray-400">{loading ? 'Loading...' : 'No disputes to review'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
