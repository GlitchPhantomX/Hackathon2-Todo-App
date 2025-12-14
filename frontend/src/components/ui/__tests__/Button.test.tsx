import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Spinner } from '../Spinner';

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('applies primary variant by default', () => {
    render(<Button>Test Button</Button>);
    const button = screen.getByRole('button', { name: /test button/i });
    expect(button).toHaveClass('bg-blue-600');
  });

  test('applies different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Test</Button>);
    expect(screen.getByRole('button', { name: /test/i })).toHaveClass('bg-blue-600');

    rerender(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button', { name: /test/i })).toHaveClass('bg-gray-200');

    rerender(<Button variant="ghost">Test</Button>);
    expect(screen.getByRole('button', { name: /test/i })).toHaveClass('bg-transparent');

    rerender(<Button variant="danger">Test</Button>);
    expect(screen.getByRole('button', { name: /test/i })).toHaveClass('bg-red-600');
  });

  test('applies different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Test</Button>);
    expect(screen.getByRole('button', { name: /test/i })).toHaveClass('text-xs');

    rerender(<Button size="md">Test</Button>);
    expect(screen.getByRole('button', { name: /test/i })).toHaveClass('text-sm');

    rerender(<Button size="lg">Test</Button>);
    expect(screen.getByRole('button', { name: /test/i })).toHaveClass('text-base');
  });

  test('shows spinner when isLoading is true', () => {
    render(<Button isLoading={true}>Loading</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner has role="status"
  });

  test('does not show spinner when isLoading is false', () => {
    render(<Button isLoading={false}>Not Loading</Button>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('applies fullWidth class when specified', () => {
    render(<Button fullWidth={true}>Full Width</Button>);
    expect(screen.getByRole('button', { name: /full width/i })).toHaveClass('w-full');
  });

  test('is disabled when isLoading is true', () => {
    render(<Button isLoading={true}>Loading</Button>);
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled={true}>Disabled</Button>);
    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled();
  });

  test('calls onClick handler when clicked', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Clickable</Button>);

    fireEvent.click(screen.getByRole('button', { name: /clickable/i }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', () => {
    const mockOnClick = jest.fn();
    render(
      <Button onClick={mockOnClick} disabled={true}>
        Disabled Button
      </Button>
    );

    fireEvent.click(screen.getByRole('button', { name: /disabled button/i }));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button', { name: /custom/i })).toHaveClass('custom-class');
  });
});