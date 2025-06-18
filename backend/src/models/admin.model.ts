import mongoose, { Schema } from 'mongoose';
import { IAdmin } from '../types/index.js';
import bcrypt from 'bcryptjs';

// Extend the IAdmin interface to include the comparePassword method
interface IAdminDocument extends IAdmin {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdminDocument>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        role: {
            type: String,
            default: 'admin',
            enum: ['admin'],
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const Admin = mongoose.model<IAdminDocument>('Admin', adminSchema);
