import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/index.js';

export async function authenticateAdmin(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here';

        const decoded = jwt.verify(token, jwtSecret) as any;

        if (!decoded || decoded.role !== 'admin') {
            return reply.code(403).send({
                message: 'Access denied. Admin privileges required.',
            });
        }

        // Add user info to request
        (request as AuthRequest).user = {
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
        };
    } catch (error) {
        return reply.code(401).send({
            message: 'Invalid token.',
        });
    }
}
