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
