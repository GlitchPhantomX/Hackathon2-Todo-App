import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  test('renders input with label', () => {
    render(<Input label="Username" id="username" />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  test('renders input without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  test('displays error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveClass('border-red-300');
  });

  test('displays helper text when provided and no error', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
  });

  test('does not display helper text when error is present', () => {
    render(
      <Input
        label="Password"
        helperText="Must be at least 8 characters"
        error="Password is too short"
      />
    );
    expect(screen.queryByText(/must be at least 8 characters/i)).not.toBeInTheDocument();
    expect(screen.getByText(/password is too short/i)).toBeInTheDocument();
  });

  test('applies fullWidth class when specified', () => {
    render(<Input label="Full Width" fullWidth={true} />);
    expect(screen.getByRole('textbox', { name: /full width/i }).parentElement).toHaveClass(
      'w-full'
    );
  });

  test('passes additional props to input element', () => {
    render(<Input label="Test" type="email" data-testid="test-input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'email');
  });

  test('handles change events', () => {
    const mockOnChange = jest.fn();
    render(<Input label="Test" onChange={mockOnChange} />);
    const input = screen.getByRole('textbox', { name: /test/i });

    fireEvent.change(input, { target: { value: 'test value' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('applies custom className', () => {
    render(<Input label="Test" className="custom-input" />);
    expect(screen.getByRole('textbox', { name: /test/i })).toHaveClass('custom-input');
  });

  test('applies proper styling when label exists', () => {
    render(<Input label="Test" />);
    expect(screen.getByRole('textbox', { name: /test/i })).toHaveClass('py-2', 'px-3');
  });

  test('applies proper styling when no label exists', () => {
    render(<Input placeholder="Test" />);
    expect(screen.getByPlaceholderText(/test/i)).toHaveClass('p-2');
  });
});