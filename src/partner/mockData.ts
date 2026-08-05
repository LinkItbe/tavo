import { PartnerRestaurantConfig, PartnerBooking } from './types';
import { readBookings, writeBookings } from '../services/bookingRepository';

export const PARTNER_RESTAURANTS: Record<string, PartnerRestaurantConfig> = {
  'osteria-cantina': {
    restaurantId: 'osteria-cantina',
    name: 'Osteria Cantina',
    category: 'Ресторан',
    cuisine: 'Итальянская кухня',
    district: 'Центральный район',
    address: 'ул. Революционная, 14',
    averageCheck: '65 BYN',
    bookingMode: 'instant',
    bookingModeLabel: 'Мгновенное подтверждение',
    openingHours: '12:00–23:00',
    slotIntervalMinutes: 30,
    defaultVisitDurationMinutes: 120,
    tables: [
      { id: 'osteria-table-1', name: 'Стол 1', zone: 'У окна', capacity: 2 },
      { id: 'osteria-table-2', name: 'Стол 2', zone: 'Основной зал', capacity: 2 },
      { id: 'osteria-table-3', name: 'Стол 3', zone: 'Основной зал', capacity: 4 },
      { id: 'osteria-table-4', name: 'Стол 4', zone: 'Основной зал', capacity: 4 },
      { id: 'osteria-table-5', name: 'Стол 5', zone: 'Большой стол', capacity: 6 },
      { id: 'osteria-table-6', name: 'Стол 6', zone: 'Терраса', capacity: 4 },
    ],
  },
  'mornings-and-beans': {
    restaurantId: 'mornings-and-beans',
    name: 'Mornings & Beans',
    category: 'Ресторан / кафе',
    cuisine: 'Завтраки',
    district: 'Площадь Победы',
    address: 'пр-т Независимости, 37',
    averageCheck: '28 BYN',
    bookingMode: 'manual',
    bookingModeLabel: 'Подтверждение вручную',
    openingHours: '08:00–21:00',
    slotIntervalMinutes: 30,
    defaultVisitDurationMinutes: 90,
    tables: [
      { id: 'beans-table-1', name: 'Стол 1', zone: 'У окна', capacity: 2 },
      { id: 'beans-table-2', name: 'Стол 2', zone: 'У окна', capacity: 2 },
      { id: 'beans-table-3', name: 'Стол 3', zone: 'Основной зал', capacity: 2 },
      { id: 'beans-table-4', name: 'Стол 4', zone: 'Основной зал', capacity: 4 },
      { id: 'beans-table-5', name: 'Стол 5', zone: 'Общий стол', capacity: 6 },
    ],
  },
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialDemoBookings(): Record<string, PartnerBooking[]> {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  return {
    'osteria-cantina': [
      {
        id: 'demo-osteria-1',
        restaurantId: 'osteria-cantina',
        customerName: 'Анна',
        customerPhone: '+375 29 000-00-01',
        customerEmail: 'anna@example.com',
        visitDate: today,
        visitTime: '18:30',
        partySize: 2,
        tableId: 'osteria-table-1',
        tableName: 'Стол 1 · У окна',
        status: 'confirmed',
        customerNote: 'Столик подальше от входа',
        createdAt: 'Демо-бронь',
        isDemo: true,
      },
      {
        id: 'demo-osteria-2',
        restaurantId: 'osteria-cantina',
        customerName: 'Максим',
        customerPhone: '+375 29 000-00-02',
        customerEmail: 'maxim@example.com',
        visitDate: today,
        visitTime: '19:30',
        partySize: 4,
        tableId: 'osteria-table-3',
        tableName: 'Стол 3 · Основной зал',
        status: 'confirmed',
        customerNote: 'День рождения',
        createdAt: 'Демо-бронь',
        isDemo: true,
      },
      {
        id: 'demo-osteria-3',
        restaurantId: 'osteria-cantina',
        customerName: 'Елена',
        customerPhone: '+375 29 000-00-03',
        customerEmail: 'elena@example.com',
        visitDate: tomorrow,
        visitTime: '20:00',
        partySize: 6,
        tableId: 'osteria-table-5',
        tableName: 'Стол 5 · Большой стол',
        status: 'confirmed',
        customerNote: 'Без пожеланий',
        createdAt: 'Демо-бронь',
        isDemo: true,
      },
    ],
    'mornings-and-beans': [
      {
        id: 'demo-beans-1',
        restaurantId: 'mornings-and-beans',
        customerName: 'Мария',
        customerPhone: '+375 29 000-00-04',
        customerEmail: 'maria@example.com',
        visitDate: today,
        visitTime: '10:00',
        partySize: 2,
        tableId: 'beans-table-1',
        tableName: 'Стол 1 · У окна',
        status: 'pending',
        customerNote: 'Нужен детский стульчик',
        createdAt: 'Демо-бронь',
        isDemo: true,
      },
      {
        id: 'demo-beans-2',
        restaurantId: 'mornings-and-beans',
        customerName: 'Андрей',
        customerPhone: '+375 29 000-00-05',
        customerEmail: 'andrey@example.com',
        visitDate: today,
        visitTime: '11:30',
        partySize: 4,
        tableId: 'beans-table-4',
        tableName: 'Стол 4 · Основной зал',
        status: 'pending',
        customerNote: 'Без пожеланий',
        createdAt: 'Демо-бронь',
        isDemo: true,
      },
      {
        id: 'demo-beans-3',
        restaurantId: 'mornings-and-beans',
        customerName: 'Ольга',
        customerPhone: '+375 29 000-00-06',
        customerEmail: 'olga@example.com',
        visitDate: tomorrow,
        visitTime: '09:30',
        partySize: 2,
        tableId: 'beans-table-2',
        tableName: 'Стол 2 · У окна',
        status: 'confirmed',
        customerNote: 'Столик рядом с розеткой',
        createdAt: 'Демо-бронь',
        isDemo: true,
      },
    ],
  };
}

const BOOKINGS_STORAGE_KEY = 'tavoo_partner_demo_bookings_v1';
const SESSION_STORAGE_KEY = 'tavoo_demo_partner_restaurant';

export function getPartnerBookingsStore(): Record<string, PartnerBooking[]> {
  return readBookings();
}

export function savePartnerBookingsStore(data: Record<string, PartnerBooking[]>): void {
  writeBookings(data);
}

export function resetPartnerDemoData(): Record<string, PartnerBooking[]> {
  if (typeof window === 'undefined') return createInitialDemoBookings();
  const initial = createInitialDemoBookings();
  writeBookings(initial);
  return initial;
}

export function getDemoPartnerSession(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(SESSION_STORAGE_KEY);
}

export function setDemoPartnerSession(restaurantId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_STORAGE_KEY, restaurantId);
}

export function clearDemoPartnerSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}
