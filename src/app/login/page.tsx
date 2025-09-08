"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nextPath, setNextPath] = useState<string>('/');
  const [customError, setCustomError] = useState<string | null>(null);
  const router = useRouter();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(nextPath);
    }
  }, [isAuthenticated, router, nextPath]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const callback = url.searchParams.get('callback');
      const next = url.searchParams.get('next');
      if (callback) {
        setNextPath(callback);
      } else if (next) {
        setNextPath(next);
      }
    } catch { }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setCustomError(null);

    // Validation côté client
    if (!email.trim()) {
      setCustomError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCustomError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setCustomError('Please enter your password.');
      return;
    }

    if (password.length < 8) {
      setCustomError('Password must be at least 8 characters long.');
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      router.push(nextPath);
      router.refresh();
    } else if (result.error) {
      if (result.error.requiresPasswordReset) {
        setCustomError(result.error.message || 'A password reset has just been sent to you. Please check your inbox.');
      } else if (result.error.message?.includes('No account found')) {
        setCustomError(result.error.message);
      } else if (result.error.message?.includes('Incorrect password')) {
        setCustomError(result.error.message);
      } else {
        setCustomError(result.error.message || 'Login failed. Please try again.');
      }
    }
  }

  return (
    <div className="h-screen pt-44 overflow-y-auto flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-4 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="Jeb Incubator Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 id="login-title" className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-600">Sign in to your Jeb account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 animate-card">
          {/* Required fields indicator */}
          <div className="mb-6 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span className="">Required fields</span>
            <span className="ml-1 text-red-400">*</span>
            <span className="ml-2">All fields marked with an asterisk are required.</span>
          </div>

          <form onSubmit={submit} className="space-y-6" role="form" aria-labelledby="login-title">
            {(error || customError) && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-down"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2" aria-hidden="true"></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      {(customError || error || '').includes('No account found') ? 'Account Not Found' :
                       (customError || error || '').includes('Incorrect password') ? 'Incorrect Password' :
                       (customError || error || '').includes('password reset') ? 'Password Reset Required' : 'Login Error'}
                    </h3>
                    <p className="text-sm text-red-700">
                      {customError || error}
                    </p>
                    {(customError || error || '').includes('No account found') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Check that you entered the correct email address</p>
                        <p>• If you don&apos;t have an account yet, <Link href="/signup" className="text-red-600 underline hover:text-red-800">sign up here</Link></p>
                      </div>
                    )}
                    {(customError || error || '').includes('Incorrect password') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Make sure your password is correct</p>
                        <p>• Passwords are case-sensitive</p>
                        <p>• <Link href="/auth/forgot-password" className="text-red-600 underline hover:text-red-800">Forgot your password?</Link></p>
                      </div>
                    )}
                    {(customError || error || '').includes('password reset') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Check your email for password reset instructions</p>
                        <p>• Don&apos;t forget to check your spam folder</p>
                      </div>
                    )}
                    {!(customError || error || '').includes('No account found') &&
                     !(customError || error || '').includes('Incorrect password') &&
                     !(customError || error || '').includes('password reset') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Please check your email and password</p>
                        <p>• Make sure your account is activated</p>
                        <p>• Try resetting your password if you forgot it</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
                id="email-label"
              >
                Email address
                <span className="text-red-500 ml-1" aria-label="Required field">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-0 border-b bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all duration-200 ${
                    email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                  required
                  aria-required="true"
                  aria-labelledby="email-label"
                  aria-describedby="email-help email-error"
                  autoComplete="email"
                  aria-invalid={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'true' : 'false'}
                />
              </div>
              <div className="flex justify-between items-start">
                <p id="email-help" className="text-xs text-gray-500">
                  Enter your registered email address
                </p>
                {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <p className="text-xs text-green-600 font-medium flex items-center" role="status">
                    <span className="mr-1">✓</span>
                    Valid email
                  </p>
                )}
                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <p id="email-error" className="text-xs text-red-600 font-medium" role="alert">
                    Please enter a valid email address
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
                id="password-label"
              >
                Password
                <span className="text-red-500 ml-1" aria-label="Required field">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border-0 border-b bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all duration-200 ${
                    password && password.length < 8 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  required
                  aria-required="true"
                  aria-labelledby="password-label"
                  aria-describedby="password-help password-error"
                  autoComplete="current-password"
                  aria-invalid={password && password.length < 8 ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-start">
                <p id="password-help" className="text-xs text-gray-500">
                  Enter your account password
                </p>
                {password && password.length >= 8 && (
                  <p className="text-xs text-green-600 font-medium flex items-center" role="status">
                    <span className="mr-1">✓</span>
                    Password meets requirements
                  </p>
                )}
                {password && password.length < 8 && (
                  <p id="password-error" className="text-xs text-red-600 font-medium" role="alert">
                    Password must be at least 8 characters
                  </p>
                )}
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                aria-describedby={loading ? "loading-status" : "submit-help"}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                    <span>Signing in...</span>
                    <span id="loading-status" className="sr-only">Loading, please wait</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <FiArrowRight className="h-5 w-5" aria-hidden="true" />
                  </>
                )}
              </button>
              <p id="submit-help" className="text-xs text-center text-gray-500">
                {!email.trim() || !password.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8
                  ? "Please fill in all required fields correctly to enable sign in"
                  : "All fields are valid. Click to sign in."
                }
              </p>
            </div>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Signup link */}
          <div className="text-center">
            <p className="text-gray-600">
              Not registered yet ?{' '}
              <Link
                href={`/signup${nextPath !== '/' ? `?callback=${encodeURIComponent(nextPath)}` : ''}`}
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 animate-fade-in-up">
          <p>&copy; 2025 Jeb Incubator. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
