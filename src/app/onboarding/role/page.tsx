"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/signup?callback=%2Fonboarding%2Frole');
    }
  }, [isAuthenticated, router]);

  const handle = (path: string) => () => router.push(path);

  return React.createElement(
    'div',
    { className: 'min-h-screen flex items-center justify-center px-4' },
    React.createElement(
      'div',
      { className: 'w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow p-8' },
      React.createElement('h1', { className: 'text-2xl font-bold mb-6' }, 'Choose your role'),
      React.createElement(
        'div',
        { className: 'grid gap-4 sm:grid-cols-2' },
        React.createElement('button', { onClick: handle('/onboarding/visitor'), className: 'p-4 rounded-xl border', type: 'button' }, 'Visitor'),
        React.createElement('button', { onClick: handle('/onboarding/startup'), className: 'p-4 rounded-xl border', type: 'button' }, 'Startup'),
        React.createElement('button', { onClick: handle('/onboarding/investor'), className: 'p-4 rounded-xl border', type: 'button' }, 'Investor'),
        React.createElement('button', { onClick: handle('/onboarding/partner'), className: 'p-4 rounded-xl border', type: 'button' }, 'Partner'),
      )
    )
  );
}
