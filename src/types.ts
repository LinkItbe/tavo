export type VenuePrimaryType =
  | 'restaurant'
  | 'bar'
  | 'sports_bar'
  | 'hookah_lounge'
  | 'gastrobar'
  | 'wine_bar'
  | 'cafe'
  | 'bistro'
  | 'steakhouse';

export interface Zone {
  id: string;
  venueId: string;
  name: string;
  type: string;
  smokingAllowed?: boolean;
  indoor?: boolean;
  terrace?: boolean;
}

export interface Table {
  id: string;
  venueId: string;
  zoneId: string;
  number: number;
  label: string;
  capacity: number;
  seatingType: string;
  active: boolean;
  x?: number;
  y?: number;
  shape?: 'rect' | 'circle';
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  weight?: string;
  photo: string;
  category: string;
  isPopular?: boolean;
  isFestivalSpecial?: boolean;
  festivalName?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  dishPhoto?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  primaryType: VenuePrimaryType; // Mandatory venue classification
  type?: string; // Human readable category label e.g. "Ресторан", "Спорт-бар", "Кальянная", "Гастробар"
  city?: string;
  cuisine: string[];
  primaryCuisine: string;
  averageCheck: number; // in BYN
  rating: number;
  reviewCount: number;
  photos: string[];
  tags: string[]; // e.g. ["Летняя терраса", "Живая музыка", "Можно с животными"]
  features?: string[]; // e.g. ["Прямые трансляции", "Кальянная зона", "Живая музыка"]
  amenities?: string[];
  seatingOptions?: string[]; // e.g. ["Обычный стол", "Стол у окна", "На террасе", "У экрана", "За барной стойкой"]
  hasSeatMap?: boolean;
  zones?: Zone[];
  tables?: Table[];
  smokingPolicy?: 'non-smoking' | 'smoking-zone' | 'smoking-allowed';
  isOpen: boolean;
  workingHours: string;
  isLateWorking?: boolean;
  isReservable?: boolean;
  reservationMode?: 'instant' | 'request' | 'unavailable';
  minPartySize?: number;
  maxPartySize?: number;
  bookingInterval?: number;
  bookingDuration?: number;
  slotCapacity?: number;
  bookingFeatures?: string[];
  address: string;
  district: string;
  phone: string;
  website?: string;
  lat: number;
  lng: number;
  isNew?: boolean;
  isEditorsPick?: boolean;
  collections: string[]; // collection IDs or slugs
  festivals?: string[];
  menu: {
    categoryName: string;
    dishes: Dish[];
  }[];
  reviews: Review[];
}

export type ReservationStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'no_show' | 'rejected';
export type ReservationMode = 'instant' | 'request' | 'unavailable';

export interface BookingNotificationStatus {
  email?: 'pending' | 'sent' | 'failed';
  telegram?: 'pending' | 'sent' | 'failed';
}

export interface Reservation {
  id: string;
  accessToken?: string;
  confirmationCode: string;
  reservationNumber: string; // Alias for confirmationCode
  venueId: string;
  restaurantId: string; // Alias for venueId
  venueNameSnapshot: string;
  restaurantName: string; // Alias for venueNameSnapshot
  venueAddressSnapshot: string;
  restaurantAddress: string; // Alias for venueAddressSnapshot
  restaurantPhone: string;
  userId?: string;
  guestName: string;
  customerName: string; // Alias for guestName
  guestPhone: string;
  customerPhone: string; // Alias for guestPhone
  guestEmail?: string;
  customerEmail?: string; // Alias for guestEmail
  telegramChatId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timezone?: string;
  partySize: number;
  tableId?: string;
  tableLabel?: string;
  seatingPreference?: string[];
  comment?: string;
  reservationMode: 'instant' | 'request';
  confirmationMode: 'instant' | 'request'; // Alias for reservationMode
  status: ReservationStatus;
  notificationStatus?: BookingNotificationStatus;
  createdAt: string;
  updatedAt: string;
  restaurantPhoto?: string;
}

export interface FilterState {
  city: string;
  district?: string;
  query: string;
  date: string; // YYYY-MM-DD or ''
  time: string; // HH:mm or ''
  guests: number; // default 2
  primaryType: VenuePrimaryType | 'all'; // First phase search: category
  subBarType?: 'all' | 'bar' | 'sports_bar' | 'hookah_lounge' | 'gastrobar' | 'wine_bar';
  quickCategory?: 'all' | 'breakfast' | 'date-night' | 'family' | 'panoramic-view' | 'terrace';
  types: string[];
  cuisines: string[];
  checkRanges: string[]; // e.g. ['under-30', '30-50', '50-80', 'above-80']
  features: string[];
  amenities?: string[];
  foodOptions?: string[];
  entertainment?: string[];
  specialMenu?: string[];
  smokingPolicy?: 'any' | 'non-smoking' | 'smoking-zone' | 'smoking-allowed';
  smoking?: 'any' | 'non-smoking' | 'smoking-zone' | 'smoking-allowed';
  seatingPreferences: string[]; // "Посадка и стол"
  reservationMode?: 'all' | 'online' | 'instant' | 'request';
  openNow: boolean;
  lateWorking: boolean;
  reservable: boolean;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  photo: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  icon: string; // Lucide icon name or emoji key
  description: string;
  coverImage: string;
  venueIds: string[];
  active: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
  // Backward compatibility aliases
  name?: string;
  subtitle?: string;
  photo?: string;
  badge?: string;
  filterTag?: string;
}

export type PromotionType =
  | 'special_menu'
  | 'festival'
  | 'discount'
  | 'brunch'
  | 'tasting'
  | 'seasonal'
  | 'event';

export interface Promotion {
  id: string;
  venueId: string;
  title: string;
  slug: string;
  type: PromotionType;
  description: string;
  shortDescription: string;
  image: string;
  tags: string[];
  cuisines: string[];
  dishes: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  price?: number;
  active: boolean;
  reservable: boolean;
  createdAt?: string;
  updatedAt?: string;
  sortOrder?: number;

  // Legacy / visual compatibility fields
  badge?: string;
  highlight?: string;
  datesText?: string;
  participatingRestaurantIds?: string[];
  // Alias for legacy Festival
  name?: string;
  tagline?: string;
  dates?: string;
  bannerUrl?: string;
  specialSetPrice?: number;
}

export interface OffersFilterState {
  query: string;
  type: PromotionType | 'all';
  venueType: VenuePrimaryType | 'all';
  cuisine: string; // 'all' or specific cuisine name
  reservable: 'all' | 'reservable' | 'instant' | 'request';
  priceRange: 'all' | 'under-30' | '30-50' | '50-80' | 'above-80';
  status: 'all' | 'active' | 'upcoming' | 'expired';
}

export interface Festival {
  id: string;
  name: string;
  tagline: string;
  dates: string;
  description: string;
  bannerUrl: string;
  specialSetPrice: number;
  participatingRestaurantIds: string[];
  badge: string;
  highlight: string;
  venueId?: string;
  title?: string;
  slug?: string;
  type?: PromotionType;
  shortDescription?: string;
  image?: string;
  tags?: string[];
  cuisines?: string[];
  dishes?: string[];
  startDate?: string;
  endDate?: string;
  price?: number;
  active?: boolean;
  reservable?: boolean;
}

export type ActiveTab =
  | 'home'
  | 'restaurants'
  | 'bars'
  | 'festivals'
  | 'collections'
  | 'map'
  | 'about'
  | 'favorites'
  | 'my-bookings'
  | 'admin-bookings';
