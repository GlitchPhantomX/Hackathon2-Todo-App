// Token-related functions
export const getToken = (): string | null => {
  // Client-side only
  if (typeof window !== 'undefined') {
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('token='))
      ?.split('=')[1] || null;
  }
  return null;
};

export const setToken = (token: string, options?: { path?: string; maxAge?: number; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }): void => {
  // Client-side only
  if (typeof window !== 'undefined') {
    const cookieOptions = {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      ...options,
    };

    document.cookie = `token=${token}; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}; ${
      cookieOptions.secure ? 'Secure; ' : ''
    }SameSite=${cookieOptions.sameSite};`;
  }
};

export const removeToken = (): void => {
  // Client-side only
  if (typeof window !== 'undefined') {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
};

// User-related functions
export const getUser = (): any | null => {
  // Client-side only
  if (typeof window !== 'undefined') {
    const userCookie = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('user='))
      ?.split('=')[1];
    return userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;
  }
  return null;
};

export const setUser = (user: any, options?: { path?: string; maxAge?: number; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }): void => {
  // Client-side only
  if (typeof window !== 'undefined') {
    const cookieOptions = {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      ...options,
    };

    const userString = encodeURIComponent(JSON.stringify(user));
    document.cookie = `user=${userString}; Path=${cookieOptions.path}; MaxAge=${cookieOptions.maxAge}; ${
      cookieOptions.secure ? 'Secure; ' : ''
    }SameSite=${cookieOptions.sameSite};`;
  }
};

export const removeUser = (): void => {
  // Client-side only
  if (typeof window !== 'undefined') {
    document.cookie = 'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
};

// Clear all auth-related cookies
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};