import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Restaurant } from '../types';
import { getAllNormalizedVenues } from './data';

export const STORAGE_KEY = 'tavoo:savedVenueIds:v1';
export const MIGRATION_KEY = 'tavoo:savedMigration:v1';
export const LEGACY_SAVED_KEYS = [
  'savedRestaurants',
  'savedVenueIds',
  'tavoo_saved',
  'tavoo_saved_venues',
  'restaweek_saved',
  'restaweek_saved_venues',
  'tavoo_favorites',
  'restaweek_favorites',
];

/**
 * Centralized function to normalize unknown inputs into a deduplicated string array of IDs.
 * Preserves order of first appearance, converts number IDs to string, removes falsy/empty items,
 * and canonicalizes pure numeric IDs (e.g. '1' -> 'rest-1').
 */
export function normalizeSavedIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    if (item === null || item === undefined) continue;

    let str = String(item).trim();
    if (!str) continue;

    // Canonicalize pure numeric IDs to 'rest-N' format if venue IDs in catalog use 'rest-N'
    if (/^\d+$/.test(str)) {
      str = `rest-${str}`;
    }

    if (!seen.has(str)) {
      seen.add(str);
      result.push(str);
    }
  }

  return result;
}

/**
 * Performs a one-time migration from legacy localStorage keys to tavoo:savedVenueIds:v1.
 * Cleans up legacy keys upon completion and records the migration marker.
 */
export function migrateLegacyKeysOnce(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const migrationDone = localStorage.getItem(MIGRATION_KEY);

    if (migrationDone === 'done') {
      const rawPrimary = localStorage.getItem(STORAGE_KEY);
      return rawPrimary ? normalizeSavedIds(JSON.parse(rawPrimary)) : [];
    }

    const collected: unknown[] = [];

    // Read primary key if present
    const primaryRaw = localStorage.getItem(STORAGE_KEY);
    if (primaryRaw) {
      try {
        const parsed = JSON.parse(primaryRaw);
        if (Array.isArray(parsed)) collected.push(...parsed);
      } catch {}
    }

    // Read legacy keys
    for (const key of LEGACY_SAVED_KEYS) {
      const legacyRaw = localStorage.getItem(key);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed)) {
            collected.push(...parsed);
          } else if (typeof parsed === 'string' || typeof parsed === 'number') {
            collected.push(parsed);
          }
        } catch {
          if (typeof legacyRaw === 'string') {
            legacyRaw.split(',').forEach((s) => collected.push(s));
          }
        }
      }
    }

    const normalized = normalizeSavedIds(collected);

    // Save normalized primary key & migration marker
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    localStorage.setItem(MIGRATION_KEY, 'done');

    // Remove legacy keys
    for (const key of LEGACY_SAVED_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }

    return normalized;
  } catch (err) {
    console.error('[Tavoo SavedVenuesStore] Migration error:', err);
    return [];
  }
}

/**
 * Standalone helper to check if a venue is saved.
 */
export function isVenueSaved(venueId: string | number, savedIds: string[]): boolean {
  if (venueId === null || venueId === undefined) return false;
  let str = String(venueId).trim();
  if (!str) return false;
  if (/^\d+$/.test(str)) {
    str = `rest-${str}`;
  }
  return savedIds.includes(str);
}

/**
 * Backward-compatible getter.
 */
export function getSavedVenueIds(): string[] {
  if (typeof window === 'undefined') return [];
  return migrateLegacyKeysOnce();
}

/**
 * Backward-compatible setter.
 */
export function saveVenueIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = normalizeSavedIds(ids);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (err) {
    console.error('[Tavoo SavedVenuesStore] Error writing saved venues:', err);
  }
}

/**
 * Backward-compatible toggle helper.
 */
export function toggleSavedVenueId(
  venueId: string | number,
  currentSavedIds: string[]
): { nextSavedIds: string[]; isSavedNow: boolean } {
  if (venueId === null || venueId === undefined) {
    return { nextSavedIds: currentSavedIds, isSavedNow: false };
  }

  let str = String(venueId).trim();
  if (!str) return { nextSavedIds: currentSavedIds, isSavedNow: false };
  if (/^\d+$/.test(str)) str = `rest-${str}`;

  const normalized = normalizeSavedIds(currentSavedIds);
  const alreadySaved = normalized.includes(str);

  const nextSavedIds = alreadySaved
    ? normalized.filter((id) => id !== str)
    : [...normalized, str];

  saveVenueIds(nextSavedIds);

  return { nextSavedIds, isSavedNow: !alreadySaved };
}

// ==========================================
// REACT CONTEXT & STORE IMPLEMENTATION
// ==========================================

interface SavedVenuesContextType {
  savedVenueIds: string[];
  isHydrated: boolean;
  toggleSavedVenue: (venueId: string | number) => boolean;
  isSaved: (venueId: string | number) => boolean;
  savedVenuesCount: number;
  resolvedSavedVenues: Restaurant[];
}

const SavedVenuesContext = createContext<SavedVenuesContextType | null>(null);

export const SavedVenuesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedVenueIds, setSavedVenueIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load venue catalog once
  const ALL_VENUES = useMemo(() => getAllNormalizedVenues(), []);

  // Hydration Effect: runs ONCE on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. One-time migration of legacy keys
    const migrated = migrateLegacyKeysOnce();

    // 2. Read primary key safely
    let finalIds = migrated;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        finalIds = normalizeSavedIds(JSON.parse(raw));
      } catch {
        finalIds = [];
      }
    }

    // 3. Deduplicate and clean IDs
    const normalized = normalizeSavedIds(finalIds);

    // REPLACE state with clean normalized array
    setSavedVenueIds(normalized);
    setIsHydrated(true);
  }, []);

  // Sync Effect: writes to localStorage ONLY after hydration finishes
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const normalized = normalizeSavedIds(savedVenueIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (err) {
      console.error('[Tavoo SavedVenuesStore] Error saving to localStorage:', err);
    }
  }, [savedVenueIds, isHydrated]);

  // Multi-tab Sync Effect: listens for storage events from other tabs
  useEffect(() => {
    if (!isHydrated) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;

      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        setSavedVenueIds(normalizeSavedIds(parsed));
      } catch {
        setSavedVenueIds([]);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [isHydrated]);

  // Toggle venue saved state
  const toggleSavedVenue = useCallback((venueId: string | number): boolean => {
    if (venueId === null || venueId === undefined) return false;

    let str = String(venueId).trim();
    if (!str) return false;
    if (/^\d+$/.test(str)) {
      str = `rest-${str}`;
    }

    const normalizedId = str;
    let isNowSaved = false;

    setSavedVenueIds((prev) => {
      const normalized = normalizeSavedIds(prev);

      if (normalized.includes(normalizedId)) {
        isNowSaved = false;
        return normalized.filter((id) => id !== normalizedId);
      } else {
        isNowSaved = true;
        return [...normalized, normalizedId];
      }
    });

    return isNowSaved;
  }, []);

  // Check if venue is saved
  const isSaved = useCallback((venueId: string | number): boolean => {
    return isVenueSaved(venueId, savedVenueIds);
  }, [savedVenueIds]);

  // Map unique saved IDs to actual venue objects from catalog
  const resolvedSavedVenues = useMemo(() => {
    const uniqueIds = normalizeSavedIds(savedVenueIds);
    const venuesMap = new Map(ALL_VENUES.map((v) => [String(v.id), v]));

    return uniqueIds
      .map((id) => venuesMap.get(id))
      .filter((venue): venue is Restaurant => Boolean(venue));
  }, [savedVenueIds, ALL_VENUES]);

  const savedVenuesCount = resolvedSavedVenues.length;

  const value = useMemo(
    () => ({
      savedVenueIds,
      isHydrated,
      toggleSavedVenue,
      isSaved,
      savedVenuesCount,
      resolvedSavedVenues,
    }),
    [savedVenueIds, isHydrated, toggleSavedVenue, isSaved, savedVenuesCount, resolvedSavedVenues]
  );

  return <SavedVenuesContext.Provider value={value}>{children}</SavedVenuesContext.Provider>;
};

export function useSavedVenues(): SavedVenuesContextType {
  const context = useContext(SavedVenuesContext);
  if (!context) {
    throw new Error('useSavedVenues must be used within a SavedVenuesProvider');
  }
  return context;
}
