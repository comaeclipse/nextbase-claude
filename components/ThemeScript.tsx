'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    const initTheme = () => {
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    };
    
    initTheme();
  }, []);

  return null;
}

