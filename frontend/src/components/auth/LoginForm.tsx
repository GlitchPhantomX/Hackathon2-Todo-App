'use client';

// app/login/page.tsx

import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Login | Todo App',
  description: 'Login to your todo application account',
}
// ==============================
// components/auth/LoginForm.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        Login
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={isLoading}
            placeholder="your@email.com"
            className="w-full px-3 py-2 rounded-md bg-black text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Password
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={isLoading}
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-md bg-black text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 rounded-md font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <a href="/register" className="text-purple-400 hover:underline">
          Register here
        </a>
      </p>
    </div>
  );
}
