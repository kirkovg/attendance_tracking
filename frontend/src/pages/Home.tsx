import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';

const Home: React.FC = () => {
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
            </Box>

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
