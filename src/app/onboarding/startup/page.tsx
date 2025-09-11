"use client";
import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/infrastructure/services/ApiService';
import { useAuth } from '@/context/AuthContext';

export default function StartupOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [legal_status, setLegalStatus] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [sector, setSector] = useState('');
  const [maturity, setMaturity] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [shortDescription, setShortDescription] = useState('');
  const [website_url, setWebsite] = useState('');
  const [social_media_url, setSocial] = useState('');
  const [project_status, setProjectStatus] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [needs, setNeeds] = useState('');
  const [makeMeFounder, setMakeMeFounder] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const startupPayload = { name, legal_status, address, phone, sector, maturity, email, description: shortDescription };
    type CreateStartupResp = { id: number };
    const created = await apiService.post<CreateStartupResp>(
      '/startups',
      startupPayload
    );
    if (!created.success || !created.data || typeof (created.data as CreateStartupResp).id !== 'number') {
      setLoading(false);
    setError(created.error || 'Failed to create startup');
      return;
    }
    const startupId = (created.data as CreateStartupResp).id;

    if (website_url || social_media_url || project_status || needs || longDescription) {
      await apiService.post(`/startups/${startupId}/details`, { website_url, social_media_url, project_status, needs, description: longDescription });
    }
    setLoading(false);
    router.push('/dashboard');
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen flex items-center justify-center px-4' },
    React.createElement(
      'form',
      { onSubmit, className: 'w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-4' },
      React.createElement('h1', { className: 'text-2xl font-bold' }, 'Create your startup'),
      error ? React.createElement('p', { className: 'text-red-600 text-sm' }, String(error)) : null,
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Name', value: name, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Legal status', value: legal_status, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLegalStatus(e.target.value), required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Address', value: address, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value), required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Phone', value: phone, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value), required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Sector', value: sector, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSector(e.target.value), required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Maturity', value: maturity, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMaturity(e.target.value), required: true }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Contact email', type: 'email', value: email, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), required: true }),
        React.createElement('textarea', { className: 'border p-2 rounded sm:col-span-2', placeholder: 'Short pitch', value: shortDescription, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setShortDescription(e.target.value), required: true }),
        ),
        React.createElement('h2', { className: 'font-semibold mt-4' }, 'Details (optional)'),
        React.createElement(
            'div',
            { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Website', value: website_url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value) }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Social links', value: social_media_url, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSocial(e.target.value) }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Project status', value: project_status, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProjectStatus(e.target.value) }),
        React.createElement('input', { className: 'border p-2 rounded', placeholder: 'Needs', value: needs, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setNeeds(e.target.value) }),
        React.createElement('textarea', { className: 'border p-2 rounded sm:col-span-2', placeholder: 'Detailed project description', value: longDescription, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setLongDescription(e.target.value) }),
        ),
        React.createElement(
            'label',
            { className: 'flex items-center gap-2' },
        React.createElement('input', { type: 'checkbox', checked: makeMeFounder, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMakeMeFounder(!!e.target.checked) }),
        ' Link me as founder'
        ),
        React.createElement(
            'div',
            { className: 'flex gap-2' },
        React.createElement('button', { type: 'button', onClick: () => router.back(), className: 'px-4 py-2 rounded border' }, 'Back'),
        React.createElement('button', { disabled: loading, className: 'px-4 py-2 rounded bg-purple-600 text-white' }, loading ? 'Saving...' : 'Create startup'),
      )
    )
  );
}
