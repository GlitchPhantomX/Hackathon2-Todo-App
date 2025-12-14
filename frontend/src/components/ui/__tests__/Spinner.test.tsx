import React from 'react';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../Spinner';

describe('Spinner Component', () => {
  test('renders spinner with default size', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('img'); // Spinner uses an icon, so it gets img role by default
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6');
    expect(spinner).toHaveClass('h-6');
  });

  test('applies different sizes correctly', () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByRole('img')).toHaveClass('w-4', 'h-4');

    rerender(<Spinner size="md" />);
    expect(screen.getByRole('img')).toHaveClass('w-6', 'h-6');

    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('img')).toHaveClass('w-8', 'h-8');
  });

  test('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    expect(screen.getByRole('img')).toHaveClass('custom-class');
  });

  test('applies custom color', () => {
    render(<Spinner color="red" />);
    const spinner = screen.getByRole('img');
    expect(spinner).toHaveStyle({ borderColor: 'red' });
  });

  test('has proper accessibility attributes', () => {
    render(<Spinner />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});