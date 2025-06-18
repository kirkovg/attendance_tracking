import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { AttendanceSession } from '../types';

const Sessions: React.FC = () => {
    const [sessions, setSessions] = useState<AttendanceSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (email) params.append('email', email);

            const response = await api.get<AttendanceSession[]>(
                `/attendance/sessions?${params.toString()}`
            );
            setSessions(response.data);
        } catch (err) {
            setError('Failed to fetch attendance sessions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSearch = () => {
        fetchSessions();
    };

    const handleReset = () => {
        setEmail('');
        fetchSessions();
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    };

    const formatDateTime = (timestamp: string): string => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Attendance Sessions
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        label="Filter by Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="small"
                        sx={{ minWidth: 250 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        Search
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Reset
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box
                        sx={{ display: 'flex', justifyContent: 'center', p: 3 }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <PersonIcon
                                            sx={{
                                                mr: 1,
                                                verticalAlign: 'middle',
                                            }}
                                        />
                                        Name
                                    </TableCell>
                                    <TableCell>
                                        <EmailIcon
                                            sx={{
                                                mr: 1,
                                                verticalAlign: 'middle',
                                            }}
                                        />
                                        Email
                                    </TableCell>
                                    <TableCell>Check In</TableCell>
                                    <TableCell>Check Out</TableCell>
                                    <TableCell>
                                        <AccessTimeIcon
                                            sx={{
                                                mr: 1,
                                                verticalAlign: 'middle',
                                            }}
                                        />
                                        Duration
                                    </TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sessions.map((session, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {session.entry.name}
                                        </TableCell>
                                        <TableCell>
                                            {session.entry.email}
                                        </TableCell>
                                        <TableCell>
                                            {formatDateTime(
                                                session.entry.timestamp
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {session.exit
                                                ? formatDateTime(
                                                      session.exit.timestamp
                                                  )
                                                : 'Not checked out'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDuration(session.duration)}
                                        </TableCell>
                                        <TableCell>
                                            {session.exit ? (
                                                <Chip
                                                    label="Completed"
                                                    color="success"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    label="Active"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sessions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No sessions found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default Sessions;
