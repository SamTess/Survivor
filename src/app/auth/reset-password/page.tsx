'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    } else {
      setError('Token manquant dans l\'URL');
      setCheckingToken(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate: string) => {
    try {
      setCheckingToken(true);
      const response = await fetch(`/api/auth/reset-password?token=${tokenToValidate}`);
      const data = await response.json();

      if (data.valid) {
        setValidToken(true);
      } else {
        setError('Token invalide ou expiré');
      }
    } catch {
      setError('Error validating token');
    } finally {
      setCheckingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Mot de passe créé avec succès ! Redirection vers la page de connexion...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch {
      setError('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md text-center">
          <div className="text-lg text-gray-600">Vérification du token...</div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-5">Token invalide</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-500 text-white border-none rounded hover:bg-blue-600 cursor-pointer transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
          Créer votre mot de passe
        </h2>

        {message && (
          <div className="p-3 mb-5 bg-green-100 text-green-800 border border-green-300 rounded text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 mb-5 bg-red-100 text-red-800 border border-red-300 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minLength={8}
              placeholder="Au moins 8 caractères"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minLength={8}
              placeholder="Répétez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-white font-medium rounded text-base transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
            }`}
          >
            {loading ? 'Création en cours...' : 'Créer le mot de passe'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-600">
          <p>Votre mot de passe doit contenir au minimum 8 caractères.</p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl border border-white/50 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-gray-900">Chargement...</div>
        <div className="text-sm text-gray-600 mt-2">Vérification des informations</div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
