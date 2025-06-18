import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import History from './pages/History';
import Sessions from './pages/Sessions';
import Statistics from './pages/Statistics';
import AdminLogin from './pages/AdminLogin';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

// Admin Auth Context
interface AdminAuthContextType {
    isAdmin: boolean;
    setIsAdmin: (isAdmin: boolean) => void;
}
const AdminAuthContext = createContext<AdminAuthContextType>({
    isAdmin: false,
    setIsAdmin: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        setIsAdmin(!!token);
    }, []);
    return (
        <AdminAuthContext.Provider value={{ isAdmin, setIsAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

// Protected Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAdmin } = useAdminAuth();
    if (!isAdmin) {
        return <Navigate to="/admin-login" replace />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <AdminAuthProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route
                    path="/history"
                    element={
                        <AdminRoute>
                            <History />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/sessions"
                    element={
                        <AdminRoute>
                            <Sessions />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/statistics"
                    element={
                        <AdminRoute>
                            <Statistics />
                        </AdminRoute>
                    }
                />
            </Routes>
        </AdminAuthProvider>
    );
}

export default App;
