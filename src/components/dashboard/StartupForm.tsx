"use client";

import { useEffect, useRef, useState } from "react";
import startupData from "@/mocks/startup.json";

interface StartupFormState {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website_url?: string;
  social_media_url?: string;
  legal_status?: string;
  sector?: string;
  maturity?: string;
  needs?: string;
  project_status?: string;
  founders: string[];
}

export default function StartupForm() {
  const [form, setForm] = useState<StartupFormState>({
    name: startupData.name,
    email: startupData.email,
    phone: startupData.phone,
    address: startupData.address,
    website_url: startupData.website_url,
    social_media_url: startupData.social_media_url,
    legal_status: startupData.legal_status,
    sector: startupData.sector,
    maturity: startupData.maturity,
    needs: startupData.needs,
    project_status: startupData.project_status,
    founders: startupData.founders ?? [],
  });
  const [newFounder, setNewFounder] = useState("");
  const [saved, setSaved] = useState(false);
  const initialFormRef = useRef<StartupFormState | null>(null);
  const [dirty, setDirty] = useState(false);

  // Store initial form only once
  if (initialFormRef.current === null) {
    initialFormRef.current = { ...form };
  }

  // Compute dirty state when form changes
  useEffect(() => {
    const initial = initialFormRef.current!;
    const normalize = (f: StartupFormState) => ({
      ...f,
      founders: [...(f.founders || [])].map((s) => s.trim()),
    });
    const a = JSON.stringify(normalize(form));
    const b = JSON.stringify(normalize(initial));
    setDirty(a !== b);
  }, [form]);

  function update<K extends keyof StartupFormState>(key: K, value: StartupFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Later: call API to persist
    // await fetch('/api/startup', { method: 'PUT', body: JSON.stringify(form) })
  initialFormRef.current = { ...form };
  setDirty(false);
  }

  function addFounder() {
    const v = newFounder.trim();
    if (!v) return;
    update("founders", [...form.founders, v]);
    setNewFounder("");
  }

  function removeFounder(name: string) {
    update("founders", form.founders.filter((f) => f !== name));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
        <h2 className="text-lg font-semibold text-foreground">Startup information</h2>
        <p className="text-sm text-muted-foreground">Edit your public profile and company details.</p>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
            <h3 className="mb-3 text-sm font-medium text-foreground">Basics</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Name</label>
                <input className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.name}
                       onChange={(e) => update("name", e.target.value)}
                       required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                <input type="email" className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.email}
                       onChange={(e) => update("email", e.target.value)}
                       required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
                <input className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.phone ?? ""}
                       onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Address</label>
                <input className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.address ?? ""}
                       onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
            <h3 className="mb-3 text-sm font-medium text-foreground">Online presence</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Website</label>
                <input className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.website_url ?? ""}
                       onChange={(e) => update("website_url", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Social media</label>
                <input className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.social_media_url ?? ""}
                       onChange={(e) => update("social_media_url", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
            <h3 className="mb-3 text-sm font-medium text-foreground">Company profile</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Legal status</label>
                <input className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.legal_status ?? ""}
                       onChange={(e) => update("legal_status", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Sector</label>
                <input className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                       value={form.sector ?? ""}
                       onChange={(e) => update("sector", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Maturity</label>
                <select className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                        value={form.maturity ?? ""}
                        onChange={(e) => update("maturity", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Idea</option>
                  <option>MVP</option>
                  <option>Seed</option>
                  <option>Series A</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Project status</label>
                <select className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                        value={form.project_status ?? ""}
                        onChange={(e) => update("project_status", e.target.value)}>
                  <option value="">Select…</option>
                  <option>Discovery</option>
                  <option>Building</option>
                  <option>Beta</option>
                  <option>Launched</option>
                  <option>Seed</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground">Needs</label>
                <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                          value={form.needs ?? ""}
                          onChange={(e) => update("needs", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm transition-all duration-300">
            <h3 className="mb-3 text-sm font-medium text-foreground">Founders</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.founders.map((f) => (
                <span key={f} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-1 text-sm text-foreground shadow-sm">
                  {f}
                  <button type="button" className="text-muted-foreground hover:text-destructive transition-colors duration-200" onClick={() => removeFounder(f)} aria-label={`Remove ${f}`}>×</button>
                </span>
              ))}
              {form.founders.length === 0 && (
                <span className="text-sm text-muted-foreground">No founders yet.</span>
              )}
            </div>
            <div className="flex gap-2">
              <input className="flex-1 rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                     placeholder="Add founder"
                     value={newFounder}
                     onChange={(e) => setNewFounder(e.target.value)} />
              <button type="button" onClick={addFounder} className="rounded-2xl bg-primary px-4 py-2 text-primary-foreground shadow hover:bg-primary/90 transition-all duration-200 border border-primary/20">Add</button>
            </div>
          </div>
        </div>

        {dirty && (
          <div className="fixed inset-x-0 bottom-20 z-40 flex items-center justify-center animate-fade-in-up">
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border/20 bg-card/95 px-4 py-2 shadow-lg backdrop-blur-md">
              <span className="text-sm text-foreground">You have unsaved changes</span>
              <button type="submit" className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-all duration-200">
                Save changes
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-start">
          <p className={`text-xs ${saved ? "text-accent" : "text-muted-foreground"}`}>{saved ? "Saved." : "Changes are local (mock)."}</p>
        </div>
      </form>
    </section>
  );
}
