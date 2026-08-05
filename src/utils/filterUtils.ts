import { Restaurant, FilterState } from '../types';
import { normalizeCuisine, getVenueCuisineSlugs } from '../data/cuisines';

export function normalizeSearchText(input: any): string {
  if (input === null || input === undefined) return '';
  if (Array.isArray(input)) {
    return input.map(normalizeSearchText).join(' ');
  }
  if (typeof input === 'object') {
    return Object.values(input).map(normalizeSearchText).join(' ');
  }
  return String(input)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\w\u0400-\u04FF\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const DEFAULT_FILTER_STATE: FilterState = {
  city: 'Минск',
  district: '',
  query: '',
  date: '',
  time: '',
  guests: 2,
  primaryType: 'all',
  subBarType: 'all',
  quickCategory: 'all',
  types: [],
  cuisines: [],
  checkRanges: [],
  features: [],
  amenities: [],
  foodOptions: [],
  entertainment: [],
  specialMenu: [],
  smokingPolicy: 'any',
  smoking: 'any',
  seatingPreferences: [],
  reservationMode: 'all',
  openNow: false,
  lateWorking: false,
  reservable: false,
};

export function filterRestaurants(restaurants: Restaurant[], filters?: FilterState): Restaurant[] {
  const f = filters || DEFAULT_FILTER_STATE;
  return restaurants.filter((r) => {
    // 0. Primary Category Filter (Categories-first search)
    if (f.primaryType && f.primaryType !== 'all') {
      const targetType = f.primaryType;
      if (targetType === 'restaurant') {
        // Enforce strict Restaurant catalog: exclude bar, sports_bar, hookah_lounge, gastrobar, wine_bar
        const isBarType = ['bar', 'sports_bar', 'hookah_lounge', 'gastrobar', 'wine_bar'].includes(r.primaryType);
        if (isBarType) return false;
      } else if (targetType === 'bar') {
        // Enforce strict Bar catalog
        const isBarCategory = ['bar', 'sports_bar', 'hookah_lounge', 'gastrobar', 'wine_bar'].includes(r.primaryType);
        if (!isBarCategory) return false;

        if (f.subBarType && f.subBarType !== 'all') {
          if (f.subBarType === 'wine_bar') {
            const isWineBar = r.primaryType === 'wine_bar' || 
                              r.tags.some(t => /винн/i.test(t)) || 
                              r.cuisine.some(c => /винн/i.test(c));
            if (!isWineBar) return false;
          } else if (r.primaryType !== f.subBarType) {
            return false;
          }
        }
      } else if (targetType === 'sports_bar') {
        if (r.primaryType !== 'sports_bar') return false;
      } else if (targetType === 'hookah_lounge') {
        if (r.primaryType !== 'hookah_lounge') return false;
      } else {
        if (r.primaryType !== targetType) return false;
      }
    }

    // 0b. Quick Restaurant Categories Filter (Завтраки, Для свидания, Семейные, Панорамные, С террасой)
    if (f.quickCategory && f.quickCategory !== 'all') {
      if (f.quickCategory === 'breakfast') {
        const hasBreakfast = r.tags.some(t => /завтрак/i.test(t)) || 
                             r.features?.some(ft => /завтрак/i.test(ft)) ||
                             r.menu?.some(m => /завтрак/i.test(m.categoryName));
        if (!hasBreakfast) return false;
      } else if (f.quickCategory === 'date-night') {
        const hasDateNight = r.tags.some(t => /свидан|романтик/i.test(t)) ||
                             r.features?.some(ft => /свидан|романтик/i.test(ft));
        if (!hasDateNight) return false;
      } else if (f.quickCategory === 'family') {
        const hasFamily = r.tags.some(t => /детск|семейн/i.test(t)) ||
                          r.features?.some(ft => /детск|семейн/i.test(ft));
        if (!hasFamily) return false;
      } else if (f.quickCategory === 'panoramic-view') {
        const hasPan = r.tags.some(t => /панорам|вид/i.test(t)) ||
                       r.features?.some(ft => /панорам|вид/i.test(ft));
        if (!hasPan) return false;
      } else if (f.quickCategory === 'terrace') {
        const hasTerrace = r.tags.some(t => /террас/i.test(t)) ||
                           r.features?.some(ft => /террас/i.test(ft));
        if (!hasTerrace) return false;
      }
    }

    // 1. City check
    if (f.city && r.city && r.city.toLowerCase() !== f.city.toLowerCase()) {
      return false;
    }

    // 2. District check
    if (f.district && r.district) {
      if (!r.district.toLowerCase().includes(f.district.toLowerCase())) {
        return false;
      }
    }

    // 3. Smart Normalized Search query check
    if (f.query && f.query.trim().length > 0) {
      const qNorm = normalizeSearchText(f.query);
      if (qNorm) {
        const searchableText = normalizeSearchText([
          r.name,
          r.tagline,
          r.description,
          r.type,
          r.primaryType,
          r.primaryCuisine,
          r.cuisine,
          r.tags,
          r.address,
          r.district,
          r.city,
          r.features,
          r.menu,
        ]);

        const qWords = qNorm.split(' ').filter(Boolean);
        const matchesAllWords = qWords.every(word => searchableText.includes(word));
        if (!matchesAllWords) return false;
      }
    }

    // 3b. Seating & Table Filter ("Посадка и стол")
    if (filters && filters.seatingPreferences && filters.seatingPreferences.length > 0) {
      const rOptions = r.seatingOptions || [];
      const matchesSeating = filters.seatingPreferences.some(pref => {
        const pLower = pref.toLowerCase();
        return rOptions.some(opt => opt.toLowerCase().includes(pLower) || pLower.includes(opt.toLowerCase())) ||
               r.tags.some(t => t.toLowerCase().includes(pLower));
      });
      if (!matchesSeating) return false;
    }

    // 4. Type of institution check (OR logic within types)
    if (f.types && f.types.length > 0) {
      const matchesType = f.types.some(t => {
        const lowerT = t.toLowerCase();
        if (r.type && r.type.toLowerCase().includes(lowerT)) return true;
        if (r.cuisine.some(c => c.toLowerCase().includes(lowerT))) return true;
        if (r.tags.some(tag => tag.toLowerCase().includes(lowerT))) return true;
        if (lowerT.includes('стейк') && (r.name.toLowerCase().includes('стейк') || r.cuisine.some(c => c.toLowerCase().includes('стейк')))) return true;
        return false;
      });
      if (!matchesType) return false;
    }

    // 5. Cuisines check using normalizeCuisine
    if (f.cuisines && f.cuisines.length > 0) {
      const matchesCuisine = f.cuisines.some(selectedCuisineInput => {
        const selectedSlug = normalizeCuisine(selectedCuisineInput);
        const venueSlugs = getVenueCuisineSlugs(r);
        
        if (selectedSlug && venueSlugs.includes(selectedSlug)) return true;
        
        const selLower = (selectedCuisineInput || '').toLowerCase();
        const rawVenueCuisines = [r.primaryCuisine, ...(r.cuisine || [])].filter(Boolean) as string[];
        return rawVenueCuisines.some(vc => {
          const vcLower = vc.toLowerCase();
          return vcLower.includes(selLower) || selLower.includes(vcLower);
        });
      });
      if (!matchesCuisine) return false;
    }

    // 6. Average check ranges (OR logic within ranges)
    if (f.checkRanges && f.checkRanges.length > 0) {
      const avg = r.averageCheck;
      const matchesRange = f.checkRanges.some(range => {
        if (range === 'under-30') return avg <= 30;
        if (range === '30-50') return avg >= 30 && avg <= 50;
        if (range === '50-80') return avg >= 50 && avg <= 80;
        if (range === 'above-80') return avg >= 80;
        return false;
      });
      if (!matchesRange) return false;
    }

    // 7. Features (AND logic across selected features)
    if (filters && filters.features && filters.features.length > 0) {
      const allFeaturesMatch = filters.features.every(feature => {
        const featLower = feature.toLowerCase();
        
        if (featLower.includes('открыто')) {
          return r.isOpen;
        }
        if (featLower.includes('террас')) {
          return r.tags.some(t => t.toLowerCase().includes('террас'));
        }
        if (featLower.includes('панорам') || featLower.includes('вид')) {
          return r.tags.some(t => t.toLowerCase().includes('вид') || t.toLowerCase().includes('панорам')) || r.collections.includes('scenic_view');
        }
        if (featLower.includes('животн') || featLower.includes('pet')) {
          return r.tags.some(t => t.toLowerCase().includes('животн'));
        }
        if (featLower.includes('детей') || featLower.includes('детск')) {
          return r.tags.some(t => t.toLowerCase().includes('детск') || t.toLowerCase().includes('комнат') || t.toLowerCase().includes('детей'));
        }
        if (featLower.includes('компани') || featLower.includes('банкет')) {
          return r.tags.some(t => t.toLowerCase().includes('компани') || t.toLowerCase().includes('банкет'));
        }
        if (featLower.includes('завтрак')) {
          return r.cuisine.some(c => c.toLowerCase().includes('завтрак')) || r.tags.some(t => t.toLowerCase().includes('завтрак'));
        }
        if (featLower.includes('свидани') || featLower.includes('романти')) {
          return r.collections.includes('romantic') || r.tags.some(t => t.toLowerCase().includes('свидан') || t.toLowerCase().includes('романтик'));
        }

        // Generic tag match
        return r.tags.some(t => t.toLowerCase().includes(featLower) || featLower.includes(t.toLowerCase()));
      });

      if (!allFeaturesMatch) return false;
    }

    // 8. Amenities (Удобства) (AND logic across selected amenities)
    const activeAmenities = filters.amenities || [];
    if (activeAmenities.length > 0) {
      const allAmenitiesMatch = activeAmenities.every(amenity => {
        const itemLower = amenity.toLowerCase();
        if (itemLower.includes('парковк')) {
          return r.tags.some(t => t.toLowerCase().includes('парковк'));
        }
        if (itemLower.includes('wi-fi') || itemLower.includes('wifi')) {
          return r.tags.some(t => t.toLowerCase().includes('wi-fi') || t.toLowerCase().includes('wifi') || t.toLowerCase().includes('интернет'));
        }
        if (itemLower.includes('кондиционер')) {
          return r.tags.some(t => t.toLowerCase().includes('кондиционер') || t.toLowerCase().includes('климат'));
        }
        if (itemLower.includes('безбарьерн')) {
          return r.tags.some(t => t.toLowerCase().includes('безбарьерн') || t.toLowerCase().includes('пандус') || t.toLowerCase().includes('инвалид') || t.toLowerCase().includes('доступн'));
        }
        return r.tags.some(t => t.toLowerCase().includes(itemLower));
      });

      if (!allAmenitiesMatch) return false;
    }

    // 9. Food & Drinks (Еда и напитки) (AND logic across options)
    const activeFood = filters.foodOptions || filters.specialMenu || [];
    if (activeFood.length > 0) {
      const allFoodMatch = activeFood.every(item => {
        const itemLower = item.toLowerCase();
        if (itemLower === 'бар' || itemLower.includes('барна') || itemLower.includes('коктейл')) {
          return r.cuisine.some(c => c.toLowerCase().includes('бар') || c.toLowerCase().includes('коктейл') || c.toLowerCase().includes('винн')) ||
                 r.tags.some(t => t.toLowerCase().includes('бар') || t.toLowerCase().includes('коктейл') || t.toLowerCase().includes('винн')) ||
                 r.type?.toLowerCase().includes('бар');
        }
        if (itemLower.includes('вегетариан')) {
          return r.cuisine.some(c => c.toLowerCase().includes('вегетар')) ||
                 r.tags.some(t => t.toLowerCase().includes('вегетар')) ||
                 r.menu.some(cat => cat.dishes.some(d => d.name.toLowerCase().includes('вегетар') || d.description.toLowerCase().includes('вегетар')));
        }
        if (itemLower.includes('веган')) {
          return r.cuisine.some(c => c.toLowerCase().includes('веган')) ||
                 r.tags.some(t => t.toLowerCase().includes('веган')) ||
                 r.menu.some(cat => cat.dishes.some(d => d.name.toLowerCase().includes('веган') || d.description.toLowerCase().includes('веган')));
        }
        if (itemLower.includes('детск')) {
          return r.tags.some(t => t.toLowerCase().includes('детск')) ||
                 r.menu.some(cat => cat.categoryName.toLowerCase().includes('детск'));
        }
        return true;
      });

      if (!allFoodMatch) return false;
    }

    // 10. Entertainment (Развлечения) (AND logic across selected options)
    const activeEntertainment = filters.entertainment || [];
    if (activeEntertainment.length > 0) {
      const allEntMatch = activeEntertainment.every(item => {
        const itemLower = item.toLowerCase();
        if (itemLower.includes('музык')) {
          return r.tags.some(t => t.toLowerCase().includes('музык') || t.toLowerCase().includes('живая'));
        }
        if (itemLower.includes('танцпол') || itemLower.includes('танц')) {
          return r.tags.some(t => t.toLowerCase().includes('танцпол') || t.toLowerCase().includes('танц') || t.toLowerCase().includes('диско'));
        }
        return r.tags.some(t => t.toLowerCase().includes(itemLower));
      });

      if (!allEntMatch) return false;
    }

    // 11. Smoking policy
    const activeSmoking = filters.smokingPolicy || filters.smoking || 'any';
    if (activeSmoking !== 'any') {
      const tagsLower = r.tags.map(t => t.toLowerCase());
      const hasSmokingZone = tagsLower.some(t => t.includes('зона для курения') || t.includes('курить') || t.includes('кальян'));
      const hasSmokingAllowed = tagsLower.some(t => t.includes('курение разрешено') || t.includes('курить'));

      if (activeSmoking === 'non-smoking' && (hasSmokingZone || hasSmokingAllowed)) {
        return false;
      }
      if (activeSmoking === 'smoking-zone' && !hasSmokingZone) {
        return false;
      }
      if (activeSmoking === 'smoking-allowed' && !hasSmokingAllowed) {
        return false;
      }
    }

    // 12. Party size check (guests)
    if (filters.guests) {
      const maxParty = r.maxPartySize || 12;
      const minParty = r.minPartySize || 1;
      if (filters.guests < minParty || filters.guests > maxParty) {
        return false;
      }
    }

    // 13. Booking / Reservation Mode check
    if (filters.reservationMode && filters.reservationMode !== 'all') {
      const rMode = r.reservationMode || (r.isReservable ? 'instant' : 'unavailable');
      if (filters.reservationMode === 'online') {
        if (!r.isReservable || rMode === 'unavailable') return false;
      } else if (filters.reservationMode === 'instant') {
        if (rMode !== 'instant') return false;
      } else if (filters.reservationMode === 'request') {
        if (rMode !== 'request') return false;
      }
    }

    // 14. Open Now check
    if (filters.openNow && !r.isOpen) {
      return false;
    }

    // 15. Late Working check
    if (filters.lateWorking && !r.isLateWorking) {
      return false;
    }

    // 16. Reservable check
    if (filters.reservable && (!r.isReservable || r.reservationMode === 'unavailable')) {
      return false;
    }

    return true;
  });
}

export function getActiveFiltersCount(filters: FilterState): number {
  let count = 0;
  if (filters.primaryType && filters.primaryType !== 'all') count++;
  if (filters.district) count++;
  if (filters.date) count++;
  if (filters.time) count++;
  if (filters.guests && filters.guests !== 2) count++;
  count += filters?.types ? filters.types.length : 0;
  count += filters?.cuisines ? filters.cuisines.length : 0;
  count += filters?.checkRanges ? filters.checkRanges.length : 0;
  count += filters?.features ? filters.features.length : 0;
  if (filters.seatingPreferences && filters.seatingPreferences.length > 0) count += filters.seatingPreferences.length;
  if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
  const foodOpts = filters.foodOptions || filters.specialMenu || [];
  if (foodOpts.length > 0) count += foodOpts.length;
  if (filters.entertainment && filters.entertainment.length > 0) count += filters.entertainment.length;
  const smokingVal = filters.smokingPolicy || filters.smoking || 'any';
  if (smokingVal !== 'any') count++;
  if (filters.reservationMode && filters.reservationMode !== 'all') count++;
  if (filters.openNow) count++;
  if (filters.lateWorking) count++;
  if (filters.reservable) count++;
  return count;
}

export function parseFiltersFromUrl(params: URLSearchParams, defaultCity = 'Минск'): FilterState {
  const guestsNum = parseInt(params.get('guests') || '2', 10);
  const validGuests = isNaN(guestsNum) || guestsNum < 1 ? 2 : guestsNum;

  const foodOpts = params.get('food') ? params.get('food')!.split(',').filter(Boolean) : (params.get('special') ? params.get('special')!.split(',').filter(Boolean) : []);
  const smokingVal = (params.get('smoking') as any) || 'any';

  const subBarVal = params.get('type') || params.get('subBarType') || 'all';
  const quickCatVal = params.get('category') || params.get('quickCategory') || 'all';

  return {
    city: params.get('city') || defaultCity,
    district: params.get('district') || '',
    query: params.get('q') || '',
    date: params.get('date') || '',
    time: params.get('time') || '',
    guests: validGuests,
    primaryType: (params.get('primaryType') as any) || 'all',
    subBarType: subBarVal as any,
    quickCategory: quickCatVal as any,
    types: params.get('types') ? params.get('types')!.split(',').filter(Boolean) : [],
    cuisines: params.get('cuisines') ? params.get('cuisines')!.split(',').filter(Boolean) : [],
    checkRanges: params.get('check') ? params.get('check')!.split(',').filter(Boolean) : [],
    features: params.get('features') ? params.get('features')!.split(',').filter(Boolean) : [],
    amenities: params.get('amenities') ? params.get('amenities')!.split(',').filter(Boolean) : [],
    foodOptions: foodOpts,
    specialMenu: foodOpts,
    entertainment: params.get('entertainment') ? params.get('entertainment')!.split(',').filter(Boolean) : [],
    smokingPolicy: smokingVal,
    smoking: smokingVal,
    seatingPreferences: params.get('seating') ? params.get('seating')!.split(',').filter(Boolean) : [],
    reservationMode: (params.get('mode') as any) || 'all',
    openNow: params.get('openNow') === 'true',
    lateWorking: params.get('lateWorking') === 'true',
    reservable: params.get('reservable') === 'true',
  };
}

export function buildUrlSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.city) params.set('city', filters.city);
  if (filters.primaryType && filters.primaryType !== 'all') params.set('primaryType', filters.primaryType);
  if (filters.subBarType && filters.subBarType !== 'all') params.set('type', filters.subBarType);
  if (filters.quickCategory && filters.quickCategory !== 'all') params.set('category', filters.quickCategory);
  if (filters.district) params.set('district', filters.district);
  if (filters.query) params.set('q', filters.query);
  if (filters.date) params.set('date', filters.date);
  if (filters.time) params.set('time', filters.time);
  if (filters.guests && filters.guests !== 2) params.set('guests', filters.guests.toString());
  if (filters?.types && filters.types.length > 0) params.set('types', filters.types.join(','));
  if (filters?.cuisines && filters.cuisines.length > 0) params.set('cuisines', filters.cuisines.join(','));
  if (filters?.checkRanges && filters.checkRanges.length > 0) params.set('check', filters.checkRanges.join(','));
  if (filters?.features && filters.features.length > 0) params.set('features', filters.features.join(','));
  if (filters.seatingPreferences && filters.seatingPreferences.length > 0) params.set('seating', filters.seatingPreferences.join(','));
  if (filters.amenities && filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
  const foodOpts = filters.foodOptions || filters.specialMenu || [];
  if (foodOpts.length > 0) params.set('food', foodOpts.join(','));
  if (filters.entertainment && filters.entertainment.length > 0) params.set('entertainment', filters.entertainment.join(','));
  const smokingVal = filters.smokingPolicy || filters.smoking || 'any';
  if (smokingVal !== 'any') params.set('smoking', smokingVal);
  if (filters.reservationMode && filters.reservationMode !== 'all') params.set('mode', filters.reservationMode);
  if (filters.openNow) params.set('openNow', 'true');
  if (filters.lateWorking) params.set('lateWorking', 'true');
  if (filters.reservable) params.set('reservable', 'true');
  return params;
}

