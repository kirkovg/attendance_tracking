import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/utils';
import Home from '../Home';

describe('Home Page', () => {
    it('should render welcome message', () => {
        render(<Home />);

        expect(
            screen.getByText('Welcome to the Attendance Tracking System')
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /A modern, secure, and efficient way to manage attendance/
            )
        ).toBeInTheDocument();
    });

    it('should render how it works section', () => {
        render(<Home />);

        expect(screen.getByText('How It Works')).toBeInTheDocument();
    });

    it('should render all three steps', () => {
        render(<Home />);

        expect(screen.getByText('1. Camera Access')).toBeInTheDocument();
        expect(
            screen.getByText('2. Identity Verification')
        ).toBeInTheDocument();
        expect(screen.getByText('3. Record Attendance')).toBeInTheDocument();
    });

    it('should render step descriptions', () => {
        render(<Home />);

        expect(
            screen.getByText(/Allow camera access when prompted/)
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /The system captures your photo and verifies your identity/
            )
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Your attendance is recorded with timestamp and photo/
            )
        ).toBeInTheDocument();
    });
});
