import { FastifyInstance } from 'fastify';
import { Document } from 'mongoose';
import { FastifyRequest } from 'fastify';

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

export interface IAdmin extends Document {
    username: string;
    password: string;
    email: string;
    role: 'admin';
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

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: {
        username: string;
        email: string;
        role: string;
    };
}

export interface AuthRequest extends FastifyRequest {
    user?: {
        username: string;
        email: string;
        role: string;
    };
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
