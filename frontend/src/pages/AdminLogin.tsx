import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
} from '@mui/material';
import api from '../services/api';
import { useAdminAuth } from '../App';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setIsAdmin } = useAdminAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', {
                username,
                password,
            });
            const { token } = response.data;
            localStorage.setItem('adminToken', token);
            setIsAdmin(true);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom align="center">
                    Admin Login
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminLogin;
