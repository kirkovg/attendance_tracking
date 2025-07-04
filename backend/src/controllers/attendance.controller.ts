import { AttendanceService } from '../services/attendance.service.js';
import {
    AttendanceRequest,
    AttendanceQuery,
    AttendanceResponse,
} from '../types/index.js';
import {
    FastifyInstance,
    FastifyPluginAsync,
    FastifyRequest,
    FastifyReply,
} from 'fastify';
import fs from 'fs';
import { ImageProcessor } from '../utils/imageProcessor.js';
import { authenticateAdmin } from '../utils/auth.middleware.js';

export class AttendanceController {
    constructor(
        private attendanceService: AttendanceService,
        private imageProcessor: ImageProcessor
    ) {}

    static inject = ['AttendanceService', 'ImageProcessor'] as const;

    routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
        // Process attendance (check-in/check-out)
        fastify.post<{ Body: AttendanceRequest }>(
            '/attendance',
            async (
                request: FastifyRequest<{ Body: AttendanceRequest }>,
                reply: FastifyReply
            ): Promise<AttendanceResponse> => {
                try {
                    const { name, email, image, type } = request.body;

                    // Validate required fields
                    if (!name || !email || !image) {
                        return reply.code(400).send({
                            message: 'Name, email, and image are required',
                        });
                    }

                    // Verify identity for exit (compare with last entry photo)
                    if (type === 'EXIT') {
                        const verification =
                            await this.attendanceService.verifyIdentity(
                                email,
                                image
                            );
                        if (!verification.verified) {
                            return reply.code(400).send({
                                message: `Identity verification failed. Similarity: ${Math.round(
                                    verification.similarity * 100
                                )}%`,
                            });
                        }
                    }

                    const record =
                        await this.attendanceService.recordAttendance({
                            name,
                            email,
                            image,
                            type,
                        });

                    return {
                        message: `Successfully recorded ${
                            type === 'ENTRY' ? 'check-in' : 'check-out'
                        }`,
                        type,
                        record,
                    };
                } catch (error) {
                    fastify.log.error(error);
                    return reply.code(500).send({
                        message: 'Error processing attendance',
                    });
                }
            }
        );

        // Get attendance history (protected - admin only)
        fastify.get<{ Querystring: AttendanceQuery }>(
            '/attendance/history',
            { preHandler: authenticateAdmin },
            async (
                request: FastifyRequest<{ Querystring: AttendanceQuery }>,
                reply: FastifyReply
            ) => {
                try {
                    const { email, startDate, endDate, type } = request.query;

                    return await this.attendanceService.getAttendanceHistory({
                        email,
                        startDate,
                        endDate,
                        type,
                    });
                } catch (error) {
                    fastify.log.error(error);
                    return reply.code(500).send({
                        message: 'Error fetching attendance history',
                    });
                }
            }
        );

        // Get attendance sessions (protected - admin only)
        fastify.get<{ Querystring: { email?: string } }>(
            '/attendance/sessions',
            { preHandler: authenticateAdmin },
            async (
                request: FastifyRequest<{ Querystring: { email?: string } }>,
                reply: FastifyReply
            ) => {
                try {
                    const { email } = request.query;
                    const sessions =
                        await this.attendanceService.getAttendanceSessions(
                            email
                        );
                    return sessions;
                } catch (error) {
                    fastify.log.error(error);
                    return reply.code(500).send({
                        message: 'Error fetching attendance sessions',
                    });
                }
            }
        );

        // Get admin statistics (protected - admin only)
        fastify.get(
            '/attendance/stats',
            { preHandler: authenticateAdmin },
            async (_request: FastifyRequest, reply: FastifyReply) => {
                try {
                    const stats = await this.attendanceService.getAdminStats();
                    return stats;
                } catch (error) {
                    fastify.log.error(error);
                    return reply.code(500).send({
                        message: 'Error fetching statistics',
                    });
                }
            }
        );

        // Serve uploaded images
        fastify.get('/uploads/:filename', async (request, reply) => {
            try {
                const { filename } = request.params as { filename: string };
                const imagePath = this.imageProcessor.getImagePath(filename);

                if (!fs.existsSync(imagePath)) {
                    return reply.code(404).send({ message: 'Image not found' });
                }

                const stream = fs.createReadStream(imagePath);
                reply.type('image/jpeg');
                return reply.send(stream);
            } catch (error) {
                fastify.log.error(error);
                return reply.code(404).send({ message: 'Image not found' });
            }
        });
    };
}
