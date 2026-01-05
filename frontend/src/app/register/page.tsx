"use client"
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import { Spinner } from '@/components/ui/spinner';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}