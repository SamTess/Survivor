"use client"

import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

const DarkModeToggle = () => {
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
      <FaSun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" /> : 
      <FaMoon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
  );

  return (
    <Button
      size="sm"
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      className="group rounded-full w-10 h-10 p-0 bg-muted/20 hover:bg-muted/40 border-0 transition-all duration-200 hover:scale-105"
    >
      {icon}
    </Button>
  );
};

export default DarkModeToggle;
