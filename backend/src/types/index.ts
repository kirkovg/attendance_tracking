import { FastifyInstance } from 'fastify';
import { Document } from 'mongoose';

export interface IAttendance extends Document {
    name: string;
    email: string;
    image: string;
    imagePath: string;
    type: 'ENTRY' | 'EXIT';
    timestamp: Date;
    duration?: number; // Duration in minutes for completed sessions
    createdAt: Date;
    updatedAt: Date;
}

export interface AttendanceRequest {
    name: string;
    email: string;
    image: string;
    type: 'ENTRY' | 'EXIT';
}

export interface AttendanceResponse {
    message: string;
    type: 'ENTRY' | 'EXIT';
    record: AttendanceRecord;
}

export interface AttendanceQuery {
    email?: string;
    startDate?: string;
    endDate?: string;
    type?: 'ENTRY' | 'EXIT';
}

export interface FastifyInstanceWithServices extends FastifyInstance {
    redis: any;
    mongoose: any;
}

export interface AttendanceRecord {
    _id: string;
    name: string;
    email: string;
    image: string;
    imagePath: string;
    type: 'ENTRY' | 'EXIT';
    timestamp: string;
    duration?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse {
    message: string;
    data?: AttendanceRecord | AttendanceRecord[];
}

export interface AttendanceSession {
    entry: AttendanceRecord;
    exit?: AttendanceRecord;
    duration?: number;
}

export interface AdminStats {
    totalEntries: number;
    totalExits: number;
    activeUsers: number;
    averageDuration: number;
}
