import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model.js';
import { LoginRequest, LoginResponse } from '../types/index.js';

export class AuthService {
    private readonly jwtSecret: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here';
    }

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const { username, password } = credentials;

        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
            this.jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            message: 'Login successful',
            token,
            user: {
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        };
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async createDefaultAdmin(): Promise<void> {
        try {
            const existingAdmin = await Admin.findOne({ username: 'admin' });
            if (!existingAdmin) {
                const admin = new Admin({
                    username: 'admin',
                    // NOTE: obviously this is not a good practice, but for the sake of the demo, we'll use a default password
                    password: 'admin123',
                    email: 'admin@attendance.com',
                    role: 'admin',
                });
                await admin.save();
                console.log('Default admin user created');
            }
        } catch (error) {
            console.error('Error creating default admin:', error);
        }
    }
}
