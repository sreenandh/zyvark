import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
    /** Which roles are allowed to see this route */
    allowedRoles?: string[];
}

/**
 * Wraps a route so that:
 *  1. If no token → redirect to /login
 *  2. If token exists but role is not in allowedRoles → redirect to the
 *     correct home page for their role
 */
export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const token = localStorage.getItem('admin_token');
    const role = localStorage.getItem('user_role'); // 'user' | 'provider' | 'admin'

    // ── Not logged in → login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ── Logged in but wrong role for this route
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Send them to their own home
        if (role === 'user') return <Navigate to="/book" replace />;
        if (role === 'provider') return <Navigate to="/provider-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
