import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../Alert';

describe('Alert Component', () => {
  test('renders alert with children', () => {
    render(<Alert>This is an alert</Alert>);
    expect(screen.getByText(/this is an alert/i)).toBeInTheDocument();
  });

  test('renders alert with title', () => {
    render(<Alert title="Alert Title">This is an alert</Alert>);
    expect(screen.getByText(/alert title/i)).toBeInTheDocument();
  });

  test('applies different variants correctly', () => {
    const { rerender } = render(<Alert variant="success">Test</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');

    rerender(<Alert variant="error">Test</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');

    rerender(<Alert variant="warning">Test</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');

    rerender(<Alert variant="info">Test</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
  });

  test('shows icon by default', () => {
    render(<Alert variant="success">Test alert</Alert>);
    // The icon is CheckCircle for success variant
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  test('hides icon when showIcon is false', () => {
    render(<Alert variant="success" showIcon={false}>Test alert</Alert>);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('shows close button when onClose is provided', () => {
    const mockOnClose = jest.fn();
    render(<Alert variant="info" onClose={mockOnClose}>Test alert</Alert>);
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not show close button when onClose is not provided', () => {
    render(<Alert variant="info">Test alert</Alert>);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Alert className="custom-alert">Test alert</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-alert');
  });

  test('renders complex content correctly', () => {
    render(
      <Alert title="Complex Alert">
        <div>This is a <strong>complex</strong> alert.</div>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </Alert>
    );

    expect(screen.getByText(/complex/i)).toBeInTheDocument();
    expect(screen.getByText(/this is a/i)).toBeInTheDocument();
    expect(screen.getByText(/item 1/i)).toBeInTheDocument();
    expect(screen.getByText(/item 2/i)).toBeInTheDocument();
  });

  test('has proper accessibility role', () => {
    render(<Alert>Accessible alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});