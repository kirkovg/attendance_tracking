import Attendance from '../models/attendance.model.js';
import { ImageProcessor } from '../utils/imageProcessor.js';
import {
    AttendanceRequest,
    AttendanceRecord,
    AttendanceSession,
    AdminStats,
} from '../types/index.js';

export class AttendanceService {
    static inject = ['ImageProcessor'] as const;

    constructor(private imageProcessor: ImageProcessor) {}

    async recordAttendance(data: AttendanceRequest): Promise<AttendanceRecord> {
        const timestamp = new Date();

        // Process and store the image
        const { imagePath, processedImage } =
            await this.imageProcessor.processAndStoreImage(
                data.image,
                data.email,
                data.type,
                timestamp
            );

        // Check for existing entry if this is an exit
        let duration: number | undefined;
        if (data.type === 'EXIT') {
            const lastEntry = await Attendance.findOne({
                email: data.email,
                type: 'ENTRY',
            }).sort({ timestamp: -1 });

            if (lastEntry) {
                const timeDiff =
                    timestamp.getTime() - lastEntry.timestamp.getTime();
                duration = Math.round(timeDiff / (1000 * 60)); // Convert to minutes
            }
        }

        // Create attendance record
        const attendance = new Attendance({
            name: data.name,
            email: data.email,
            image: processedImage,
            imagePath,
            type: data.type,
            timestamp,
            duration,
        });

        await attendance.save();

        return {
            _id: attendance._id.toString(),
            name: attendance.name,
            email: attendance.email,
            image: attendance.image,
            imagePath: attendance.imagePath,
            type: attendance.type,
            timestamp: attendance.timestamp.toISOString(),
            duration: attendance.duration,
            createdAt: attendance.createdAt.toISOString(),
            updatedAt: attendance.updatedAt.toISOString(),
        };
    }

    async getAttendanceHistory(query: {
        email?: string;
        startDate?: string;
        endDate?: string;
        type?: 'ENTRY' | 'EXIT';
    }): Promise<AttendanceRecord[]> {
        const filter: any = {};

        if (query.email) {
            filter.email = query.email;
        }

        if (query.type) {
            filter.type = query.type;
        }

        if (query.startDate && query.endDate) {
            filter.timestamp = {
                $gte: new Date(query.startDate),
                $lte: new Date(query.endDate),
            };
        }

        const records = await Attendance.find(filter)
            .sort({ timestamp: -1 })
            .limit(100);

        return records.map((record) => ({
            _id: record._id.toString(),
            name: record.name,
            email: record.email,
            image: record.image,
            imagePath: record.imagePath,
            type: record.type,
            timestamp: record.timestamp.toISOString(),
            duration: record.duration,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        }));
    }

    async getAttendanceSessions(email?: string): Promise<AttendanceSession[]> {
        const filter: any = {};
        if (email) {
            filter.email = email;
        }

        const records = await Attendance.find(filter).sort({ timestamp: -1 });

        const sessions: AttendanceSession[] = [];
        const entryMap = new Map<string, AttendanceRecord>();

        // Group entries and exits
        records.forEach((record) => {
            const recordData: AttendanceRecord = {
                _id: record._id.toString(),
                name: record.name,
                email: record.email,
                image: record.image,
                imagePath: record.imagePath,
                type: record.type,
                timestamp: record.timestamp.toISOString(),
                duration: record.duration,
                createdAt: record.createdAt.toISOString(),
                updatedAt: record.updatedAt.toISOString(),
            };

            if (record.type === 'ENTRY') {
                entryMap.set(record.email, recordData);
            } else if (record.type === 'EXIT') {
                const entry = entryMap.get(record.email);
                if (entry) {
                    sessions.push({
                        entry,
                        exit: recordData,
                        duration: record.duration,
                    });
                    entryMap.delete(record.email);
                }
            }
        });

        // Add incomplete sessions (entry without exit)
        entryMap.forEach((entry) => {
            sessions.push({ entry });
        });

        return sessions.sort(
            (a, b) =>
                new Date(b.entry.timestamp).getTime() -
                new Date(a.entry.timestamp).getTime()
        );
    }

    async getAdminStats(): Promise<AdminStats> {
        const [totalEntries, totalExits, activeUsers, completedSessions] =
            await Promise.all([
                Attendance.countDocuments({ type: 'ENTRY' }),
                Attendance.countDocuments({ type: 'EXIT' }),
                Attendance.distinct('email').countDocuments(),
                Attendance.find({ duration: { $exists: true, $ne: null } }),
            ]);

        const averageDuration =
            completedSessions.length > 0
                ? completedSessions.reduce(
                      (sum, session) => sum + (session.duration || 0),
                      0
                  ) / completedSessions.length
                : 0;

        return {
            totalEntries,
            totalExits,
            activeUsers,
            averageDuration: Math.round(averageDuration),
        };
    }

    async verifyIdentity(
        email: string,
        currentImage: string
    ): Promise<{ verified: boolean; similarity: number }> {
        // Get the last entry image for this user
        const lastEntry = await Attendance.findOne({
            email,
            type: 'ENTRY',
        }).sort({ timestamp: -1 });

        if (!lastEntry) {
            return { verified: false, similarity: 0 };
        }

        const similarity = await this.imageProcessor.compareImages(
            lastEntry.image,
            currentImage
        );
        const verified = similarity > 0.7; // 70% similarity threshold

        return { verified, similarity };
    }
}
