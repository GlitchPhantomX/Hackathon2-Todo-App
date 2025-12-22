// src/lib/auth.ts

export const auth = {
  async getSession() {
    // TEMP mock session (replace with real auth later)
    return {
      user: {
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@example.com',
        image: null,
      },
      accessToken: 'demo-access-token',
    }
  },
}
