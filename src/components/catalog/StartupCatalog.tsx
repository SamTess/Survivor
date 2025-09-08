"use client";
import React from 'react';
import type { Startup } from '@/domain/entities/Startup';
import { useStartupCatalog } from '@/hooks/useStartupCatalog';
import { StartupCard } from './StartupCard';
import { useRouter } from 'next/navigation';

type SortOption = 'name' | 'created-desc' | 'created-asc';
interface Props { initial: Startup[] }

export function StartupCatalog({ initial }: Props) {
  const router = useRouter();
  const catalog = useStartupCatalog(initial);
  const { search, sector, maturity, address, legalStatus, sortBy,
    setSearch, setSector, setMaturity, setAddress, setLegalStatus, setSortBy,
    sectors, maturities, addresses, legalStatuses, filtered, clearAll } = catalog;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs font-medium">Search</label>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, sector, email..." className="border rounded px-2 py-1 text-sm" />
          </div>
          <Select label="Sector" value={sector} onChange={setSector} options={sectors} />
          <Select label="Maturity" value={maturity} onChange={setMaturity} options={maturities} />
          <Select label="Address" value={address} onChange={setAddress} options={addresses} />
          <Select label="Legal status" value={legalStatus} onChange={setLegalStatus} options={legalStatuses} />
          <div className="flex flex-col">
            <label className="text-xs font-medium">Sort</label>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as SortOption)} className="border rounded px-2 py-1 text-sm">
              <option value="name">Name (A-Z)</option>
              <option value="created-desc">Created (newest)</option>
              <option value="created-asc">Created (oldest)</option>
            </select>
          </div>
          <button type="button" onClick={clearAll} className="ml-auto text-xs underline">Reset</button>
        </div>
  <p className="text-xs text-muted-foreground">{filtered.length} / {initial.length} startups shown</p>
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-10">No results</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {filtered.map(s => <StartupCard key={s.id} startup={s} onClick={() => router.push(`/startups/${s.id}`)} />)}
      </div>
    </div>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string)=>void; options: string[] }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className="border rounded px-2 py-1 text-sm min-w-[130px]">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
