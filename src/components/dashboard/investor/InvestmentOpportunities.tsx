"use client";

import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/utils";
import { InvestorApiResponse } from "@/domain/interfaces/Investor";

type OpportunityItem = {
  id: string;
  direction: string;
  source_type: string;
  source_id: number;
  source_name?: string | null;
  target_type: string;
  target_id: number;
  target_name?: string | null;
  score?: number | null;
  score_breakdown?: Record<string, number> | null;
  status: string;
  updated_at: string | Date;
  deal_type?: string | null;
  round?: string | null;
  proposed_amount_eur?: number | string | null;
  valuation_pre_money_eur?: number | string | null;
  ownership_target_pct?: number | string | null;
  fund_id?: string | null;
  budget_fit?: string | null;
  budget_fit_score?: number | string | null;
  pilot_estimated_cost_eur?: number | string | null;
  pilot_budget_fit?: string | null;
  term_deadline?: string | Date | null;
  startup_investment_history?: Array<{ dt: string | Date; amount_eur: unknown; round?: string | null; deal_type?: string | null; }>;
};

type OpportunityDraft = {
  round: string;
  deal_type: string;
  proposed_amount_eur: string;
  valuation_pre_money_eur: string;
  ownership_target_pct: string;
  budget_fit: string;
  budget_fit_score: string;
  pilot_estimated_cost_eur: string;
  pilot_budget_fit: string;
  fund_id: string;
  term_deadline: string; // yyyy-mm-dd
};

interface InvestmentOpportunitiesProps {
  investor: InvestorApiResponse | null;
}

function badgeForScore(score?: number | null) {
  const s = typeof score === 'number' ? score : 0;
  if (s >= 80) return 'bg-emerald-600 text-white shadow-sm';
  if (s >= 60) return 'bg-sky-600 text-white shadow-sm';
  if (s >= 40) return 'bg-amber-500 text-black shadow-sm';
  return 'bg-zinc-700 text-white shadow-sm';
}

function toNumber(x: unknown): number | null {
  if (x === null || x === undefined) return null;
  const n = typeof x === 'string' ? Number(x) : (x as number);
  return Number.isFinite(n) ? n : null;
}

const eur = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
function fmtEur(x: unknown): string | null {
  const n = toNumber(x);
  return n === null ? null : eur.format(n);
}
function fmtPct(x: unknown): string | null {
  const n = toNumber(x);
  return n === null ? null : `${n}%`;
}
function chipColorByFitRaw(fit?: string | null): string {
  const f = (fit || '').toUpperCase();
  switch (f) {
    case 'WITHIN_RANGE':
    case 'WITHIN':
      return 'bg-emerald-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
    case 'ABOVE_RANGE':
    case 'OVER':
      return 'bg-amber-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
    case 'BELOW_RANGE':
    case 'UNDER':
      return 'bg-blue-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
    case 'UNKNOWN':
    default:
      return 'bg-zinc-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  }
}

function chipLabelByFitRaw(fit?: string | null): string {
  const f = (fit || '').toUpperCase();
  switch (f) {
    case 'WITHIN_RANGE':
    case 'WITHIN':
      return 'Within range';
    case 'ABOVE_RANGE':
    case 'OVER':
      return 'Above range';
    case 'BELOW_RANGE':
    case 'UNDER':
      return 'Below range';
    case 'UNKNOWN':
    default:
      return 'Unknown';
  }
}

function budgetFitInfo(op: OpportunityItem) {
  const fit = op.budget_fit ?? (op.pilot_budget_fit as string | null | undefined);
  return {
    label: chipLabelByFitRaw(fit),
    cls: chipColorByFitRaw(fit),
  };
}

function scoreKeyInfo(key: string): { label: string; desc: string } {
  const k = key.toLowerCase();
  switch (k) {
    case 'tags':
      return { label: 'Tags', desc: 'Chevauchement des tags/intérêts entre investisseur et startup.' };
    case 'text':
      return { label: 'Texte', desc: 'Similarité sémantique des descriptions et objectifs.' };
    case 'stage':
      return { label: 'Stade', desc: 'Adéquation du stade/round de la startup avec votre thèse.' };
    case 'geo':
      return { label: 'Géo', desc: 'Compatibilité géographique (pays/région ciblés).' };
    case 'engagement':
      return { label: 'Engagement', desc: 'Signal d\'intérêt récent (vues, likes, bookmarks).' };
    case 'budget':
      return { label: 'Budget', desc: 'Fit entre le ticket proposé et votre plage de budget.' };
    default:
      return { label: key, desc: 'Contribution au score global (0–100).' };
  }
}

function statusChipClass(status: string): string {
  const s = status.toUpperCase();
  if (s === 'NEW') return 'bg-blue-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  if (s === 'QUALIFIED') return 'bg-indigo-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  if (s === 'CONTACTED') return 'bg-cyan-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  if (s === 'IN_DISCUSSION') return 'bg-amber-500 text-black shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  if (s === 'PILOT') return 'bg-purple-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  if (s === 'DEAL') return 'bg-emerald-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  if (s === 'LOST') return 'bg-red-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
  return 'bg-zinc-600 text-white shadow-sm ring-1 ring-black/10 dark:ring-white/10';
}


export default function InvestmentOpportunities({ investor }: InvestmentOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [autoGenTried, setAutoGenTried] = useState<boolean>(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editDrafts, setEditDrafts] = useState<Record<string, OpportunityDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const toDateInput = (d: unknown): string => {
    if (!d) return '';
    try {
      const dt = typeof d === 'string' || d instanceof Date ? new Date(d) : new Date(String(d));
      if (isNaN(dt.getTime())) return '';
      const off = dt.getTimezoneOffset();
      const local = new Date(dt.getTime() - off * 60 * 1000);
      return local.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const createDraftFromOpportunity = (op: OpportunityItem): OpportunityDraft => ({
    round: op.round ?? '',
    deal_type: op.deal_type ?? '',
    proposed_amount_eur: toNumber(op.proposed_amount_eur)?.toString() ?? '',
    valuation_pre_money_eur: toNumber(op.valuation_pre_money_eur)?.toString() ?? '',
    ownership_target_pct: toNumber(op.ownership_target_pct)?.toString() ?? '',
    budget_fit: op.budget_fit ?? '',
    budget_fit_score: toNumber(op.budget_fit_score)?.toString() ?? '',
    pilot_estimated_cost_eur: toNumber(op.pilot_estimated_cost_eur)?.toString() ?? '',
    pilot_budget_fit: op.pilot_budget_fit ?? '',
    fund_id: op.fund_id ?? '',
    term_deadline: toDateInput(op.term_deadline),
  });

  const handleToggle = (op: OpportunityItem) => {
    setSaveError(null);
    setExpandedId(prev => {
      const next = prev === op.id ? null : op.id;
      if (next === op.id) {
        setEditDrafts(d => (d[op.id] ? d : { ...d, [op.id]: createDraftFromOpportunity(op) }));
      }
      return next;
    });
  };

  const handleCardClick = (e: React.MouseEvent, op: OpportunityItem) => {
    const target = e.target as HTMLElement;
    if (target.closest('a,button,input,select,textarea,label')) return;
    handleToggle(op);
  };

  const updateDraft = (id: string, field: keyof OpportunityDraft, value: string) => {
    setEditDrafts(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const cancelDraft = (op: OpportunityItem) => {
    setEditDrafts(prev => ({ ...prev, [op.id]: createDraftFromOpportunity(op) }));
  };

  const saveDraft = async (op: OpportunityItem) => {
    const draft = editDrafts[op.id];
    if (!draft) return;
    setSavingId(op.id);
    setSaveError(null);
    try {
      const num = (s: string) => {
        if (s === undefined || s === null) return undefined;
        const t = String(s).trim();
        if (t === '') return undefined;
        const n = Number(t);
        return Number.isFinite(n) ? n : undefined;
      };
      const mapFit = (s: string) => {
        const t = (s || '').toUpperCase();
        if (!t) return undefined;
        if (['BELOW_RANGE', 'WITHIN_RANGE', 'ABOVE_RANGE', 'UNKNOWN'].includes(t)) return t;
        if (t === 'UNDER') return 'BELOW_RANGE';
        if (t === 'WITHIN') return 'WITHIN_RANGE';
        if (t === 'OVER') return 'ABOVE_RANGE';
        return undefined;
      };
      const mapPilotFit = (s: string) => {
        const t = (s || '').toUpperCase();
        if (!t) return undefined;
        if (['WITHIN', 'OVER', 'UNDER', 'UNKNOWN'].includes(t)) return t;
        if (t === 'WITHIN_RANGE') return 'WITHIN';
        if (t === 'ABOVE_RANGE' || t === 'OVER_RANGE') return 'OVER';
        if (t === 'BELOW_RANGE' || t === 'UNDER_RANGE') return 'UNDER';
        return undefined;
      };
      const mapRound = (s: string) => {
        const t = (s || '').toUpperCase().replace(/\s+/g, '_');
        if (!t) return undefined;
        const m: Record<string, string> = {
          'PRE-SEED': 'PRE_SEED', 'PRE_SEED': 'PRE_SEED',
          'SEED': 'SEED',
          'SERIES_A': 'A', 'A': 'A',
          'SERIES_B': 'B', 'B': 'B',
          'SERIES_C': 'C', 'C': 'C',
          'GROWTH': 'GROWTH'
        };
        return m[t] ?? undefined;
      };
      const mapDealType = (s: string) => {
        const t = (s || '').toUpperCase().replace(/\s+/g, '_');
        if (!t) return undefined;
        const m: Record<string, string> = {
          'EQUITY': 'EQUITY',
          'CONVERTIBLE': 'CONVERTIBLE',
          'SAFE': 'SAFE',
          'GRANT': 'GRANT',
          'REVENUE_BASED': 'REVENUE_BASED',
          'VENTURE_DEBT': 'REVENUE_BASED',
          'PARTNERSHIP': 'PARTNERSHIP',
          'PILOT': 'PILOT',
          'LICENSE': 'LICENSE',
          'COMMERCIAL': 'COMMERCIAL',
        };
        return m[t] ?? undefined;
      };
      const dateIso = (s: string) => {
        const t = (s || '').trim();
        if (!t) return undefined;
        const dt = new Date(t);
        return isNaN(dt.getTime()) ? undefined : dt.toISOString();
      };

      const payload: Record<string, unknown> = {
        id: op.id,
      };
      const maybeSet = (k: string, v: unknown) => {
        if (v !== undefined) payload[k] = v;
      };

      maybeSet('round', mapRound(draft.round));
      maybeSet('deal_type', mapDealType(draft.deal_type));
      maybeSet('proposed_amount_eur', num(draft.proposed_amount_eur));
      maybeSet('valuation_pre_money_eur', num(draft.valuation_pre_money_eur));
      maybeSet('ownership_target_pct', num(draft.ownership_target_pct));
      maybeSet('budget_fit', mapFit(draft.budget_fit));
      maybeSet('budget_fit_score', num(draft.budget_fit_score));
      maybeSet('pilot_estimated_cost_eur', num(draft.pilot_estimated_cost_eur));
      maybeSet('pilot_budget_fit', mapPilotFit(draft.pilot_budget_fit));
      maybeSet('fund_id', draft.fund_id?.trim() || undefined);
      maybeSet('term_deadline', dateIso(draft.term_deadline));

      const res = await fetch('/api/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Mise à jour échouée');
      await refresh();
      setExpandedId(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!investor?.id) {
          setOpportunities([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/opportunities?type=INVESTOR&id=${investor.id}&limit=50`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Erreur API');
        setOpportunities(json.items as OpportunityItem[]);
        if (!autoGenTried && (json.total === 0 || (json.items as OpportunityItem[]).length === 0)) {
          try {
            const genRes = await fetch('/api/opportunities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mode: 'investor', id: investor.id, topK: 20, minScore: 45 }),
            });
            const genJson = await genRes.json();
            if (genJson.success) {
              setAutoGenTried(true);
              const r2 = await fetch(`/api/opportunities?type=INVESTOR&id=${investor.id}&limit=50`);
              const j2 = await r2.json();
              if (j2.success) setOpportunities(j2.items as OpportunityItem[]);
            }
          } catch { /* ignore */ }
        }
      } catch (error) {
        console.error('Error fetching investment opportunities:', error);
        setError('Failed to load investment opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [investor]);

  const filteredOpportunities = opportunities.filter(op => {
  const label = `${op.source_name ?? ''} ${op.target_name ?? ''} ${op.source_type} ${op.source_id} ${op.target_type} ${op.target_id}`.toLowerCase();
    const matchesSearch = label.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || op.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const refresh = async () => {
    if (!investor?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities?type=INVESTOR&id=${investor.id}&limit=50`);
      const json = await res.json();
      if (json.success) setOpportunities(json.items as OpportunityItem[]);
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    if (!investor?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'investor', id: investor.id, topK: 20, minScore: 45 }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Génération échouée');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (opId: string, status: string) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: opId, status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Mise à jour échouée');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  if (loading) {
    return (
      <section className="space-y-6 overflow-y-auto max-w-6xl mx-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }


  if (error) {
    return (
      <section className="space-y-6 overflow-y-auto max-w-6xl mx-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Investment Opportunities</h2>
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 overflow-y-auto max-w-6xl mx-auto">
      {/* Hero/Header */}
      <Card className="border-border/30 bg-gradient-to-br from-card to-background/40 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FaRocket size={14} />
            </span>
            Investment Opportunities
          </CardTitle>
          <CardDescription>
              Matches générés pour votre profil investisseur. Astuce: survolez les éléments pour une aide.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Rechercher une opportunité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                title="Rechercher par nom, type ou identifiants"
                className="w-full pl-10 pr-4 py-2 bg-background/70 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filtrer les opportunités par statut"
              className="px-3 py-2 text-sm bg-background/70 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">new</option>
              <option value="qualified">qualified</option>
              <option value="contacted">contacted</option>
              <option value="in_discussion">in_discussion</option>
              <option value="pilot">pilot</option>
              <option value="deal">deal</option>
              <option value="lost">lost</option>
            </select>
            <div className="inline-flex rounded-lg overflow-hidden border border-border/60">
              <button
                onClick={() => setViewMode('grid')}
                title="Afficher en grille"
                className={cn("px-3 py-2 text-sm transition-colors", viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background/70 text-muted-foreground hover:text-foreground')}
              >Grille</button>
              <button
                onClick={() => setViewMode('list')}
                title="Afficher en liste"
                className={cn("px-3 py-2 text-sm transition-colors", viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background/70 text-muted-foreground hover:text-foreground')}
              >Liste</button>
            </div>
            <button onClick={generate} title="Générer de nouvelles opportunités pour votre profil" className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 shadow-sm">Générer</button>
            <button onClick={() => setShowHelp((v) => !v)} title="Afficher/masquer le glossaire des termes" className="px-3 py-2 rounded-lg bg-background/70 text-foreground text-sm border border-border/60 hover:bg-background/60">{showHelp ? 'Masquer l\u00A0aide' : 'Aide / Glossaire'}</button>
          </div>
        </CardContent>
        <CardFooter className="pt-0 text-sm text-muted-foreground flex justify-between">
          <span>{filteredOpportunities.length} opportunités</span>
          {investor?.investment_focus && (
            <span>Focus: <strong className="text-foreground">{investor.investment_focus}</strong></span>
          )}
        </CardFooter>
      </Card>

      {showHelp && (
        <Card className="border-border/30 bg-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Glossaire rapide</CardTitle>
            <CardDescription>Repères sur les termes financiers et le calcul du score.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground space-y-3">
            <div>
              <div className="text-foreground font-medium">Round (stade)</div>
              <ul className="list-disc pl-5">
                <li><span className="text-foreground">Pre-Seed</span>: tout début, validation initiale.</li>
                <li><span className="text-foreground">Seed</span>: amorçage, premiers clients.</li>
                <li><span className="text-foreground">Series A/B/C</span>: croissance/accélération.</li>
                <li><span className="text-foreground">Growth</span>: scale-up.</li>
              </ul>
            </div>
            <div>
              <div className="text-foreground font-medium">Type de deal</div>
              <ul className="list-disc pl-5">
                <li><span className="text-foreground">Equity</span>: actions ordinaires/préférentielles.</li>
                <li><span className="text-foreground">SAFE / Convertible</span>: titre convertible (dette/équity différée).</li>
                <li><span className="text-foreground">Grant</span>: subvention non dilutive.</li>
                <li><span className="text-foreground">Revenue-Based</span>: remboursement indexé sur revenus (quasi-dette).</li>
                <li><span className="text-foreground">Pilot / License / Commercial / Partnership</span>: collaboration commerciale/technique.</li>
              </ul>
            </div>
            <div>
              <div className="text-foreground font-medium">Score (cases)</div>
              <ul className="list-disc pl-5">
                <li><span className="text-foreground">Tags</span>: chevauchement de tags/intérêts.</li>
                <li><span className="text-foreground">Texte</span>: similarité sémantique des descriptions.</li>
                <li><span className="text-foreground">Stade</span>: adéquation du round.</li>
                <li><span className="text-foreground">Géo</span>: compatibilité géographique.</li>
                <li><span className="text-foreground">Engagement</span>: signaux d&#39;intérêt (vues, likes...).</li>
                <li><span className="text-foreground">Budget</span>: fit entre ticket et plage de budget.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
        {filteredOpportunities.map((opportunity) => {
          const isStartupTarget = opportunity.target_type === 'STARTUP';
          const startupId = isStartupTarget ? opportunity.target_id : (opportunity.source_type === 'STARTUP' ? opportunity.source_id : null);
          const startupName = isStartupTarget
            ? (opportunity.target_name && opportunity.target_name.trim().length > 0 ? opportunity.target_name : null)
            : (opportunity.source_type === 'STARTUP'
                ? (opportunity.source_name && opportunity.source_name.trim().length > 0 ? opportunity.source_name : null)
                : null);
          const fallback = `${opportunity.source_type} #${opportunity.source_id} → ${opportunity.target_type} #${opportunity.target_id}`;
          const label = startupName ?? fallback;
          return (
            <Card
              key={opportunity.id}
              className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-background/40 to-background/20 backdrop-blur-md hover:border-primary/40 hover:shadow-lg transition-all duration-200"
              onClick={(e) => handleCardClick(e, opportunity)}
            >
              <CardContent className="p-5">
                <div className="h-1.5 -mx-5 -mt-5 mb-4 rounded-t-2xl bg-gradient-to-r from-primary/50 via-accent/40 to-transparent" />
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FaRocket size={12} />
                    </span>
                    <a className="font-semibold text-foreground hover:underline truncate" href={startupId ? `/projects/${startupId}` : undefined} onClick={(e) => e.stopPropagation()}>
                      {label}
                    </a>
                    {/* Inline meta chips: Round & Deal (compact) */}
                    <div className="hidden sm:flex items-center gap-2">
                      {opportunity.round && (
                        <span title="Stade de financement (Pre-Seed, Seed, Series A/B/C, Growth)" className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">{opportunity.round}</span>
                      )}
                      {opportunity.deal_type && (
                        <span title="Type d'opération (Equity, SAFE, Convertible, Grant, Revenue-Based, etc.)" className="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-primary border border-accent/20">{opportunity.deal_type}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span title={"Score global de pertinence (0–100), agrégé sur plusieurs critères"} className={cn("px-2 py-1 text-xs rounded-full font-medium ring-1", badgeForScore(opportunity.score), "ring-current/25")}>{typeof opportunity.score === 'number' ? `${Math.round(opportunity.score)}%` : '—'}</span>
                    <span title={"Statut de l'opportunité (new, qualified, contacted, in_discussion, pilot, deal, lost)"} className={cn('px-2 py-1 text-xs rounded-full font-medium', statusChipClass(opportunity.status))}>{opportunity.status.replace('_', ' ')}</span>
                  </div>
                </div>
                {/* For small screens, show Round/Deal chips on their own line */}
                {(opportunity.round || opportunity.deal_type) && (
                  <div className="sm:hidden mb-3 flex items-center gap-2">
                    {opportunity.round && (
                        <span title="Stade de financement (Seed, Series A, Series B, etc.)" className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">{opportunity.round}</span>
                    )}
                    {opportunity.deal_type && (
                        <span title="Type d'opération (Equity, SAFE, Venture Debt, etc.)" className="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-primary border border-accent/20">{opportunity.deal_type}</span>
                    )}
                  </div>
                )}

                {opportunity.score_breakdown && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 text-xs">
                    {Object.entries(opportunity.score_breakdown).map(([k, v]) => {
                      const info = scoreKeyInfo(k);
                      return (
                        <div key={k} className="rounded-md px-2 py-1 bg-secondary/20 border border-secondary/30 flex items-center justify-between" title={`${info.label} — ${info.desc}`}>
                          <span className="text-muted-foreground">{info.label}</span>
                          <span className="text-foreground font-medium">{Math.round(Number(v))}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Financement */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/50 p-3 bg-card/60 hover:bg-card/80 transition-colors">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Montant proposé</div>
                    <div title="Montant du ticket proposé" className="mt-1 text-foreground text-lg md:text-xl font-semibold tracking-tight">{fmtEur(opportunity.proposed_amount_eur) ?? '—'}</div>
                    {Array.isArray(opportunity.startup_investment_history) && opportunity.startup_investment_history.length > 0 && (
                      <div className="mt-2 rounded-md bg-primary/5 p-2" title="Historique des montants récents (hauteur proportionnelle au montant)">
                        <div className="text-[11px] text-muted-foreground mb-1">Évolution (derniers deals)</div>
                        <div className="flex items-end gap-1.5 h-12">
                          {opportunity.startup_investment_history.map((p, idx) => {
                            const n = toNumber(p.amount_eur) ?? 0;
                            // simple scale on 6 bars; avoid 0 height bars
                            const vals = opportunity.startup_investment_history!.map(v => toNumber(v.amount_eur) ?? 0);
                            const max = Math.max(1, ...vals);
                            const h = Math.max(3, Math.round((n / max) * 44));
                            return <div key={idx} className="w-2.5 bg-primary rounded-sm animate-bar" style={{ height: `${h}px` }} title={`${fmtEur(n)} • ${new Date(p.dt).toLocaleDateString()}`}></div>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border border-border/50 p-3 bg-card/60 hover:bg-card/80 transition-colors">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Budget fit</div>
                    <div className="mt-1 flex items-center gap-2">
                      {(() => { const info = budgetFitInfo(opportunity); return (
                        <span title="Adéquation du ticket avec votre plage de budget" className={cn('px-2 py-0.5 rounded-full text-[11px]', info.cls)}>
                          {info.label}
                        </span>
                      ); })()}
                      {toNumber(opportunity.budget_fit_score) !== null && (
                        <span title="Score de budget sur 20 (plus élevé = meilleur fit)" className="text-foreground font-medium">{Math.round(toNumber(opportunity.budget_fit_score) as number)}/20</span>
                      )}
                    </div>
                  </div>
                  <div title="Fonds ciblé et date limite estimée pour l'offre" className="rounded-lg border border-border/50 p-3 bg-card/60 hover:bg-card/80 transition-colors">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Fund + Deadline</div>
                    <div className="mt-1 flex flex-col gap-1">
                      <div className="text-foreground">{opportunity.fund_id ? `Fund ${opportunity.fund_id.slice(0, 6)}…` : '—'}</div>
                      <div className="text-muted-foreground">{opportunity.term_deadline ? new Date(opportunity.term_deadline).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                  {opportunity.valuation_pre_money_eur && (
                    <div title="Valorisation pré-money estimée" className="rounded-lg border border-border/50 p-3 bg-card/60 hover:bg-card/80 transition-colors">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Valuation (pre-money)</div>
                      <div className="mt-1 font-medium text-foreground">{fmtEur(opportunity.valuation_pre_money_eur)}</div>
                    </div>
                  )}
                  {opportunity.ownership_target_pct && (
                    <div title="Pourcentage de participation visé" className="rounded-lg border border-border/50 p-3 bg-card/60 hover:bg-card/80 transition-colors">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Ownership cible</div>
                      <div className="mt-1 font-medium text-foreground">{fmtPct(opportunity.ownership_target_pct)}</div>
                    </div>
                  )}
                </div>

                {/* Détails éditables */}
                {expandedId === opportunity.id && (
                  <div className="mt-4 rounded-lg border border-border/40 bg-background/40 p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-3 text-sm font-medium text-foreground">Modifier l&apos;opportunité</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1" title="Stade de financement: Pre-Seed, Seed, Series A/B/C, Growth">Round</label>
                        <select
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.round ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'round', e.target.value)}
                        >
                          <option value="">—</option>
                          <option>Pre-Seed</option>
                          <option>Seed</option>
                          <option>Series A</option>
                          <option>Series B</option>
                          <option>Series C</option>
                          <option>Series D</option>
                          <option>Bridge</option>
                          <option>Extension</option>
                          <option>Other</option>
                        </select>
                        <p className="mt-1 text-xs text-muted-foreground">Exemples: Pre-Seed = tout début; Seed = amorçage; Series A/B/C = croissance; Growth = scale.</p>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1" title="Type d’opération: Equity, SAFE, Convertible, Grant, etc.">Type de deal</label>
                        <select
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.deal_type ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'deal_type', e.target.value)}
                        >
                          <option value="">—</option>
                          <option>Equity</option>
                          <option>SAFE</option>
                          <option>Convertible</option>
                          <option>Venture Debt</option>
                          <option>Grant</option>
                          <option>Other</option>
                        </select>
                        <p className="mt-1 text-xs text-muted-foreground">Equity = actions; SAFE/Convertible = titre convertible; Grant = subvention; Revenue-Based = dette indexée sur revenus.</p>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Montant proposé (€)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          placeholder={fmtEur(opportunity.proposed_amount_eur) ?? ''}
                          value={editDrafts[opportunity.id]?.proposed_amount_eur ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'proposed_amount_eur', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Valorisation pre-money (€)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          placeholder={fmtEur(opportunity.valuation_pre_money_eur) ?? ''}
                          value={editDrafts[opportunity.id]?.valuation_pre_money_eur ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'valuation_pre_money_eur', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Ownership cible (%)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          placeholder={fmtPct(opportunity.ownership_target_pct) ?? ''}
                          value={editDrafts[opportunity.id]?.ownership_target_pct ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'ownership_target_pct', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Budget fit</label>
                        <select
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.budget_fit ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'budget_fit', e.target.value)}
                        >
                          <option value="">—</option>
                          <option value="BELOW_RANGE">Below range</option>
                          <option value="WITHIN_RANGE">Within range</option>
                          <option value="ABOVE_RANGE">Above range</option>
                          <option value="UNKNOWN">Unknown</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Score budget (/20)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.budget_fit_score ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'budget_fit_score', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Coût pilote estimé (€)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.pilot_estimated_cost_eur ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'pilot_estimated_cost_eur', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1" title="Adéquation du budget pilote (Within, Over, Under)">Pilot budget fit</label>
                        <select
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.pilot_budget_fit ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'pilot_budget_fit', e.target.value)}
                        >
                          <option value="">—</option>
                          <option value="WITHIN">Within</option>
                          <option value="OVER">Over</option>
                          <option value="UNDER">Under</option>
                          <option value="UNKNOWN">Unknown</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Fund ID</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.fund_id ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'fund_id', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Deadline</label>
                        <input
                          type="date"
                          className="w-full px-2 py-1.5 rounded-md border border-border/60 bg-background/70"
                          value={editDrafts[opportunity.id]?.term_deadline ?? ''}
                          onChange={(e) => updateDraft(opportunity.id, 'term_deadline', e.target.value)}
                        />
                      </div>
                    </div>
                    {saveError && <div className="mt-2 text-xs text-red-500">{saveError}</div>}
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm rounded-md border border-border/60 bg-background/70 hover:bg-background/60"
                        onClick={() => cancelDraft(opportunity)}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                        onClick={() => saveDraft(opportunity)}
                        disabled={savingId === opportunity.id}
                      >
                        {savingId === opportunity.id ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/20" title="Sens de la relation et dernière mise à jour" onClick={(e) => e.stopPropagation()}>
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2">{opportunity.direction}</span>
                    <span>{new Date(opportunity.updated_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="hidden sm:inline">Statut:</span>
                    <span aria-hidden className={cn('px-2 py-1 rounded-full font-medium', statusChipClass(opportunity.status))}>
                      {opportunity.status.replace('_', ' ')}
                    </span>
                    <label htmlFor={`status-${opportunity.id}`} className="sr-only">Status</label>
                    <select
                      id={`status-${opportunity.id}`}
                      value={opportunity.status}
                      onChange={(e) => updateStatus(opportunity.id, e.target.value)}
                      title="Modifier le statut de l'opportunité"
                      className="px-3 py-1 rounded-full bg-background/70 border border-border/60 text-foreground font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary/40 hover:bg-background/60"
                    >
                      <option value="new">New</option>
                      <option value="qualified">Qualified</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_discussion">In discussion</option>
                      <option value="pilot">Pilot</option>
                      <option value="deal">Deal</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card className="text-center border-dashed border-border/40">
          <CardContent className="p-10">
            <FiSearch className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune opportunité trouvée</h3>
            <p className="text-muted-foreground mb-4">Ajustez vos filtres ou générez de nouvelles correspondances.</p>
            <button onClick={generate} title="Générer de nouvelles opportunités pour votre profil" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 shadow-sm">Générer des opportunités</button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
