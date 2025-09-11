"use client";
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/infrastructure/services/ApiService';
import { useAuth } from '@/context/AuthContext';

export default function InvestorOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [legal_status, setLegalStatus] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [investor_type, setInvestorType] = useState('');
  const [investment_focus, setInvestmentFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = { name, email, legal_status, address, phone, description, investor_type, investment_focus };
    const res = await apiService.post('/investors', payload);
    setLoading(false);
    if (!res.success) { setError(res.error || 'Creation failed'); return; }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 space-y-4">
        <h1 className="text-2xl font-bold">Investor profile</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} required />
          <input className="border p-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required />
          <input className="border p-2 rounded" placeholder="Legal status" value={legal_status} onChange={(e)=>setLegalStatus(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Investor type" value={investor_type} onChange={(e)=>setInvestorType(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Investment focus" value={investment_focus} onChange={(e)=>setInvestmentFocus(e.target.value)} />
          <textarea className="border p-2 rounded sm:col-span-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={()=>router.back()} className="px-4 py-2 rounded border">Back</button>
          <button disabled={loading} className="px-4 py-2 rounded bg-purple-600 text-white">{loading? 'Saving...' : 'Finish'}</button>
        </div>
      </form>
    </div>
  );
}
