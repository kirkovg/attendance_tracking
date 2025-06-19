import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthService } from '../../services/auth.service.js';
import { redisClient } from '../../utils/redis.js';
import jwt from 'jsonwebtoken';

// Mock the dependencies
jest.mock('../../models/admin.model.js', () => {
    const AdminMock = jest.fn();
    // Export the mock so we can access it in tests
    (global as any).AdminMock = AdminMock;
    return {
        __esModule: true,
        Admin: AdminMock,
    };
});
jest.mock('../../utils/redis.js');
jest.mock('jsonwebtoken');

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

describe('AuthService', () => {
    let authService: AuthService;
    let mockAdmin: any;
    let AdminMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        // Get the mock from global scope
        AdminMock = (global as any).AdminMock;

        authService = new AuthService();
        mockAdmin = {
            username: 'testuser',
            email: 'test@example.com',
            role: 'admin',
            comparePassword: jest.fn(),
            save: jest.fn(),
        };

        // Set up the AdminMock to return mockAdmin
        AdminMock.mockImplementation(() => mockAdmin);

        // Set up static methods on AdminMock
        (AdminMock as any).findOne = jest.fn();
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            const credentials = {
                username: 'testuser',
                password: 'password123',
            };

            (AdminMock as any).findOne.mockResolvedValue(mockAdmin);
            mockAdmin.comparePassword.mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

            const result = await authService.login(credentials);

            expect((AdminMock as any).findOne).toHaveBeenCalledWith({
                username: 'testuser',
            });
            expect(mockAdmin.comparePassword).toHaveBeenCalledWith(
                'password123'
            );
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    username: 'testuser',
                    email: 'test@example.com',
                    role: 'admin',
                },
                'test-secret-key',
                { expiresIn: '24h' }
            );
            expect(result).toEqual({
                message: 'Login successful',
                token: 'mock-jwt-token',
                user: {
                    username: 'testuser',
                    email: 'test@example.com',
                    role: 'admin',
                },
            });
        });

        it('should throw error for invalid username', async () => {
            const credentials = {
                username: 'nonexistent',
                password: 'password123',
            };

            (AdminMock as any).findOne.mockResolvedValue(null);

            await expect(authService.login(credentials)).rejects.toThrow(
                'Invalid credentials'
            );
            expect((AdminMock as any).findOne).toHaveBeenCalledWith({
                username: 'nonexistent',
            });
        });

        it('should throw error for invalid password', async () => {
            const credentials = {
                username: 'testuser',
                password: 'wrongpassword',
            };

            (AdminMock as any).findOne.mockResolvedValue(mockAdmin);
            mockAdmin.comparePassword.mockResolvedValue(false);

            await expect(authService.login(credentials)).rejects.toThrow(
                'Invalid credentials'
            );
            expect(mockAdmin.comparePassword).toHaveBeenCalledWith(
                'wrongpassword'
            );
        });
    });

    describe('logout', () => {
        it('should successfully logout and blacklist token', async () => {
            const token = 'valid-jwt-token';
            const mockDecoded = {
                exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
            };

            (jwt.decode as jest.Mock).mockReturnValue(mockDecoded);
            (redisClient.setEx as jest.Mock).mockResolvedValue('OK' as never);

            await authService.logout(token);

            expect(jwt.decode).toHaveBeenCalledWith(token);
            expect(redisClient.setEx).toHaveBeenCalledWith(
                `blacklist:${token}`,
                expect.any(Number),
                '1'
            );
        });

        it('should handle logout with expired token', async () => {
            const token = 'expired-jwt-token';
            const mockDecoded = {
                exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            };

            (jwt.decode as jest.Mock).mockReturnValue(mockDecoded);

            await authService.logout(token);

            expect(jwt.decode).toHaveBeenCalledWith(token);
            // For expired tokens, the service should not blacklist them
            expect(redisClient.setEx).not.toHaveBeenCalled();
        });

        it('should handle logout error gracefully', async () => {
            const token = 'invalid-token';

            (jwt.decode as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(authService.logout(token)).rejects.toThrow(
                'Logout failed'
            );
        });
    });

    describe('verifyToken', () => {
        it('should successfully verify valid token', async () => {
            const token = 'valid-jwt-token';
            const mockDecoded = {
                username: 'testuser',
                email: 'test@example.com',
                role: 'admin',
            };

            (redisClient.get as jest.Mock).mockResolvedValue(null as never);
            (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

            const result = await authService.verifyToken(token);

            expect(redisClient.get).toHaveBeenCalledWith(`blacklist:${token}`);
            expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
            expect(result).toEqual(mockDecoded);
        });

        it('should throw error for blacklisted token', async () => {
            const token = 'blacklisted-token';

            (redisClient.get as jest.Mock).mockResolvedValue('1' as never);

            await expect(authService.verifyToken(token)).rejects.toThrow(
                'Invalid token'
            );
            expect(redisClient.get).toHaveBeenCalledWith(`blacklist:${token}`);
        });

        it('should throw error for invalid token', async () => {
            const token = 'invalid-token';

            (redisClient.get as jest.Mock).mockResolvedValue(null as never);
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(authService.verifyToken(token)).rejects.toThrow(
                'Invalid token'
            );
        });
    });

    describe('createDefaultAdmin', () => {
        it('should create default admin when none exists', async () => {
            (AdminMock as any).findOne.mockResolvedValue(null);
            mockAdmin.save.mockResolvedValue(mockAdmin);

            await authService.createDefaultAdmin();

            expect((AdminMock as any).findOne).toHaveBeenCalledWith({
                username: 'admin',
            });
            expect(AdminMock).toHaveBeenCalledWith({
                username: 'admin',
                password: 'admin123',
                email: 'admin@attendance.com',
                role: 'admin',
            });
            expect(mockAdmin.save).toHaveBeenCalled();
        });

        it('should not create default admin when one already exists', async () => {
            (AdminMock as any).findOne.mockResolvedValue(mockAdmin);

            await authService.createDefaultAdmin();

            expect((AdminMock as any).findOne).toHaveBeenCalledWith({
                username: 'admin',
            });
            expect(AdminMock).not.toHaveBeenCalled();
            expect(mockAdmin.save).not.toHaveBeenCalled();
        });

        it('should handle error during admin creation', async () => {
            (AdminMock as any).findOne.mockResolvedValue(null);
            mockAdmin.save.mockRejectedValue(new Error('Database error'));

            // The service catches errors and doesn't re-throw them
            await expect(
                authService.createDefaultAdmin()
            ).resolves.toBeUndefined();
        });
    });
});
