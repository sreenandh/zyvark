import React from 'react';
import { Map, Zap } from 'lucide-react';

export default function Emergencies() {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-100 rounded-full blur-[60px] opacity-50" />
                <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-red-500/10 relative z-10 border border-gray-50 transform rotate-[-5deg]">
                    <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center">
                        <Map size={48} className="text-red-500" />
                        <Zap size={24} className="text-yellow-400 absolute top-6 right-6 animate-bounce" />
                    </div>
                </div>
            </div>

            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Live Operations Center</h1>
            <p className="text-xl text-gray-500 font-medium mb-8 leading-relaxed">
                We're building a real-time command center to track emergencies, provider locations, and critical alerts on a live map.
            </p>

            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-bold text-gray-900 text-sm uppercase tracking-wide">Coming Soon</span>
            </div>
        </div>
    );
}
