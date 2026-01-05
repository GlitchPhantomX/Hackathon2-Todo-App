// This file should be updated to use the AuthContext instead of the mock auth system
// For now, we'll create a function that gets token from localStorage (matching AuthContext storage)
export async function getCurrentUserId(): Promise<string> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User not authenticated');
  }

  // Decode the JWT token to get user info
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payloadPart = tokenParts[1];
    if (!payloadPart) {
      throw new Error('Invalid token: missing payload');
    }
    const payload = JSON.parse(atob(payloadPart));
    return payload.sub || payload.user_id || payload.id;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('Invalid token');
  }
}

export async function getAuthToken(): Promise<string> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token');
  }
  return token;
}

export async function getUserInfo() {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payloadPart = tokenParts[1];
    if (!payloadPart) {
      throw new Error('Invalid token: missing payload');
    }
    const payload = JSON.parse(atob(payloadPart));
    return {
      id: payload.sub || payload.user_id || payload.id || '',
      name: payload.name || payload.username || 'User',
      email: payload.email || payload.sub || '',
      avatar: null,
      initials: getInitials(payload.name || payload.username || 'User'),
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}