"use client";
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function VisitorOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    router.push('/dashboard');
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen flex items-center justify-center px-4' },
    React.createElement(
      'form',
      { onSubmit, className: 'w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow p-8 space-y-4' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Welcome! Set up your visitor profile'),
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 gap-4' },
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Display name', value: displayName, onChange: (e: ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value) }),
        React.createElement('textarea', { className: 'border p-2 rounded', placeholder: 'Short bio (optional)', value: bio, onChange: (e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value) }),
      ),
      React.createElement(
        'div',
        { className: 'flex gap-2' },
        React.createElement('button', { type: 'button', onClick: () => router.back(), className: 'px-4 py-2 rounded border' }, 'Back'),
        React.createElement('button', { disabled: loading, className: 'px-4 py-2 rounded bg-purple-600 text-white' }, loading ? 'Saving...' : 'Continue'),
      )
    )
  );
}
