import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import History from './pages/History';
import Sessions from './pages/Sessions';
import Statistics from './pages/Statistics';
import AdminLogin from './pages/AdminLogin';
import { AdminAuthProvider, AdminRoute } from './contexts/AdminAuthContext';

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
