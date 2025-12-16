import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../services/api';

const ProtectedRoute = ({ allowedRoles }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                setIsLoading(false);
                return;
            }

            // Optional: Verify token validity specifically if needed, 
            // but for now existence + role check is sufficient for frontend routing.
            const user = JSON.parse(userStr);

            if (allowedRoles && !allowedRoles.includes(user.role)) {
                setIsLoading(false);
                // User is logged in but wrong role
                return;
            }

            setIsAuthorized(true);
            setIsLoading(false);
        };

        verifyAuth();
    }, [allowedRoles]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthorized) {
        // Redirect to login if not auth, or dashboard if auth but wrong role?
        // Simpler: Redirect to Login for now.
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
