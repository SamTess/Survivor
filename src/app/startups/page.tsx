import type { Startup } from '@/domain/entities/Startup';

// Page catalogue des startups
import { StartupCatalog } from '@/components/catalog/StartupCatalog';

export const dynamic = 'force-dynamic';

async function fetchStartups(): Promise<Startup[]> {
  try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/startups`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const rawList: unknown[] = Array.isArray(json.data) ? json.data : [];
  const data: Startup[] = rawList.map((s): Startup => {
    if (typeof s !== 'object' || s === null) throw new Error('Invalid startup shape');
    const o = s as Record<string, unknown>;
    return {
      id: Number(o.id),
      name: String(o.name || ''),
      legal_status: String(o.legal_status || ''),
      address: String(o.address || ''),
      phone: String(o.phone || ''),
      sector: String(o.sector || ''),
      maturity: String(o.maturity || ''),
      email: String(o.email || ''),
      description: String(o.description || ''),
      image_data: o.image_data as Uint8Array | null | undefined,
      created_at: o.created_at ? new Date(String(o.created_at)) : undefined,
    };
  });
  return data;
  } catch (e) {
  console.error('Erreur récupération startups', e);
  return [];
  }
}

export default async function StartupsPage() {
  const startups = await fetchStartups();
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Catalogue des startups</h1>
  <p className="text-sm text-muted-foreground">Exploration, filtres et recherche sur l&apos;ensemble de l&apos;écosystème.</p>
      </header>
      <StartupCatalog initial={startups} />
    </main>
  )
}
