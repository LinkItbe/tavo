import { Restaurant, VenuePrimaryType } from '../types';
import { RESTAURANTS } from '../data/mockData';

export function normalizeVenue(rawVenue: any): Restaurant {
  const idStr = String(rawVenue.id || '');
  
  let primaryType: VenuePrimaryType = rawVenue.primaryType;
  if (!primaryType) {
    const rawType = (rawVenue.type || '').toLowerCase();
    const rawCuisine = (rawVenue.primaryCuisine || (rawVenue.cuisine || []).join(' ')).toLowerCase();

    if (rawType.includes('спорт') || rawCuisine.includes('спорт')) {
      primaryType = 'sports_bar';
    } else if (rawType.includes('кальян') || rawCuisine.includes('кальян')) {
      primaryType = 'hookah_lounge';
    } else if (rawType.includes('гастро') || rawCuisine.includes('гастро')) {
      primaryType = 'gastrobar';
    } else if (rawType.includes('бар') || rawType.includes('pub') || rawCuisine.includes('бар')) {
      primaryType = 'bar';
    } else if (rawType.includes('стейк') || rawCuisine.includes('стейк')) {
      primaryType = 'steakhouse';
    } else if (rawType.includes('кафе') || rawType.includes('кофейня')) {
      primaryType = 'cafe';
    } else if (rawType.includes('бистро')) {
      primaryType = 'bistro';
    } else {
      primaryType = 'restaurant';
    }
  }

  return {
    ...rawVenue,
    id: idStr,
    primaryType,
    city: rawVenue.city || 'Минск',
    district: rawVenue.district || '',
    type: rawVenue.type || 'Ресторан',
    cuisine: Array.isArray(rawVenue.cuisine) ? rawVenue.cuisine : [],
    primaryCuisine: rawVenue.primaryCuisine || (Array.isArray(rawVenue.cuisine) && rawVenue.cuisine[0]) || '',
    tags: Array.isArray(rawVenue.tags) ? rawVenue.tags : [],
    features: Array.isArray(rawVenue.features) ? rawVenue.features : [],
    seatingOptions: Array.isArray(rawVenue.seatingOptions) ? rawVenue.seatingOptions : [],
    menu: Array.isArray(rawVenue.menu) ? rawVenue.menu : [],
    reviews: Array.isArray(rawVenue.reviews) ? rawVenue.reviews : [],
    photos: Array.isArray(rawVenue.photos) ? rawVenue.photos : [],
    collections: Array.isArray(rawVenue.collections) ? rawVenue.collections : [],
    festivals: Array.isArray(rawVenue.festivals) ? rawVenue.festivals : [],
    isReservable: typeof rawVenue.isReservable === 'boolean' ? rawVenue.isReservable : true,
    isOpen: typeof rawVenue.isOpen === 'boolean' ? rawVenue.isOpen : true,
    rating: typeof rawVenue.rating === 'number' ? rawVenue.rating : 4.5,
    averageCheck: typeof rawVenue.averageCheck === 'number' ? rawVenue.averageCheck : 50,
  };
}

export function getAllNormalizedVenues(): Restaurant[] {
  const normalized = RESTAURANTS.map(normalizeVenue);
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Tavoo Diagnostics] Total normalized venues count:', normalized.length);
  }
  return normalized;
}
