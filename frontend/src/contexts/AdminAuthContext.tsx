import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import api from '../services/api';

// Admin Auth Context
interface AdminAuthContextType {
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
    isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
    isAdmin: false,
    setIsAdmin: () => {},
    isLoading: true,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('adminToken');

            if (!token) {
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            try {
                // Use the dedicated verify token endpoint
                await api.get('/auth/verify');
                setIsAdmin(true);
            } catch (error: any) {
                // If token is invalid (401), clear it and set admin to false
                if (error.response?.status === 401) {
                    localStorage.removeItem('adminToken');
                    setIsAdmin(false);
                }
                // For other errors (network issues, etc.), keep the token but set admin to false
                // This prevents infinite loading on network issues
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, []);

    return (
        <AdminAuthContext.Provider value={{ isAdmin, setIsAdmin, isLoading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

// Protected Route
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAdmin, isLoading } = useAdminAuth();

    if (isLoading) {
        // Show loading state while validating token
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/admin-login" replace />;
    }

    return <>{children}</>;
};
