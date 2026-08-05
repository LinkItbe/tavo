import { Restaurant } from '../types';

export interface NormalizedCoordinates {
  lat: number;
  lng: number;
}

export interface VenueWithCoords {
  venue: Restaurant;
  coords: NormalizedCoordinates;
}

/**
 * Normalizes and validates coordinates for a venue.
 * Returns { lat, lng } if valid, or null if invalid.
 */
export function normalizeCoordinates(venue: any): NormalizedCoordinates | null {
  if (!venue) return null;

  const rawLat = venue.lat ?? venue.latitude;
  const rawLng = venue.lng ?? venue.longitude;

  if (rawLat === undefined || rawLat === null || rawLng === undefined || rawLng === null) {
    return null;
  }

  let lat = typeof rawLat === 'number' ? rawLat : parseFloat(String(rawLat));
  let lng = typeof rawLng === 'number' ? rawLng : parseFloat(String(rawLng));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  // Detect swapped coordinates for Minsk area (Lat is ~53.8-54.0, Lng is ~27.4-27.7)
  if (lat > 20 && lat < 30 && lng > 50 && lng < 60) {
    const temp = lat;
    lat = lng;
    lng = temp;
  }

  // Latitude must be -90 to 90, Longitude -180 to 180
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  // Reject [0, 0] null island
  if (lat === 0 && lng === 0) {
    return null;
  }

  return { lat, lng };
}

/**
 * Development diagnostics for venue coordinates.
 * Logs id, name, lat, lng and checks for anomalies.
 */
export function diagnoseVenueCoordinates(venues: Restaurant[]): {
  total: number;
  validCount: number;
  invalidVenues: Restaurant[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const invalidVenues: Restaurant[] = [];
  let validCount = 0;

  if (process.env.NODE_ENV !== 'production') {
    console.groupCollapsed('[Tavoo Map Diagnostics] Checking venue coordinates...');
  }

  venues.forEach((v) => {
    const coords = normalizeCoordinates(v);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Venue [${v.id}] "${v.name}": lat=${v.lat}, lng=${v.lng} => `, coords ? `${coords.lat}, ${coords.lng}` : 'INVALID');
    }

    if (!coords) {
      invalidVenues.push(v);
      const warnMsg = `Укажите координаты для отображения на карте: [${v.id}] "${v.name}"`;
      warnings.push(warnMsg);
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Tavoo Map Warning] ${warnMsg}`);
      }
    } else {
      validCount++;
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Tavoo Map Diagnostics Summary] Total: ${venues.length}, Valid: ${validCount}, Missing/Invalid: ${invalidVenues.length}`);
    console.groupEnd();
  }

  return {
    total: venues.length,
    validCount,
    invalidVenues,
    warnings,
  };
}
