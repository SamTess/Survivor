"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/EnhancedAuthContext';
import { apiService } from '../../infrastructure/services/ApiService';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [passwordResetInfo, setPasswordResetInfo] = useState<{
    show: boolean;
    message?: string;
    resetUrl?: string;
  }>({ show: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific errors
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setPasswordResetInfo({ show: false });

    const result = await login(formData);

    if (result.success) {
      onSuccess?.();
    } else if (result.error) {
      if (result.error.requiresPasswordReset) {
        setPasswordResetInfo({
          show: true,
          message: result.error.message,
          resetUrl: result.error.resetUrl
        });
      } else {
        setFormErrors({ general: result.error.message });
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setFormErrors({ email: 'Please enter your email address first' });
      return;
    }

    try {
      const response = await apiService.requestPasswordReset({ email: formData.email });
      if (response.success) {
        setPasswordResetInfo({
          show: true,
          message: 'Password reset email sent successfully!'
        });
      } else {
        setFormErrors({ general: response.error || 'Failed to send reset email' });
      }
    } catch (err) {
      setFormErrors({ general: 'Network error. Please try again.' });
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              formErrors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              formErrors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>

        {/* General error display */}
        {(error || formErrors.general) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error || formErrors.general}</p>
          </div>
        )}

        {/* Password reset info */}
        {passwordResetInfo.show && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">{passwordResetInfo.message}</p>
            {passwordResetInfo.resetUrl && (
              <a
                href={passwordResetInfo.resetUrl}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Reset your password here (Dev Mode)
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Forgot your password?
          </button>
        </div>
      </form>
    </div>
  );
}
