"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { bytesToDataUrl } from "@/utils/image";

type ApiStartup = {
  id: number;
  name: string;
  legal_status: string;
  address: string;
  phone: string;
  sector: string;
  maturity: string;
  email: string;
  description: string;
  image_data?: Uint8Array | number[] | null;
  created_at?: string | Date;
};

type CardStartup = {
  id: number;
  name: string;
  sector: string;
  maturity: string;
  description: string;
  image: string;
};

export function FeaturedStartups() {
  const [items, setItems] = useState<CardStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/startups?limit=6', { cache: 'no-store' });
        const json = await res.json();
        if (!json.success || !Array.isArray(json.data)) {
          throw new Error(json.error || 'Réponse invalide');
        }
        const list: CardStartup[] = json.data
          .sort((a: ApiStartup, b: ApiStartup) => {
            const ad = new Date(a.created_at || 0).getTime();
            const bd = new Date(b.created_at || 0).getTime();
            return bd - ad;
          })
          .slice(0, 6)
          .map((s: ApiStartup) => {
            const raw: unknown = s.image_data;
            let img: string | null = null;
            if (raw) {
              const uint = raw instanceof Uint8Array ? raw : Array.isArray(raw) ? new Uint8Array(raw) : undefined;
              img = bytesToDataUrl(uint) || null;
            }
            return {
              id: s.id,
              name: s.name,
              sector: s.sector || '',
              maturity: s.maturity || '',
              description: s.description || '',
              image: img || '/logo.png'
            };
          });
        if (!cancelled) {
          setItems(list);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Loading error';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Rocket className="h-5 w-5" /></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured <span className="text-primary">Startups</span></h2>
        </div>
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl border bg-muted/30" />
            ))}
          </div>
        )}
        {!loading && error && (
          <div className="text-sm text-destructive">Impossible de charger les startups: {error}</div>
        )}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(s => (
              <Link key={s.id} href={`/projects/${s.id}`} className="group rounded-xl border bg-card/60 backdrop-blur-sm border-border/60 p-5 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden ring-1 ring-border/40 bg-muted">
                    <Image src={s.image} alt={s.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{s.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mt-1">{s.sector}{s.maturity ? ` • ${s.maturity}` : ''}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex-grow line-clamp-3">{s.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-1 font-medium">{s.maturity || '—'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
