const DEFAULT_STORAGE_KEY = 'universal-theme';

export function resolveTheme(theme, systemDark) {
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
}

export function readTheme(storageKey = DEFAULT_STORAGE_KEY, fallback = 'system') {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return ['light', 'dark', 'system'].includes(saved) ? saved : fallback;
  } catch {
    return fallback;
  }
}

export function saveTheme(theme, storageKey = DEFAULT_STORAGE_KEY) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(storageKey, theme); } catch { /* Storage may be unavailable. */ }
}

export function applyTheme(theme, target = document.documentElement) {
  if (!target) return;
  const systemDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const resolved = resolveTheme(theme, systemDark);
  target.classList.toggle('dark', resolved === 'dark');
  target.dataset.theme = resolved;
  target.style.colorScheme = resolved;
  return resolved;
}
