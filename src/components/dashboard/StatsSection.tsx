"use client";

import { useMemo } from "react";
import { FiTrendingUp, FiUsers, FiBarChart2 } from "react-icons/fi";
import statsData from "@/mocks/stats.json";
import { StartupDetailApiResponse } from "@/domain/interfaces";

type Stats = typeof statsData;

interface StatsSectionProps {
  startup?: StartupDetailApiResponse | null;
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function formatPercent(n: number) {
  return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(n);
}

function Sparkline({ data, color = "#6610F2" }: { data: number[]; color?: string }) {
  const path = useMemo(() => {
    if (!data.length) return "";
    const w = 120;
    const h = 36;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - norm(v) * h;
      return `${x},${y}`;
    });
    return `M ${points[0]} L ${points.slice(1).join(" ")}`;
  }, [data]);

  return (
    <svg viewBox="0 0 120 36" className="w-28 h-9 overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth={2} className="animate-draw" />
    </svg>
  );
}

function Bars({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const max = Math.max(1, ...data);
  return (
  <div className="flex items-end gap-1 h-24">
      {data.map((v, i) => (
        <div
          key={i}
      className="w-4 rounded-t animate-bar"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.8 }}
          title={`${v}`}
        />
      ))}
    </div>
  );
}

export default function StatsSection({ startup }: StatsSectionProps) {
  const stats: Stats = statsData;

  const totalFunding = stats.fundingHistory.reduce((s, f) => s + f.amount, 0);

  // Get startup-specific info when available
  const startupName = startup?.name || "Your Project";
  const startupSector = startup?.sector || "Technology";
  const startupMaturity = startup?.maturity || "Early Stage";

  return (
    <section className="space-y-6 overflow-y-auto">
      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-5 shadow-sm animate-card transition-all duration-300">
        <h2 className="text-lg font-semibold text-foreground">Statistics</h2>
        <p className="text-sm text-muted-foreground">
          {startup ? `All the stats you need to know about ${startupName}.` : "All the stats you need to know about your project."}
        </p>
        {startup && (
          <div className="mt-3 flex gap-3 text-xs">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{startupSector}</span>
            <span className="px-2 py-1 bg-accent/10 text-accent rounded-full">{startupMaturity}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Views (this month)</p>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(stats.viewsThisMonth)}</p>
            </div>
            <FiTrendingUp className="text-primary" size={24} />
          </div>
          <div className="mt-2"><Sparkline data={stats.monthlyViews} /></div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total funding</p>
              <p className="text-2xl font-semibold text-foreground">€{formatNumber(totalFunding)}</p>
            </div>
            <FiBarChart2 className="text-accent" size={24} />
          </div>
          <div className="mt-2">
            <Bars data={stats.fundingHistory.map(f => Math.round(f.amount / 1000))} />
            <p className="mt-1 text-xs text-muted-foreground">k€ by round</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion rate</p>
              <p className="text-2xl font-semibold text-foreground">{formatPercent(stats.conversionRate)}</p>
            </div>
            <FiTrendingUp className="text-primary" size={24} />
          </div>
          <div className="mt-2"><Sparkline data={stats.activeUsers} color="#6610F2" /></div>
        </div>

        <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active users</p>
              <p className="text-2xl font-semibold text-foreground">{formatNumber(stats.activeUsers.at(-1) || 0)}</p>
            </div>
            <FiUsers className="text-primary" size={24} />
          </div>
          <div className="mt-2"><Bars data={stats.activeUsers} color="#6610F2" /></div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/20 bg-card/80 backdrop-blur-md p-4 shadow-sm animate-card transition-all duration-300">
        <h3 className="text-sm font-medium text-foreground">Funding rounds</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.fundingHistory.map((f) => (
            <div key={f.label} className="rounded-2xl border border-border/20 bg-background/50 p-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm hover:border-primary/20">
              <p className="text-sm text-muted-foreground">{f.label}</p>
              <p className="text-lg font-semibold text-foreground">€{formatNumber(f.amount)}</p>
              <p className="text-xs text-muted-foreground">{new Date(f.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
