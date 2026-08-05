import { Reservation, ReservationStatus, Restaurant } from '../types';
import { BRAND_NAME } from '../constants/brand';
import { bookingsStore } from './bookingStore';

export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getAllReservations(): Reservation[] {
  return bookingsStore.getCachedBookings();
}

export function getUserReservations(): Reservation[] {
  return bookingsStore.getCachedBookings();
}

export function getAllStoredReservations(): Reservation[] {
  return bookingsStore.getCachedBookings();
}

export function saveReservation(data: Partial<Reservation>): Reservation {
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  const confirmationCode = `TV-${randomCode}`;
  const now = new Date().toISOString();

  const newRes: Reservation = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    accessToken: `token_${Date.now()}`,
    confirmationCode,
    reservationNumber: confirmationCode,
    venueId: data.venueId || data.restaurantId || 'rest-1',
    restaurantId: data.restaurantId || data.venueId || 'rest-1',
    venueNameSnapshot: data.venueNameSnapshot || data.restaurantName || 'Ресторан',
    restaurantName: data.restaurantName || data.venueNameSnapshot || 'Ресторан',
    venueAddressSnapshot: data.venueAddressSnapshot || data.restaurantAddress || 'Минск',
    restaurantAddress: data.restaurantAddress || data.venueAddressSnapshot || 'Минск',
    restaurantPhone: data.restaurantPhone || '+375 (29) 111-22-33',
    guestName: data.guestName || data.customerName || 'Гость',
    customerName: data.customerName || data.guestName || 'Гость',
    guestPhone: data.guestPhone || data.customerPhone || '+375 29 000-00-00',
    customerPhone: data.customerPhone || data.guestPhone || '+375 29 000-00-00',
    guestEmail: data.guestEmail || data.customerEmail || '',
    customerEmail: data.customerEmail || data.guestEmail || '',
    date: data.date || getTodayStr(),
    time: data.time || '19:00',
    partySize: data.partySize || 2,
    comment: data.comment || '',
    tableId: data.tableId,
    tableLabel: data.tableLabel,
    seatingPreference: data.seatingPreference,
    reservationMode: data.reservationMode || (data.confirmationMode as any) || 'instant',
    confirmationMode: data.confirmationMode || (data.reservationMode as any) || 'instant',
    status: data.status || 'confirmed',
    notificationStatus: { email: 'sent', telegram: 'pending' },
    createdAt: now,
    updatedAt: now,
  };

  bookingsStore.saveToken(newRes.id, newRes.accessToken!);
  return newRes;
}

export function updateReservationStatus(id: string, status: ReservationStatus): Reservation | null {
  if (status === 'cancelled') {
    bookingsStore.cancelBooking(id).catch(console.error);
  }
  const found = bookingsStore.getCachedBookings().find(r => r.id === id);
  if (found) {
    found.status = status;
    found.updatedAt = new Date().toISOString();
  }
  return found || null;
}

export function cancelReservation(id: string): Reservation | null {
  bookingsStore.cancelBooking(id).catch(console.error);
  const found = bookingsStore.getCachedBookings().find(r => r.id === id);
  return found || null;
}

export function generateAllTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 10; hour <= 22; hour++) {
    const hStr = String(hour).padStart(2, '0');
    slots.push(`${hStr}:00`);
    if (hour < 22) {
      slots.push(`${hStr}:30`);
    }
  }
  return slots;
}

export interface SlotAvailability {
  time: string;
  available: boolean;
  remainingCapacity: number;
}

export function getClosestAvailableSlots(
  restaurant: Restaurant,
  dateStr?: string,
  targetTime?: string,
  partySize: number = 2,
  count: number = 3
): string[] {
  const date = dateStr || getTodayStr();
  const slots = getRestaurantSlotAvailability(restaurant, date, partySize);
  const available = slots.filter(s => s.available).map(s => s.time);
  if (available.length > 0) return available.slice(0, count);
  return ['18:00', '19:00', '20:00'].slice(0, count);
}

export function getRestaurantSlotAvailability(
  restaurant: Restaurant,
  dateStr: string,
  partySize: number = 2
): SlotAvailability[] {
  const allSlots = generateAllTimeSlots();
  const existingReservations = bookingsStore.getCachedBookings().filter(
    r => (r.venueId === restaurant.id || r.restaurantId === restaurant.id) &&
         r.date === dateStr &&
         r.status !== 'cancelled' &&
         r.status !== 'rejected'
  );

  const capacityPerSlot = restaurant.slotCapacity || 6;
  const maxParty = restaurant.maxPartySize || 12;
  const minParty = restaurant.minPartySize || 1;

  const todayStr = getTodayStr();
  const isToday = dateStr === todayStr;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return allSlots.map(time => {
    const [h, m] = time.split(':').map(Number);
    const slotMinutes = h * 60 + m;

    if (isToday && slotMinutes <= currentMinutes + 30) {
      return { time, available: false, remainingCapacity: 0 };
    }

    if (partySize < minParty || partySize > maxParty) {
      return { time, available: false, remainingCapacity: 0 };
    }

    const reservationsAtSlot = existingReservations.filter(r => r.time === time);
    const bookedParties = reservationsAtSlot.length;
    const remainingCapacity = Math.max(0, capacityPerSlot - bookedParties);

    return {
      time,
      available: remainingCapacity > 0,
      remainingCapacity,
    };
  });
}

export function isSlotAvailable(
  restaurant: Restaurant,
  dateStr: string,
  timeStr: string,
  partySize: number = 2
): { available: boolean; reason?: string } {
  if (!restaurant.isReservable) {
    return { available: false, reason: 'Онлайн-бронирование недоступно для этого заведения.' };
  }

  const availability = getRestaurantSlotAvailability(restaurant, dateStr, partySize);
  const slot = availability.find(s => s.time === timeStr);

  if (!slot) {
    return { available: false, reason: 'Указанное время недоступно.' };
  }

  if (!slot.available) {
    if (slot.remainingCapacity === 0) {
      return { available: false, reason: 'Все столики на это время уже забронированы.' };
    }
    return { available: false, reason: 'Не удалось забронировать на указанное время.' };
  }

  return { available: true };
}

export function formatPartySizeRu(size: number): string {
  if (size === 1) return '1 гость';
  if (size >= 2 && size <= 4) return `${size} гостя`;
  return `${size} гостей`;
}

export function formatDateRu(dateStr: string): string {
  if (!dateStr) return 'Выберите дату';
  
  const today = getTodayStr();
  const tomorrow = getTomorrowStr();

  if (dateStr === today) return 'Сегодня';
  if (dateStr === tomorrow) return 'Завтра';

  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const monthsRu = [
      'янв', 'февр', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'авг', 'сент', 'окт', 'нояб', 'дек'
    ];
    const daysRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    return `${daysRu[d.getDay()]}, ${day} ${monthsRu[d.getMonth()]}`;
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTimeRu(dateStr: string, timeStr: string): string {
  if (!dateStr && !timeStr) return 'Выберите';
  const dateFormatted = formatDateRu(dateStr);
  if (!timeStr) return dateFormatted;
  return `${dateFormatted}, ${timeStr}`;
}

export function getAvailableTimeSlotsForRestaurant(restaurant: Restaurant): string[] {
  return generateAllTimeSlots();
}

export function downloadCalendarICS(reservation: Reservation) {
  const [y, m, d] = reservation.date.split('-');
  const [hh, mm] = reservation.time.split(':');
  
  const startIso = `${y}${m}${d}T${hh}${mm}00`;
  const endMin = (parseInt(hh, 10) * 60 + parseInt(mm, 10) + 90);
  const endH = String(Math.floor(endMin / 60)).padStart(2, '0');
  const endM = String(endMin % 60).padStart(2, '0');
  const endIso = `${y}${m}${d}T${endH}${endM}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${BRAND_NAME}//Table Booking//RU`,
    'BEGIN:VEVENT',
    `SUMMARY:Бронирование столика: ${reservation.venueNameSnapshot || reservation.restaurantName}`,
    `DESCRIPTION:Номер бронирования: ${reservation.confirmationCode || reservation.reservationNumber}\\nАдрес: ${reservation.venueAddressSnapshot || reservation.restaurantAddress}\\nГости: ${reservation.partySize}`,
    `LOCATION:${reservation.venueAddressSnapshot || reservation.restaurantAddress}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `tavoo-${reservation.confirmationCode || reservation.reservationNumber}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
