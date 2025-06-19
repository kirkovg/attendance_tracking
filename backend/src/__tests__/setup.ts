import { jest } from '@jest/globals';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Mock redis
jest.mock('../utils/redis.js', () => ({
    redisClient: {
        setEx: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    },
}));

// Mock sharp for image processing
jest.mock('sharp', () => {
    return jest.fn().mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest
            .fn()
            .mockResolvedValue(Buffer.from('fake-image-data') as never),
        metadata: jest.fn().mockResolvedValue({
            width: 100,
            height: 100,
        } as never),
    }));
});

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password' as never),
    compare: jest.fn().mockResolvedValue(true as never),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    }),
    decode: jest.fn().mockReturnValue({
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
    }),
}));

// Global test timeout
jest.setTimeout(10000);
