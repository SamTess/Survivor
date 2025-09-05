"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState<string>('/');
  const router = useRouter();
  const { signup, loading, error, clearError, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(nextPath);
    }
  }, [isAuthenticated, router, nextPath]);

  // Handle callback parameter from URL
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
  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One digit', test: (pwd: string) => /\d/.test(pwd) }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.test(password));
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!isPasswordValid) {
      setError('Password does not meet all required criteria.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    const result = await signup({ name, email, password });

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'An error occurred while creating the account');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
    // Error handling is now managed by the AuthContext
  }

  return (
    <div className="h-screen pt-66 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="Jeb Incubator Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejoignez Jeb</h1>
          <p className="text-gray-600">Create your account and start your adventure</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 animate-card">
          <form onSubmit={submit} className="space-y-6">
            {(error || validationError) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-down">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{validationError || error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-200"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-200"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-3 transition-colors ${
                        req.test(password)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {req.test(password) && <FiCheck className="w-3 h-3" />}
                      </div>
                      <span className={req.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border-0 border-b bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                    confirmPassword && !doPasswordsMatch
                      ? 'border-red-300 focus:border-red-500'
                      : confirmPassword && doPasswordsMatch
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-300 focus:border-purple-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>

              {confirmPassword && !doPasswordsMatch && (
                <p className="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
              )}
              {confirmPassword && doPasswordsMatch && (
                <p className="text-sm text-green-600 flex items-center">
                  <FiCheck className="w-4 h-4 mr-1" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !doPasswordsMatch}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>Create my account</span>
                  <FiArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-purple-600 hover:text-purple-500 transition-colors duration-200"
              >
                Sign in
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
