import type { Startup } from '@/domain/entities/Startup';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { startupCardFieldConfig } from '@/components/catalog/startupCardFieldConfig';

export const dynamic = 'force-dynamic';

async function fetchStartup(id: string): Promise<Startup | null> {
  try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/startups/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const s = json.data;
  if (!s) return null;
  return { ...s, created_at: s.created_at ? new Date(s.created_at) : undefined };
  } catch (e) {
  console.error('Erreur récupération startup', e);
  return null;
  }
}

export default async function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const startup = await fetchStartup(id);
  if (!startup) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
    <Link href="/startups" className="text-sm text-primary underline" prefetch>← Retour au catalogue</Link>
      </div>
      <header className="space-y-2">
    <h1 className="text-3xl font-bold">{startup.name}</h1>
    <p className="text-sm text-muted-foreground">{startup.description}</p>
      </header>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Informations</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {startupCardFieldConfig.map(f => {
      const raw = (startup as any)[f.key];
      if (raw == null || raw === '') return null;
      const value = f.format ? f.format(raw, startup) : (typeof raw === 'string' ? raw : String(raw));
      if (!value) return null;
            return (
              <li key={f.key} className="flex flex-col rounded border p-3 bg-background/50">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{f.label}</span>
        <span className="text-sm break-words">{value}</span>
              </li>
      );
          })}
        </ul>
      </section>
    </main>
  );
}
