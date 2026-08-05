import { PartnerBooking, BookingStatus, PartnerRestaurantConfig } from '../partner/types';
import { PARTNER_RESTAURANTS, createInitialDemoBookings } from '../partner/mockData';
import { Reservation, ReservationStatus } from '../types';

const STORAGE_KEY = 'tavoo_partner_demo_bookings_v1';
const GUEST_BOOKINGS_KEY = 'tavoo_user_booking_ids';

export function readBookings(): Record<string, PartnerBooking[]> {
  if (typeof window === 'undefined') {
    return createInitialDemoBookings();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialDemoBookings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      const initial = createInitialDemoBookings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch {
    const initial = createInitialDemoBookings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function writeBookings(data: Record<string, PartnerBooking[]>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('tavoo:bookings-updated'));
  } catch (e) {
    console.error('[bookingRepository] Failed to write to localStorage', e);
  }
}

export function getBookingsByRestaurant(restaurantId: string): PartnerBooking[] {
  const store = readBookings();
  return store[restaurantId] || [];
}

export function getBookingById(bookingId: string): PartnerBooking | null {
  const store = readBookings();
  for (const restId in store) {
    const found = store[restId].find((b) => b.id === bookingId);
    if (found) return found;
  }
  return null;
}

export function getSavedGuestBookingIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestBookingId(bookingId: string): void {
  if (typeof window === 'undefined') return;
  const current = getSavedGuestBookingIds();
  if (!current.includes(bookingId)) {
    const updated = [bookingId, ...current];
    localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(updated));
  }
}

function isTimeWithinOperatingHours(visitTime: string, openingHoursStr: string): boolean {
  if (!openingHoursStr) return true;
  // Opening hours format e.g. "12:00–23:00" or "08:00–21:00"
  const parts = openingHoursStr.split(/[–\-]/);
  if (parts.length !== 2) return true;

  const [openStr, closeStr] = parts.map((s) => s.trim());
  const [openH, openM] = openStr.split(':').map(Number);
  const [closeH, closeM] = closeStr.split(':').map(Number);
  const [visitH, visitM] = visitTime.split(':').map(Number);

  const openMins = openH * 60 + (openM || 0);
  const closeMins = closeH * 60 + (closeM || 0);
  const visitMins = visitH * 60 + (visitM || 0);

  if (closeMins > openMins) {
    return visitMins >= openMins && visitMins < closeMins;
  } else {
    // Overnight hours e.g. 18:00–02:00
    return visitMins >= openMins || visitMins < closeMins;
  }
}

export interface CreateBookingParams {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // HH:mm
  partySize: number;
  tableId?: string;
  tableName?: string;
  customerNote?: string;
}

export function createBooking(params: CreateBookingParams): PartnerBooking {
  const {
    restaurantId,
    customerName,
    customerPhone,
    customerEmail = '',
    visitDate,
    visitTime,
    partySize,
    tableId,
    tableName,
    customerNote = '',
  } = params;

  if (!restaurantId || !customerName.trim() || !customerPhone.trim() || !visitDate || !visitTime) {
    throw new Error('Пожалуйста, заполните все обязательные поля.');
  }

  const store = readBookings();
  const restConfig = PARTNER_RESTAURANTS[restaurantId];

  // 1. Validate working hours
  if (restConfig && restConfig.openingHours) {
    if (!isTimeWithinOperatingHours(visitTime, restConfig.openingHours)) {
      throw new Error(`Ресторан закрыт в это время. Часы работы: ${restConfig.openingHours}`);
    }
  }

  // Existing active bookings for this restaurant on this date & time
  const existingBookings = (store[restaurantId] || []).filter(
    (b) =>
      b.visitDate === visitDate &&
      b.visitTime === visitTime &&
      b.status !== 'cancelled' &&
      b.status !== 'declined' &&
      b.status !== 'no_show'
  );

  let assignedTableId = tableId || '';
  let assignedTableName = tableName || '';

  // 2. Validate selected table or auto-assign table
  if (restConfig) {
    if (assignedTableId) {
      const table = restConfig.tables.find((t) => t.id === assignedTableId);
      if (!table) {
        throw new Error('Выбранный стол не найден в схеме ресторана.');
      }
      if (table.capacity < partySize) {
        throw new Error(`Стол "${table.name}" рассчитан максимум на ${table.capacity} гостей.`);
      }
      const isAlreadyBooked = existingBookings.some((b) => b.tableId === assignedTableId);
      if (isAlreadyBooked) {
        throw new Error('К сожалению, этот стол уже забронирован на выбранное время.');
      }
      if (!assignedTableName) {
        assignedTableName = `${table.name} · ${table.zone}`;
      }
    } else {
      // Auto-assign available table with sufficient capacity
      const occupiedTableIds = existingBookings.map((b) => b.tableId);
      const availableTable = restConfig.tables.find(
        (t) => t.capacity >= partySize && !occupiedTableIds.includes(t.id)
      );

      if (availableTable) {
        assignedTableId = availableTable.id;
        assignedTableName = `${availableTable.name} · ${availableTable.zone}`;
      } else {
        // Fallback name if all specific tables are full or not configured
        assignedTableName = `Стол на ${partySize} чел.`;
      }
    }
  } else {
    if (!assignedTableName) {
      assignedTableName = `Стол на ${partySize} чел.`;
    }
  }

  // 3. Determine booking mode & status
  let bookingMode: 'instant' | 'manual' = 'instant';
  let initialStatus: BookingStatus = 'confirmed';

  if (restConfig) {
    bookingMode = restConfig.bookingMode;
    initialStatus = restConfig.bookingMode === 'instant' ? 'confirmed' : 'pending';
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const randomCodeNum = Math.floor(10000 + Math.random() * 90000);
  const bookingCode = `TV-${randomCodeNum}`;
  const newId = `tb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newBooking: PartnerBooking = {
    id: newId,
    restaurantId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail.trim(),
    visitDate,
    visitTime,
    partySize,
    tableId: assignedTableId,
    tableName: assignedTableName,
    status: initialStatus,
    customerNote: customerNote.trim(),
    createdAt: `${visitDate} ${timeStr}`,
    isDemo: false,
    bookingCode,
    bookingMode,
    source: 'Tavoo Website',
  };

  const currentRestBookings = store[restaurantId] || [];
  store[restaurantId] = [newBooking, ...currentRestBookings];
  writeBookings(store);

  // Save to guest's session storage
  saveGuestBookingId(newId);

  return newBooking;
}

export function updateBookingStatus(
  restaurantId: string,
  bookingId: string,
  newStatus: BookingStatus
): PartnerBooking | null {
  const store = readBookings();
  const restBookings = store[restaurantId];
  if (!restBookings) return null;

  const index = restBookings.findIndex((b) => b.id === bookingId);
  if (index === -1) return null;

  const updatedBooking = { ...restBookings[index], status: newStatus };
  restBookings[index] = updatedBooking;
  store[restaurantId] = restBookings;

  writeBookings(store);
  return updatedBooking;
}

export function cancelBooking(bookingId: string): PartnerBooking | null {
  const store = readBookings();
  for (const restId in store) {
    const index = store[restId].findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      const updatedBooking = { ...store[restId][index], status: 'cancelled' as BookingStatus };
      store[restId][index] = updatedBooking;
      writeBookings(store);
      return updatedBooking;
    }
  }
  return null;
}

export function getCurrentGuestBookings(): PartnerBooking[] {
  const store = readBookings();
  const savedIds = getSavedGuestBookingIds();

  const allBookings: PartnerBooking[] = [];
  for (const restId in store) {
    allBookings.push(...store[restId]);
  }

  if (savedIds.length > 0) {
    const matched = allBookings.filter((b) => savedIds.includes(b.id));
    return matched.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  // If no saved guest IDs, return all bookings created from Tavoo website or non-demo
  return allBookings
    .filter((b) => !b.isDemo || b.source === 'Tavoo Website')
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function subscribeToBookingChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = () => callback();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener('tavoo:bookings-updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('tavoo:bookings-updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function partnerBookingToReservation(pb: PartnerBooking): Reservation {
  const photo =
    pb.restaurantId === 'osteria-cantina'
      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
      : pb.restaurantId === 'mornings-and-beans'
      ? 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';

  const restaurantName =
    pb.restaurantId === 'osteria-cantina'
      ? 'Osteria Cantina'
      : pb.restaurantId === 'mornings-and-beans'
      ? 'Mornings & Beans'
      : PARTNER_RESTAURANTS[pb.restaurantId]?.name || pb.restaurantId;

  const address =
    pb.restaurantId === 'osteria-cantina'
      ? 'ул. Революционная, 14'
      : pb.restaurantId === 'mornings-and-beans'
      ? 'пр-т Независимости, 37'
      : PARTNER_RESTAURANTS[pb.restaurantId]?.address || 'Минск';

  const code = (pb as any).bookingCode || `TV-${pb.id.slice(-5)}`;
  const mode = (pb as any).bookingMode || (pb.restaurantId === 'mornings-and-beans' ? 'request' : 'instant');

  let resStatus: ReservationStatus = 'pending';
  if (pb.status === 'confirmed') resStatus = 'confirmed';
  else if (pb.status === 'cancelled') resStatus = 'cancelled';
  else if (pb.status === 'declined') resStatus = 'declined';
  else if (pb.status === 'completed') resStatus = 'completed';

  return {
    id: pb.id,
    confirmationCode: code,
    reservationNumber: code,
    venueId: pb.restaurantId,
    restaurantId: pb.restaurantId,
    venueNameSnapshot: restaurantName,
    restaurantName: restaurantName,
    venueAddressSnapshot: address,
    restaurantAddress: address,
    restaurantPhone: pb.restaurantId === 'osteria-cantina' ? '+375 (29) 612-34-56' : '+375 (29) 765-43-21',
    guestName: pb.customerName,
    customerName: pb.customerName,
    guestPhone: pb.customerPhone,
    customerPhone: pb.customerPhone,
    guestEmail: pb.customerEmail,
    customerEmail: pb.customerEmail,
    date: pb.visitDate,
    time: pb.visitTime,
    partySize: pb.partySize,
    tableId: pb.tableId,
    tableLabel: pb.tableName,
    seatingPreference: pb.tableName ? [pb.tableName] : [],
    comment: pb.customerNote,
    reservationMode: mode as any,
    confirmationMode: mode as any,
    status: resStatus,
    createdAt: pb.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    restaurantPhoto: photo,
  };
}
