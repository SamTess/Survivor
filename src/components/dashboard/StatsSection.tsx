"use client";

import { useMemo } from "react";
import { FiTrendingUp, FiUsers, FiBarChart2 } from "react-icons/fi";
import statsData from "@/mocks/stats.json";

type Stats = typeof statsData;

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

export default function StatsSection() {
  const stats: Stats = statsData;

  const totalFunding = stats.fundingHistory.reduce((s, f) => s + f.amount, 0);

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-card">
        <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
        <p className="text-sm text-gray-700">All the stats you need to know about your project.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-card transition-transform duration-200 hover:scale-[1.01] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Views (this month)</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.viewsThisMonth)}</p>
            </div>
            <FiTrendingUp className="text-indigo-600" size={24} />
          </div>
          <div className="mt-2"><Sparkline data={stats.monthlyViews} /></div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-card transition-transform duration-200 hover:scale-[1.01] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Total funding</p>
              <p className="text-2xl font-semibold text-gray-900">€{formatNumber(totalFunding)}</p>
            </div>
            <FiBarChart2 className="text-emerald-600" size={24} />
          </div>
          <div className="mt-2">
            <Bars data={stats.fundingHistory.map(f => Math.round(f.amount / 1000))} />
            <p className="mt-1 text-xs text-gray-700">k€ by round</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-card transition-transform duration-200 hover:scale-[1.01] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Conversion rate</p>
              <p className="text-2xl font-semibold text-gray-900">{formatPercent(stats.conversionRate)}</p>
            </div>
            <FiTrendingUp className="text-indigo-600" size={24} />
          </div>
          <div className="mt-2"><Sparkline data={stats.activeUsers} color="#6610F2" /></div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-card transition-transform duration-200 hover:scale-[1.01] hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Active users</p>
              <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.activeUsers.at(-1) || 0)}</p>
            </div>
            <FiUsers className="text-indigo-600" size={24} />
          </div>
          <div className="mt-2"><Bars data={stats.activeUsers} color="#6610F2" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-card">
        <h3 className="text-sm font-medium text-gray-900">Funding rounds</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.fundingHistory.map((f) => (
            <div key={f.label} className="rounded-lg border border-gray-200 p-3 transition-transform duration-200 hover:scale-[1.01] hover:shadow-sm">
              <p className="text-sm text-gray-700">{f.label}</p>
              <p className="text-lg font-semibold text-gray-900">€{formatNumber(f.amount)}</p>
              <p className="text-xs text-gray-700">{new Date(f.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
