'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, CalendarDays, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [masterName, setMasterName] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('mbautolab_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const syncMaster = () => setMasterName(localStorage.getItem('mbautolab_master'));
    syncMaster();

    const interval = setInterval(syncMaster, 800);
    const onStorage = () => syncMaster();
    window.addEventListener('storage', onStorage);

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mbautolab_theme', next);
  };

  const handleLogout = () => {
    localStorage.removeItem('mbautolab_master');
    setMasterName(null);
    router.push('/');
  };

  return (
    <header
      className="navbar"
      style={{
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <svg className="nav-logo-svg" viewBox="0 0 480 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <polygon points="0,80 22,8 38,8 16,80" fill="#00a2e8" />
            <polygon points="28,80 50,8 66,8 44,80" fill="#003a94" />
            <polygon points="56,80 78,8 94,8 72,80" fill="#e51b24" />
            <line x1="106" y1="8" x2="106" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <text x="118" y="62" fontFamily="'Space Grotesk', sans-serif" fontWeight="800" fontSize="58" letterSpacing="-2">MB</text>
            <text x="230" y="62" fontFamily="'Space Grotesk', sans-serif" fontWeight="300" fontSize="58" letterSpacing="-2" opacity="0.6">AUTO</text>
            <text x="380" y="62" fontFamily="'Space Grotesk', sans-serif" fontWeight="800" fontSize="58" letterSpacing="-2" fill="#00a2e8">LAB</text>
            <text x="118" y="84" fontFamily="'Outfit', sans-serif" fontWeight="400" fontSize="13" letterSpacing="3.5" opacity="0.4">AKILLI SERVİS TAKİP</text>
          </svg>
        </Link>

        {/* Right Controls */}
        <div className="nav-controls">
          {/* Theme Toggle */}
          <button className="ctrl-btn" onClick={toggleTheme} title="Temayı Değiştir" aria-label="Tema">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            >
              {theme === 'dark'
                ? <Sun size={17} strokeWidth={2.2} color="#f59e0b" />
                : <Moon size={17} strokeWidth={2.2} color="#3b82f6" />}
            </motion.div>
          </button>

          {/* Randevu Al — her zaman görünür */}
          <button
            className="btn btn-sm btn-accent"
            onClick={() => router.push('/randevu')}
            style={{ gap: 6 }}
          >
            <CalendarDays size={15} />
            <span style={{ fontSize: '0.82rem' }}>Randevu Al</span>
          </button>

          {/* Usta giriş yaptıysa sadece adını + çıkış göster — panel linki YOK */}
          <AnimatePresence>
            {masterName && (
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px',
                  background: 'rgba(0,162,232,0.08)',
                  border: '1px solid rgba(0,162,232,0.2)',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--blue)',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={12} color="#fff" />
                  </div>
                  {masterName} Usta
                </div>
                <button
                  onClick={handleLogout}
                  title="Çıkış Yap"
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(229,27,36,0.08)',
                    border: '1px solid rgba(229,27,36,0.2)',
                    color: 'var(--red)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <LogOut size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
