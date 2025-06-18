import fastify from 'fastify';
import mongoose from 'mongoose';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from 'dotenv';
import { Container } from './container.js';

config();

const app = fastify({
    logger: true,
});

// Register plugins
app.register(cors, {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://frontend:3000',
        process.env.FRONTEND_URL,
    ].filter((url): url is string => Boolean(url)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
});

// Swagger documentation
app.register(swagger, {
    swagger: {
        info: {
            title: 'Attendance Tracking API',
            description: 'API documentation for the attendance tracking system',
            version: '1.0.0',
        },
    },
});

app.register(swaggerUi, {
    routePrefix: '/api-docs',
});

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });

Container.initialize()
    .then((containerInstance) => {
        const attendanceController = containerInstance.resolve(
            'AttendanceController'
        );
        app.register(attendanceController.routes, { prefix: '/api' });
        console.log('Dependency injection container initialized');
    })
    .catch((err) => {
        console.error(
            'Failed to initialize dependency injection container:',
            err
        );
        process.exit(1);
    });

// Health check route
app.get('/health', async () => {
    return { status: 'ok' };
});

// Start server
const start = async () => {
    try {
        await app.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
