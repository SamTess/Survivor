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
  // financement (optionnel)
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

interface InvestmentOpportunitiesProps {
  investor: InvestorApiResponse | null;
}

function badgeForScore(score?: number | null) {
  const s = typeof score === 'number' ? score : 0;
  // Couleurs saturées et fortes pour maximiser la lisibilité sur fonds clairs/sombres
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
      return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/20';
    case 'ABOVE_RANGE':
    case 'OVER':
      return 'text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/20';
    case 'BELOW_RANGE':
    case 'UNDER':
      return 'text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20';
    case 'UNKNOWN':
    default:
      return 'text-foreground bg-muted';
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
  // Prefer budget_fit; fallback to pilot_budget_fit if present
  const fit = op.budget_fit ?? (op.pilot_budget_fit as string | null | undefined);
  return {
    label: chipLabelByFitRaw(fit),
    cls: chipColorByFitRaw(fit),
  };
}

function statusChipClass(status: string): string {
  const s = status.toUpperCase();
  // Badges de statut très contrastés, avec un léger ring pour se détacher du fond
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
          // Auto-générer une fois si aucune opportunité présente
          try {
            const genRes = await fetch('/api/opportunities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mode: 'investor', id: investor.id, topK: 20, minScore: 45 }),
            });
            const genJson = await genRes.json();
            if (genJson.success) {
              setAutoGenTried(true);
              // recharger
              const r2 = await fetch(`/api/opportunities?type=INVESTOR&id=${investor.id}&limit=50`);
              const j2 = await r2.json();
              if (j2.success) setOpportunities(j2.items as OpportunityItem[]);
            }
          } catch {
            // pas bloquant; on laisse vide
          }
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
          </div>
        </CardContent>
        <CardFooter className="pt-0 text-sm text-muted-foreground flex justify-between">
          <span>{filteredOpportunities.length} opportunités</span>
          {investor?.investment_focus && (
            <span>Focus: <strong className="text-foreground">{investor.investment_focus}</strong></span>
          )}
        </CardFooter>
      </Card>

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
          >
            <CardContent className="p-5">
              <div className="h-1.5 -mx-5 -mt-5 mb-4 rounded-t-2xl bg-gradient-to-r from-primary/50 via-accent/40 to-transparent" />
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FaRocket size={12} />
                  </span>
                  <a className="font-semibold text-foreground hover:underline truncate" href={startupId ? `/projects/${startupId}` : undefined}>
                    {label}
                  </a>
                  {/* Inline meta chips: Round & Deal (compact) */}
                  <div className="hidden sm:flex items-center gap-2">
                    {opportunity.round && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">{opportunity.round}</span>
                    )}
                    {opportunity.deal_type && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-primary border border-accent/20">{opportunity.deal_type}</span>
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
                  {Object.entries(opportunity.score_breakdown).map(([k, v]) => (
          <div key={k} className="rounded-md px-2 py-1 bg-secondary/20 border border-secondary/30 flex items-center justify-between">
                      <span className="text-muted-foreground capitalize">{k}</span>
                      <span className="text-foreground font-medium">{Math.round(Number(v))}</span>
                    </div>
                  ))}
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
                      <span title="Adéquation du ticket avec votre plage de budget" className={cn('px-2 py-0.5 rounded-full text-[11px] ring-1', info.cls, 'ring-current/20')}>
                        {info.label}
                      </span>
                    ); })()}
                    {toNumber(opportunity.budget_fit_score) !== null && (
                      <span title="Score de budget sur 20 (plus élevé = meilleur fit)" className="text-foreground font-medium">{Math.round(toNumber(opportunity.budget_fit_score) as number)}/20</span>
                    )}
                  </div>
                </div>
                <div title="Fonds ciblé et date limite estimée pour l'offre" className="rounded-lg border border-border/50 p-3 bg-card/60 hover:bg-card/80 transition-colors">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Fund & Deadline</div>
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

              <div className="flex items-center justify-between pt-3 border-t border-border/20" title="Sens de la relation et dernière mise à jour">
                <div className="text-xs text-muted-foreground">
                  <span className="mr-2">{opportunity.direction}</span>
                  <span>{new Date(opportunity.updated_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <label htmlFor={`status-${opportunity.id}`} className="sr-only">Status</label>
                  <select
                    id={`status-${opportunity.id}`}
                    value={opportunity.status}
                    onChange={(e) => updateStatus(opportunity.id, e.target.value)}
                    title="Modifier le statut de l'opportunité"
                    className="px-2 py-1 bg-background/70 border border-border/60 rounded-md text-foreground font-medium focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
                  >
                    <option value="new">new</option>
                    <option value="qualified">qualified</option>
                    <option value="contacted">contacted</option>
                    <option value="in_discussion">in_discussion</option>
                    <option value="pilot">pilot</option>
                    <option value="deal">deal</option>
                    <option value="lost">lost</option>
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
