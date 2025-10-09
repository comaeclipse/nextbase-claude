'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          <i className="fas fa-map-marked-alt"></i>
          <span>VetRetire</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link href="/quiz" className={`nav-link ${pathname === '/quiz' ? 'active' : ''}`}>
            <i className="fas fa-clipboard-list"></i>
            <span>Quiz</span>
          </Link>
          <Link href="/map" className={`nav-link ${pathname === '/map' ? 'active' : ''}`}>
            <i className="fas fa-map"></i>
            <span>Map</span>
          </Link>
        </div>
        <div className="nav-actions">
          <button
            id="theme-toggle"
            className="theme-toggle"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <i className="fas fa-sun light-icon"></i>
            <i className="fas fa-moon dark-icon"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

