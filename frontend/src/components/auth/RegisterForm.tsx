'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, CheckCircle2, Eye, EyeOff, Shield } from 'lucide-react';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await registerUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      router.push('/new-dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: 'var(--purple-300)' }}
        />
        <div 
          className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: 'var(--violet-300)' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                }}
              />
              <div 
                className="relative h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600), var(--purple-500))',
                }}
              >
                <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span 
              className="text-2xl font-bold bg-clip-text text-transparent"
              style={{ 
                backgroundImage: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              }}
            >
              TodoMaster
            </span>
          </Link>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ 
              color: 'var(--foreground)',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
              fontWeight: 800,
            }}
          >
            Create Account
          </h1>
          <p 
            className="text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Start your productivity journey today
          </p>
        </div>

        {/* Register Card */}
        <div 
          className="rounded-2xl shadow-xl border backdrop-blur-sm p-8"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          {/* Error Message */}
          {error && (
            <div 
              className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3"
              style={{ 
                backgroundColor: 'var(--destructive)',
                borderLeftColor: '#dc2626'
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail 
                    className="h-5 w-5" 
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)'
                    e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.1)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User 
                    className="h-5 w-5" 
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                </div>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="johndoe"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)'
                    e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.1)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock 
                    className="h-5 w-5" 
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)'
                    e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.1)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p 
                className="text-xs mt-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Shield 
                    className="h-5 w-5" 
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)'
                    e.target.style.boxShadow = `0 0 0 3px rgba(139, 92, 246, 0.1)`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border accent-purple-600"
                style={{ borderColor: 'var(--border)' }}
              />
              <label 
                className="text-xs"
                style={{ color: 'var(--muted-foreground)' }}
              >
                I agree to the{' '}
                <Link 
                  href="/terms" 
                  className="font-medium transition-colors"
                  style={{ color: 'var(--primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link 
                  href="/privacy" 
                  className="font-medium transition-colors"
                  style={{ color: 'var(--primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--purple-600), var(--violet-600))'
              }}
            >
              <span className="relative z-10">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </span>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--violet-600), var(--purple-600))'
                }}
              />
              {/* Shine effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'shine 2s infinite'
                }}
              />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span 
                className="px-2"
                style={{ 
                  backgroundColor: 'var(--card)',
                  color: 'var(--muted-foreground)'
                }}
              >
                Or
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p 
            className="text-center text-sm"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-semibold transition-colors"
              style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}