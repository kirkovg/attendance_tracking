import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { authenticateAdmin } from '../../utils/auth.middleware.js';
import { AuthService } from '../../services/auth.service.js';
import { FastifyRequest, FastifyReply } from 'fastify';

// Mock the AuthService
jest.mock('../../services/auth.service.js');

describe('authenticateAdmin', () => {
    let mockRequest: jest.Mocked<FastifyRequest>;
    let mockReply: jest.Mocked<FastifyReply>;
    let mockAuthService: jest.Mocked<AuthService>;

    beforeEach(() => {
        mockRequest = {
            headers: {},
        } as any;

        mockReply = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as any;

        mockAuthService = {
            verifyToken: jest.fn(),
        } as any;

        // Mock the AuthService constructor
        (AuthService as jest.Mock).mockImplementation(() => mockAuthService);
    });

    it('should return 401 for missing authorization header', async () => {
        mockRequest.headers = {};

        await authenticateAdmin(mockRequest, mockReply);

        expect(mockReply.code).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({
            message: 'Access denied. No token provided.',
        });
    });

    it('should return 401 for invalid authorization header format', async () => {
        mockRequest.headers = { authorization: 'InvalidFormat token' };

        await authenticateAdmin(mockRequest, mockReply);

        expect(mockReply.code).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({
            message: 'Access denied. No token provided.',
        });
    });

    it('should return 403 for non-admin user', async () => {
        const mockDecoded = {
            username: 'testuser',
            email: 'test@example.com',
            role: 'user', // non-admin role
        };

        mockRequest.headers = { authorization: 'Bearer valid-token' };
        mockAuthService.verifyToken.mockResolvedValue(mockDecoded);

        await authenticateAdmin(mockRequest, mockReply);

        expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token');
        expect(mockReply.code).toHaveBeenCalledWith(403);
        expect(mockReply.send).toHaveBeenCalledWith({
            message: 'Access denied. Admin privileges required.',
        });
    });

    it('should successfully authenticate admin user', async () => {
        const mockDecoded = {
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
        };

        mockRequest.headers = { authorization: 'Bearer valid-token' };
        mockAuthService.verifyToken.mockResolvedValue(mockDecoded);

        await authenticateAdmin(mockRequest, mockReply);

        expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token');
        expect(mockReply.code).not.toHaveBeenCalled();
        expect(mockReply.send).not.toHaveBeenCalled();
        expect((mockRequest as any).user).toEqual({
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
        });
    });

    it('should return 401 for invalid token', async () => {
        mockRequest.headers = { authorization: 'Bearer invalid-token' };
        mockAuthService.verifyToken.mockRejectedValue(
            new Error('Invalid token')
        );

        await authenticateAdmin(mockRequest, mockReply);

        expect(mockAuthService.verifyToken).toHaveBeenCalledWith(
            'invalid-token'
        );
        expect(mockReply.code).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({
            message: 'Invalid token.',
        });
    });

    it('should handle token verification errors', async () => {
        mockRequest.headers = { authorization: 'Bearer error-token' };
        mockAuthService.verifyToken.mockRejectedValue(
            new Error('Token verification failed')
        );

        await authenticateAdmin(mockRequest, mockReply);

        expect(mockAuthService.verifyToken).toHaveBeenCalledWith('error-token');
        expect(mockReply.code).toHaveBeenCalledWith(401);
        expect(mockReply.send).toHaveBeenCalledWith({
            message: 'Invalid token.',
        });
    });
});
