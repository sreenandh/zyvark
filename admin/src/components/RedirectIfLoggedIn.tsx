import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps /login so that if the user is ALREADY logged in, they are
 * redirected to their home page instead of seeing the login form.
 */
export default function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('admin_token');
    const role = localStorage.getItem('user_role');

    if (token) {
        if (role === 'user') return <Navigate to="/book" replace />;
        if (role === 'provider') return <Navigate to="/provider-dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
