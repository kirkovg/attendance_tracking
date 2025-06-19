import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/utils';
import AdminLogin from '../AdminLogin';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Mock the hooks and API
vi.mock('../../contexts/AdminAuthContext', () => ({
    useAdminAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
    BrowserRouter: vi.fn().mockImplementation((props) => props.children),
}));

vi.mock('../../services/api', () => ({
    default: {
        post: vi.fn(),
    },
}));

const mockNavigate = vi.fn();
const mockSetIsAdmin = vi.fn();

describe('AdminLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render login form', () => {
        (useAdminAuth as any).mockReturnValue({
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);

        render(<AdminLogin />);

        expect(screen.getByText('Admin Login')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Login' })
        ).toBeInTheDocument();
    });

    it('should handle form input changes', async () => {
        (useAdminAuth as any).mockReturnValue({
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);

        const user = userEvent.setup();
        render(<AdminLogin />);

        const usernameInput = screen
            .getByTestId('username')
            .querySelector('input');
        const passwordInput = screen
            .getByTestId('password')
            .querySelector('input');

        await user.type(usernameInput as Element, 'admin');
        await user.type(passwordInput as Element, 'password123');

        expect(usernameInput).toHaveValue('admin');
        expect(passwordInput).toHaveValue('password123');
    });

    it('should handle successful login', async () => {
        (useAdminAuth as any).mockReturnValue({
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (api.post as any).mockResolvedValue({
            data: { token: 'test-token' },
        });

        const user = userEvent.setup();
        render(<AdminLogin />);

        const usernameInput = screen
            .getByTestId('username')
            .querySelector('input');
        const passwordInput = screen
            .getByTestId('password')
            .querySelector('input');
        const loginButton = screen.getByRole('button', { name: 'Login' });

        await user.type(usernameInput as Element, 'admin');
        await user.type(passwordInput as Element, 'password123');
        await user.click(loginButton);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                username: 'admin',
                password: 'password123',
            });
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'adminToken',
                'test-token'
            );
            expect(mockSetIsAdmin).toHaveBeenCalledWith(true);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('should handle login error', async () => {
        (useAdminAuth as any).mockReturnValue({
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (api.post as any).mockRejectedValue({
            response: { data: { message: 'Invalid credentials' } },
        });

        const user = userEvent.setup();
        render(<AdminLogin />);

        const usernameInput = screen
            .getByTestId('username')
            .querySelector('input');
        const passwordInput = screen
            .getByTestId('password')
            .querySelector('input');
        const loginButton = screen.getByRole('button', { name: 'Login' });

        await user.type(usernameInput as Element, 'admin');
        await user.type(passwordInput as Element, 'wrongpassword');
        await user.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('should show loading state during login', async () => {
        (useAdminAuth as any).mockReturnValue({
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (api.post as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        const user = userEvent.setup();
        render(<AdminLogin />);

        const usernameInput = screen
            .getByTestId('username')
            .querySelector('input');
        const passwordInput = screen
            .getByTestId('password')
            .querySelector('input');
        const loginButton = screen.getByRole('button', { name: 'Login' });

        await user.type(usernameInput as Element, 'admin');
        await user.type(passwordInput as Element, 'password123');
        await user.click(loginButton);

        // Should show loading state
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(loginButton).toBeDisabled();
    });

    it('should handle generic login error', async () => {
        (useAdminAuth as any).mockReturnValue({
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (api.post as any).mockRejectedValue(new Error('Network error'));

        const user = userEvent.setup();
        render(<AdminLogin />);

        const usernameInput = screen
            .getByTestId('username')
            .querySelector('input');
        const passwordInput = screen
            .getByTestId('password')
            .querySelector('input');
        const loginButton = screen.getByRole('button', { name: 'Login' });

        await user.type(usernameInput as Element, 'admin');
        await user.type(passwordInput as Element, 'password123');
        await user.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText('Login failed')).toBeInTheDocument();
        });
    });

    it('should require both username and password', () => {
        (useAdminAuth as any).mockReturnValue({
            setIsAdmin: mockSetIsAdmin,
        });
        (useNavigate as any).mockReturnValue(mockNavigate);

        render(<AdminLogin />);

        const usernameInput = screen
            .getByTestId('username')
            .querySelector('input');
        const passwordInput = screen
            .getByTestId('password')
            .querySelector('input');

        expect(usernameInput).toBeRequired();
        expect(passwordInput).toBeRequired();
    });
});
