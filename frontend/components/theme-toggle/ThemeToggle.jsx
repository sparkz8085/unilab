'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { applyTheme, readTheme, saveTheme } from './themeManager';
import './ThemeToggle.css';

const POSITIONS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];

export default function ThemeToggle({ defaultTheme = 'system', position = 'top-right', idleTimeout = 3000, idleOpacity = 0.2, size = 'medium', onThemeChange, storageKey = 'universal-theme', showLabel = true, className = '' }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [idle, setIdle] = useState(false);
  const timer = useRef(null);
  const touchStart = useRef(null);
  const callback = useRef(onThemeChange);
  callback.current = onThemeChange;
  const safePosition = POSITIONS.includes(position) ? position : 'top-right';
  const resetIdle = useCallback(() => {
    setIdle(false);
    if (timer.current) clearTimeout(timer.current);
    if (idleTimeout > 0) timer.current = setTimeout(() => setIdle(true), idleTimeout);
  }, [idleTimeout]);

  useEffect(() => {
    const stored = readTheme(storageKey, defaultTheme);
    setTheme(stored);
    const resolved = applyTheme(stored);
    callback.current?.(stored, resolved);
    resetIdle();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [storageKey, defaultTheme, resetIdle]);

  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => { const resolved = applyTheme('system'); callback.current?.('system', resolved); };
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, [theme]);

  const choose = (next) => {
    setTheme(next);
    saveTheme(next, storageKey);
    const resolved = applyTheme(next);
    callback.current?.(next, resolved);
    resetIdle();
  };
  const cycle = () => choose(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  const swipe = (event) => {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 24) choose(delta > 0 ? 'light' : 'dark');
    touchStart.current = null;
  };
  const resolvedDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`utg-root utg-${safePosition} utg-${size} ${resolvedDark ? 'utg-dark' : 'utg-light'} ${idle ? 'utg-idle' : ''} ${className}`}
      style={{ '--utg-idle-opacity': Math.max(0.1, Math.min(0.8, idleOpacity)) }}
      onPointerEnter={resetIdle} onPointerDown={resetIdle} onFocus={resetIdle}>
      <button type="button" className="utg-control" onClick={cycle}
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={swipe}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); choose('dark'); } if (e.key === 'ArrowRight') { e.preventDefault(); choose('light'); } }}
        aria-label={`Current theme: ${theme}. Activate to cycle light, dark and system themes.`}
        title={`Theme: ${theme}`}>
        <span className={`utg-option ${!resolvedDark ? 'utg-selected' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="utg-icon"><g>{Array.from({length: 12}, (_, i) => <circle key={i} cx={12 + 8 * Math.cos(i * Math.PI / 6)} cy={12 + 8 * Math.sin(i * Math.PI / 6)} r="1" />)}<circle cx="12" cy="12" r="3" /></g></svg>
        </span>
        <span className="utg-track"><span className="utg-thumb" /></span>
        <span className={`utg-option ${resolvedDark ? 'utg-selected' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" className="utg-icon"><g>{Array.from({length: 9}, (_, i) => <circle key={i} cx={9 + (i % 3) * 2.4} cy={8 + Math.floor(i / 3) * 2.4} r=".75" />)}</g><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /></svg>
        </span>
        {showLabel && <span className="utg-label">{theme === 'system' ? 'SYSTEM' : theme.toUpperCase()}</span>}
      </button>
    </div>
  );
}
