import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
} from '@mui/material';
import {
    Home as HomeIcon,
    History as HistoryIcon,
    Person as PersonIcon,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAdminAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar: React.FC = () => {
    const { isAdmin, setIsAdmin } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Call backend logout endpoint to invalidate token
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if backend call fails
        } finally {
            // Clear token and update UI
            localStorage.removeItem('adminToken');
            setIsAdmin(false);
            navigate('/');
        }
    };

    return (
        <AppBar position="static">
            <Container maxWidth="lg">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        Attendance Tracking System
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            startIcon={<HomeIcon />}
                            size="small"
                        >
                            Home
                        </Button>
                        {!isAdmin && (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/attendance"
                                startIcon={<PersonIcon />}
                                size="small"
                            >
                                Attendance
                            </Button>
                        )}
                        {isAdmin && (
                            <>
                                <Button
                                    color="inherit"
                                    component={RouterLink}
                                    to="/history"
                                    startIcon={<HistoryIcon />}
                                    size="small"
                                >
                                    History
                                </Button>
                                <Button
                                    color="inherit"
                                    component={RouterLink}
                                    to="/sessions"
                                    startIcon={<TimelineIcon />}
                                    size="small"
                                >
                                    Sessions
                                </Button>
                                <Button
                                    color="inherit"
                                    component={RouterLink}
                                    to="/statistics"
                                    startIcon={<TrendingUpIcon />}
                                    size="small"
                                >
                                    Statistics
                                </Button>
                            </>
                        )}
                        {!isAdmin ? (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/admin-login"
                                size="small"
                            >
                                Admin Login
                            </Button>
                        ) : (
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                size="small"
                            >
                                Logout
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
