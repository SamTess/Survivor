"use client";

import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";
import { InvestorApiResponse } from "@/domain/interfaces/Investor";

type OpportunityItem = {
  id: string;
  direction: string;
  source_type: string;
  source_id: number;
  target_type: string;
  target_id: number;
  score?: number | null;
  score_breakdown?: Record<string, number> | null;
  status: string;
  updated_at: string | Date;
};

interface InvestmentOpportunitiesProps {
  investor: InvestorApiResponse | null;
}

function badgeForScore(score?: number | null) {
  const s = typeof score === 'number' ? score : 0;
  if (s >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
  if (s >= 60) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
  if (s >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
  return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
}

export default function InvestmentOpportunities({ investor }: InvestmentOpportunitiesProps) {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    const label = `${op.source_type} ${op.source_id} ${op.target_type} ${op.target_id}`.toLowerCase();
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
      <section className="space-y-6 overflow-y-auto">
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
      <section className="space-y-6 overflow-y-auto">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Investment Opportunities</h2>
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 overflow-y-auto">
      {/* Header & Filters */}
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Investment Opportunities</h2>
              <p className="text-sm text-muted-foreground">Matches générés pour votre profil investisseur</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <div className="w-4 h-4 flex flex-col gap-1">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
              <button onClick={generate} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90">Générer</button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredOpportunities.length} opportunities found</span>
            {investor?.investment_focus && (
              <span>Focus: <strong>{investor.investment_focus}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Opportunities Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
        {filteredOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaRocket className="text-primary" size={16} />
                {(() => {
                  const isStartupTarget = opportunity.target_type === 'STARTUP';
                  const startupId = isStartupTarget ? opportunity.target_id : (opportunity.source_type === 'STARTUP' ? opportunity.source_id : null);
                  return (
                    <a className="font-semibold text-foreground hover:underline" href={startupId ? `/projects/${startupId}` : undefined} target={startupId ? '_self' : undefined}>
                      {startupId ? `Startup #${startupId}` : `${opportunity.source_type} #${opportunity.source_id} → ${opportunity.target_type} #${opportunity.target_id}`}
                    </a>
                  );
                })()}
              </div>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${badgeForScore(opportunity.score)}`}>
                {typeof opportunity.score === 'number' ? `${Math.round(opportunity.score)}%` : '—'}
              </span>
            </div>
            {opportunity.score_breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-xs">
                {Object.entries(opportunity.score_breakdown).map(([k, v]) => (
                  <div key={k} className="bg-secondary/30 rounded-md px-2 py-1 flex items-center justify-between">
                    <span className="text-muted-foreground capitalize">{k}</span>
                    <span className="text-foreground font-medium">{Math.round(Number(v))}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-border/20">
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
                  className="px-2 py-1 bg-background border border-border rounded-md"
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
          </div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-8 text-center shadow-sm">
          <FiSearch className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold text-foreground mb-2">No opportunities found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
        </div>
      )}
    </section>
  );
}
