import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    People as PeopleIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    AccessTime as AccessTimeIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { AdminStats } from '../types';

const Statistics: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<AdminStats>('/attendance/stats');
            setStats(response.data);
        } catch (err) {
            setError('Failed to fetch statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const StatCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
    }> = ({ title, value, icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                        sx={{
                            backgroundColor: color,
                            borderRadius: '50%',
                            p: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
                <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!stats) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="info">No statistics available</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                <TrendingUpIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
                System Statistics
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Check-ins"
                        value={stats.totalEntries}
                        icon={<LoginIcon sx={{ color: 'white' }} />}
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Check-outs"
                        value={stats.totalExits}
                        icon={<LogoutIcon sx={{ color: 'white' }} />}
                        color="#f44336"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Users"
                        value={stats.activeUsers}
                        icon={<PeopleIcon sx={{ color: 'white' }} />}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg. Duration"
                        value={formatDuration(stats.averageDuration)}
                        icon={<AccessTimeIcon sx={{ color: 'white' }} />}
                        color="#ff9800"
                    />
                </Grid>
            </Grid>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Key Insights
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: '#f5f5f5',
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="subtitle1" gutterBottom>
                                Attendance Rate
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stats.totalExits > 0
                                    ? `${Math.round(
                                          (stats.totalExits /
                                              stats.totalEntries) *
                                              100
                                      )}% of check-ins have corresponding check-outs`
                                    : 'No completed sessions yet'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                p: 2,
                                backgroundColor: '#f5f5f5',
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="subtitle1" gutterBottom>
                                Current Status
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stats.activeUsers > 0
                                    ? `${stats.activeUsers} users currently checked in`
                                    : 'No users currently checked in'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Statistics;
