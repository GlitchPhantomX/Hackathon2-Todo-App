// Mock the environment before importing the module
// This approach sets up the mock once for the entire test file
const mockCookies: { [key: string]: string } = {};

// Create a custom document object for testing
const mockDocument = {
  _cookies: mockCookies,
  get cookie() {
    return Object.entries(this._cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  },
  set cookie(value: string) {
    const [nameValue] = value.split(';');
    const parts = nameValue.split('=');
    const name = parts[0]?.trim() || '';
    const cookieValue = parts.slice(1).join('=') || '';
    this._cookies[name] = cookieValue;
  }
};

// Mock window object
const mockWindow = {
  document: mockDocument
};

// Set up the global environment
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

// For document, we need to be more careful since it might already exist
// If document doesn't exist globally, we'll create it
if (typeof global.document === 'undefined') {
  Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true
  });
}

import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  clearAuth
} from '@/utils/cookies';

describe('Cookie Utility Functions', () => {
  beforeEach(() => {
    // Reset mock cookies before each test
    Object.keys(mockDocument._cookies).forEach(key => delete mockDocument._cookies[key]);
  });

  describe('Token functions', () => {
    test('getToken returns null when no token cookie exists', () => {
      expect(getToken()).toBeNull();
    });

    test('setToken sets the token cookie correctly', () => {
      setToken('test-token-value');
      expect(mockDocument._cookies['token']).toBe('test-token-value');
    });

    test('removeToken removes the token cookie', () => {
      setToken('some-token');
      expect(mockDocument._cookies['token']).toBe('some-token');
      removeToken();
      expect(mockDocument._cookies['token']).toBe('');
    });

    test('getToken returns token value when cookie exists', () => {
      mockDocument._cookies['token'] = 'test-value';
      expect(getToken()).toBe('test-value');
    });
  });

  describe('User functions', () => {
    test('getUser returns null when no user cookie exists', () => {
      expect(getUser()).toBeNull();
    });

    test('setUser sets the user cookie correctly', () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com' };
      setUser(user);
      expect(mockDocument._cookies['user']).toBeDefined();
      expect(JSON.parse(decodeURIComponent(mockDocument._cookies['user']))).toEqual(user);
    });

    test('removeUser removes the user cookie', () => {
      const user = { id: '1', name: 'Test User' };
      setUser(user);
      expect(mockDocument._cookies['user']).toBeDefined();
      removeUser();
      expect(mockDocument._cookies['user']).toBe('');
    });

    test('getUser returns user object when cookie exists', () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com' };
      const encodedUser = encodeURIComponent(JSON.stringify(user));
      mockDocument._cookies['user'] = encodedUser;
      expect(getUser()).toEqual(user);
    });
  });

  describe('clearAuth function', () => {
    test('clearAuth removes both token and user cookies', () => {
      setToken('test-token');
      const user = { id: '1', name: 'Test User' };
      setUser(user);

      expect(mockDocument._cookies['token']).toBe('test-token');
      expect(mockDocument._cookies['user']).toBeDefined();

      clearAuth();

      expect(mockDocument._cookies['token']).toBe('');
      expect(mockDocument._cookies['user']).toBe('');
    });
  });
});