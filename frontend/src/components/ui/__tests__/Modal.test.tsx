import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '../Modal';

// Mock createPortal to avoid issues with DOM manipulation in tests
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        Modal content
      </Modal>
    );
    expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
  });

  test('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Modal content
      </Modal>
    );
    expect(screen.getByText(/modal content/i)).toBeInTheDocument();
  });

  test('displays title when provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Title">
        Modal content
      </Modal>
    );
    expect(screen.getByText(/test title/i)).toBeInTheDocument();
  });

  test('does not display title when not provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Modal content
      </Modal>
    );
    expect(screen.queryByText(/test title/i)).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Modal content
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when backdrop is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Modal content
      </Modal>
    );

    const backdrop = screen.getByRole('button'); // The backdrop div acts as a button
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('applies different sizes correctly', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose} size="sm">
        Modal content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-sm');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="md">
        Modal content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="lg">
        Modal content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg');

    rerender(
      <Modal isOpen={true} onClose={mockOnClose} size="xl">
        Modal content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-w-xl');
  });

  test('adds overflow-hidden to body when open', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Modal content
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('removes overflow-hidden from body when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        Modal content
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={mockOnClose}>
        Modal content
      </Modal>
    );
    expect(document.body.style.overflow).toBe('unset');
  });

  test('renders children correctly', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <p>First child</p>
        <span>Second child</span>
      </Modal>
    );
    expect(screen.getByText(/first child/i)).toBeInTheDocument();
    expect(screen.getByText(/second child/i)).toBeInTheDocument();
  });
});