"use client"

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({
  className = ''
}: DarkModeToggleProps) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = stored !== null ? stored === 'true' : prefersDark;
      setDarkMode(initial);
      document.documentElement.classList.toggle('dark', initial);
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem('darkMode', darkMode.toString());
    } catch {}
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, mounted]);

  const toggleDarkMode = () => setDarkMode(d => !d);

  const icon = !mounted ? null : (
    darkMode ?
      <Sun className="h-5 w-5" /> :
      <Moon className="h-5 w-5" />
  );

  return (
    <Button
      size="sm"
      onClick={toggleDarkMode}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      aria-pressed={darkMode}
      className={`${className} group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
    >
      {icon}
    </Button>
  );
};
