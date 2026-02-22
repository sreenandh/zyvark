import React from 'react';

export default function SkeletonLoader({ className = "w-full h-4" }: { className?: string }) {
    return (
        <div className={`bg-gray-200 animate-pulse rounded-full ${className}`}></div>
    );
}

export function ProviderSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-4 flex gap-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-3 py-1">
                <div className="flex justify-between">
                    <div className="w-32 h-5 bg-gray-200 animate-pulse rounded-full" />
                    <div className="w-12 h-5 bg-gray-200 animate-pulse rounded-full" />
                </div>
                <div className="flex gap-3">
                    <div className="w-16 h-4 bg-gray-200 animate-pulse rounded-full" />
                    <div className="w-16 h-4 bg-gray-200 animate-pulse rounded-full" />
                </div>
                <div className="flex gap-2 pt-1">
                    <div className="w-20 h-4 bg-gray-200 animate-pulse rounded-full" />
                    <div className="w-12 h-4 bg-gray-200 animate-pulse rounded-full" />
                </div>
            </div>
        </div>
    );
}
