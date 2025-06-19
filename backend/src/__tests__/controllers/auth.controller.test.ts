import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthController } from '../../controllers/auth.controller.js';
import { AuthService } from '../../services/auth.service.js';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Mock the AuthService
jest.mock('../../services/auth.service.js');

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

describe('AuthController', () => {
    let authController: AuthController;
    let mockAuthService: jest.Mocked<AuthService>;
    let mockFastify: jest.Mocked<FastifyInstance>;
    let mockRequest: jest.Mocked<FastifyRequest>;
    let mockReply: jest.Mocked<FastifyReply>;

    beforeEach(() => {
        mockAuthService = {
            login: jest.fn(),
            logout: jest.fn(),
            verifyToken: jest.fn(),
            createDefaultAdmin: jest.fn(),
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
            headers: {},
        } as any;

        mockReply = {
            code: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as any;

        authController = new AuthController(mockAuthService);
    });

    describe('routes', () => {
        it('should register login route', async () => {
            await authController.routes(mockFastify as any, {} as any);

            expect(mockFastify.post).toHaveBeenCalledWith(
                '/auth/login',
                expect.any(Function)
            );
        });

        it('should register logout route', async () => {
            await authController.routes(mockFastify as any, {} as any);

            expect(mockFastify.post).toHaveBeenCalledWith(
                '/auth/logout',
                { preHandler: expect.any(Function) },
                expect.any(Function)
            );
        });

        it('should register verify route', async () => {
            await authController.routes(mockFastify as any, {} as any);

            expect(mockFastify.get).toHaveBeenCalledWith(
                '/auth/verify',
                expect.any(Function)
            );
        });
    });

    describe('login endpoint', () => {
        let loginHandler: Function;

        beforeEach(async () => {
            await authController.routes(mockFastify as any, {} as any);

            loginHandler = (
                (mockFastify.post as jest.Mock).mock?.calls.find(
                    (call: any) => call[0] === '/auth/login'
                ) as any
            )[1] as unknown as Function;
        });

        it('should return 400 for missing username', async () => {
            mockRequest.body = { password: 'password123' };

            await loginHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Username and password are required',
            });
        });

        it('should return 400 for missing password', async () => {
            mockRequest.body = { username: 'testuser' };

            await loginHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Username and password are required',
            });
        });

        it('should successfully login with valid credentials', async () => {
            const loginData = {
                username: 'testuser',
                password: 'password123',
            };
            const loginResponse = {
                message: 'Login successful',
                token: 'mock-jwt-token',
                user: {
                    username: 'testuser',
                    email: 'test@example.com',
                    role: 'admin',
                },
            };

            mockRequest.body = loginData;
            mockAuthService.login.mockResolvedValue(loginResponse);

            const result = await loginHandler(mockRequest, mockReply);

            expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
            expect(result).toEqual(loginResponse);
        });

        it('should return 401 for invalid credentials', async () => {
            mockRequest.body = {
                username: 'testuser',
                password: 'wrongpassword',
            };
            mockAuthService.login.mockRejectedValue(
                new Error('Invalid credentials')
            );

            await loginHandler(mockRequest, mockReply);

            expect(mockFastify.log.error).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Invalid credentials',
            });
        });
    });

    describe('logout endpoint', () => {
        let logoutHandler: Function;

        beforeEach(async () => {
            await authController.routes(mockFastify as any, {} as any);
            logoutHandler = (
                (mockFastify.post as jest.Mock).mock?.calls.find(
                    (call: any) => call[0] === '/auth/logout'
                ) as any
            )[2] as unknown as Function;
        });

        it('should return 401 for missing authorization header', async () => {
            mockRequest.headers = {};

            await logoutHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'No token provided',
            });
        });

        it('should return 401 for invalid authorization header format', async () => {
            mockRequest.headers = { authorization: 'InvalidFormat token' };

            await logoutHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'No token provided',
            });
        });

        it('should successfully logout with valid token', async () => {
            mockRequest.headers = { authorization: 'Bearer valid-token' };
            mockAuthService.logout.mockResolvedValue(undefined);

            const result = await logoutHandler(mockRequest, mockReply);

            expect(mockAuthService.logout).toHaveBeenCalledWith('valid-token');
            expect(result).toEqual({
                message: 'Logout successful',
            });
        });

        it('should return 500 for logout failure', async () => {
            mockRequest.headers = { authorization: 'Bearer valid-token' };
            mockAuthService.logout.mockRejectedValue(
                new Error('Logout failed')
            );

            await logoutHandler(mockRequest, mockReply);

            expect(mockFastify.log.error).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Logout failed',
            });
        });
    });

    describe('verify endpoint', () => {
        let verifyHandler: Function;

        beforeEach(async () => {
            await authController.routes(mockFastify as any, {} as any);
            verifyHandler = (
                (mockFastify.get as jest.Mock).mock?.calls.find(
                    (call: any) => call[0] === '/auth/verify'
                ) as any
            )[1] as unknown as Function;
        });

        it('should return 401 for missing authorization header', async () => {
            mockRequest.headers = {};

            await verifyHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'No token provided',
            });
        });

        it('should return 401 for invalid authorization header format', async () => {
            mockRequest.headers = { authorization: 'InvalidFormat token' };

            await verifyHandler(mockRequest, mockReply);

            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'No token provided',
            });
        });

        it('should successfully verify valid token', async () => {
            const mockDecoded = {
                username: 'testuser',
                email: 'test@example.com',
                role: 'admin',
            };

            mockRequest.headers = { authorization: 'Bearer valid-token' };
            mockAuthService.verifyToken.mockResolvedValue(mockDecoded);

            const result = await verifyHandler(mockRequest, mockReply);

            expect(mockAuthService.verifyToken).toHaveBeenCalledWith(
                'valid-token'
            );
            expect(result).toEqual({
                message: 'Token is valid',
                user: mockDecoded,
            });
        });

        it('should return 401 for invalid token', async () => {
            mockRequest.headers = { authorization: 'Bearer invalid-token' };
            mockAuthService.verifyToken.mockRejectedValue(
                new Error('Invalid token')
            );

            await verifyHandler(mockRequest, mockReply);

            expect(mockFastify.log.error).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(401);
            expect(mockReply.send).toHaveBeenCalledWith({
                message: 'Invalid token',
            });
        });
    });
});
