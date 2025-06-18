import { AuthService } from '../services/auth.service.js';
import { LoginRequest, LoginResponse } from '../types/index.js';
import {
    FastifyInstance,
    FastifyPluginAsync,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import { authenticateAdmin } from '../utils/auth.middleware.js';

export class AuthController {
    constructor(private authService: AuthService) {}

    static inject = ['AuthService'] as const;

    routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
        // Login endpoint
        fastify.post<{ Body: LoginRequest }>(
            '/auth/login',
            async (
                request: FastifyRequest<{ Body: LoginRequest }>,
                reply: FastifyReply
            ): Promise<LoginResponse> => {
                try {
                    const { username, password } = request.body;

                    // Validate required fields
                    if (!username || !password) {
                        return reply.code(400).send({
                            message: 'Username and password are required',
                        });
                    }

                    const result = await this.authService.login({
                        username,
                        password,
                    });

                    return result;
                } catch (error) {
                    fastify.log.error(error);
                    return reply.code(401).send({
                        message: 'Invalid credentials',
                    });
                }
            }
        );

        // Logout endpoint (requires authentication)
        fastify.post(
            '/auth/logout',
            { preHandler: authenticateAdmin },
            async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    const authHeader = request.headers.authorization;
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return reply.code(401).send({
                            message: 'No token provided',
                        });
                    }

                    const token = authHeader.substring(7);
                    await this.authService.logout(token);

                    return {
                        message: 'Logout successful',
                    };
                } catch (error) {
                    fastify.log.error(error);
                    return reply.code(500).send({
                        message: 'Logout failed',
                    });
                }
            }
        );

        // Verify token endpoint
        fastify.get(
            '/auth/verify',
            async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    const authHeader = request.headers.authorization;
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        return reply.code(401).send({
                            message: 'No token provided',
                        });
                    }

                    const token = authHeader.substring(7);
                    const decoded = await this.authService.verifyToken(token);

                    return {
                        message: 'Token is valid',
                        user: decoded,
                    };
                } catch (error) {
                    fastify.log.error(error);
                    return reply.code(401).send({
                        message: 'Invalid token',
                    });
                }
            }
        );
    };
}
