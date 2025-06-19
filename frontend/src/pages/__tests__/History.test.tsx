import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/utils';
import History from '../History';
import api from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
    default: {
        get: vi.fn(),
    },
}));

// Mock MUI DatePicker
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
    DatePicker: ({ label, value, onChange }: any) => (
        <input
            data-testid={`datepicker-${label.toLowerCase().replace(' ', '-')}`}
            value={value ? value.toISOString().split('T')[0] : ''}
            onChange={(e) => {
                if (e.target.value) {
                    const date = new Date(e.target.value);
                    onChange && onChange(date);
                } else {
                    onChange && onChange(null);
                }
            }}
            placeholder={label}
            type="date"
        />
    ),
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
    LocalizationProvider: ({ children }: any) => children,
}));

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
    AdapterDateFns: {},
}));

const mockRecords = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        type: 'ENTRY' as const,
        timestamp: '2024-01-01T10:00:00Z',
        imagePath: 'john-entry.jpg',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        type: 'EXIT' as const,
        timestamp: '2024-01-01T18:00:00Z',
        imagePath: 'jane-exit.jpg',
        createdAt: '2024-01-01T18:00:00Z',
        updatedAt: '2024-01-01T18:00:00Z',
    },
];

describe('History', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (api.get as any).mockResolvedValue({ data: mockRecords });
    });

    it('should render history page with title', () => {
        render(<History />);

        expect(screen.getByText('Attendance History')).toBeInTheDocument();
    });

    it('should render search form elements', () => {
        render(<History />);

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByTestId('datepicker-start-date')).toBeInTheDocument();
        expect(screen.getByTestId('datepicker-end-date')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Search' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Reset' })
        ).toBeInTheDocument();
    });

    it('should fetch records on mount', async () => {
        render(<History />);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/attendance/history?');
        });
    });

    it('should display records in table', async () => {
        render(<History />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
            expect(screen.getByText('ENTRY')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
            expect(screen.getByText('EXIT')).toBeInTheDocument();
        });
    });

    it('should handle search with email filter', async () => {
        const user = userEvent.setup();
        render(<History />);

        const emailInput = screen.getByLabelText('Email');
        const searchButton = screen.getByRole('button', { name: 'Search' });

        await user.type(emailInput, 'john@example.com');
        await user.click(searchButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                '/attendance/history?email=john%40example.com'
            );
        });
    });

    it('should handle search with date filters', async () => {
        const user = userEvent.setup();
        render(<History />);

        const startDateInput = screen.getByTestId('datepicker-start-date');
        const endDateInput = screen.getByTestId('datepicker-end-date');
        const searchButton = screen.getByRole('button', { name: 'Search' });

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        await user.type(startDateInput, '2024-01-01');
        await user.type(endDateInput, '2024-01-31');
        await user.click(searchButton);

        await waitFor(() => {
            // Check for the second API call (after search) with URL-encoded parameters
            expect(api.get).toHaveBeenCalledWith(
                `/attendance/history?startDate=${encodeURIComponent(
                    startDate.toISOString()
                )}&endDate=${encodeURIComponent(endDate.toISOString())}`
            );
        });
    });

    it('should handle search with all filters', async () => {
        const user = userEvent.setup();
        render(<History />);

        const emailInput = screen.getByLabelText('Email');
        const startDateInput = screen.getByTestId('datepicker-start-date');
        const endDateInput = screen.getByTestId('datepicker-end-date');
        const searchButton = screen.getByRole('button', { name: 'Search' });

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        expect(startDateInput).toBeInTheDocument();
        expect(endDateInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(searchButton).toBeInTheDocument();

        await user.type(emailInput, 'john@example.com');
        await user.type(startDateInput, '2024-01-01');
        await user.type(endDateInput, '2024-01-31');
        await user.click(searchButton);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(
                `/attendance/history?email=john%40example.com&startDate=${encodeURIComponent(
                    startDate.toISOString()
                )}&endDate=${encodeURIComponent(endDate.toISOString())}`
            );
        });
    });

    it('should handle reset functionality', async () => {
        const user = userEvent.setup();
        render(<History />);

        const emailInput = screen.getByLabelText('Email');
        const resetButton = screen.getByRole('button', { name: 'Reset' });

        await user.type(emailInput, 'john@example.com');
        await user.click(resetButton);

        await waitFor(() => {
            expect(emailInput).toHaveValue('');
            expect(api.get).toHaveBeenCalledWith('/attendance/history?');
        });
    });

    it('should show loading state', async () => {
        (api.get as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<History />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show error state', async () => {
        (api.get as any).mockRejectedValue(new Error('Network error'));

        render(<History />);

        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch attendance records')
            ).toBeInTheDocument();
        });
    });

    it('should show no records message when empty', async () => {
        (api.get as any).mockResolvedValue({ data: [] });

        render(<History />);

        await waitFor(() => {
            expect(screen.getByText('No records found')).toBeInTheDocument();
        });
    });

    it('should display timestamps in readable format', async () => {
        render(<History />);

        await waitFor(() => {
            // Check that timestamps are displayed in a readable format
            const timestampCells = screen.getAllByText(
                /\d{1,2}\/\d{1,2}\/\d{4}/
            );
            expect(timestampCells.length).toBeGreaterThan(0);
        });
    });

    it('should handle image click to open dialog', async () => {
        const user = userEvent.setup();
        render(<History />);

        await waitFor(() => {
            const image = screen.getByAltText('John Doe ENTRY');
            expect(image).toBeInTheDocument();
        });

        const image = screen.getByAltText('John Doe ENTRY');
        await user.click(image);

        await waitFor(() => {
            expect(screen.getByText('Attendance Image')).toBeInTheDocument();
        });
    });

    it('should disable buttons during loading', async () => {
        (api.get as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<History />);

        const searchButton = screen.getByRole('button', { name: 'Search' });
        const resetButton = screen.getByRole('button', { name: 'Reset' });

        expect(searchButton).toBeDisabled();
        expect(resetButton).toBeDisabled();
    });
});
