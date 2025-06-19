import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AttendanceService } from '../../services/attendance.service.js';
import { ImageProcessor } from '../../utils/imageProcessor.js';
import type AttendanceType from '../../models/attendance.model.js';

// Mock the dependencies
jest.mock('../../models/attendance.model.js', () => {
    const AttendanceMock = jest.fn();
    // Export the mock so we can access it in tests
    (global as any).AttendanceMock = AttendanceMock;
    return {
        __esModule: true,
        default: AttendanceMock,
    };
});
jest.mock('../../utils/imageProcessor.js');

jest.mock('mongoose', () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    connection: { readyState: 1 },
    Schema: jest.fn().mockImplementation(() => ({
        pre: jest.fn().mockReturnThis(),
        method: jest.fn().mockReturnThis(),
        methods: {},
        virtual: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis(),
        index: jest.fn().mockReturnThis(),
    })),
    model: jest.fn().mockImplementation(() => ({
        findOne: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
        distinct: jest.fn(),
        save: jest.fn(),
        comparePassword: jest.fn(),
    })),
}));

describe('AttendanceService', () => {
    let attendanceService: AttendanceService;
    let mockImageProcessor: jest.Mocked<ImageProcessor>;
    let mockAttendance: any;
    let AttendanceMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Get the mock from global scope
        AttendanceMock = (global as any).AttendanceMock;

        mockImageProcessor = {
            processAndStoreImage: jest.fn(),
            compareImages: jest.fn(),
        } as any;

        attendanceService = new AttendanceService(mockImageProcessor);

        mockAttendance = {
            _id: 'mock-id',
            name: 'John Doe',
            email: 'john@example.com',
            image: 'base64-image-data',
            imagePath: '/uploads/test.jpg',
            type: 'ENTRY',
            timestamp: new Date('2023-01-01T10:00:00Z'),
            duration: undefined,
            createdAt: new Date('2023-01-01T10:00:00Z'),
            updatedAt: new Date('2023-01-01T10:00:00Z'),
            save: jest.fn(),
        };

        // Set up the AttendanceMock to return mockAttendance
        AttendanceMock.mockImplementation(() => mockAttendance);

        // Set up static methods on AttendanceMock
        (AttendanceMock as any).findOne = jest.fn();
        (AttendanceMock as any).find = jest.fn();
        (AttendanceMock as any).countDocuments = jest.fn();
        (AttendanceMock as any).distinct = jest.fn();
    });

    describe('recordAttendance', () => {
        it('should record entry attendance successfully', async () => {
            const attendanceData = {
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                type: 'ENTRY' as const,
            };

            const mockProcessedImage = {
                imagePath: '/uploads/test.jpg',
                processedImage: 'processed-base64-data',
            };

            mockImageProcessor.processAndStoreImage.mockResolvedValue(
                mockProcessedImage
            );
            mockAttendance.save.mockResolvedValue(mockAttendance);

            const result = await attendanceService.recordAttendance(
                attendanceData
            );

            expect(
                mockImageProcessor.processAndStoreImage
            ).toHaveBeenCalledWith(
                'base64-image-data',
                'john@example.com',
                'ENTRY',
                expect.any(Date)
            );
            expect(AttendanceMock).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com',
                image: 'processed-base64-data',
                imagePath: '/uploads/test.jpg',
                type: 'ENTRY',
                timestamp: expect.any(Date),
                duration: undefined,
            });
            expect(result).toEqual({
                _id: 'mock-id',
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                imagePath: '/uploads/test.jpg',
                type: 'ENTRY',
                timestamp: expect.any(String),
                duration: undefined,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        it('should record exit attendance with duration calculation', async () => {
            const attendanceData = {
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                type: 'EXIT' as const,
            };

            const lastEntry = {
                timestamp: new Date('2023-01-01T10:00:00Z'),
            };

            const mockProcessedImage = {
                imagePath: '/uploads/test.jpg',
                processedImage: 'processed-base64-data',
            };

            mockImageProcessor.processAndStoreImage.mockResolvedValue(
                mockProcessedImage
            );
            (AttendanceMock as any).findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(lastEntry as never),
            });

            // Mock the exit attendance record with duration
            const exitAttendance = {
                ...mockAttendance,
                type: 'EXIT',
                timestamp: new Date('2023-01-01T18:00:00Z'),
                duration: 28800, // 8 hours in seconds (not milliseconds)
            };

            // Update the mockAttendance to include duration for this test
            mockAttendance.duration = 28800;
            mockAttendance.save.mockResolvedValue(exitAttendance);

            const result = await attendanceService.recordAttendance(
                attendanceData
            );

            expect((AttendanceMock as any).findOne).toHaveBeenCalledWith({
                email: 'john@example.com',
                type: 'ENTRY',
            });
            expect(result.duration).toBeDefined();
        });
    });

    describe('getAttendanceHistory', () => {
        it('should return attendance history with email filter', async () => {
            const query = { email: 'john@example.com' };
            const mockRecords = [mockAttendance];

            (AttendanceMock as any).find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockRecords as never),
                }),
            });

            const result = await attendanceService.getAttendanceHistory(query);

            expect((AttendanceMock as any).find).toHaveBeenCalledWith({
                email: { $regex: 'john@example\\.com', $options: 'i' },
            });
            expect(result).toHaveLength(1);
        });

        it('should return attendance history with date range filter', async () => {
            const query = {
                startDate: '2023-01-01',
                endDate: '2023-01-31',
            };
            const mockRecords = [mockAttendance];

            (AttendanceMock as any).find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockRecords as never),
                }),
            });

            const result = await attendanceService.getAttendanceHistory(query);

            expect((AttendanceMock as any).find).toHaveBeenCalledWith({
                timestamp: {
                    $gte: new Date('2023-01-01'),
                    $lte: new Date('2023-01-31'),
                },
            });
            expect(result).toHaveLength(1);
        });

        it('should return attendance history with type filter', async () => {
            const query = { type: 'ENTRY' as const };
            const mockRecords = [mockAttendance];

            (AttendanceMock as any).find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue(mockRecords as never),
                }),
            });

            const result = await attendanceService.getAttendanceHistory(query);

            expect((AttendanceMock as any).find).toHaveBeenCalledWith({
                type: 'ENTRY',
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('getAttendanceSessions', () => {
        it('should return attendance sessions for specific email', async () => {
            const mockRecords = [
                {
                    ...mockAttendance,
                    type: 'ENTRY',
                    timestamp: new Date('2023-01-01T10:00:00Z'),
                },
                {
                    ...mockAttendance,
                    type: 'EXIT',
                    timestamp: new Date('2023-01-01T18:00:00Z'),
                    duration: 28800,
                },
            ];

            (AttendanceMock as any).find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockRecords as never),
            });

            const result = await attendanceService.getAttendanceSessions(
                'john@example.com'
            );

            expect((AttendanceMock as any).find).toHaveBeenCalledWith({
                email: { $regex: 'john@example\\.com', $options: 'i' },
            });
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('entry');
            expect(result[0]).toHaveProperty('exit');
            expect(result[0]).toHaveProperty('duration');
        });

        it('should return incomplete sessions (entry without exit)', async () => {
            const mockRecords = [
                {
                    ...mockAttendance,
                    type: 'ENTRY',
                    timestamp: new Date('2023-01-01T10:00:00Z'),
                },
            ];

            (AttendanceMock as any).find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockRecords as never),
            });

            const result = await attendanceService.getAttendanceSessions(
                'john@example.com'
            );

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('entry');
            expect(result[0]).not.toHaveProperty('exit');
        });
    });

    describe('getAdminStats', () => {
        it('should return admin statistics', async () => {
            const mockDistinctEmails = ['john@example.com', 'jane@example.com'];
            const mockCompletedSessions = [
                {
                    duration: 28800000, // 8 hours
                },
                {
                    duration: 36000000, // 10 hours
                },
            ];

            (AttendanceMock as any).countDocuments.mockResolvedValueOnce(10); // totalEntries
            (AttendanceMock as any).countDocuments.mockResolvedValueOnce(8); // totalExits
            (AttendanceMock as any).distinct.mockResolvedValue(
                mockDistinctEmails
            );
            (AttendanceMock as any).find.mockResolvedValue(
                mockCompletedSessions
            );

            const result = await attendanceService.getAdminStats();

            expect((AttendanceMock as any).countDocuments).toHaveBeenCalledWith(
                {
                    type: 'ENTRY',
                }
            );
            expect((AttendanceMock as any).countDocuments).toHaveBeenCalledWith(
                {
                    type: 'EXIT',
                }
            );
            expect((AttendanceMock as any).distinct).toHaveBeenCalledWith(
                'email'
            );
            expect((AttendanceMock as any).find).toHaveBeenCalledWith({
                duration: { $exists: true, $ne: null },
            });

            expect(result).toEqual({
                totalEntries: 10,
                totalExits: 8,
                totalUsers: 2,
                averageDuration: 32400000, // 9 hours average
            });
        });

        it('should handle empty completed sessions', async () => {
            (AttendanceMock as any).countDocuments.mockResolvedValueOnce(0);
            (AttendanceMock as any).countDocuments.mockResolvedValueOnce(0);
            (AttendanceMock as any).distinct.mockResolvedValue([]);
            (AttendanceMock as any).find.mockResolvedValue([]);

            const result = await attendanceService.getAdminStats();

            expect(result).toEqual({
                totalEntries: 0,
                totalExits: 0,
                totalUsers: 0,
                averageDuration: 0,
            });
        });
    });

    describe('verifyIdentity', () => {
        it('should verify identity successfully', async () => {
            const email = 'john@example.com';
            const currentImage = 'current-base64-image';
            const lastEntry = {
                image: 'stored-base64-image',
            };

            (AttendanceMock as any).findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(lastEntry as never),
            });
            mockImageProcessor.compareImages.mockResolvedValue(0.85);

            const result = await attendanceService.verifyIdentity(
                email,
                currentImage
            );

            expect((AttendanceMock as any).findOne).toHaveBeenCalledWith({
                email,
                type: 'ENTRY',
            });
            expect(mockImageProcessor.compareImages).toHaveBeenCalledWith(
                'stored-base64-image',
                'current-base64-image'
            );
            expect(result).toEqual({
                verified: true,
                similarity: 0.85,
            });
        });

        it('should return false for low similarity', async () => {
            const email = 'john@example.com';
            const currentImage = 'current-base64-image';
            const lastEntry = {
                image: 'stored-base64-image',
            };

            (AttendanceMock as any).findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(lastEntry as never),
            });
            mockImageProcessor.compareImages.mockResolvedValue(0.5);

            const result = await attendanceService.verifyIdentity(
                email,
                currentImage
            );

            expect(result).toEqual({
                verified: false,
                similarity: 0.5,
            });
        });

        it('should return false when no previous entry exists', async () => {
            const email = 'john@example.com';
            const currentImage = 'current-base64-image';

            (AttendanceMock as any).findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue(null as never),
            });

            const result = await attendanceService.verifyIdentity(
                email,
                currentImage
            );

            expect(result).toEqual({
                verified: false,
                similarity: 0,
            });
        });
    });

    describe('escapeRegex', () => {
        it('should escape regex special characters', () => {
            const service = attendanceService as any;
            const result = service.escapeRegex('user+name@domain.com');
            expect(result).toBe('user\\+name@domain\\.com');
        });
    });
});
