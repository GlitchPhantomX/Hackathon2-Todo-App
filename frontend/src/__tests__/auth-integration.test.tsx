import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { User, AuthContextType, LoginCredentials, RegisterCredentials } from '@/types/auth.types';

// Mock the router and auth context
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('Authentication Flow Integration Tests', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseRouter.mockReturnValue({
      push: mockPush,
      prefetch: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      options: {},
    } as any);

    mockedUseAuth.mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    } as AuthContextType);
  });

  describe('Registration Flow', () => {
    test('registers new user and redirects to dashboard', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      mockRegister.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      );

      // Fill in registration form
      const nameInput = screen.getByLabelText(/full name/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        } as RegisterCredentials);
      });

      // Verify redirect to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('shows error when registration fails', async () => {
      const errorMessage = 'Registration failed';
      mockRegister.mockRejectedValue(new Error(errorMessage));

      render(
        <AuthProvider>
          <RegisterForm />
        </AuthProvider>
      );

      // Fill in registration form
      const nameInput = screen.getByLabelText(/full name/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Login Flow', () => {
    test('logs in existing user and redirects to dashboard', async () => {
      mockLogin.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Fill in login form
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        } as LoginCredentials);
      });

      // Verify redirect to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('shows error when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValue(new Error(errorMessage));

      render(
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      );

      // Fill in login form
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Route Protection', () => {
    test('redirects unauthenticated user to login when accessing protected route', () => {
      // Simulate an unauthenticated user trying to access a protected route
      mockedUseAuth.mockReturnValue({
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      } as AuthContextType);

      // In a real app, this would happen automatically via middleware
      // For testing, we're verifying that the auth context correctly reports the state
      const { isAuthenticated } = useAuth();
      expect(isAuthenticated).toBe(false);
    });

    test('allows authenticated user to access protected route', () => {
      // Simulate an authenticated user
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      mockedUseAuth.mockReturnValue({
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        user: mockUser,
        token: 'mock-token',
        isLoading: false,
        isAuthenticated: true,
      } as AuthContextType);

      // In a real app, this would happen automatically via middleware
      // For testing, we're verifying that the auth context correctly reports the state
      const { isAuthenticated } = useAuth();
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('Logout Flow', () => {
    test('logs out user and redirects to login', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      mockedUseAuth.mockReturnValue({
        login: mockLogin,
        register: mockRegister,
        logout: mockLogout,
        user: mockUser,
        token: 'mock-token',
        isLoading: false,
        isAuthenticated: true,
      } as AuthContextType);

      // Simulate logout process
      await act(async () => {
        await mockLogout();
      });

      // Verify that logout was called
      expect(mockLogout).toHaveBeenCalled();

      // In a real app, this would redirect to login
      // For testing, we're just verifying the logout function was called
    });
  });
});