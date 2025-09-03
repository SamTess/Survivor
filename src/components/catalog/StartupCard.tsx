"use client";
import React from 'react';
import type { Startup } from '@/domain/entities/Startup';
import { startupCardFieldConfig } from './startupCardFieldConfig';
import clsx from 'clsx';

export interface StartupCardProps {
  startup: Startup
  onClick?: (s: Startup) => void
  className?: string
}

export function StartupCard({ startup, onClick, className }: StartupCardProps) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onClick?.(startup);
  };
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={() => onClick?.(startup)}
      onKeyDown={handleKey}
      className={clsx(
        'group relative flex flex-col gap-3 rounded-lg border p-4 bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
    >
      <div>
        <h3 className="text-lg font-semibold leading-tight mb-1 group-hover:text-primary transition-colors">{startup.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-3 min-h-[3.6em]">{startup.description}</p>
      </div>
      <div className="flex flex-wrap gap-3 text-xs pt-1">
        {startupCardFieldConfig.map(f => {
          const raw = (startup as any)[f.key];
          if (raw == null || raw === '') return null;
          const value = f.format ? f.format(raw, startup) : (typeof raw === 'string' ? raw : String(raw));
          if (!value) return null;
          const Icon = f.icon;
          return (
            <span key={f.key} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
              {Icon && <Icon className="size-3" />}
              <span className="whitespace-nowrap max-w-[140px] truncate" title={`${f.label}: ${value}`}>{value}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
