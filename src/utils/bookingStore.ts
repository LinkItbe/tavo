import { Reservation, ReservationStatus, Restaurant } from '../types';
import { 
  createBooking as repoCreateBooking, 
  cancelBooking as repoCancelBooking, 
  getCurrentGuestBookings, 
  partnerBookingToReservation,
  subscribeToBookingChanges
} from '../services/bookingRepository';

const LOCAL_TOKENS_KEY = 'tavoo_booking_tokens';
const OLD_RESERVATIONS_KEY = 'tavoo_reservations';

export interface BookingTokenPair {
  bookingId: string;
  accessToken: string;
}

type StoreListener = () => void;

class BookingsStore {
  private listeners: Set<StoreListener> = new Set();
  private cache: Reservation[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    this.syncWithServer();
    subscribeToBookingChanges(() => {
      this.syncWithServer();
    });
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getSavedTokens(): BookingTokenPair[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOCAL_TOKENS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveToken(bookingId: string, accessToken: string) {
    if (typeof window === 'undefined') return;
    const current = this.getSavedTokens();
    if (!current.some((t) => t.bookingId === bookingId)) {
      const updated = [{ bookingId, accessToken }, ...current];
      localStorage.setItem(LOCAL_TOKENS_KEY, JSON.stringify(updated));
    }
  }

  public async syncWithServer(): Promise<Reservation[]> {
    // 1. Get guest bookings from repository (localStorage single source of truth)
    const partnerBookings = getCurrentGuestBookings();
    const repoReservations = partnerBookings.map(partnerBookingToReservation);

    // 2. Combine with server / token-based bookings if API endpoint is active
    let serverReservations: Reservation[] = [];
    const tokens = this.getSavedTokens();
    const ids = tokens.map((t) => t.bookingId).filter(Boolean);

    try {
      let url = '/api/bookings';
      if (ids.length > 0) {
        url += `?ids=${encodeURIComponent(ids.join(','))}`;
      }

      const res = await fetch(url);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if ((data.success || data.ok) && Array.isArray(data.bookings)) {
          serverReservations = data.bookings;
        }
      }
    } catch (e) {
      // ignore network errors
    }

    // Merge repository reservations and server reservations, avoiding duplicates
    const combinedMap = new Map<string, Reservation>();
    for (const r of repoReservations) {
      combinedMap.set(r.id, r);
    }
    for (const r of serverReservations) {
      if (!combinedMap.has(r.id)) {
        combinedMap.set(r.id, r);
      }
    }

    // Fallback: legacy localStorage data
    try {
      const legacyRaw = localStorage.getItem(OLD_RESERVATIONS_KEY);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          for (const r of parsed) {
            if (!combinedMap.has(r.id)) combinedMap.set(r.id, r);
          }
        }
      }
    } catch {
      // ignore
    }

    this.cache = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    this.notify();
    return this.cache;
  }

  public getCachedBookings(): Reservation[] {
    return this.cache;
  }

  public async createBooking(payload: {
    venueId: string;
    date: string;
    time: string;
    partySize: number;
    tableId?: string;
    tableLabel?: string;
    seatingPreference?: string[];
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    telegramChatId?: string;
    comment?: string;
    telegramOptIn?: boolean;
  }): Promise<Reservation> {
    // 1. Create in repository (validates working hours, capacity, availability, sets status rules)
    const partnerBooking = repoCreateBooking({
      restaurantId: payload.venueId,
      customerName: payload.guestName,
      customerPhone: payload.guestPhone,
      customerEmail: payload.guestEmail,
      visitDate: payload.date,
      visitTime: payload.time,
      partySize: payload.partySize,
      tableId: payload.tableId,
      tableName: payload.tableLabel,
      customerNote: payload.comment,
    });

    const reservation = partnerBookingToReservation(partnerBooking);

    // 2. Also attempt server API call in background for telegram/email triggers if available
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.accessToken) {
          this.saveToken(reservation.id, data.accessToken);
        }
      }
    } catch {
      // ignore API failure in offline/demo mode
    }

    this.cache = [reservation, ...this.cache.filter((b) => b.id !== reservation.id)];
    this.notify();

    return reservation;
  }

  public async cancelBooking(id: string): Promise<Reservation> {
    // 1. Cancel in repository
    const repoUpdated = repoCancelBooking(id);

    // 2. Attempt server cancel if available
    const tokens = this.getSavedTokens();
    const tokenPair = tokens.find((t) => t.bookingId === id);
    try {
      await fetch(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: tokenPair?.accessToken }),
      });
    } catch {
      // ignore
    }

    let updatedReservation: Reservation;
    if (repoUpdated) {
      updatedReservation = partnerBookingToReservation(repoUpdated);
    } else {
      const found = this.cache.find((b) => b.id === id);
      updatedReservation = found
        ? { ...found, status: 'cancelled' }
        : {
            id,
            confirmationCode: id,
            reservationNumber: id,
            venueId: '',
            restaurantId: '',
            venueNameSnapshot: 'Заведение',
            restaurantName: 'Заведение',
            venueAddressSnapshot: '',
            restaurantAddress: '',
            restaurantPhone: '',
            guestName: '',
            customerName: '',
            guestPhone: '',
            customerPhone: '',
            date: '',
            time: '',
            partySize: 2,
            reservationMode: 'instant',
            confirmationMode: 'instant',
            status: 'cancelled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
    }

    this.cache = this.cache.map((b) => (b.id === id ? updatedReservation : b));
    this.notify();

    return updatedReservation;
  }

  public async checkAvailability(
    venueId: string,
    date: string,
    partySize: number = 2
  ): Promise<{
    slots: { time: string; available: boolean; remaining: number }[];
    occupiedTableIds: string[];
  }> {
    try {
      const res = await fetch(
        `/api/bookings/availability?venueId=${encodeURIComponent(
          venueId
        )}&date=${encodeURIComponent(date)}&partySize=${partySize}`
      );
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success || data.ok) {
          return {
            slots: data.slots || [],
            occupiedTableIds: data.occupiedTableIds || [],
          };
        }
      }
    } catch (e) {
      // Fallback
    }

    return { slots: [], occupiedTableIds: [] };
  }
}

export const bookingsStore = new BookingsStore();
