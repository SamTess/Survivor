"use client"

import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

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

  const icon = !mounted ? null : (darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-md" />);

  return (
    <button type="button" aria-label="Toggle dark mode" onClick={toggleDarkMode} className="rounded-full smooth-hover">
      {icon}
    </button>
  );
};

export default DarkModeToggle;
