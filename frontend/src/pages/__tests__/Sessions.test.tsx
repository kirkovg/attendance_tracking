import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/utils';
import Sessions from '../Sessions';
import api from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn(),
    },
}));

const mockSessions = [
    {
        entry: {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            image: 'john-entry.jpg',
            imagePath: 'john-entry.jpg',
            type: 'ENTRY' as const,
            timestamp: '2024-01-01T10:00:00Z',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z',
        },
        exit: {
            _id: '2',
            name: 'John Doe',
            email: 'john@example.com',
            image: 'john-exit.jpg',
            imagePath: 'john-exit.jpg',
            type: 'EXIT' as const,
            timestamp: '2024-01-01T18:00:00Z',
            createdAt: '2024-01-01T18:00:00Z',
            updatedAt: '2024-01-01T18:00:00Z',
        },
        duration: 28800, // 8 hours in seconds
    },
    {
        entry: {
            _id: '3',
            name: 'Jane Smith',
            email: 'jane@example.com',
            image: 'jane-entry.jpg',
            imagePath: 'jane-entry.jpg',
            type: 'ENTRY' as const,
            timestamp: '2024-01-01T09:00:00Z',
            createdAt: '2024-01-01T09:00:00Z',
            updatedAt: '2024-01-01T09:00:00Z',
        },
        // No exit record - active session
        duration: undefined,
    },
];

describe('Sessions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (api.get as any).mockResolvedValue({ data: mockSessions });
    });

    it('should render sessions page with title', () => {
        render(<Sessions />);

        expect(screen.getByText('Attendance Sessions')).toBeInTheDocument();
    });

    it('should render search form elements', () => {
        render(<Sessions />);

        expect(screen.getByLabelText('Filter by Email')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Search' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Reset' })
        ).toBeInTheDocument();
    });

    it('should fetch sessions on mount', async () => {
        render(<Sessions />);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/attendance/sessions?');
        });
    });

    it('should display sessions in table', async () => {
        render(<Sessions />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        });
    });

    it('should display completed session correctly', async () => {
        render(<Sessions />);

        await waitFor(() => {
            // Check for completed session data
            expect(screen.getByText('480m 0s')).toBeInTheDocument(); // Duration
            expect(screen.getByText('Completed')).toBeInTheDocument(); // Status
        });
    });

    it('should display active session correctly', async () => {
        render(<Sessions />);

        await waitFor(() => {
            // Check for active session data
            expect(screen.getByText('N/A')).toBeInTheDocument(); // Duration for active session
            expect(screen.getByText('Active')).toBeInTheDocument(); // Status
            expect(screen.getByText('Not checked out')).toBeInTheDocument();
        });
    });

    it('should handle search with email filter', async () => {
        const user = userEvent.setup();
        render(<Sessions />);

        const emailInput = screen.getByLabelText('Filter by Email');
        const searchButton = screen.getByRole('button', { name: 'Search' });

        await user.type(emailInput, 'john@example.com');
        await user.click(searchButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                '/attendance/sessions?email=john%40example.com'
            );
        });
    });

    it('should handle reset functionality', async () => {
        const user = userEvent.setup();
        render(<Sessions />);

        const emailInput = screen.getByLabelText('Filter by Email');
        const resetButton = screen.getByRole('button', { name: 'Reset' });

        await user.type(emailInput, 'john@example.com');
        await user.click(resetButton);

        await waitFor(() => {
            expect(emailInput).toHaveValue('');
            expect(api.get).toHaveBeenCalledWith('/attendance/sessions?');
        });
    });

    it('should show loading state', async () => {
        (api.get as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<Sessions />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error state', async () => {
        (api.get as any).mockRejectedValue(new Error('Network error'));

        render(<Sessions />);

        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch attendance sessions')
            ).toBeInTheDocument();
        });
    });

    it('should show no sessions message when empty', async () => {
        (api.get as any).mockResolvedValue({ data: [] });

        render(<Sessions />);

        await waitFor(() => {
            expect(screen.getByText('No sessions found')).toBeInTheDocument();
        });
    });

    it('should format short duration correctly', async () => {
        const shortSession = [
            {
                ...mockSessions[0],
                duration: 45, // 45 seconds
            },
        ];
        (api.get as any).mockResolvedValue({ data: shortSession });

        render(<Sessions />);

        await waitFor(() => {
            expect(screen.getByText('45s')).toBeInTheDocument();
        });
    });

    it('should handle image click to open dialog', async () => {
        const user = userEvent.setup();
        render(<Sessions />);

        await waitFor(() => {
            const imageAvatars = screen.getAllByRole('img');
            expect(imageAvatars.length).toBeGreaterThan(0);
        });

        const imageAvatars = screen.getAllByRole('img');
        await user.click(imageAvatars[0]);

        // Should open image dialog
        expect(screen.getByText('Attendance Image')).toBeInTheDocument();
    });

    it('should disable buttons during loading', async () => {
        (api.get as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<Sessions />);

        const searchButton = screen.getByRole('button', { name: 'Search' });
        const resetButton = screen.getByRole('button', { name: 'Reset' });

        expect(searchButton).toBeDisabled();
        expect(resetButton).toBeDisabled();
    });

    it('should display timestamps in readable format', async () => {
        render(<Sessions />);

        await waitFor(() => {
            // Check that timestamps are displayed (the exact format depends on locale)
            expect(screen.getAllByText(/1\/1\/2024/)).toBeDefined();
        });
    });

    it('should show status chips correctly', async () => {
        render(<Sessions />);

        await waitFor(() => {
            expect(screen.getByText('Completed')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
        });
    });

    it('should handle sessions without exit records', async () => {
        const incompleteSession = [
            {
                entry: {
                    _id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    image: 'john-entry.jpg',
                    imagePath: 'john-entry.jpg',
                    type: 'ENTRY' as const,
                    timestamp: '2024-01-01T10:00:00Z',
                    createdAt: '2024-01-01T10:00:00Z',
                    updatedAt: '2024-01-01T10:00:00Z',
                },
                // No exit record
                duration: undefined,
            },
        ];
        (api.get as any).mockResolvedValue({ data: incompleteSession });

        render(<Sessions />);

        await waitFor(() => {
            expect(screen.getByText('Not checked out')).toBeInTheDocument();
            expect(screen.getByText('N/A')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
        });
    });
});
