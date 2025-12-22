import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../card';

describe('Card Component', () => {
  test('renders card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  test('applies default padding', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).toHaveClass('p-4');
  });

  test('applies different padding sizes correctly', () => {
    const { rerender } = render(<Card padding="none">Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).not.toHaveClass('p-3', 'p-4', 'p-6');

    rerender(<Card padding="sm">Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).toHaveClass('p-3');

    rerender(<Card padding="md">Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).toHaveClass('p-4');

    rerender(<Card padding="lg">Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).toHaveClass('p-6');
  });

  test('applies shadow by default', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).toHaveClass('shadow-sm');
  });

  test('does not apply shadow when shadow prop is false', () => {
    render(<Card shadow={false}>Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).not.toHaveClass('shadow-sm');
  });

  test('applies rounded corners by default', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).toHaveClass('rounded-lg');
  });

  test('does not apply rounded corners when rounded prop is false', () => {
    render(<Card rounded={false}>Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).not.toHaveClass('rounded-lg');
  });

  test('applies custom className', () => {
    render(<Card className="custom-card">Card content</Card>);
    expect(screen.getByText(/card content/i).closest('div')).toHaveClass('custom-card');
  });

  test('applies all props together correctly', () => {
    render(
      <Card padding="lg" shadow={false} rounded={false} className="custom-class">
        Card content
      </Card>
    );
    const card = screen.getByText(/card content/i).closest('div');
    expect(card).toHaveClass('p-6', 'custom-class');
    expect(card).not.toHaveClass('shadow-sm', 'rounded-lg');
  });
});