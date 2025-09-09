"use client";
import React, { FormEvent, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/infrastructure/services/ApiService';
import { useAuth } from '@/context/AuthContext';

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [legal_status, setLegalStatus] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [partnership_type, setPartnershipType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = { name, email, legal_status, address, phone, description, partnership_type };
    const res = await apiService.post('/partners', payload);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Creation failed'); return; }
    router.push('/dashboard');
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen flex items-center justify-center px-4' },
    React.createElement(
      'form',
      { onSubmit, className: 'w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-4' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Become a Partner'),
      error ? React.createElement('p', { className: 'text-red-600 text-sm' }, String(error)) : null,
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Name', value: name, onChange: (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value), required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Email', value: email, onChange: (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), type: 'email', required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Legal status', value: legal_status, onChange: (e: ChangeEvent<HTMLInputElement>) => setLegalStatus(e.target.value) }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Address', value: address, onChange: (e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value) }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Phone', value: phone, onChange: (e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value) }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Partnership type', value: partnership_type, onChange: (e: ChangeEvent<HTMLInputElement>) => setPartnershipType(e.target.value) }),
        React.createElement('textarea', { className: 'border p-2 rounded sm:col-span-2', placeholder: 'Description', value: description, onChange: (e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value) }),
      ),
      React.createElement(
        'div',
        { className: 'flex gap-2' },
        React.createElement('button', { type: 'button', onClick: () => router.back(), className: 'px-4 py-2 rounded border' }, 'Back'),
        React.createElement('button', { disabled: loading, className: 'px-4 py-2 rounded bg-purple-600 text-white' }, loading ? 'Saving...' : 'Finish'),
      )
    )
  );
}
