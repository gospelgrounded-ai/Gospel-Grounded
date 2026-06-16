import type { HistoryEntry } from '../types';

const KEY = 'gg_carousel_history';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const MAX_ENTRIES = 50;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const entries: HistoryEntry[] = JSON.parse(raw);
    const cutoff = Date.now() - MAX_AGE_MS;
    return entries.filter((e) => new Date(e.createdAt).getTime() > cutoff);
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  const existing = loadHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const updated = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
