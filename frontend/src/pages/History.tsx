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
    Avatar,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon } from '@mui/icons-material';
import api from '../services/api';
import { AttendanceRecord } from '../types';

const History: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [email, setEmail] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const fetchRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (email) params.append('email', email);
            if (startDate) params.append('startDate', startDate.toISOString());
            if (endDate) params.append('endDate', endDate.toISOString());

            const response = await api.get<AttendanceRecord[]>(
                `/attendance/history?${params.toString()}`
            );
            setRecords(response.data);
        } catch (err) {
            setError('Failed to fetch attendance records');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleSearch = () => {
        fetchRecords();
    };

    const handleReset = () => {
        setEmail('');
        setStartDate(null);
        setEndDate(null);
        fetchRecords();
    };

    const handleImageClick = (imagePath: string) => {
        setSelectedImage(imagePath);
        setImageDialogOpen(true);
    };

    const handleCloseImageDialog = () => {
        setImageDialogOpen(false);
        setSelectedImage(null);
    };

    const getImageUrl = (imagePath: string): string => {
        // Construct the full URL to the backend image endpoint
        const baseUrl =
            import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        return `${baseUrl}/uploads/${imagePath}`;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Attendance History
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="small"
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue: Date | null) =>
                                setStartDate(newValue)
                            }
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue: Date | null) =>
                                setEndDate(newValue)
                            }
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>
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
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Image</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.map((record, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{record.name}</TableCell>
                                        <TableCell>{record.email}</TableCell>
                                        <TableCell>{record.type}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                record.timestamp
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {record.imagePath && (
                                                <Avatar
                                                    src={getImageUrl(
                                                        record.imagePath
                                                    )}
                                                    alt={`${record.name} ${record.type}`}
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            opacity: 0.8,
                                                        },
                                                    }}
                                                    onClick={() =>
                                                        handleImageClick(
                                                            record.imagePath
                                                        )
                                                    }
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {records.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No records found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Image Dialog */}
            <Dialog
                open={imageDialogOpen}
                onClose={handleCloseImageDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Attendance Image
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseImageDialog}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedImage && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 400,
                            }}
                        >
                            <img
                                src={getImageUrl(selectedImage)}
                                alt="Attendance"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default History;
