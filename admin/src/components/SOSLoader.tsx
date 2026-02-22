import React from 'react';

export default function SOSLoader({ message = "Searching..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
                {/* Core */}
                <div className="absolute w-16 h-16 bg-red-600 rounded-full z-10 animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.4)] flex items-center justify-center border-4 border-white">
                    <span className="text-2xl font-bold text-white">SOS</span>
                </div>

                {/* Rings (Red for high urgency/visibility) */}
                <div className="absolute w-full h-full border-4 border-red-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute w-48 h-48 border-2 border-red-500/50 rounded-full animate-ping opacity-50" style={{ animationDuration: '2s' }}></div>
                <div className="absolute w-64 h-64 border border-red-500/30 rounded-full animate-ping opacity-25" style={{ animationDuration: '3s' }}></div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 animate-pulse">{message}</h3>
            <p className="text-gray-500 text-sm mt-2">Connecting to nearby rescue providers...</p>
        </div>
    );
}
