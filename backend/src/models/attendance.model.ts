import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    name: string;
    email: string;
    image: string; // Base64 image data
    imagePath: string; // File path for stored image
    type: 'ENTRY' | 'EXIT';
    timestamp: Date;
    duration?: number; // Duration in minutes for completed sessions
    createdAt: Date;
    updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        image: { type: String, required: true }, // Base64 image data
        imagePath: { type: String, required: true }, // File path for stored image
        type: { type: String, enum: ['ENTRY', 'EXIT'], required: true },
        timestamp: { type: Date, required: true, default: Date.now },
        duration: { type: Number }, // Duration in minutes for completed sessions
    },
    {
        timestamps: true,
    }
);

// Create indexes for faster queries
attendanceSchema.index({ email: 1, timestamp: -1 });
attendanceSchema.index({ type: 1, timestamp: -1 });
attendanceSchema.index({ email: 1, type: 1, timestamp: -1 });

const AttendanceModel = mongoose.model<IAttendance>(
    'Attendance',
    attendanceSchema
);

export default AttendanceModel;
