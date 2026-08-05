import { Promotion } from '../types';
import { INITIAL_DEMO_PROMOTIONS, normalizePromotion } from './promotionUtils';

const PROMOTIONS_STORAGE_KEY = 'tavoo_promotions_v2';

export function getStoredPromotions(): Promotion[] {
  if (typeof window === 'undefined') {
    return INITIAL_DEMO_PROMOTIONS.map(normalizePromotion);
  }

  try {
    const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizePromotion);
      }
    }
  } catch (err) {
    console.error('Failed to load promotions from localStorage', err);
  }

  // Fallback to initial demo promotions
  const normalized = INITIAL_DEMO_PROMOTIONS.map(normalizePromotion);
  savePromotions(normalized);
  return normalized;
}

export function savePromotions(promotions: Promotion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(promotions));
  } catch (err) {
    console.error('Failed to save promotions to localStorage', err);
  }
}

export function saveSinglePromotion(newOrUpdated: Partial<Promotion> & { venueId: string }): Promotion {
  const all = getStoredPromotions();
  const id = newOrUpdated.id || `promo-${Date.now()}`;
  
  const normalized = normalizePromotion({
    ...newOrUpdated,
    id,
    active: newOrUpdated.active ?? true,
    reservable: newOrUpdated.reservable ?? true,
    createdAt: newOrUpdated.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const index = all.findIndex(p => p.id === id);
  let updatedList: Promotion[];

  if (index >= 0) {
    updatedList = [...all];
    updatedList[index] = normalized;
  } else {
    updatedList = [normalized, ...all];
  }

  savePromotions(updatedList);
  return normalized;
}

export function deletePromotion(id: string): void {
  const all = getStoredPromotions();
  const filtered = all.filter(p => p.id !== id);
  savePromotions(filtered);
}

export function resetPromotionsToDefault(): Promotion[] {
  const defaults = INITIAL_DEMO_PROMOTIONS.map(normalizePromotion);
  savePromotions(defaults);
  return defaults;
}
