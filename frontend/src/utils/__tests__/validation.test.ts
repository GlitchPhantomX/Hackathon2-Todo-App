import {
  isValidEmail,
  isValidPassword,
  validateLoginForm,
  validateRegisterForm,
  validateTaskForm
} from '@/utils/validation';

describe('Validation Utility Functions', () => {
  describe('Email validation', () => {
    test('isValidEmail returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    test('isValidEmail returns false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test example.com')).toBe(false);
    });
  });

  describe('Password validation', () => {
    test('isValidPassword returns true for passwords with 8+ characters', () => {
      expect(isValidPassword('password')).toBe(true);
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('a'.repeat(8))).toBe(true);
      expect(isValidPassword('a'.repeat(10))).toBe(true);
    });

    test('isValidPassword returns false for passwords with less than 8 characters', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('pass')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
    });
  });

  describe('Login form validation', () => {
    test('validateLoginForm returns valid for valid inputs', () => {
      const result = validateLoginForm('test@example.com', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('validateLoginForm returns errors for empty email', () => {
      const result = validateLoginForm('', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email is required');
    });

    test('validateLoginForm returns errors for invalid email', () => {
      const result = validateLoginForm('invalid-email', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
    });

    test('validateLoginForm returns errors for empty password', () => {
      const result = validateLoginForm('test@example.com', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });

    test('validateLoginForm returns errors for short password', () => {
      const result = validateLoginForm('test@example.com', 'short');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password must be at least 8 characters');
    });

    test('validateLoginForm returns errors for multiple issues', () => {
      const result = validateLoginForm('', 'short');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email is required');
      expect(result.errors.password).toBe('Password must be at least 8 characters');
    });
  });

  describe('Register form validation', () => {
    test('validateRegisterForm returns valid for valid inputs', () => {
      const result = validateRegisterForm('test@example.com', 'password123', 'Test User');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('validateRegisterForm returns errors for empty name', () => {
      const result = validateRegisterForm('test@example.com', 'password123', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });

    test('validateRegisterForm returns errors for short name', () => {
      const result = validateRegisterForm('test@example.com', 'password123', 'A');
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name must be at least 2 characters');
    });

    test('validateRegisterForm returns errors for empty email', () => {
      const result = validateRegisterForm('', 'password123', 'Test User');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email is required');
    });

    test('validateRegisterForm returns errors for invalid email', () => {
      const result = validateRegisterForm('invalid-email', 'password123', 'Test User');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
    });

    test('validateRegisterForm returns errors for empty password', () => {
      const result = validateRegisterForm('test@example.com', '', 'Test User');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });

    test('validateRegisterForm returns errors for short password', () => {
      const result = validateRegisterForm('test@example.com', 'short', 'Test User');
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password must be at least 8 characters');
    });

    test('validateRegisterForm returns errors for multiple issues', () => {
      const result = validateRegisterForm('', 'short', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
      expect(result.errors.email).toBe('Email is required');
      expect(result.errors.password).toBe('Password must be at least 8 characters');
    });
  });

  describe('Task form validation', () => {
    test('validateTaskForm returns valid for valid inputs', () => {
      const result = validateTaskForm('Valid Task Title', 'Task description');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('validateTaskForm returns errors for empty title', () => {
      const result = validateTaskForm('', 'Task description');
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title is required');
    });

    test('validateTaskForm returns errors for short title', () => {
      const result = validateTaskForm('A', 'Task description');
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBe('Title must be at least 3 characters');
    });

    test('validateTaskForm returns errors for long description', () => {
      const longDescription = 'A'.repeat(501);
      const result = validateTaskForm('Valid Title', longDescription);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('Description must be less than 500 characters');
    });

    test('validateTaskForm allows empty description', () => {
      const result = validateTaskForm('Valid Title', '');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('validateTaskForm allows valid long description (under 500 chars)', () => {
      const longDescription = 'A'.repeat(500);
      const result = validateTaskForm('Valid Title', longDescription);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });
});