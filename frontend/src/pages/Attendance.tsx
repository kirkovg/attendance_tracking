import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Button,
    TextField,
    CircularProgress,
    Alert,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import api from '../services/api';
import { AttendanceRecord } from '../types';
import { AxiosError } from 'axios';

const Attendance: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [type, setType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            setError('Failed to access camera');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const captureImage = (): string | null => {
        if (!videoRef.current) return null;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(videoRef.current, 0, 0);
        return canvas.toDataURL('image/jpeg');
    };

    const handleSubmit = async () => {
        if (!name || !email) {
            setError('Please fill in all fields');
            return;
        }

        const image = captureImage();
        if (!image) {
            setError('Failed to capture image');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await api.post<AttendanceRecord>('/attendance', {
                name,
                email,
                image,
                type,
            });

            setSuccess(
                `${type === 'ENTRY' ? 'Check-in' : 'Check-out'} successful!`
            );
            setName('');
            setEmail('');
        } catch (err) {
            const data = (err as AxiosError).response?.data as any;
            setError(`${data?.message || 'Failed to record attendance'}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newType: 'ENTRY' | 'EXIT' | null
    ) => {
        if (newType !== null) {
            setType(newType);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Attendance
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <ToggleButtonGroup
                        value={type}
                        exclusive
                        onChange={handleTypeChange}
                        aria-label="attendance type"
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value="ENTRY" aria-label="entry">
                            Check In
                        </ToggleButton>
                        <ToggleButton value="EXIT" aria-label="exit">
                            Check Out
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <TextField
                        fullWidth
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            maxWidth: '640px',
                            marginBottom: '1rem',
                        }}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    fullWidth
                >
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        `${type === 'ENTRY' ? 'Check In' : 'Check Out'}`
                    )}
                </Button>
            </Paper>
        </Container>
    );
};

export default Attendance;
