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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/"
                            startIcon={<HomeIcon />}
                        >
                            Home
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/attendance"
                            startIcon={<PersonIcon />}
                        >
                            Attendance
                        </Button>
                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/history"
                            startIcon={<HistoryIcon />}
                        >
                            History
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
