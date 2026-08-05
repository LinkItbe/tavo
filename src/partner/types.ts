export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'declined'
  | 'cancelled'
  | 'no_show';

export type BookingMode = 'instant' | 'manual';

export interface PartnerTable {
  id: string;
  name: string;
  zone: string;
  capacity: number;
}

export interface PartnerRestaurantConfig {
  restaurantId: string;
  name: string;
  category: string;
  cuisine: string;
  district: string;
  address: string;
  averageCheck: string;
  bookingMode: BookingMode;
  bookingModeLabel: string;
  openingHours: string;
  slotIntervalMinutes: number;
  defaultVisitDurationMinutes: number;
  tables: PartnerTable[];
}

export interface PartnerBooking {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // HH:mm
  partySize: number;
  tableId: string;
  tableName: string;
  status: BookingStatus;
  customerNote: string;
  createdAt?: string;
  isDemo?: boolean;
  bookingCode?: string;
  bookingMode?: BookingMode;
  source?: string;
}
