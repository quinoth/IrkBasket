import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { auth } = useAuth();
    if (!auth.user) {
        return <Navigate to="/login" />;
    }
    if (!allowedRoles.includes(auth.user.role)) {
        return <Navigate to="/profile" />;
    }
    return children;
};

export default ProtectedRoute;