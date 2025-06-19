import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test/utils';
import Navbar from '../Navbar';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Mock the hooks and API
vi.mock('../../contexts/AdminAuthContext', () => ({
    useAdminAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...(actual as any),
        useNavigate: vi.fn(),
    };
});

vi.mock('../../services/api', () => ({
    default: {
        post: vi.fn(),
    },
}));

const mockNavigate = vi.fn();
const mockSetIsAdmin = vi.fn();

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render navbar with home link', () => {
        (useAdminAuth as any).mockReturnValue({
            isAdmin: false,
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);

        render(<Navbar />);

        expect(
            screen.getByText('Attendance Tracking System')
        ).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should show attendance link for non-admin users', () => {
        (useAdminAuth as any).mockReturnValue({
            isAdmin: false,
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);

        render(<Navbar />);

        expect(screen.getByText('Attendance')).toBeInTheDocument();
        expect(screen.getByText('Admin Login')).toBeInTheDocument();
        expect(screen.queryByText('History')).not.toBeInTheDocument();
        expect(screen.queryByText('Sessions')).not.toBeInTheDocument();
        expect(screen.queryByText('Statistics')).not.toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('should show admin links for admin users', () => {
        (useAdminAuth as any).mockReturnValue({
            isAdmin: true,
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);

        render(<Navbar />);

        expect(screen.getByText('History')).toBeInTheDocument();
        expect(screen.getByText('Sessions')).toBeInTheDocument();
        expect(screen.getByText('Statistics')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.queryByText('Attendance')).not.toBeInTheDocument();
        expect(screen.queryByText('Admin Login')).not.toBeInTheDocument();
    });

    it('should handle logout successfully', async () => {
        (useAdminAuth as any).mockReturnValue({
            isAdmin: true,
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (api.post as any).mockResolvedValue({});

        localStorage.setItem('adminToken', 'test-token');

        render(<Navbar />);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // Wait for async operations
        await vi.waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/logout');
            expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken');
            expect(mockSetIsAdmin).toHaveBeenCalledWith(false);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('should handle logout with API error', async () => {
        (useAdminAuth as any).mockReturnValue({
            isAdmin: true,
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (api.post as any).mockRejectedValue(new Error('API Error'));

        localStorage.setItem('adminToken', 'test-token');

        render(<Navbar />);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // Wait for async operations
        await vi.waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/logout');
            expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken');
            expect(mockSetIsAdmin).toHaveBeenCalledWith(false);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('should have correct navigation links', () => {
        (useAdminAuth as any).mockReturnValue({
            isAdmin: false,
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);

        render(<Navbar />);

        const homeLink = screen.getByText('Home').closest('a');
        const attendanceLink = screen.getByText('Attendance').closest('a');
        const adminLoginLink = screen.getByText('Admin Login').closest('a');

        expect(homeLink).toHaveAttribute('href', '/');
        expect(attendanceLink).toHaveAttribute('href', '/attendance');
        expect(adminLoginLink).toHaveAttribute('href', '/admin-login');
    });
});
