import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Container,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
    Person as PersonIcon,
    History as HistoryIcon,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
    CameraAlt as CameraIcon,
} from '@mui/icons-material';

const Home: React.FC = () => {
    const features = [
        {
            title: 'Check In/Out',
            description:
                'Record your attendance with facial recognition using your device camera.',
            icon: <PersonIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
            path: '/attendance',
            color: '#e8f5e8',
        },
        {
            title: 'Attendance History',
            description:
                'View detailed records of all your check-ins and check-outs with filtering options.',
            icon: <HistoryIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
            path: '/history',
            color: '#e3f2fd',
        },
        {
            title: 'Session Overview',
            description:
                'See your attendance sessions grouped by entry and exit with duration calculations.',
            icon: <TimelineIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
            path: '/sessions',
            color: '#fff3e0',
        },
        {
            title: 'System Statistics',
            description:
                'View comprehensive statistics and insights about attendance patterns.',
            icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
            path: '/statistics',
            color: '#f3e5f5',
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                >
                    Welcome to the Attendance Tracking System
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    A modern, secure, and efficient way to manage attendance
                    using facial recognition technology
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        to="/attendance"
                        startIcon={<CameraIcon />}
                        sx={{ minWidth: 200 }}
                    >
                        Start Check-in
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/history"
                        startIcon={<HistoryIcon />}
                        sx={{ minWidth: 200 }}
                    >
                        View History
                    </Button>
                </Box>
            </Box>

            <Typography
                variant="h4"
                gutterBottom
                sx={{ mb: 4, textAlign: 'center' }}
            >
                System Features
            </Typography>

            <Grid container spacing={3}>
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                            }}
                        >
                            <CardContent
                                sx={{
                                    textAlign: 'center',
                                    p: 3,
                                    backgroundColor: feature.color,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box>
                                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 3 }}
                                    >
                                        {feature.description}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    to={feature.path}
                                    fullWidth
                                    sx={{ mt: 'auto' }}
                                >
                                    Access {feature.title}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box
                sx={{
                    mt: 6,
                    p: 4,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ textAlign: 'center' }}
                >
                    How It Works
                </Typography>
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                1. Camera Access
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Allow camera access when prompted to enable
                                facial recognition
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                2. Identity Verification
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                The system captures your photo and verifies your
                                identity
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                3. Record Attendance
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Your attendance is recorded with timestamp and
                                photo
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Home;
