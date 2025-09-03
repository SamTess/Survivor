import type { Startup } from '@/domain/entities/Startup';

// Page catalogue des startups
import { StartupCatalog } from '@/components/catalog/StartupCatalog';

export const dynamic = 'force-dynamic';

async function fetchStartups(): Promise<Startup[]> {
  try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/startups`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const data: any[] = json.data || [];
    return data.map(s => ({
      ...s,
      created_at: s.created_at ? new Date(s.created_at) : undefined,
    }))
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
        <p className="text-sm text-muted-foreground">Exploration, filtres et recherche sur l'ensemble de l'écosystème.</p>
      </header>
      <StartupCatalog initial={startups} />
    </main>
  )
}
