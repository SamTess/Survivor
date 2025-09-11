"use client";
import React, {useState, useCallback, useEffect, useRef} from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { ArrowRight, ArrowLeft, Play, Pause } from 'lucide-react';

export type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  content: React.ReactNode;
  notes?: string; // presenter notes (hidden in UI now)
};

interface SlideDeckProps {
  slides: Slide[];
  autoPlayMs?: number;
  className?: string;
  tall?: boolean;
  showProgress?: boolean;
  showControls?: boolean;
  showDots?: boolean;
  showCounter?: boolean;
}

export const SlideDeck: React.FC<SlideDeckProps> = ({ slides, autoPlayMs = 0, className, tall = false, showProgress = true, showControls = true, showDots = true, showCounter = true }) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const total = slides.length;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const go = useCallback((delta: number) => {
    setIndex(i => {
      const next = i + delta;
      if (next < 0) return 0;
      if (next >= total) return total - 1;
      return next;
    });
  }, [total]);

  const goTo = useCallback((i: number) => {
    setIndex(Math.min(Math.max(i,0), total-1));
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1);} 
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1);} 
      if (e.key === 'Home') goTo(0);
      if (e.key === 'End') goTo(total-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go, goTo, total]);

  // Autoplay
  useEffect(() => {
    if (!autoPlayMs || !isPlaying) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => go(1), autoPlayMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlayMs, isPlaying, go]);

  const progress = (index + 1) / total * 100;
  const slide = slides[index];

  return (
    <div className={cn('relative w-full h-full flex flex-col', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="h-1 w-full bg-muted/40 overflow-hidden rounded-full mb-2">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{width: progress + '%'}} />
        </div>
      )}

      <div className={cn('flex-1 relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-background to-muted shadow-inner', tall && 'min-h-[88vh]')}> 
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[radial-gradient(circle_at_30%_30%,theme(colors.primary)/0.3,transparent_60%),radial-gradient(circle_at_70%_70%,theme(colors.accent)/0.25,transparent_55%)]" />

        <div key={slide.id} className={cn('w-full h-full p-8 md:p-14 flex flex-col gap-6 animate-fade-in-up overflow-hidden', tall && 'pb-16')}> 
          {slide.title && (
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
              {slide.title} {slide.subtitle && <span className="block text-lg md:text-2xl font-normal text-primary mt-2">{slide.subtitle}</span>}
            </h2>
          )}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 h-full w-full overflow-auto prose prose-invert max-w-none text-foreground/90 leading-relaxed text-base md:text-lg slide-content">{slide.content}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => go(-1)} disabled={index===0} className="rounded-full bg-transparent">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => go(1)} disabled={index===total-1} className="rounded-full bg-transparent">
              <ArrowRight className="w-4 h-4" />
            </Button>
            {autoPlayMs > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setIsPlaying(p=>!p)} className="rounded-full">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
          </div>
          {showDots && (
            <div className="flex-1 flex items-center justify-center gap-2 flex-wrap">
              {slides.map((s,i)=>(
                <button key={s.id} onClick={()=>goTo(i)} aria-label={`Aller à la diapositive ${i+1}`} className={cn('h-2 w-6 rounded-full transition-all', i===index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/30')} />
              ))}
            </div>
          )}
          {showCounter && (
            <div className="text-xs text-muted-foreground tabular-nums font-mono tracking-tight">{index+1} / {total}</div>
          )}
        </div>
      )}
    </div>
  );
};
