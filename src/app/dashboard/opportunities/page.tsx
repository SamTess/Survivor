"use client";
import { useEffect, useState } from "react";

type Opportunity = {
  id: string;
  direction: string;
  source_type: string;
  source_id: number;
  target_type: string;
  target_id: number;
  score?: number | null;
  status: string;
  updated_at: string;
};

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [status, setStatus] = useState<string>("qualified");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/opportunities?status=${status}&limit=20`);
        const json = await res.json();
        if (json.success) setItems(json.items || []);
        else setError(json.error || "Erreur inconnue");
      } catch (e: any) {
        setError(e?.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [status]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Opportunities</h1>
        <select className="border rounded px-2 py-1 bg-background text-foreground" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="new">new</option>
          <option value="qualified">qualified</option>
          <option value="contacted">contacted</option>
          <option value="in_discussion">in_discussion</option>
          <option value="pilot">pilot</option>
          <option value="deal">deal</option>
          <option value="lost">lost</option>
        </select>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div className="font-medium">{it.direction}</div>
              <div className="text-sm opacity-70">{new Date(it.updated_at).toLocaleString()}</div>
            </div>
            <div className="text-sm opacity-80 mt-1">{it.source_type} #{it.source_id} → {it.target_type} #{it.target_id}</div>
            <div className="mt-2 text-sm">Score: {it.score ?? '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
