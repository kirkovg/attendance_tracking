import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AttendanceController } from '../../controllers/attendance.controller.js';
import { AttendanceService } from '../../services/attendance.service.js';
import { ImageProcessor } from '../../utils/imageProcessor.js';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Mock the AttendanceService and ImageProcessor
jest.mock('../../services/attendance.service.js');
jest.mock('../../utils/imageProcessor.js');

// Fix fs mock initialization order
let mockExistsSync: jest.Mock;
let mockCreateReadStream: jest.Mock;
jest.mock('fs', () => ({
    existsSync: (...args: any[]) => mockExistsSync(...args),
    createReadStream: (...args: any[]) => mockCreateReadStream(...args),
}));

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

describe('AttendanceController', () => {
    let attendanceController: AttendanceController;
    let mockAttendanceService: jest.Mocked<AttendanceService>;
    let mockImageProcessor: jest.Mocked<ImageProcessor>;
    let mockFastify: jest.Mocked<FastifyInstance>;
    let mockRequest: jest.Mocked<FastifyRequest>;
    let mockReply: jest.Mocked<FastifyReply>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockAttendanceService = {
            recordAttendance: jest.fn(),
            getAttendanceHistory: jest.fn(),
            getAttendanceSessions: jest.fn(),
            getAdminStats: jest.fn(),
            verifyIdentity: jest.fn(),
        } as any;

        mockImageProcessor = {
            getImagePath: jest.fn(),
        } as any;

        mockFastify = {
            post: jest.fn(),
            get: jest.fn(),
            log: {
                error: jest.fn(),
            },
        } as any;

        mockRequest = {
            body: {},
            query: {},
            headers: {},
            params: {},
        } as any;

        mockReply = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn(),
            type: jest.fn().mockReturnThis(),
        } as any;

        attendanceController = new AttendanceController(
            mockAttendanceService,
            mockImageProcessor
        );

        // Assign fs mocks for each test
        mockExistsSync = jest.fn();
        mockCreateReadStream = jest.fn();
    });

    describe('routes', () => {
        it('should register main attendance route', async () => {
            await attendanceController.routes(mockFastify as any, {} as any);

            expect(mockFastify.post).toHaveBeenCalledWith(
                '/attendance',
                expect.any(Function)
            );
        });

        it('should register get history route with preHandler', async () => {
            await attendanceController.routes(mockFastify as any, {} as any);

            expect(mockFastify.get).toHaveBeenCalledWith(
                '/attendance/history',
                { preHandler: expect.any(Function) },
                expect.any(Function)
            );
        });

        it('should register get sessions route with preHandler', async () => {
            await attendanceController.routes(mockFastify as any, {} as any);

            expect(mockFastify.get).toHaveBeenCalledWith(
                '/attendance/sessions',
                { preHandler: expect.any(Function) },
                expect.any(Function)
            );
        });

        it('should register get stats route with preHandler', async () => {
            await attendanceController.routes(mockFastify as any, {} as any);

            expect(mockFastify.get).toHaveBeenCalledWith(
                '/attendance/stats',
                { preHandler: expect.any(Function) },
                expect.any(Function)
            );
        });

        it('should register uploads route', async () => {
            await attendanceController.routes(mockFastify as any, {} as any);

            expect(mockFastify.get).toHaveBeenCalledWith(
                '/uploads/:filename',
                expect.any(Function)
            );
        });
    });

    describe('main attendance endpoint', () => {
        let attendanceHandler: Function;

        beforeEach(async () => {
            await attendanceController.routes(mockFastify as any, {} as any);
            const call = (mockFastify.post as jest.Mock).mock?.calls.find(
                (call: any) => call[0] === '/attendance'
            ) as any;
            attendanceHandler = call?.[1] as Function;
        });

        it('should return 400 for missing required fields', async () => {
            mockRequest.body = {
                name: 'John Doe',
                email: 'john@example.com',
                // missing image
            };

            await attendanceHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Name, email, and image are required',
            });
        });

        it('should successfully record entry attendance', async () => {
            const attendanceData = {
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                type: 'ENTRY' as const,
            };

            const attendanceRecord = {
                _id: 'mock-id',
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                imagePath: '/uploads/test.jpg',
                type: 'ENTRY' as const,
                timestamp: '2023-01-01T10:00:00.000Z',
                duration: undefined,
                createdAt: '2023-01-01T10:00:00.000Z',
                updatedAt: '2023-01-01T10:00:00.000Z',
            };

            mockRequest.body = attendanceData;
            mockAttendanceService.recordAttendance.mockResolvedValue(
                attendanceRecord
            );

            const result = await attendanceHandler(mockRequest, mockReply);

            expect(mockAttendanceService.recordAttendance).toHaveBeenCalledWith(
                attendanceData
            );
            expect(result).toEqual({
                message: 'Successfully recorded check-in',
                type: 'ENTRY',
                record: attendanceRecord,
            });
        });

        it('should verify identity for exit attendance', async () => {
            const attendanceData = {
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                type: 'EXIT' as const,
            };

            const attendanceRecord = {
                _id: 'mock-id',
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                imagePath: '/uploads/test.jpg',
                type: 'EXIT' as const,
                timestamp: '2023-01-01T18:00:00.000Z',
                duration: 28800000, // 8 hours in ms
                createdAt: '2023-01-01T10:00:00.000Z',
                updatedAt: '2023-01-01T18:00:00.000Z',
            };

            mockRequest.body = attendanceData;
            mockAttendanceService.verifyIdentity.mockResolvedValue({
                verified: true,
                similarity: 0.95,
            });
            mockAttendanceService.recordAttendance.mockResolvedValue(
                attendanceRecord
            );

            const result = await attendanceHandler(mockRequest, mockReply);

            expect(mockAttendanceService.verifyIdentity).toHaveBeenCalledWith(
                'john@example.com',
                'base64-image-data'
            );
            expect(mockAttendanceService.recordAttendance).toHaveBeenCalledWith(
                attendanceData
            );
            expect(result).toEqual({
                message: 'Successfully recorded check-out',
                type: 'EXIT',
                record: attendanceRecord,
            });
        });

        it('should return 400 for failed identity verification', async () => {
            const attendanceData = {
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                type: 'EXIT' as const,
            };

            mockRequest.body = attendanceData;
            mockAttendanceService.verifyIdentity.mockResolvedValue({
                verified: false,
                similarity: 0.45,
            });

            await attendanceHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Identity verification failed. Similarity: 45%',
            });
        });

        it('should handle service errors', async () => {
            mockRequest.body = {
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-image-data',
                type: 'ENTRY' as const,
            };

            mockAttendanceService.recordAttendance.mockRejectedValue(
                new Error('Service error')
            );

            await attendanceHandler(mockRequest, mockReply);

            expect(mockFastify.log.error).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Error processing attendance',
            });
        });
    });

    describe('get history endpoint', () => {
        let historyHandler: Function;

        beforeEach(async () => {
            await attendanceController.routes(mockFastify as any, {} as any);
            const call = (mockFastify.get as jest.Mock).mock?.calls.find(
                (call: any) => call[0] === '/attendance/history'
            ) as any;
            historyHandler = call?.[2] as Function; // Handler is the third argument due to preHandler
        });

        it('should return attendance history', async () => {
            const query = {
                email: 'john@example.com',
                startDate: '2023-01-01',
                endDate: '2023-01-31',
                type: 'ENTRY' as const,
            };

            const historyData = [
                {
                    _id: 'mock-id-1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: 'base64-image-data',
                    imagePath: '/uploads/test.jpg',
                    type: 'ENTRY' as const,
                    timestamp: '2023-01-01T10:00:00.000Z',
                    createdAt: '2023-01-01T10:00:00.000Z',
                    updatedAt: '2023-01-01T10:00:00.000Z',
                },
            ];

            mockRequest.query = query;
            mockAttendanceService.getAttendanceHistory.mockResolvedValue(
                historyData
            );

            const result = await historyHandler(mockRequest, mockReply);

            expect(
                mockAttendanceService.getAttendanceHistory
            ).toHaveBeenCalledWith(query);
            expect(result).toEqual(historyData);
        });

        it('should handle service errors', async () => {
            mockRequest.query = { email: 'john@example.com' };
            mockAttendanceService.getAttendanceHistory.mockRejectedValue(
                new Error('Service error')
            );

            await historyHandler(mockRequest, mockReply);

            expect(mockFastify.log.error).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Error fetching attendance history',
            });
        });
    });

    describe('get sessions endpoint', () => {
        let sessionsHandler: Function;

        beforeEach(async () => {
            await attendanceController.routes(mockFastify as any, {} as any);
            const call = (mockFastify.get as jest.Mock).mock?.calls.find(
                (call: any) => call[0] === '/attendance/sessions'
            ) as any;
            sessionsHandler = call?.[2] as Function; // Handler is the third argument due to preHandler
        });

        it('should return attendance sessions', async () => {
            const entryRecord = {
                _id: 'entry-id',
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-entry-image',
                imagePath: '/uploads/entry.jpg',
                type: 'ENTRY' as const,
                timestamp: '2023-01-01T10:00:00.000Z',
                createdAt: '2023-01-01T10:00:00.000Z',
                updatedAt: '2023-01-01T10:00:00.000Z',
            };

            const exitRecord = {
                _id: 'exit-id',
                name: 'John Doe',
                email: 'john@example.com',
                image: 'base64-exit-image',
                imagePath: '/uploads/exit.jpg',
                type: 'EXIT' as const,
                timestamp: '2023-01-01T18:00:00.000Z',
                duration: 28800000,
                createdAt: '2023-01-01T18:00:00.000Z',
                updatedAt: '2023-01-01T18:00:00.000Z',
            };

            const sessionsData = [
                {
                    entry: entryRecord,
                    exit: exitRecord,
                    duration: 28800000, // 8 hours in ms
                },
            ];

            mockRequest.query = { email: 'john@example.com' };
            mockAttendanceService.getAttendanceSessions.mockResolvedValue(
                sessionsData
            );

            const result = await sessionsHandler(mockRequest, mockReply);

            expect(
                mockAttendanceService.getAttendanceSessions
            ).toHaveBeenCalledWith('john@example.com');
            expect(result).toEqual(sessionsData);
        });
    });

    describe('get stats endpoint', () => {
        let statsHandler: Function;

        beforeEach(async () => {
            await attendanceController.routes(mockFastify as any, {} as any);
            const call = (mockFastify.get as jest.Mock).mock?.calls.find(
                (call: any) => call[0] === '/attendance/stats'
            ) as any;
            statsHandler = call?.[2] as Function; // Handler is the third argument due to preHandler
        });

        it('should return admin statistics', async () => {
            const statsData = {
                totalEntries: 100,
                totalExits: 80,
                totalUsers: 25,
                averageDuration: 28800000,
            };

            mockAttendanceService.getAdminStats.mockResolvedValue(statsData);

            const result = await statsHandler(mockRequest, mockReply);

            expect(mockAttendanceService.getAdminStats).toHaveBeenCalled();
            expect(result).toEqual(statsData);
        });
    });

    describe('uploads endpoint', () => {
        let uploadsHandler: Function;

        beforeEach(async () => {
            await attendanceController.routes(mockFastify as any, {} as any);
            const call = (mockFastify.get as jest.Mock).mock?.calls.find(
                (call: any) => call[0] === '/uploads/:filename'
            ) as any;
            uploadsHandler = call?.[1] as Function;
        });

        it('should serve uploaded images', async () => {
            const filename = 'test.jpg';
            const imagePath = '/path/to/uploads/test.jpg';

            mockRequest.params = { filename };
            mockImageProcessor.getImagePath.mockReturnValue(imagePath);
            mockExistsSync.mockReturnValue(true);
            mockCreateReadStream.mockReturnValue('mock-stream');

            await uploadsHandler(mockRequest, mockReply);

            expect(mockImageProcessor.getImagePath).toHaveBeenCalledWith(
                filename
            );
            expect(mockReply.type).toHaveBeenCalledWith('image/jpeg');
            expect(mockReply.send).toHaveBeenCalledWith('mock-stream');
        });

        it('should return 404 for non-existent images', async () => {
            const filename = 'nonexistent.jpg';
            const imagePath = '/path/to/uploads/nonexistent.jpg';

            mockRequest.params = { filename };
            mockImageProcessor.getImagePath.mockReturnValue(imagePath);
            mockExistsSync.mockReturnValue(false);

            await uploadsHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Image not found',
            });
        });
    });
});
