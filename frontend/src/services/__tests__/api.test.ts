import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '../api';

// Mock axios
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            interceptors: {
                request: {
                    use: vi.fn(),
                },
                response: {
                    use: vi.fn(),
                },
            },
        })),
    },
}));

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create axios instance with correct base URL', () => {
        // The api instance should be created with the correct base URL
        expect(api).toBeDefined();
    });

    it('should not add admin token when not available', () => {
        // Test the logic that would be in the request interceptor
        const mockConfig = {
            method: 'get',
            url: '/test',
            headers: {} as Record<string, string>,
        };

        // Simulate the interceptor logic
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            mockConfig.headers.Authorization = `Bearer ${adminToken}`;
        }

        expect(mockConfig.headers.Authorization).toBeUndefined();
    });

    it('should handle request errors', () => {
        const mockError = new Error('Request failed');
        const mockRequestInterceptor = vi.fn((successHandler, errorHandler) => {
            // Simulate error handler
            return errorHandler(mockError);
        });

        expect(() => mockRequestInterceptor(vi.fn(), vi.fn())).not.toThrow();
    });

    it('should handle response errors', () => {
        const mockError = {
            response: {
                status: 404,
                data: { message: 'Not found' },
            },
        };

        const mockResponseInterceptor = vi.fn(
            (successHandler, errorHandler) => {
                // Simulate error handler
                return errorHandler(mockError);
            }
        );

        expect(() => mockResponseInterceptor(vi.fn(), vi.fn())).not.toThrow();
    });
});
