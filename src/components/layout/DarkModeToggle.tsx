"use client"

import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

// Hydration-safe dark mode toggle: defer reading localStorage until after mount.
const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // On mount: read preference & apply class
  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = stored !== null ? stored === 'true' : prefersDark;
      setDarkMode(initial);
      document.documentElement.classList.toggle('dark', initial);
    } catch (_) {
      // ignore
    }
  }, []);

  // Persist & update class when changed (after mount only)
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem('darkMode', darkMode.toString());
    } catch (_) {/* ignore */}
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode, mounted]);

  const toggleDarkMode = () => setDarkMode(d => !d);

  // Avoid SSR mismatch: render a placeholder icon until mounted
  const icon = !mounted ? null : (darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-md" />);

  return (
    <button type="button" aria-label="Toggle dark mode" onClick={toggleDarkMode} className="rounded-full smooth-hover">
      {icon}
    </button>
  );
};

export default DarkModeToggle;
