import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthRole, getAuthToken } from '../utils/authStorage';
import { ROUTES, roleHomePath } from '../utils/routes';

interface Props {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const token = getAuthToken();
    const role = getAuthRole();

    if (!token) {
        return <Navigate to={ROUTES.login} replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to={roleHomePath(role)} replace />;
    }

    return <>{children}</>;
}
