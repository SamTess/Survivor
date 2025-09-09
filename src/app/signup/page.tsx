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
  const isFormValid = name.trim() && email.trim() && password.trim() && confirmPassword.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && name.trim().length >= 2 && isPasswordValid && doPasswordsMatch;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!isPasswordValid) {
      setValidationError('Password does not meet all requierments.');
      return;
    }

    if (!doPasswordsMatch) {
      setValidationError('The passwords don\'t match.');
      return;
    }

    const result = await signup({ name, email, password });

    if (result.success) {
      router.push(nextPath);
      router.refresh();
    }
    // Error handling is now managed by the AuthContext
  }

  return (
    <div className="h-screen pt-82 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4 py-8 overflow-y-auto">
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
          <h1 id="signup-title" className="text-3xl font-bold text-gray-900 mb-2">Join Jeb</h1>
          <p className="text-gray-600">Create your account and start your journey</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 animate-card">
          {/* Required fields indicator */}
          <div className="mb-6 text-sm text-gray-600 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <span className="">Required fields</span>
            <span className="ml-1 text-red-400">*</span>
            <span className="ml-2">All fields marked with an asterisk are required.</span>
          </div>

          <form onSubmit={submit} className="space-y-6" role="form" aria-labelledby="signup-title">
            {(error || validationError) && (
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
                      {(validationError || error || '').includes('Password does not meet') ? 'Password Requirements Not Met' :
                       (validationError || error || '').includes('passwords don\'t match') ? 'Password Mismatch' : 'Signup Error'}
                    </h3>
                    <p className="text-sm text-red-700">
                      {validationError || error}
                    </p>
                    {(validationError || error || '').includes('Password does not meet') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Password must be at least 8 characters long</p>
                        <p>• Include at least one uppercase letter</p>
                        <p>• Include at least one lowercase letter</p>
                        <p>• Include at least one digit</p>
                      </div>
                    )}
                    {(validationError || error || '').includes('passwords don\'t match') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Both password fields must contain the same text</p>
                        <p>• Check for typos in both fields</p>
                      </div>
                    )}
                    {!(validationError || error || '').includes('Password does not meet') &&
                     !(validationError || error || '').includes('passwords don\'t match') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Please check all fields are filled correctly</p>
                        <p>• Make sure your email address is valid</p>
                        <p>• Try using a different email if the problem persists</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
                id="name-label"
              >
                Full Name
                <span className="text-red-500 ml-1" aria-label="Required field">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border-0 border-b bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-200 ${
                    name && name.trim().length < 2 ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Jean Dupont"
                  required
                  aria-required="true"
                  aria-labelledby="name-label"
                  aria-describedby="name-help name-error"
                  autoComplete="name"
                  aria-invalid={name && name.trim().length < 2 ? 'true' : 'false'}
                />
              </div>
              <div className="flex justify-between items-start">
                <p id="name-help" className="text-xs text-gray-500">
                  Enter your full name as it appears on official documents
                </p>
                {name && name.trim().length >= 2 && (
                  <p className="text-xs text-green-600 font-medium flex items-center" role="status">
                    <span className="mr-1">✓</span>
                    Name looks good
                  </p>
                )}
                {name && name.trim().length < 2 && (
                  <p id="name-error" className="text-xs text-red-600 font-medium" role="alert">
                    Name must be at least 2 characters
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
                id="email-label"
              >
                Email
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
                  className={`w-full pl-10 pr-4 py-3 border-0 border-b bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-200 ${
                    email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
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
                  Enter your email address for account verification
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
                  className={`w-full pl-10 pr-12 py-3 border-0 border-b bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-200 ${
                    password && !isPasswordValid ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  required
                  aria-required="true"
                  aria-labelledby="password-label"
                  aria-describedby="password-help password-error password-requirements"
                  autoComplete="new-password"
                  aria-invalid={password && !isPasswordValid ? 'true' : 'false'}
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
                  Create a strong password for your account
                </p>
                {password && isPasswordValid && (
                  <p className="text-xs text-green-600 font-medium flex items-center" role="status">
                    <span className="mr-1">✓</span>
                    Strong password
                  </p>
                )}
                {password && !isPasswordValid && (
                  <p id="password-error" className="text-xs text-red-600 font-medium" role="alert">
                    Password does not meet requirements
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              {password && (
                <div id="password-requirements" className="mt-3 space-y-2" role="list" aria-label="Password requirements">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm" role="listitem">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-3 transition-colors ${
                        req.test(password)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {req.test(password) && <FiCheck className="w-3 h-3" aria-hidden="true" />}
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
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
                id="confirm-password-label"
              >
                Confirm password
                <span className="text-red-500 ml-1" aria-label="Required field">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                  aria-required="true"
                  aria-labelledby="confirm-password-label"
                  aria-describedby="confirm-password-help confirm-password-error confirm-password-success"
                  autoComplete="new-password"
                  aria-invalid={confirmPassword && !doPasswordsMatch ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-start">
                <p id="confirm-password-help" className="text-xs text-gray-500">
                  Re-enter your password to confirm
                </p>
                {confirmPassword && doPasswordsMatch && (
                  <p id="confirm-password-success" className="text-xs text-green-600 font-medium flex items-center" role="status">
                    <FiCheck className="w-4 h-4 mr-1" aria-hidden="true" />
                    Passwords are matching
                  </p>
                )}
                {confirmPassword && !doPasswordsMatch && (
                  <p id="confirm-password-error" className="text-xs text-red-600 font-medium" role="alert">
                    The passwords don&apos;t match
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                aria-describedby={loading ? "loading-status" : "submit-help"}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                    <span>Creating...</span>
                    <span id="loading-status" className="sr-only">Loading, please wait</span>
                  </>
                ) : (
                  <>
                    <span>Create my account</span>
                    <FiArrowRight className="h-5 w-5" aria-hidden="true" />
                  </>
                )}
              </button>
              <p id="submit-help" className="text-xs text-center text-gray-500">
                {!isFormValid
                  ? "Please fill in all required fields correctly to enable account creation"
                  : "All fields are valid. Click to create your account."
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

          {/* Login link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account ?{' '}
              <Link
                href={`/login${nextPath !== '/' ? `?callback=${encodeURIComponent(nextPath)}` : ''}`}
                className="font-semibold text-purple-600 hover:text-purple-500 transition-colors duration-200"
              >
                Connect
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
