import { Restaurant, Category, Collection, Festival } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'italian',
    name: 'Итальянская кухня',
    iconName: 'UtensilsCrossed',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'japanese',
    name: 'Японская кухня',
    iconName: 'Fish',
    photo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'steaks',
    name: 'Стейки',
    iconName: 'Flame',
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'burgers',
    name: 'Бургеры',
    iconName: 'Beef',
    photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'breakfast',
    name: 'Завтраки',
    iconName: 'Coffee',
    photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'coffee',
    name: 'Кофейни',
    iconName: 'CupSoda',
    photo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'wine',
    name: 'Винные бары',
    iconName: 'Wine',
    photo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'belarusian',
    name: 'Белорусская кухня',
    iconName: 'CookingPot',
    photo: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'asian',
    name: 'Азиатская кухня',
    iconName: 'Soup',
    photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'vegan',
    name: 'Вегетарианская кухня',
    iconName: 'Salad',
    photo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'pizza',
    name: 'Пицца',
    iconName: 'Pizza',
    photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'desserts',
    name: 'Десерты',
    iconName: 'Cake',
    photo: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'seafood',
    name: 'Морепродукты',
    iconName: 'Anchor',
    photo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mexican',
    name: 'Мексиканская кухня',
    iconName: 'Flame',
    photo: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'panasian',
    name: 'Паназиатская кухня',
    iconName: 'ChefHat',
    photo: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'european',
    name: 'Европейская кухня',
    iconName: 'Wine',
    photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'georgian',
    name: 'Грузинская кухня',
    iconName: 'Sparkles',
    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'mediterranean',
    name: 'Средиземноморская кухня',
    iconName: 'Anchor',
    photo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
  }
];

export const COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    title: 'Для свидания',
    slug: 'date-night',
    icon: 'Heart',
    description: 'Камерные заведения с приглушенным светом и романтической атмосферой',
    coverImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-1', 'rest-5', 'rest-7', 'rest-10'],
    active: true,
    sortOrder: 1,
    name: 'Для свидания',
    subtitle: 'Камерные заведения с приглушенным светом и романтической атмосферой',
    photo: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80',
    badge: 'Романтика'
  },
  {
    id: 'col-2',
    title: 'Недорого',
    slug: 'budget',
    icon: 'Wallet',
    description: 'Доступные заведения с отличной кухней и средним чеком до 40 BYN',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-2', 'rest-6', 'rest-8'],
    active: true,
    sortOrder: 2,
    name: 'Недорого',
    subtitle: 'Доступные заведения с отличной кухней и средним чеком до 40 BYN',
    photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    badge: 'Доступно'
  },
  {
    id: 'col-3',
    title: 'Атмосферно',
    slug: 'atmospheric',
    icon: 'Sparkles',
    description: 'Уникальные концептуальные интерьеры, авторский свет и душевный уют',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-1', 'rest-3', 'rest-5', 'rest-10', 'rest-12'],
    active: true,
    sortOrder: 3,
    name: 'Атмосферно',
    subtitle: 'Уникальные концептуальные интерьеры, авторский свет и душевный уют',
    photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    badge: 'Атмосфера'
  },
  {
    id: 'col-4',
    title: 'Для семьи',
    slug: 'family',
    icon: 'Users',
    description: 'Просторные залы, детские комнаты и сбалансированное меню для взрослых и детей',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-2', 'rest-4', 'rest-8', 'rest-11'],
    active: true,
    sortOrder: 4,
    name: 'Для семьи',
    subtitle: 'Просторные залы, детские комнаты и сбалансированное меню для всех',
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    badge: 'Для семьи'
  },
  {
    id: 'col-5',
    title: 'С красивым видом',
    slug: 'view',
    icon: 'Eye',
    description: 'Панорамные террасы и заведения на верхних этажах с видом на город',
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-1', 'rest-3', 'rest-5', 'rest-7'],
    active: true,
    sortOrder: 5,
    name: 'С красивым видом',
    subtitle: 'Панорамные террасы и рестораны на верхних этажах',
    photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    badge: 'Панорама'
  },
  {
    id: 'col-6',
    title: 'Для большой компании',
    slug: 'groups',
    icon: 'UserPlus',
    description: 'Большие длинные столы, сеты для шеринга и душевные встречи друзей',
    coverImage: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-3', 'rest-4', 'rest-8', 'rest-9', 'rest-11'],
    active: true,
    sortOrder: 6,
    name: 'Для большой компании',
    subtitle: 'Большие столы и сеты для шеринга',
    photo: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80',
    badge: 'Компании'
  },
  {
    id: 'col-7',
    title: 'Завтраки',
    slug: 'breakfast',
    icon: 'Coffee',
    description: 'Заведения, где накрывают пышные сырники, яйца бенедикт и спешелти кофе',
    coverImage: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-2', 'rest-6'],
    active: true,
    sortOrder: 7,
    name: 'Завтраки',
    subtitle: 'Идеальное утро, бенедикт и спешелти кофе',
    photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    badge: 'Завтраки'
  },
  {
    id: 'col-8',
    title: 'Открыто допоздна',
    slug: 'late-night',
    icon: 'Moon',
    description: 'Барная карта, кальяны, кухни и прямые трансляции, доступные после полуночи',
    coverImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    venueIds: ['rest-3', 'rest-5', 'rest-7', 'rest-9', 'rest-10', 'rest-12'],
    active: true,
    sortOrder: 8,
    name: 'Открыто допоздна',
    subtitle: 'Коктейли, кальяны и кухня после полуночи',
    photo: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    badge: 'Допоздна'
  }
];

export const FESTIVALS: Festival[] = [
  {
    id: 'restaurant-week',
    name: 'Minsk Restaurant Week 2026',
    tagline: 'Главное гастрономическое событие сезона',
    dates: '15 — 30 Августа 2026',
    description: 'Более 30 лучших ресторанов города представляют эксклюзивные дегустационные сеты из 4 блюд по фиксированной цене 55 BYN.',
    bannerUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    specialSetPrice: 55,
    participatingRestaurantIds: ['rest-1', 'rest-3', 'rest-5', 'rest-7'],
    badge: 'Главный фест',
    highlight: 'Спецсет 55 BYN'
  },
  {
    id: 'zavtrako-fest',
    name: 'ЗавтракоФест',
    tagline: 'Идеальное утро в лучших заведениях города',
    dates: '1 — 14 Сентября 2026',
    description: 'Марафон утренних сетов: пышные сырники, дранники с лососем, драфтовый фильтр-кофе и игристое к каждому сету.',
    bannerUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
    specialSetPrice: 28,
    participatingRestaurantIds: ['rest-2', 'rest-4', 'rest-6'],
    badge: 'Утренний сет',
    highlight: 'Завтраки + Игристое'
  },
  {
    id: 'burger-fest',
    name: 'Фестиваль Бургеров',
    tagline: 'Битва лучших крафтовых бургеров',
    dates: '20 — 27 Сентября 2026',
    description: 'Шефы представляют крафтовые бургеры с выдержанной говядиной, бриошью на закваске и авторскими соусами.',
    bannerUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    specialSetPrice: 32,
    participatingRestaurantIds: ['rest-3', 'rest-8'],
    badge: 'Бургер Сет',
    highlight: 'Бургер + Батат'
  },
  {
    id: 'coffee-week',
    name: 'Неделя Кофе',
    tagline: 'Праздник спешелти кофе и крафтовой выпечки',
    dates: '5 — 12 Октября 2026',
    description: 'Специальные сеты из микролотов спешелти арабики и десерта от шеф-кондитера по фиксированной цене.',
    bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    specialSetPrice: 18,
    participatingRestaurantIds: ['rest-2', 'rest-6'],
    badge: 'Спешелти',
    highlight: 'Кофе + Круассан'
  },
  {
    id: 'wine-fest',
    name: 'Фестиваль Вина',
    tagline: 'Дни сомелье и эногастрономических пар',
    dates: '15 — 25 Октября 2026',
    description: 'Винные дегустационные сеты с подбором эксклюзивных сыров, тапасов и морепродуктов от сомелье.',
    bannerUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    specialSetPrice: 65,
    participatingRestaurantIds: ['rest-1', 'rest-5', 'rest-7'],
    badge: 'Эногастрономия',
    highlight: '3 бокала + Закуски'
  },
  {
    id: 'autumn-menu',
    name: 'Осеннее Меню',
    tagline: 'Сезон тыквы, лисичек и согревающих специй',
    dates: '1 — 30 Ноября 2026',
    description: 'Специальные согревающие позиции с тыквенным кремом, трюфельным маслом и пряными напитками.',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    specialSetPrice: 42,
    participatingRestaurantIds: ['rest-4', 'rest-5', 'rest-8'],
    badge: 'Сезонное меню',
    highlight: 'Уют и вкус'
  }
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Osteria Cantina',
    tagline: 'Итальянская дровяная печь и свежая паста ручной работы',
    description: 'Аутентичная остерия в самом сердце города. Каждое утро шеф-повар раскатывает свежую пасту, а вечером в дровяной печи выпекается римская пицца с хрустящим бортиком. Уютный свет, стеллажи с выдержанными винами и виниловая музыка.',
    primaryType: 'restaurant',
    type: 'Ресторан',
    city: 'Минск',
    isReservable: true,
    isLateWorking: false,
    cuisine: ['Итальянская кухня', 'Средиземноморская кухня', 'Винные бары', 'Пицца'],
    primaryCuisine: 'Итальянская кухня',
    averageCheck: 65,
    rating: 4.9,
    reviewCount: 184,
    seatingOptions: ['Обычный стол', 'Стол у окна', 'На террасе', 'VIP-комната'],
    hasSeatMap: true,
    zones: [
      { id: 'z1', venueId: 'rest-1', name: 'Главный зал', type: 'indoor' },
      { id: 'z2', venueId: 'rest-1', name: 'Летняя терраса', type: 'terrace' }
    ],
    tables: [
      { id: 't1-1', venueId: 'rest-1', zoneId: 'z1', number: 1, label: 'Стол 1 (У окна)', capacity: 2, seatingType: 'Стол у окна', active: true, x: 20, y: 30, shape: 'rect' },
      { id: 't1-2', venueId: 'rest-1', zoneId: 'z1', number: 2, label: 'Стол 2 (Центр)', capacity: 4, seatingType: 'Обычный стол', active: true, x: 50, y: 30, shape: 'rect' },
      { id: 't1-3', venueId: 'rest-1', zoneId: 'z1', number: 3, label: 'Стол 3 (VIP Кабинка)', capacity: 6, seatingType: 'VIP-комната', active: true, x: 80, y: 30, shape: 'rect' },
      { id: 't1-4', venueId: 'rest-1', zoneId: 'z2', number: 4, label: 'Терраса 1', capacity: 2, seatingType: 'На террасе', active: true, x: 30, y: 75, shape: 'circle' },
      { id: 't1-5', venueId: 'rest-1', zoneId: 'z2', number: 5, label: 'Терраса 2', capacity: 4, seatingType: 'На террасе', active: true, x: 70, y: 75, shape: 'circle' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Летняя терраса', 'Живая музыка', 'Подходит для свидания', 'Парковка', 'Панорамный вид'],
    isOpen: true,
    workingHours: '12:00 — 23:00',
    address: 'ул. Революционная, 14',
    district: 'Центральный район',
    phone: '+375 (29) 612-34-56',
    website: 'https://osteriacantina.by',
    lat: 53.9022,
    lng: 27.5519,
    isEditorsPick: true,
    collections: ['date-night', 'view', 'atmospheric'],
    festivals: ['restaurant-week', 'wine-fest'],
    menu: [
      {
        categoryName: 'Фестивальный сет Restaurant Week',
        dishes: [
          {
            id: 'd-fest-1',
            name: 'Фестивальный сет Osteria Cantina (4 блюда)',
            description: 'Тартар из тунца с авокадо, трюфельный ризотто с лисичками, оссобуко на медленном огне и мини-тирамису.',
            price: 55,
            weight: '720 г',
            photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
            category: 'Сеты',
            isFestivalSpecial: true,
            festivalName: 'Minsk Restaurant Week 2026'
          }
        ]
      },
      {
        categoryName: 'Паста & Ризотто',
        dishes: [
          {
            id: 'd-1',
            name: 'Тальятелле с камчатским крабом',
            description: 'Свежая паста собственного замеса, соус из томатов конкассе, чеснока и белого вина',
            price: 34,
            weight: '320 г',
            photo: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
            category: 'Паста',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-1',
        author: 'Анастасия К.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: 'Вчера',
        text: 'Невероятная атмосфера для романтического вечера! Паста с крабом просто тает во рту.'
      }
    ]
  },
  {
    id: 'rest-2',
    name: 'Mornings & Beans',
    tagline: 'Концептуальные завтраки весь день и спешелти кофе',
    description: 'Светлое минималистичное пространство с панорамными окнами и духом скандинавского уюта. Мы подаем спешелти кофе свежей обжарки, пышные панкейки, боулы и легендарные сырники с соленой карамелью.',
    primaryType: 'cafe',
    type: 'Кафе / Кофейня',
    city: 'Минск',
    isReservable: true,
    isLateWorking: false,
    cuisine: ['Завтраки', 'Кофейни', 'Десерты'],
    primaryCuisine: 'Завтраки',
    averageCheck: 28,
    rating: 4.8,
    reviewCount: 240,
    seatingOptions: ['Обычный стол', 'Стол у окна', 'На террасе'],
    photos: [
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Летняя терраса', 'Завтраки', 'Можно с животными', 'Детское меню'],
    isOpen: true,
    workingHours: '08:00 — 21:00',
    address: 'пр-т Независимости, 37',
    district: 'Площадь Победы',
    phone: '+375 (29) 789-01-23',
    website: 'https://morningsbeans.by',
    lat: 53.9085,
    lng: 27.5752,
    collections: ['budget', 'family', 'breakfast'],
    festivals: ['zavtrako-fest', 'coffee-week'],
    menu: [
      {
        categoryName: 'Фирменные завтраки',
        dishes: [
          {
            id: 'd-21',
            name: 'Сырники с соленой карамелью',
            description: 'Фермерский творог, ваниль Бурбон, маскарпоне и малина',
            price: 16,
            weight: '260 г',
            photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
            category: 'Завтраки',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-21',
        author: 'Елена С.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '2 дня назад',
        text: 'Лучшие сырники в Минске без преувеличения!'
      }
    ]
  },
  {
    id: 'rest-3',
    name: 'Prime Steak & Grill',
    tagline: 'Премиальная выдержанная говядина и гриль на углях',
    description: 'Гастрономический ресторан стейков с камерой dry aging сухого вызревания мяса до 45 дней. Брутальный современный интерьер из натурального дерева, открытая кухня с грилем Josper.',
    primaryType: 'steakhouse',
    type: 'Стейкхаус',
    city: 'Минск',
    isReservable: true,
    isLateWorking: true,
    cuisine: ['Стейки', 'Европейская кухня', 'Бургеры', 'Винные бары'],
    primaryCuisine: 'Стейки',
    averageCheck: 95,
    rating: 4.9,
    reviewCount: 312,
    seatingOptions: ['Обычный стол', 'Диван или кабинка', 'VIP-комната', 'Большой стол'],
    hasSeatMap: true,
    zones: [
      { id: 'zs1', venueId: 'rest-3', name: 'Гриль Зал', type: 'indoor' },
      { id: 'zs2', venueId: 'rest-3', name: 'VIP Кабинеты', type: 'indoor' }
    ],
    tables: [
      { id: 'ts-1', venueId: 'rest-3', zoneId: 'zs1', number: 1, label: 'Стол у гриля 1', capacity: 4, seatingType: 'Диван или кабинка', active: true, x: 25, y: 35, shape: 'rect' },
      { id: 'ts-2', venueId: 'rest-3', zoneId: 'zs1', number: 2, label: 'Длинный стол 2', capacity: 8, seatingType: 'Большой стол', active: true, x: 60, y: 35, shape: 'rect' },
      { id: 'ts-3', venueId: 'rest-3', zoneId: 'zs2', number: 3, label: 'VIP Зал "Черный Дым"', capacity: 10, seatingType: 'VIP-комната', active: true, x: 80, y: 70, shape: 'rect' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Панорамный вид', 'Зона для курения', 'Парковка', 'Подходит для большой компании'],
    isOpen: true,
    workingHours: '13:00 — 00:00',
    address: 'ул. Карла Маркса, 21',
    district: 'Ленинский район',
    phone: '+375 (29) 111-22-33',
    website: 'https://primesteak.by',
    lat: 53.8965,
    lng: 27.5567,
    collections: ['atmospheric', 'view', 'groups', 'late-night'],
    festivals: ['restaurant-week', 'burger-fest'],
    menu: [
      {
        categoryName: 'Стейки Dry Aged',
        dishes: [
          {
            id: 'd-31',
            name: 'Стейк Рибай Dry Aged (35 дней)',
            description: 'Выдержанная мраморная говядина со специями',
            price: 68,
            weight: '350 г',
            photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
            category: 'Стейки',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-31',
        author: 'Артем Д.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: 'Неделю назад',
        text: 'Рибай медиум рар приготовлен филигранно.'
      }
    ]
  },
  {
    id: 'rest-4',
    name: 'Бульба & Традиция',
    tagline: 'Современное прочтение белорусской национальной кухни',
    description: 'Мы бережно сохранили традиционные рецепты белорусских хуторов и придали им изысканную современную подачу. Хрустящие драники с трюфельной сметаной, мачанка со свиными ребрышками.',
    primaryType: 'restaurant',
    type: 'Ресторан',
    city: 'Минск',
    isReservable: true,
    isLateWorking: false,
    cuisine: ['Белорусская кухня', 'Европейская кухня'],
    primaryCuisine: 'Белорусская кухня',
    averageCheck: 42,
    rating: 4.8,
    reviewCount: 156,
    seatingOptions: ['Обычный стол', 'Диван или кабинка', 'Большой стол'],
    photos: [
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Живая музыка', 'Детская комната', 'Детское меню', 'Подходит для большой компании'],
    isOpen: true,
    workingHours: '11:00 — 23:00',
    address: 'Троицкое предместье, ул. Старовиленская, 10',
    district: 'Троицкое Предместье',
    phone: '+375 (29) 444-55-66',
    lat: 53.9081,
    lng: 27.5562,
    collections: ['family', 'groups'],
    festivals: ['zavtrako-fest', 'autumn-menu'],
    menu: [
      {
        categoryName: 'Национальные блюда',
        dishes: [
          {
            id: 'd-41',
            name: 'Драники с белыми грибами',
            description: 'Соус из лесных белых грибов, запеченные в печи',
            price: 18,
            weight: '340 г',
            photo: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
            category: 'Белорусская',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-41',
        author: 'Ольга П.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: 'Вчера',
        text: 'Очень душевное место в Троицком! Драники не жирные.'
      }
    ]
  },
  {
    id: 'rest-5',
    name: 'Nami Izakaya & Sushi',
    tagline: 'Свежие морепродукты и японский гриль Робата',
    description: 'Стильный гастробар в японском стиле Изакая. Премиальный тунец блюфин, фарерский лосось, нигири с обжаренным вагю и авторская карта саке и японского виски.',
    primaryType: 'gastrobar',
    type: 'Гастробар',
    city: 'Минск',
    isReservable: true,
    isLateWorking: true,
    cuisine: ['Японская кухня', 'Паназиатская кухня', 'Морепродукты'],
    primaryCuisine: 'Японская кухня',
    averageCheck: 85,
    rating: 4.9,
    reviewCount: 198,
    seatingOptions: ['За барной стойкой', 'Стол у окна', 'На террасе'],
    hasSeatMap: true,
    zones: [
      { id: 'zn1', venueId: 'rest-5', name: 'Изакая Зал', type: 'indoor' },
      { id: 'zn2', venueId: 'rest-5', name: 'Суши Бар', type: 'indoor' }
    ],
    tables: [
      { id: 'tn-1', venueId: 'rest-5', zoneId: 'zn2', number: 1, label: 'Барная стойка (Место 1-2)', capacity: 2, seatingType: 'За барной стойкой', active: true, x: 20, y: 40, shape: 'rect' },
      { id: 'tn-2', venueId: 'rest-5', zoneId: 'zn1', number: 2, label: 'Стол у окна', capacity: 4, seatingType: 'Стол у окна', active: true, x: 60, y: 40, shape: 'rect' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Подходит для свидания', 'Панорамный вид', 'Летняя терраса'],
    isOpen: true,
    workingHours: '12:00 — 00:00',
    address: 'ул. Интернациональная, 25',
    district: 'Центральный район',
    phone: '+375 (29) 333-44-55',
    lat: 53.9038,
    lng: 27.5584,
    collections: ['date-night', 'atmospheric', 'view', 'late-night'],
    festivals: ['restaurant-week', 'wine-fest'],
    menu: [
      {
        categoryName: 'Суши & Нигири',
        dishes: [
          {
            id: 'd-51',
            name: 'Сет нигири Абури (5 шт)',
            description: 'Опаленный тунец блюфин и уголь Робата',
            price: 38,
            weight: '180 г',
            photo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
            category: 'Суши',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-51',
        author: 'Дмитрий Н.',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '4 дня назад',
        text: 'Качество рыбы на высочайшем уровне.'
      }
    ]
  },
  {
    id: 'rest-6',
    name: 'Botanica Green Kitchen',
    tagline: 'Органическая вегетарианская кухня и боулы',
    description: 'Уютный светлый оазис с живыми растениями. Мы доказываем, что растительная кухня может быть яркой, насыщенной и безумно вкусной.',
    primaryType: 'bistro',
    type: 'Бистро / Кафе',
    city: 'Минск',
    isReservable: true,
    isLateWorking: false,
    cuisine: ['Вегетарианская кухня', 'Кофейни'],
    primaryCuisine: 'Вегетарианская кухня',
    averageCheck: 35,
    rating: 4.7,
    reviewCount: 112,
    seatingOptions: ['Обычный стол', 'На террасе'],
    photos: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Вегетарианские блюда', 'Летняя терраса'],
    isOpen: true,
    workingHours: '09:00 — 21:00',
    address: 'ул. Октябрьская, 19',
    district: 'Октябрьская улица',
    phone: '+375 (29) 888-99-00',
    lat: 53.8899,
    lng: 27.5702,
    collections: ['budget', 'breakfast'],
    festivals: ['zavtrako-fest', 'coffee-week'],
    menu: [
      {
        categoryName: 'Зеленые боулы',
        dishes: [
          {
            id: 'd-61',
            name: 'Боул с авокадо и киноа',
            description: 'Печеный нут, эдамаме и тахини',
            price: 19,
            weight: '350 г',
            photo: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
            category: 'Боулы',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-61',
        author: 'Ирина М.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: 'Вчера',
        text: 'Обожаю их матча-латте и боулы.'
      }
    ]
  },
  {
    id: 'rest-7',
    name: 'Panorama Sky Bar',
    tagline: 'Панорамный ресторан на 22 этаже с видом на весь Минск',
    description: 'Завораживающий вид на вечерние огни города, авторская европейская кухня, морепродукты и эксклюзивные коктейли. Идеальное место для незабываемых свиданий.',
    primaryType: 'bar',
    type: 'Бар',
    city: 'Минск',
    isReservable: true,
    isLateWorking: true,
    cuisine: ['Морепродукты', 'Винные бары', 'Итальянская кухня'],
    primaryCuisine: 'Морепродукты',
    averageCheck: 110,
    rating: 4.9,
    reviewCount: 420,
    seatingOptions: ['За барной стойкой', 'Стол у окна', 'На террасе'],
    photos: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Панорамный вид', 'Летняя терраса', 'Живая музыка', 'Подходит для свидания'],
    isOpen: true,
    workingHours: '16:00 — 02:00',
    address: 'пр-т Победителей, 9',
    district: 'Немига',
    phone: '+375 (29) 999-00-11',
    lat: 53.9064,
    lng: 27.5492,
    collections: ['date-night', 'view', 'late-night'],
    festivals: ['restaurant-week', 'wine-fest'],
    menu: [
      {
        categoryName: 'Дары Моря',
        dishes: [
          {
            id: 'd-71',
            name: 'Плато со свежими устрицами (6 шт)',
            description: 'Дикие устрицы Фин де Клер и лимон',
            price: 52,
            weight: '400 г',
            photo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
            category: 'Морепродукты',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-71',
        author: 'Владислав З.',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '3 дня назад',
        text: 'Вид на закат просто фантастический!'
      }
    ]
  },
  {
    id: 'rest-8',
    name: 'Craft Burger Lab',
    tagline: 'Сочные крафтовые бургеры и домашние соусы',
    description: 'Лаборатория уличной еды высокого уровня. Мраморная говядина зернового откорма, картофельные булочки ежедневно.',
    primaryType: 'bar',
    type: 'Бар / Бургерная',
    city: 'Минск',
    isReservable: true,
    isLateWorking: false,
    cuisine: ['Бургеры', 'Мексиканская кухня'],
    primaryCuisine: 'Бургеры',
    averageCheck: 38,
    rating: 4.8,
    reviewCount: 289,
    seatingOptions: ['За барной стойкой', 'Большой стол', 'На террасе'],
    photos: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Можно с животными', 'Летняя терраса'],
    isOpen: true,
    workingHours: '11:00 — 23:00',
    address: 'ул. Зыбицкая, 6',
    district: 'Верхний Город',
    phone: '+375 (29) 555-66-77',
    lat: 53.9056,
    lng: 27.5589,
    collections: ['budget', 'family', 'groups'],
    festivals: ['burger-fest'],
    menu: [
      {
        categoryName: 'Крафтовые бургеры',
        dishes: [
          {
            id: 'd-81',
            name: 'Бургер Трюфельный Бэкон',
            description: 'Двойная котлета, чеддер, бекон и трюфельный майо',
            price: 24,
            weight: '380 г',
            photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
            category: 'Бургеры',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-81',
        author: 'Егор К.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '5 дней назад',
        text: 'Бургер с трюфелем — бомба!'
      }
    ]
  },
  {
    id: 'rest-9',
    name: 'Arena Sports Bar & Grill',
    tagline: 'Главный спорт-бар города с 4K экранами и трансляциями',
    description: 'Культовое место для любителей футбола, хоккея и UFC. 12 гигантских экранов 4K, многоканальный звук, 20 сортов крафтового и импортного разливного пива, сочные крылышки, бургеры и ребра на гриле.',
    primaryType: 'sports_bar',
    type: 'Спорт-бар',
    city: 'Минск',
    isReservable: true,
    isLateWorking: true,
    cuisine: ['Бургеры', 'Американская кухня', 'Закуски к пиву'],
    primaryCuisine: 'Американская кухня',
    averageCheck: 45,
    rating: 4.8,
    reviewCount: 310,
    seatingOptions: ['У экрана', 'За барной стойкой', 'Большой стол'],
    hasSeatMap: true,
    zones: [
      { id: 'zs-1', venueId: 'rest-9', name: 'Главная арена с экраном', type: 'indoor' },
      { id: 'zs-2', venueId: 'rest-9', name: 'Барная стойка', type: 'indoor' }
    ],
    tables: [
      { id: 'tsports-1', venueId: 'rest-9', zoneId: 'zs-1', number: 1, label: 'Стол прямо перед проектором 1', capacity: 6, seatingType: 'У экрана', active: true, x: 30, y: 30, shape: 'rect' },
      { id: 'tsports-2', venueId: 'rest-9', zoneId: 'zs-1', number: 2, label: 'Большой стол фанатов 2', capacity: 10, seatingType: 'Большой стол', active: true, x: 70, y: 30, shape: 'rect' },
      { id: 'tsports-3', venueId: 'rest-9', zoneId: 'zs-2', number: 3, label: 'Место у бара', capacity: 2, seatingType: 'За барной стойкой', active: true, x: 50, y: 75, shape: 'rect' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Большие экраны', 'Прямые трансляции', 'Подходит для большой компании', 'Парковка'],
    features: ['Прямые трансляции', 'Большие экраны', 'Крафтовое пиво', 'Кикер / Настольный футбол'],
    isOpen: true,
    workingHours: '14:00 — 02:00',
    address: 'пр-т Победителей, 20',
    district: 'Центральный район',
    phone: '+375 (29) 700-11-22',
    lat: 53.9120,
    lng: 27.5380,
    collections: ['groups', 'late-night'],
    menu: [
      {
        categoryName: 'Закуски к матчу',
        dishes: [
          {
            id: 'd-91',
            name: 'Сет фри & острые крылья Баффало (1 кг)',
            description: 'Острые куриные крылышки, батат, соус блю чиз и начос',
            price: 36,
            weight: '1000 г',
            photo: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=600&q=80',
            category: 'Закуски',
            isPopular: true
          },
          {
            id: 'd-92',
            name: 'Арена Бургер с рваной свининой',
            description: 'Коул слоу, соус BBQ, чеддер и хрустящий лук',
            price: 22,
            weight: '390 г',
            photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
            category: 'Бургеры'
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-91',
        author: 'Максим Т.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '3 дня назад',
        text: 'Смотрели финал Лиги Чемпионов — атмосфера невероятная! Огромные экраны.'
      }
    ]
  },
  {
    id: 'rest-10',
    name: 'Cloud Velvet Lounge',
    tagline: 'Премиальный кальянный клуб с приглушенным светом и чайными церемониями',
    description: 'Лаунж-пространство премиум-класса. Кальяны высшей категории от лучших паркмейкеров, винтажные мягкие диваны, изолированные VIP-кабинки, редкие сорта китайского чая и авторские коктейли.',
    primaryType: 'hookah_lounge',
    type: 'Кальянная',
    city: 'Минск',
    isReservable: true,
    isLateWorking: true,
    cuisine: ['Авторские кальяны', 'Азиатская кухня', 'Чайная карта', 'Коктейли'],
    primaryCuisine: 'Авторские кальяны',
    averageCheck: 55,
    rating: 4.9,
    reviewCount: 225,
    seatingOptions: ['Кальянная зона', 'Диван или кабинка', 'VIP-комната'],
    hasSeatMap: true,
    zones: [
      { id: 'zh-1', venueId: 'rest-10', name: 'Лаунж зал с диванами', type: 'indoor' },
      { id: 'zh-2', venueId: 'rest-10', name: 'VIP Лаунж кабинки', type: 'indoor' }
    ],
    tables: [
      { id: 'thookah-1', venueId: 'rest-10', zoneId: 'zh-1', number: 1, label: 'Уютный диван 1', capacity: 4, seatingType: 'Диван или кабинка', active: true, x: 30, y: 35, shape: 'rect' },
      { id: 'thookah-2', venueId: 'rest-10', zoneId: 'zh-2', number: 2, label: 'VIP Зал "Velvet Silk"', capacity: 8, seatingType: 'VIP-комната', active: true, x: 75, y: 35, shape: 'rect' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Кальянная зона', 'VIP-комнаты', 'Приглушенный свет', 'Чайная карта'],
    features: ['Авторские миксы', 'Китайский коллекционный чай', 'PlayStation 5', 'Приглушенный свет'],
    isOpen: true,
    workingHours: '15:00 — 03:00',
    address: 'ул. Зыбицкая, 15',
    district: 'Верхний Город',
    phone: '+375 (29) 300-44-55',
    lat: 53.9060,
    lng: 27.5595,
    collections: ['date-night', 'atmospheric', 'late-night'],
    menu: [
      {
        categoryName: 'Кальянные сеты & Чай',
        dishes: [
          {
            id: 'd-101',
            name: 'Авторский микс "Velvet Cloud" + Чай Те Гуань Инь',
            description: 'Фруктовый чашный микс с нотами манго и бергамота, подача на грейпфруте',
            price: 45,
            weight: 'сет',
            photo: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=600&q=80',
            category: 'Кальяны',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-101',
        author: 'Денис Р.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: 'Вчера',
        text: 'Лучший дым и вытяжка в городе. Чай мастера подают великолепно.'
      }
    ]
  },
  {
    id: 'rest-11',
    name: 'Champion Sports Pub',
    tagline: 'Спортивные трансляции, крафтовое пиво и дымные бургеры',
    description: 'Просторный спорт-паб с отдельными экранами в каждой кабинке, широким ассортиментом европейского разливного пива и атмосферой настоящего стадиона.',
    primaryType: 'sports_bar',
    type: 'Спорт-бар',
    city: 'Минск',
    isReservable: true,
    isLateWorking: true,
    cuisine: ['Бургеры', 'Европейская кухня', 'Закуски к пиву'],
    primaryCuisine: 'Закуски к пиву',
    averageCheck: 40,
    rating: 4.7,
    reviewCount: 142,
    seatingOptions: ['У экрана', 'За барной стойкой', 'Большой стол'],
    photos: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Прямые трансляции', 'У экрана', 'Большие столы'],
    features: ['Прямые трансляции', 'Экран в каждой кабинке', 'Крафтовое пиво'],
    isOpen: true,
    workingHours: '13:00 — 01:00',
    address: 'ул. Якуба Коласа, 18',
    district: 'Советский район',
    phone: '+375 (29) 811-22-33',
    lat: 53.9210,
    lng: 27.5850,
    collections: ['family', 'groups'],
    menu: [
      {
        categoryName: 'Меню для болельщиков',
        dishes: [
          {
            id: 'd-111',
            name: 'Свиные ребра в соусе глазурь Jack Daniels',
            description: 'Подаются с запеченным картофелем и маринованным луком',
            price: 29,
            weight: '450 г',
            photo: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
            category: 'Мясо',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-111',
        author: 'Сергей К.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '4 дня назад',
        text: 'Супер удобные экраны у каждого стола!'
      }
    ]
  },
  {
    id: 'rest-12',
    name: 'Smoke & Chill Hookah House',
    tagline: 'Дымная атмосферная локация с кальянами и настолками',
    description: 'Уютная кальянная с авторским дизайном, игровыми зонами с консолями PS5, душевным персоналом и огромным выбором табаков со всего мира.',
    primaryType: 'hookah_lounge',
    type: 'Кальянная',
    city: 'Минск',
    isReservable: true,
    isLateWorking: true,
    cuisine: ['Кальяны', 'Напитки', 'Закуски'],
    primaryCuisine: 'Авторские кальяны',
    averageCheck: 48,
    rating: 4.8,
    reviewCount: 168,
    seatingOptions: ['Кальянная зона', 'Диван или кабинка', 'VIP-комната'],
    photos: [
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Кальянная зона', 'Игровые консоли', 'Приглушенный свет'],
    features: ['Авторские кальяны', 'PlayStation 5', 'Настольные игры'],
    isOpen: true,
    workingHours: '16:00 — 04:00',
    address: 'ул. Ленина, 8',
    district: 'Центральный район',
    phone: '+375 (29) 400-55-66',
    lat: 53.9010,
    lng: 27.5550,
    collections: ['atmospheric', 'late-night'],
    menu: [
      {
        categoryName: 'Кальяны',
        dishes: [
          {
            id: 'd-121',
            name: 'Кальян Premium Darkside / MustHave',
            description: 'Индивидуальный подбор крепости и аромата от мастера',
            price: 38,
            weight: '1 шт',
            photo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
            category: 'Кальяны',
            isPopular: true
          }
        ]
      }
    ],
    reviews: [
      {
        id: 'r-121',
        author: 'Влад М.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        date: '3 дня назад',
        text: 'Поиграли в фифу на соньке под отличный дымный кальян.'
      }
    ]
  }
];

export const CITIES = [
  'Минск',
  'Брест',
  'Гродно',
  'Гомель',
  'Витебск',
  'Могилев'
];
