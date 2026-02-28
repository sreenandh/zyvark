import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthRole, getAuthToken } from '../utils/authStorage';
import { roleHomePath } from '../utils/routes';

export default function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
    const token = getAuthToken();
    const role = getAuthRole();

    if (token) {
        return <Navigate to={roleHomePath(role)} replace />;
    }

    return <>{children}</>;
}
