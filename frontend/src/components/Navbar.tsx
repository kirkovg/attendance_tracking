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

const Navbar: React.FC = () => {
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
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/attendance"
                            startIcon={<PersonIcon />}
                            size="small"
                        >
                            Attendance
                        </Button>
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
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
