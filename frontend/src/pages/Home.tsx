import React from 'react';
import { Box, Typography } from '@mui/material';

const Home: React.FC = () => (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h3" gutterBottom>
            Welcome to the Attendance Tracker!
        </Typography>
        <Typography variant="h6">
            Use the navigation bar to check in/out or view your attendance
            history.
        </Typography>
    </Box>
);

export default Home;
