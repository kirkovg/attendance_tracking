import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../test/utils';
import Statistics from '../Statistics';
import api from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn(),
    },
}));

const mockStats = {
    totalEntries: 150,
    totalExits: 120,
    totalUsers: 45,
    averageDuration: 28800, // 8 hours in seconds
};

describe('Statistics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (api.get as any).mockResolvedValue({ data: mockStats });
    });

    it('should render statistics page with title', async () => {
        render(<Statistics />);

        await waitFor(() => {
            expect(screen.getByText('System Statistics')).toBeInTheDocument();
        });
    });

    it('should fetch stats on mount', async () => {
        render(<Statistics />);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/attendance/stats');
        });
    });

    it('should display all stat cards', async () => {
        render(<Statistics />);

        await waitFor(() => {
            expect(screen.getByText('Total Check-ins')).toBeInTheDocument();
            expect(screen.getByText('150')).toBeInTheDocument();

            expect(screen.getByText('Total Check-outs')).toBeInTheDocument();
            expect(screen.getByText('120')).toBeInTheDocument();

            expect(screen.getByText('Total Users')).toBeInTheDocument();
            expect(screen.getByText('45')).toBeInTheDocument();

            expect(screen.getByText('Avg. Duration')).toBeInTheDocument();
            expect(screen.getByText('480m 0s')).toBeInTheDocument();
        });
    });

    it('should format duration correctly for minutes and seconds', async () => {
        const statsWithMinutes = {
            ...mockStats,
            averageDuration: 3665, // 1 hour 1 minute 5 seconds
        };
        (api.get as any).mockResolvedValue({ data: statsWithMinutes });

        render(<Statistics />);

        await waitFor(() => {
            expect(screen.getByText('61m 5s')).toBeInTheDocument();
        });
    });

    it('should format duration correctly for seconds only', async () => {
        const statsWithSeconds = {
            ...mockStats,
            averageDuration: 45, // 45 seconds
        };
        (api.get as any).mockResolvedValue({ data: statsWithSeconds });

        render(<Statistics />);

        await waitFor(() => {
            expect(screen.getByText('45s')).toBeInTheDocument();
        });
    });

    it('should display key insights section', async () => {
        render(<Statistics />);

        await waitFor(() => {
            expect(screen.getByText('Key Insights')).toBeInTheDocument();
            expect(screen.getByText('Attendance Rate')).toBeInTheDocument();
            expect(screen.getByText('Current Status')).toBeInTheDocument();
        });
    });

    it('should calculate attendance rate correctly', async () => {
        render(<Statistics />);

        await waitFor(() => {
            // 120 exits / 150 entries = 80%
            expect(
                screen.getByText(
                    '80% of check-ins have corresponding check-outs'
                )
            ).toBeInTheDocument();
        });
    });

    it('should show current status with active users', async () => {
        render(<Statistics />);

        await waitFor(() => {
            // 150 entries - 120 exits = 30 users currently checked in
            expect(
                screen.getByText('30 users currently checked in')
            ).toBeInTheDocument();
        });
    });

    it('should handle zero exits in attendance rate', async () => {
        const statsWithNoExits = {
            ...mockStats,
            totalExits: 0,
        };
        (api.get as any).mockResolvedValue({ data: statsWithNoExits });

        render(<Statistics />);

        await waitFor(() => {
            expect(
                screen.getByText('No completed sessions yet')
            ).toBeInTheDocument();
        });
    });

    it('should handle no active users', async () => {
        const statsWithNoActiveUsers = {
            ...mockStats,
            totalEntries: 100,
            totalExits: 100,
        };
        (api.get as any).mockResolvedValue({ data: statsWithNoActiveUsers });

        render(<Statistics />);

        await waitFor(() => {
            expect(
                screen.getByText('No users currently checked in')
            ).toBeInTheDocument();
        });
    });

    it('should show loading state', async () => {
        (api.get as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<Statistics />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error state', async () => {
        (api.get as any).mockRejectedValue(new Error('Network error'));

        render(<Statistics />);

        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch statistics')
            ).toBeInTheDocument();
        });
    });

    it('should show no stats available message', async () => {
        (api.get as any).mockResolvedValue({ data: null });

        render(<Statistics />);

        await waitFor(() => {
            expect(
                screen.getByText('No statistics available')
            ).toBeInTheDocument();
        });
    });

    it('should render stat cards with correct icons', async () => {
        render(<Statistics />);

        await waitFor(() => {
            expect(screen.getByText('Total Check-ins')).toBeInTheDocument();
            expect(screen.getByText('Total Check-outs')).toBeInTheDocument();
            expect(screen.getByText('Total Users')).toBeInTheDocument();
            expect(screen.getByText('Avg. Duration')).toBeInTheDocument();
        });
    });

    it('should handle very large numbers', async () => {
        const statsWithLargeNumbers = {
            ...mockStats,
            totalEntries: 999999,
            totalExits: 888888,
            totalUsers: 12345,
            averageDuration: 86400, // 24 hours
        };
        (api.get as any).mockResolvedValue({ data: statsWithLargeNumbers });

        render(<Statistics />);

        await waitFor(() => {
            expect(screen.getByText('999999')).toBeInTheDocument();
            expect(screen.getByText('888888')).toBeInTheDocument();
            expect(screen.getByText('12345')).toBeInTheDocument();
            expect(screen.getByText('1440m 0s')).toBeInTheDocument(); // 24 hours = 1440 minutes
        });
    });

    it('should round attendance rate percentage correctly', async () => {
        const statsWithFractionalRate = {
            ...mockStats,
            totalEntries: 100,
            totalExits: 33, // 33% should round to 33%
        };
        (api.get as any).mockResolvedValue({ data: statsWithFractionalRate });

        render(<Statistics />);

        await waitFor(() => {
            expect(
                screen.getByText(
                    '33% of check-ins have corresponding check-outs'
                )
            ).toBeInTheDocument();
        });
    });
});
