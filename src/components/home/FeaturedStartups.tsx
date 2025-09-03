"use client";

import { Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startups } from "@/data/startups";
import { bytesToDataUrl } from "@/utils/image";

// Pick a subset (e.g., newest 6) - sort by created_at desc if available
const featuredStartups = [...startups]
  .sort((a, b) => (b.created_at?.getTime?.() || 0) - (a.created_at?.getTime?.() || 0))
  .slice(0, 6)
  .map(s => {
    const img = bytesToDataUrl(s.image_data) || "/logo.png";
    return {
      id: s.id,
      name: s.name,
      sector: s.sector || "",
      maturity: s.maturity || "",
      description: s.description || "",
      image: img,
    };
  });

export function FeaturedStartups() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Rocket className="h-5 w-5" /></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured <span className="text-primary">Startups</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStartups.map(s => (
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
      </div>
    </section>
  );
}
