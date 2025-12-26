import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setUserRole(user.role);
                    setIsAuthenticated(true);
                } catch (e) {
                    // JSON parse error, treat as not auth
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>; // Or return null for faster flickery transition
    }

    if (isAuthenticated) {
        if (userRole === 'admin' || userRole === 'superadmin') {
            return <Navigate to="/admin" replace />;
        } else if (userRole === 'vendor') {
            return <Navigate to="/vendor/dashboard" replace />;
        } else {
            // Default to customer dashboard
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default PublicRoute;
