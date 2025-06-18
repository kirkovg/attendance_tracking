export interface AttendanceRecord {
    name: string;
    email: string;
    image: string;
    type: 'ENTRY' | 'EXIT';
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse {
    message: string;
    data?: AttendanceRecord;
}

export interface AttendanceState {
    isLoading: boolean;
    error: string | null;
    success: string | null;
}

export interface AttendanceSession {
    entry: {
        _id: string;
        name: string;
        email: string;
        image: string;
        type: 'ENTRY';
        timestamp: string;
        createdAt: string;
        updatedAt: string;
    };
    exit?: {
        _id: string;
        name: string;
        email: string;
        image: string;
        type: 'EXIT';
        timestamp: string;
        createdAt: string;
        updatedAt: string;
    };
    duration?: number; // Duration in seconds
}

export interface AdminStats {
    totalEntries: number;
    totalExits: number;
    totalUsers: number;
    averageDuration: number;
}

export interface VerificationResult {
    verified: boolean;
    similarity: number;
    message?: string;
}
