"use client";

import { useEffect, useRef, useState } from "react";
import startupData from "@/mocks/startup.json";
import { StartupDetailApiResponse } from "@/domain/interfaces";
import { apiService } from "@/context/auth";

// Champs finance présents dans le schéma Prisma S_STARTUP
type FinanceFields = {
  fundraising_status?: string;
  round?: string;
  ask_currency?: string;
  ask_min?: number | string | null;
  ask_max?: number | string | null;
  use_of_funds?: string;
  revenue_arr_eur?: number | string | null;
  runway_months?: number | string | null;
};

function fromStartupFinance(src: unknown): Partial<FinanceFields> {
  const obj = (typeof src === 'object' && src !== null) ? (src as Record<string, unknown>) : {};
  const getString = (k: string) => typeof obj[k] === 'string' ? obj[k] as string : undefined;
  const getNumOrStr = (k: string) => (typeof obj[k] === 'number' || typeof obj[k] === 'string') ? obj[k] as number | string : undefined;
  const getInt = (k: string) => (typeof obj[k] === 'number' || typeof obj[k] === 'string') ? obj[k] as number | string : undefined;
  return {
    fundraising_status: getString('fundraising_status'),
    round: getString('round'),
    ask_currency: getString('ask_currency'),
    ask_min: getNumOrStr('ask_min'),
    ask_max: getNumOrStr('ask_max'),
    use_of_funds: getString('use_of_funds'),
    revenue_arr_eur: getNumOrStr('revenue_arr_eur'),
    runway_months: getInt('runway_months'),
  };
}

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
  // Finance
  fundraising_status?: string;
  round?: string;
  ask_currency?: string;
  ask_min?: string | number;
  ask_max?: string | number;
  use_of_funds?: string;
  revenue_arr_eur?: string | number;
  runway_months?: string | number;
}

interface StartupFormProps {
  startup?: StartupDetailApiResponse | null;
}

export default function StartupForm({ startup }: StartupFormProps) {
  const [form, setForm] = useState<StartupFormState>(startupData);
  const [newFounder, setNewFounder] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialFormRef = useRef<StartupFormState | null>(null);

  // Update form when startup prop changes
  useEffect(() => {
    if (startup) {
      const fin = fromStartupFinance(startup);
      const newForm = {
        name: startup?.name,
        email: startup?.email,
        phone: startup?.phone,
        address: startup?.address,
        website_url: startup?.website_url,
        social_media_url: startup?.social_media_url,
        legal_status: startup?.legal_status,
        sector: startup?.sector,
        maturity: startup?.maturity,
        needs: startup?.needs,
        project_status: startup?.project_status,
        founders: startup?.founders?.map(f => f.name) || [],
        // Finance (si disponibles dans la payload du backend)
        fundraising_status: fin.fundraising_status ?? "",
        round: fin.round ?? "",
        ask_currency: fin.ask_currency ?? "EUR",
        ask_min: fin.ask_min ?? "",
        ask_max: fin.ask_max ?? "",
        use_of_funds: fin.use_of_funds ?? "",
        revenue_arr_eur: fin.revenue_arr_eur ?? "",
        runway_months: fin.runway_months ?? "",
      };
      setForm(newForm);
      initialFormRef.current = { ...newForm };
    }
  }, [startup]);

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

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    
    if (!startup?.id) {
      setError("No startup ID available for saving");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare the data to send to the API
      const updateData = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
        website_url: form.website_url || null,
        social_media_url: form.social_media_url || null,
        legal_status: form.legal_status || null,
        sector: form.sector || null,
        maturity: form.maturity || null,
        needs: form.needs || null,
        project_status: form.project_status || null,
  // Finance - conversions sûres (string vide => null)
  fundraising_status: form.fundraising_status || null,
  round: form.round || null,
  ask_currency: (form.ask_currency || "").toString().slice(0,3).toUpperCase() || null,
  ask_min: form.ask_min === "" || form.ask_min === undefined ? null : Number(form.ask_min),
  ask_max: form.ask_max === "" || form.ask_max === undefined ? null : Number(form.ask_max),
  use_of_funds: form.use_of_funds || null,
  revenue_arr_eur: form.revenue_arr_eur === "" || form.revenue_arr_eur === undefined ? null : Number(form.revenue_arr_eur),
  runway_months: form.runway_months === "" || form.runway_months === undefined ? null : Number(form.runway_months),
        // Note: founders will be handled separately if needed
      };

      const response = await apiService.put(`/startups/${startup.id}`, updateData);

      if (response.success) {
        setSaved(true);
        setDirty(false);
        initialFormRef.current = { ...form };
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.error || "Failed to save startup");
      }
    } catch (error) {
      console.error('Error saving startup:', error);
      setError("An unexpected error occurred while saving");
    } finally {
      setSaving(false);
    }
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
    <section className="space-y-4 pb-24">
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

          {/* Finance */}
          <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300 lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium text-foreground">Finance</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Fundraising status</label>
                <select
                  className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  value={form.fundraising_status ?? ""}
                  onChange={(e) => update("fundraising_status", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="PLANNING">Planning</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Round</label>
                <select
                  className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  value={form.round ?? ""}
                  onChange={(e) => update("round", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="PRE_SEED">Pre-seed</option>
                  <option value="SEED">Seed</option>
                  <option value="A">Series A</option>
                  <option value="B">Series B</option>
                  <option value="C">Series C</option>
                  <option value="GROWTH">Growth</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Currency</label>
                <input
                  className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  placeholder="EUR"
                  maxLength={3}
                  value={form.ask_currency ?? ""}
                  onChange={(e) => update("ask_currency", e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Ask min</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  placeholder="0.00"
                  value={form.ask_min ?? ""}
                  onChange={(e) => update("ask_min", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Ask max</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  placeholder="0.00"
                  value={form.ask_max ?? ""}
                  onChange={(e) => update("ask_max", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">ARR (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  placeholder="0.00"
                  value={form.revenue_arr_eur ?? ""}
                  onChange={(e) => update("revenue_arr_eur", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Runway (months)</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  className="w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  placeholder="0"
                  value={form.runway_months ?? ""}
                  onChange={(e) => update("runway_months", e.target.value)}
                />
              </div>

              <div className="lg:col-span-3 sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground">Use of funds</label>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-border bg-background/80 backdrop-blur-md px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-200"
                  placeholder="Breakdown of how the funds will be used"
                  value={form.use_of_funds ?? ""}
                  onChange={(e) => update("use_of_funds", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {dirty && (
          <div className="fixed inset-x-0 bottom-20 z-40 flex items-center justify-center animate-fade-in-up">
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border/20 bg-card/95 px-4 py-2 shadow-lg backdrop-blur-md">
              <span className="text-sm text-foreground">You have unsaved changes</span>
              <button 
                type="submit" 
                disabled={saving}
                className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed inset-x-0 bottom-20 z-40 flex items-center justify-center animate-fade-in-up">
            <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-2 shadow-lg backdrop-blur-md">
              <span className="text-sm text-destructive">{error}</span>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className="rounded-2xl bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-all duration-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-start">
          <p className={`text-xs ${saved ? "text-accent" : "text-muted-foreground"}`}>
            {saved ? "Saved successfully!" : startup?.id ? "Changes will be saved to the server" : "Changes are local (mock)."}
          </p>
        </div>
      </form>
    </section>
  );
}
