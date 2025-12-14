import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import LoginForm from "@/components/auth/LoginForm" 
import { Spinner } from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Login | Todo App',
  description: 'Login to your todo application account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}