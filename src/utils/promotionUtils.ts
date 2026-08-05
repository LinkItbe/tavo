import { Promotion, PromotionType, OffersFilterState, Restaurant } from '../types';
import { FESTIVALS } from '../data/mockData';
import { getAllNormalizedVenues } from './data';

export const DEFAULT_OFFERS_FILTERS: OffersFilterState = {
  query: '',
  type: 'all',
  venueType: 'all',
  cuisine: 'all',
  reservable: 'all',
  priceRange: 'all',
  status: 'all',
};

// Initial restored demo promotions linked to real venues in the system
export const INITIAL_DEMO_PROMOTIONS: any[] = [
  {
    id: 'restaurant-week',
    venueId: 'rest-1', // Osteria Cantina
    restaurantId: 'rest-1',
    participatingRestaurantIds: ['rest-1', 'rest-3', 'rest-5', 'rest-7'],
    title: 'Неделя ресторанов Минска 2026',
    name: 'Неделя ресторанов Минска 2026',
    slug: 'minsk-restaurant-week-2026',
    type: 'special_menu',
    tagline: 'Главное гастрономическое событие сезона',
    description: 'Более 30 лучших ресторанов города представляют эксклюзивные дегустационные сеты из 4 блюд по фиксированной цене 55 BYN.',
    shortDescription: 'Эксклюзивный специальный сет из 4 авторских блюд.',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    tags: ['Специальный сет', 'Дегустационный сет', 'Спецсет 55 BYN'],
    cuisines: ['Итальянская', 'Европейская', 'Авторская'],
    dishes: ['Тартар из говядины', 'Римская пицца', 'Ньокки с трюфелем', 'Тирамису'],
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    dates: '1 — 31 Августа 2026',
    price: 55,
    specialSetPrice: 55,
    active: true,
    reservable: true,
    badge: 'Спецпредложение',
    highlight: 'Спецсет 55 BYN',
  },
  {
    id: 'zavtrako-fest',
    venueId: 'rest-2', // Bistro Breakfast & Co
    restaurantId: 'rest-2',
    participatingRestaurantIds: ['rest-2', 'rest-4', 'rest-6'],
    title: 'Спешл Завтраки & Игристое',
    name: 'Спешл Завтраки & Игристое',
    slug: 'breakfast-special-set',
    type: 'brunch',
    tagline: 'Идеальное утро в лучших заведениях города',
    description: 'Марафон утренних сетов: пышные сырники, драники с лососем, драфтовый фильтр-кофе и бокал игристого к каждому сету.',
    shortDescription: 'Пышные сырники, драники с лососем и бокал игристого.',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
    tags: ['Завтраки', 'Утренний сет', 'Игристое', 'Сырники'],
    cuisines: ['Завтраки', 'Европейская', 'Кофейни'],
    dishes: ['Сырники с ванильным кремом', 'Драники с лососем', 'Фильтр-кофе', 'Игристое'],
    startDate: '2026-08-01',
    endDate: '2026-09-14',
    dates: '1 Августа — 14 Сентября 2026',
    price: 28,
    specialSetPrice: 28,
    active: true,
    reservable: true,
    badge: 'Утренний сет',
    highlight: 'Завтраки + Игристое',
  },
  {
    id: 'burger-fest',
    venueId: 'rest-8', // Burger Crafters Bar
    restaurantId: 'rest-8',
    participatingRestaurantIds: ['rest-8', 'rest-3', 'rest-9'],
    title: 'Крафт & Бургер Спешл',
    name: 'Крафт & Бургер Спешл',
    slug: 'burger-special-menu',
    type: 'special_menu',
    tagline: 'Битва лучших крафтовых бургеров',
    description: 'Шефы представляют крафтовые бургеры с выдержанной говядиной, бриошью на закваске, хрустящим бататом и авторскими соусами.',
    shortDescription: 'Бургер с выдержанной говядиной, картофель батат и соус.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    tags: ['Бургер Сет', 'Крафт', 'Бургер + Батат', 'Бургеры'],
    cuisines: ['Американская', 'Бургеры', 'Закуски к пиву'],
    dishes: ['Бургер с рваной говядиной', 'Картофель батат', 'Трюфельный майонез', 'Крафтовое пиво'],
    startDate: '2026-08-10',
    endDate: '2026-09-27',
    dates: '10 Августа — 27 Сентября 2026',
    price: 32,
    specialSetPrice: 32,
    active: true,
    reservable: true,
    badge: 'Бургер Сет',
    highlight: 'Бургер + Батат',
  },
  {
    id: 'coffee-week',
    venueId: 'rest-6', // Specialty Coffee Lab
    restaurantId: 'rest-6',
    participatingRestaurantIds: ['rest-6', 'rest-2'],
    title: 'Неделя Спешелти Кофе',
    name: 'Неделя Спешелти Кофе',
    slug: 'coffee-special-week',
    type: 'tasting',
    tagline: 'Праздник спешелти кофе и крафтовой выпечки',
    description: 'Специальные сеты из микролотов спешелти арабики свежей обжарки и десерта от шеф-кондитера по фиксированной цене.',
    shortDescription: 'Микролот спешелти арабики и свежий круассан.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    tags: ['Спешелти', 'Кофе + Круассан', 'Десерты', 'Кофейни'],
    cuisines: ['Кофейни', 'Десерты'],
    dishes: ['Микролот Эфиопия Яргачефф', 'Миндальный круассан', 'Фильтр V60'],
    startDate: '2026-08-01',
    endDate: '2026-08-25',
    dates: '1 — 25 Августа 2026',
    price: 18,
    specialSetPrice: 18,
    active: true,
    reservable: true,
    badge: 'Спешелти',
    highlight: 'Кофе + Круассан',
  },
  {
    id: 'wine-fest',
    venueId: 'rest-5', // Terrassa Lounge & Wine
    restaurantId: 'rest-5',
    participatingRestaurantIds: ['rest-5', 'rest-1', 'rest-7'],
    title: 'Винные Дни & Сомелье',
    name: 'Винные Дни & Сомелье',
    slug: 'wine-tasting-special',
    type: 'tasting',
    tagline: 'Дни сомелье и эногастрономических пар',
    description: 'Винные дегустационные сеты с подбором эксклюзивных сыров, антипасти, тапасов и морепродуктов от сомелье.',
    shortDescription: '3 бокала выдержанного вина и тарелка авторских закусок.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    tags: ['Эногастрономия', '3 бокала + Закуски', 'Винный бар', 'Дегустация'],
    cuisines: ['Итальянская', 'Винные бары', 'Европейская'],
    dishes: ['Сет винных закусок', 'Сырная тарелка', 'Просекко', 'Пино Нуар'],
    startDate: '2026-08-05',
    endDate: '2026-09-10',
    dates: '5 Августа — 10 Сентября 2026',
    price: 65,
    specialSetPrice: 65,
    active: true,
    reservable: true,
    badge: 'Эногастрономия',
    highlight: '3 бокала + Закуски',
  },
  {
    id: 'autumn-menu',
    venueId: 'rest-4', // Paul Bakery & Cafe
    restaurantId: 'rest-4',
    participatingRestaurantIds: ['rest-4', 'rest-5', 'rest-8'],
    title: 'Осеннее Спешл-Меню',
    name: 'Осеннее Спешл-Меню',
    slug: 'autumn-menu',
    type: 'seasonal',
    tagline: 'Сезон тыквы, лисичек и согревающих специй',
    description: 'Специальные согревающие позиции с тыквенным супом-кремом, лисичками, трюфельным маслом и пряным латте.',
    shortDescription: 'Тыквенный суп-крем с рикоттой и паста с лисичками.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tags: ['Сезонное меню', 'Тыква', 'Лисички', 'Уют и вкус'],
    cuisines: ['Французская', 'Европейская', 'Завтраки'],
    dishes: ['Тыквенный суп с рикоттой', 'Паста с лисичками', 'Пряный раф'],
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    dates: '1 Сентября — 31 Октября 2026',
    price: 42,
    specialSetPrice: 42,
    active: true,
    reservable: true,
    badge: 'Сезонное меню',
    highlight: 'Уют и вкус',
  },
  {
    id: 'sports-fans-menu',
    venueId: 'rest-11', // Champion Sports Pub
    restaurantId: 'rest-11',
    participatingRestaurantIds: ['rest-11', 'rest-9'],
    title: 'Сет Болельщика & Пивной Марафон',
    name: 'Сет Болельщика',
    slug: 'sports-fans-menu',
    type: 'special_menu',
    tagline: 'Сочный мясной сет под футбол',
    description: 'Свиные ребра в соусе Jack Daniels, наггетсы, картофель фри и крафтовый эль во время прямой трансляции.',
    shortDescription: 'Ребра в соусе Jack Daniels, картофель фри и эль.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tags: ['Спорт-бар', 'Свиные ребра', 'Крафт', 'Прямые трансляции'],
    cuisines: ['Закуски к пиву', 'Европейская'],
    dishes: ['Свиные ребра Jack Daniels', 'Картофель фри', 'Крафтовый эль'],
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    dates: '1 Августа — 30 Сентября 2026',
    price: 45,
    specialSetPrice: 45,
    active: true,
    reservable: true,
    badge: 'Спорт-сет',
    highlight: 'Ребра + Крафт',
  },
  {
    id: 'hookah-velvet-set',
    venueId: 'rest-10', // Cloud Velvet Lounge
    restaurantId: 'rest-10',
    participatingRestaurantIds: ['rest-10', 'rest-12'],
    title: 'Дымный сет "Velvet Cloud" & Чайная церемония',
    name: 'Дымный сет "Velvet Cloud"',
    slug: 'hookah-velvet-set',
    type: 'tasting',
    tagline: 'Авторский кальян на грейпфруте и коллекционный чай',
    description: 'Авторский чашный микс Premium Darkside на грейпфруте в сочетании с чайником коллекционного чая Те Гуань Инь.',
    shortDescription: 'Авторский микс на грейпфруте + чай Те Гуань Инь.',
    image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80',
    tags: ['Кальянная', 'Чайная церемония', 'Приглушенный свет', 'VIP-комнаты'],
    cuisines: ['Авторские кальяны', 'Чайная карта'],
    dishes: ['Кальян на грейпфруте Velvet Cloud', 'Чай Те Гуань Инь'],
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    dates: '1 Августа — 30 Сентября 2026',
    price: 48,
    specialSetPrice: 48,
    active: true,
    reservable: true,
    badge: 'Дымный сет',
    highlight: 'Кальян + Чай',
  },
  {
    id: 'summer-steak-2026',
    venueId: 'rest-3', // Grill & Wine Meat House
    restaurantId: 'rest-3',
    participatingRestaurantIds: ['rest-3'],
    title: 'Летний Стейк-Марафон 2026',
    name: 'Летний Стейк-Марафон 2026',
    slug: 'summer-steak-2026',
    type: 'discount',
    tagline: 'Архивное предложение сезона',
    description: 'Специальная цена на сочный стейк Рибай зернового откорма с бокалом сухого красного вина.',
    shortDescription: 'Стейк Рибай зернового откорма и красное вино.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    tags: ['Стейки', 'Архив', 'Гриль', 'Завершено'],
    cuisines: ['Стейки', 'Европейская'],
    dishes: ['Стейк Рибай', 'Бокал Бордо'],
    startDate: '2026-06-01',
    endDate: '2026-07-20',
    dates: '1 Июня — 20 Июля 2026',
    price: 50,
    specialSetPrice: 50,
    active: false,
    reservable: false,
    badge: 'Завершено',
    highlight: 'Архивный сет',
  }
];

export function normalizePromotion(rawPromotion: any): Promotion {
  const rawId = String(rawPromotion.id || `promo-${Math.random().toString(36).substr(2, 6)}`);

  // Requirement 3: venueId = rawPromotion.venueId ?? rawPromotion.restaurantId ?? rawPromotion.placeId
  let venueId = rawPromotion.venueId ?? rawPromotion.restaurantId ?? rawPromotion.placeId;
  if (!venueId && Array.isArray(rawPromotion.participatingRestaurantIds) && rawPromotion.participatingRestaurantIds.length > 0) {
    venueId = rawPromotion.participatingRestaurantIds[0];
  }

  const venueIdStr = venueId ? String(venueId) : '';
  if (!venueIdStr && process.env.NODE_ENV !== 'production') {
    console.warn(`[Tavoo Warning] Promotion "${rawPromotion.title || rawPromotion.name}" (id: ${rawId}) has no valid venueId!`);
  }

  // Type normalization
  let pType: PromotionType = rawPromotion.type || 'festival';
  const validTypes: PromotionType[] = ['special_menu', 'festival', 'discount', 'brunch', 'tasting', 'seasonal', 'event'];
  if (!validTypes.includes(pType)) {
    const titleLower = (rawPromotion.title || rawPromotion.name || '').toLowerCase();
    if (titleLower.includes('завтрак') || titleLower.includes('бранч')) pType = 'brunch';
    else if (titleLower.includes('дегустац') || titleLower.includes('кофе') || titleLower.includes('вин')) pType = 'tasting';
    else if (titleLower.includes('сезон') || titleLower.includes('осен')) pType = 'seasonal';
    else if (titleLower.includes('скидк')) pType = 'discount';
    else if (titleLower.includes('меню') || titleLower.includes('сет')) pType = 'special_menu';
    else pType = 'festival';
  }

  // Dates parsing
  let startDate = rawPromotion.startDate || '2026-08-01';
  let endDate = rawPromotion.endDate || '2026-09-30';
  if (rawPromotion.dates && (!rawPromotion.startDate || !rawPromotion.endDate)) {
    const datesStr = String(rawPromotion.dates);
    if (datesStr.includes('Август')) {
      startDate = '2026-08-01';
      endDate = '2026-08-31';
    } else if (datesStr.includes('Сентябр')) {
      startDate = '2026-09-01';
      endDate = '2026-09-30';
    } else if (datesStr.includes('Октябр')) {
      startDate = '2026-10-01';
      endDate = '2026-10-31';
    } else if (datesStr.includes('Ноябр')) {
      startDate = '2026-11-01';
      endDate = '2026-11-30';
    }
  }

  const tags = Array.isArray(rawPromotion.tags)
    ? rawPromotion.tags
    : [rawPromotion.badge, rawPromotion.highlight].filter(Boolean);

  const cuisines = Array.isArray(rawPromotion.cuisines)
    ? rawPromotion.cuisines
    : (rawPromotion.primaryCuisine ? [rawPromotion.primaryCuisine] : []);

  const dishes = Array.isArray(rawPromotion.dishes) ? rawPromotion.dishes : [];

  const priceVal = typeof rawPromotion.price === 'number'
    ? rawPromotion.price
    : (typeof rawPromotion.specialSetPrice === 'number' ? rawPromotion.specialSetPrice : undefined);

  return {
    ...rawPromotion,
    id: rawId,
    venueId: venueIdStr,
    title: rawPromotion.title || rawPromotion.name || 'Специальное предложение',
    slug: rawPromotion.slug || rawPromotion.id || `promo-${rawId}`,
    type: pType,
    description: rawPromotion.description || rawPromotion.tagline || '',
    shortDescription: rawPromotion.shortDescription || rawPromotion.tagline || rawPromotion.description || '',
    image: rawPromotion.image || rawPromotion.bannerUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    tags,
    cuisines,
    dishes,
    startDate,
    endDate,
    price: priceVal,
    active: typeof rawPromotion.active === 'boolean' ? rawPromotion.active : true,
    reservable: typeof rawPromotion.reservable === 'boolean' ? rawPromotion.reservable : true,
    sortOrder: typeof rawPromotion.sortOrder === 'number' ? rawPromotion.sortOrder : 0,
    badge: rawPromotion.badge || 'Акция',
    highlight: rawPromotion.highlight || (priceVal ? `Сет ${priceVal} BYN` : 'Спецпредложение'),
    datesText: rawPromotion.dates || `${startDate} — ${endDate}`,
    participatingRestaurantIds: Array.isArray(rawPromotion.participatingRestaurantIds) ? rawPromotion.participatingRestaurantIds : [],
    // Legacy fields
    name: rawPromotion.name || rawPromotion.title,
    bannerUrl: rawPromotion.image || rawPromotion.bannerUrl,
    specialSetPrice: priceVal || 0,
  };
}

export type PromotionDateStatus = 'active' | 'upcoming' | 'expired';

export function getPromotionStatus(
  startDateStr: string,
  endDateStr: string,
  refDate: Date = new Date()
): PromotionDateStatus {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'active';
  }

  // End of day
  end.setHours(23, 59, 59, 999);
  const nowMs = refDate.getTime();

  if (nowMs < start.getTime()) {
    return 'upcoming';
  } else if (nowMs > end.getTime()) {
    return 'expired';
  } else {
    return 'active';
  }
}

export interface PromotionWithVenue {
  promotion: Promotion;
  venue: Restaurant;
}

export function getPromotionsWithVenues(
  storedPromotions: Promotion[]
): PromotionWithVenue[] {
  const venues = getAllNormalizedVenues();
  const venueMap = new Map<string, Restaurant>();
  venues.forEach(v => venueMap.set(String(v.id), v));

  const result: PromotionWithVenue[] = [];

  storedPromotions.forEach(promo => {
    const normalized = normalizePromotion(promo);
    if (!normalized.venueId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Tavoo Warning] Promotion ${normalized.id} skipped due to empty venueId`);
      }
      return;
    }

    const venue = venueMap.get(String(normalized.venueId));
    if (venue) {
      result.push({ promotion: normalized, venue });
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Tavoo Warning] Venue ID "${normalized.venueId}" not found in catalogue for promotion "${normalized.title}"`);
      }
    }
  });

  return result;
}

export function normalizeSearchText(value: any): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value.map(v => normalizeSearchText(v)).filter(Boolean).join(' ');
  }
  if (typeof value === 'object') {
    return Object.values(value).map(v => normalizeSearchText(v)).filter(Boolean).join(' ');
  }
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function buildPromotionSearchableText(item: PromotionWithVenue): string {
  const { promotion: p, venue: v } = item;

  const pParts = [
    p.title,
    p.description,
    p.shortDescription,
    p.type,
    p.badge,
    p.highlight,
    ...(p.tags || []),
    ...(p.cuisines || []),
    ...(p.dishes || []),
  ];

  const vParts = [
    v.name,
    v.primaryType,
    v.type,
    v.primaryCuisine,
    v.district,
    v.address,
    ...(v.cuisine || []),
    ...(v.tags || []),
    ...(v.features || []),
  ];

  const extraKeywords: string[] = [];
  const combined = normalizeSearchText([...pParts, ...vParts]);

  if (combined.includes('italian') || combined.includes('итальянск')) extraKeywords.push('итальянская кухня паста пицца остерия');
  if (combined.includes('brunch') || combined.includes('breakfast') || combined.includes('сырник') || combined.includes('утрен')) extraKeywords.push('завтраки завтрак бранч утренние сеты');
  if (combined.includes('burger') || combined.includes('бургер')) extraKeywords.push('бургер бургеры крафт');
  if (combined.includes('coffee') || combined.includes('кофе')) extraKeywords.push('кофе кофейня спешелти круассан');
  if (combined.includes('wine') || combined.includes('вино')) extraKeywords.push('вино винный бар эногастрономия сомелье');
  if (combined.includes('hookah') || combined.includes('кальян')) extraKeywords.push('кальян кальяны лаунж дым');
  if (combined.includes('sports') || combined.includes('спорт')) extraKeywords.push('спорт бар паб трансляции');

  return normalizeSearchText([...pParts, ...vParts, ...extraKeywords]);
}

export function filterPromotions(
  items: PromotionWithVenue[],
  filters?: OffersFilterState
): PromotionWithVenue[] {
  const f = filters || DEFAULT_OFFERS_FILTERS;
  const queryNorm = normalizeSearchText(f.query || '');

  return items.filter(({ promotion: p, venue: v }) => {
    // 1. Date Status Filter
    const dateStatus = getPromotionStatus(p.startDate, p.endDate);
    if (f.status === 'active' && dateStatus !== 'active') return false;
    if (f.status === 'upcoming' && dateStatus !== 'upcoming') return false;
    if (f.status === 'expired' && dateStatus !== 'expired') return false;
    if (f.status === 'all' || !f.status) {
      // Requirement 6: "Все = активные и будущие" by default
      if (dateStatus === 'expired') return false;
    }

    // 2. Keyword search
    if (queryNorm) {
      const sText = buildPromotionSearchableText({ promotion: p, venue: v });
      const queryWords = queryNorm.split(' ').filter(Boolean);
      const matches = queryWords.every(word => sText.includes(word));
      if (!matches) return false;
    }

    // 3. Promotion Type Filter
    if (f.type && f.type !== 'all' && p.type !== f.type) {
      return false;
    }

    // 4. Venue Primary Type Filter
    if (f.venueType && f.venueType !== 'all') {
      if (f.venueType === 'bar') {
        if (v.primaryType !== 'bar' && v.primaryType !== 'sports_bar' && v.primaryType !== 'hookah_lounge' && v.primaryType !== 'gastrobar') {
          return false;
        }
      } else if (v.primaryType !== f.venueType) {
        return false;
      }
    }

    // 5. Cuisine Filter
    if (f.cuisine && f.cuisine !== 'all') {
      const cTarget = f.cuisine.toLowerCase();
      const pCuisines = (p.cuisines || []).map(c => c.toLowerCase());
      const vCuisines = (v.cuisine || []).map(c => c.toLowerCase());
      const vPrimaryCuisine = (v.primaryCuisine || '').toLowerCase();

      const matchesCuisine =
        pCuisines.some(c => c.includes(cTarget) || cTarget.includes(c)) ||
        vCuisines.some(c => c.includes(cTarget) || cTarget.includes(c)) ||
        vPrimaryCuisine.includes(cTarget) ||
        cTarget.includes(vPrimaryCuisine);

      if (!matchesCuisine) return false;
    }

    // 6. Reservable Filter
    if (f.reservable && f.reservable !== 'all') {
      if (f.reservable === 'reservable') {
        if (!p.reservable && !v.isReservable) return false;
      } else if (f.reservable === 'instant') {
        if (v.reservationMode !== 'instant') return false;
      } else if (f.reservable === 'request') {
        if (v.reservationMode !== 'request') return false;
      }
    }

    // 7. Price Range Filter
    // Requirement 8: "Не показывай фильтр цены у записей без цены как совпадение с любым диапазоном."
    if (f.priceRange && f.priceRange !== 'all') {
      if (typeof p.price !== 'number' || isNaN(p.price)) {
        return false;
      }
      const price = p.price;
      if (f.priceRange === 'under-30' && price >= 30) return false;
      if (f.priceRange === '30-50' && (price < 30 || price > 50)) return false;
      if (f.priceRange === '50-80' && (price < 50 || price > 80)) return false;
      if (f.priceRange === 'above-80' && price <= 80) return false;
    }

    return true;
  });
}
