import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ActiveTab, Restaurant, Festival, FilterState, OffersFilterState } from './types';
import { RESTAURANTS, COLLECTIONS } from './data/mockData';
import { getAllNormalizedVenues } from './utils/data';
import { DEFAULT_OFFERS_FILTERS } from './utils/promotionUtils';
import { SavedVenuesProvider, useSavedVenues } from './utils/savedVenuesStore';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoriesSection } from './components/CategoriesSection';
import { CollectionsSection } from './components/CollectionsSection';
import { CollectionsView } from './components/CollectionsView';
import { RestaurantCard } from './components/RestaurantCard';
import { FestivalSection } from './components/FestivalSection';
import { FestivalDetailModal } from './components/FestivalDetailModal';
import { RestaurantMap } from './components/RestaurantMap';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { AboutSection } from './components/AboutSection';
import { ProfileModal } from './components/ProfileModal';
import { FilterModal } from './components/FilterModal';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { BookingModal } from './components/BookingModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AdminBookingsModal } from './components/AdminBookingsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';
import { ScrollReveal } from './components/ScrollReveal';
import { NotFoundPage } from './components/NotFoundPage';
import { 
  Utensils, 
  Heart, 
  Sparkles, 
  Loader2,
  SlidersHorizontal,
  Search,
  RotateCcw
} from 'lucide-react';
import { 
  DEFAULT_FILTER_STATE, 
  filterRestaurants, 
  parseFiltersFromUrl, 
  buildUrlSearchParams,
  getActiveFiltersCount
} from './utils/filterUtils';

import { PartnerLogin } from './partner/PartnerLogin';
import { PartnerDashboard } from './partner/PartnerDashboard';
import { PartnerAuthGuard } from './partner/PartnerAuthGuard';
import { getDemoPartnerSession } from './partner/mockData';

function MainApp() {
  const ALL_VENUES = useMemo(() => getAllNormalizedVenues(), []);

  const {
    savedVenueIds,
    toggleSavedVenue,
    isSaved,
    savedVenuesCount,
    resolvedSavedVenues,
  } = useSavedVenues();

  const [currentUrl, setCurrentUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.pathname}${window.location.search}`;
    }
    return '/';
  });

  const currentPathname = useMemo(() => {
    const path = currentUrl.split('?')[0] || '/';
    return path === '' ? '/' : path;
  }, [currentUrl]);

  const activeTab = useMemo<ActiveTab | '404'>(() => {
    if (currentPathname === '/') return 'home';
    if (currentPathname === '/restaurants' || currentPathname.startsWith('/restaurants/')) return 'restaurants';
    if (currentPathname === '/bars' || currentPathname.startsWith('/bars/')) return 'bars';
    if (currentPathname === '/collections' || currentPathname.startsWith('/collections/')) return 'collections';
    if (currentPathname === '/offers' || currentPathname.startsWith('/offers/') || currentPathname === '/festivals' || currentPathname.startsWith('/festivals/')) return 'festivals';
    if (currentPathname === '/map' || currentPathname.startsWith('/map/')) return 'map';
    if (currentPathname === '/bookings' || currentPathname.startsWith('/bookings/')) return 'my-bookings';
    if (currentPathname === '/saved' || currentPathname.startsWith('/saved/')) return 'favorites';
    if (currentPathname === '/about' || currentPathname.startsWith('/about/')) return 'about';
    return '404';
  }, [currentPathname]);

  const navigate = useCallback((pathAndQuery: string, replace = false) => {
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState({}, '', pathAndQuery);
      } else {
        window.history.pushState({}, '', pathAndQuery);
      }
      setCurrentUrl(pathAndQuery);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window !== 'undefined') {
      return parseFiltersFromUrl(new URLSearchParams(window.location.search), 'Минск');
    }
    return DEFAULT_FILTER_STATE;
  });

  // Independent Scope State for Offers Page (Requirement 10)
  const [offersFilters, setOffersFilters] = useState<OffersFilterState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return {
        query: params.get('q') || '',
        type: (params.get('type') as any) || 'all',
        venueType: (params.get('venueType') as any) || 'all',
        cuisine: params.get('cuisine') || 'all',
        reservable: (params.get('reservable') as any) || 'all',
        priceRange: (params.get('price') as any) || 'all',
        status: (params.get('status') as any) || 'all',
      };
    }
    return DEFAULT_OFFERS_FILTERS;
  });

  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingTargetRestaurant, setBookingTargetRestaurant] = useState<Restaurant | null>(null);
  const [bookingInitialDate, setBookingInitialDate] = useState<string | undefined>(undefined);
  const [bookingInitialTime, setBookingInitialTime] = useState<string | undefined>(undefined);
  const [bookingInitialGuests, setBookingInitialGuests] = useState<number | undefined>(undefined);

  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState<boolean>(false);
  const [isAdminBookingsOpen, setIsAdminBookingsOpen] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const handleOpenBookingModal = useCallback((
    restaurant: Restaurant,
    date?: string,
    time?: string,
    guests?: number
  ) => {
    setBookingTargetRestaurant(restaurant);
    setBookingInitialDate(date || filters.date);
    setBookingInitialTime(time || filters.time);
    setBookingInitialGuests(guests || filters.guests);
    setIsBookingModalOpen(true);
  }, [filters.date, filters.time, filters.guests]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const fullUrl = `${window.location.pathname}${window.location.search}`;
        setCurrentUrl(fullUrl);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const parsed = parseFiltersFromUrl(params, filters.city || 'Минск');
      if (currentPathname.startsWith('/bars')) {
        parsed.primaryType = 'bar';
        const typeParam = params.get('type') || params.get('subBarType');
        if (typeParam) {
          parsed.subBarType = typeParam as any;
        }
      } else if (currentPathname.startsWith('/restaurants')) {
        parsed.primaryType = 'restaurant';
      }
      setFilters(parsed);
    }
  }, [currentUrl, currentPathname]);

  // Sync URL for Offers Page
  useEffect(() => {
    if (activeTab === 'festivals' && typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (offersFilters?.query) params.set('q', offersFilters.query);
      if (offersFilters?.type && offersFilters.type !== 'all') params.set('type', offersFilters.type);
      if (offersFilters?.venueType && offersFilters.venueType !== 'all') params.set('venueType', offersFilters.venueType);
      if (offersFilters?.cuisine && offersFilters.cuisine !== 'all') params.set('cuisine', offersFilters.cuisine);
      if (offersFilters?.reservable && offersFilters.reservable !== 'all') params.set('reservable', offersFilters.reservable);
      if (offersFilters?.priceRange && offersFilters.priceRange !== 'all') params.set('price', offersFilters.priceRange);
      if (offersFilters?.status && offersFilters.status !== 'all') params.set('status', offersFilters.status);

      const queryString = params.toString();
      const newUrl = queryString ? `/offers?${queryString}` : '/offers';
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab, offersFilters]);

  const handleUpdateFilters = useCallback((newFilters: FilterState) => {
    setIsSearching(true);
    setFilters(newFilters);
    const params = buildUrlSearchParams(newFilters);
    const qStr = params.toString();
    const basePath = currentPathname === '/' ? '/restaurants' : currentPathname;
    const newUrl = qStr ? `${basePath}?${qStr}` : basePath;
    navigate(newUrl, true);
    setTimeout(() => {
      setIsSearching(false);
    }, 150);
  }, [currentPathname, navigate]);

  const handlePerformSearch = useCallback((overrideFilters?: FilterState) => {
    const filtersToUse = overrideFilters || filters;
    setIsSearching(true);
    setFilters(filtersToUse);
    const params = buildUrlSearchParams(filtersToUse);
    const qStr = params.toString();
    const targetPath = filtersToUse.primaryType === 'bar' ? '/bars' : '/restaurants';
    navigate(`${targetPath}${qStr ? `?${qStr}` : ''}`);
    setTimeout(() => {
      setIsSearching(false);
    }, 200);
  }, [filters, navigate]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [favCategoryFilter, setFavCategoryFilter] = useState<'all' | 'restaurant' | 'bar' | 'sports_bar' | 'hookah_lounge'>('all');

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleToggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isSavedNow = toggleSavedVenue(id);
    setToastMessage(isSavedNow ? 'Добавлено в сохранённое' : 'Удалено из сохранённого');
  }, [toggleSavedVenue]);

  const visibleRestaurants = useMemo(() => {
    return filterRestaurants(ALL_VENUES, {
      ...filters,
      primaryType: 'restaurant',
    });
  }, [ALL_VENUES, filters]);

  const visibleBars = useMemo(() => {
    return filterRestaurants(ALL_VENUES, {
      ...filters,
      primaryType: 'bar',
    });
  }, [ALL_VENUES, filters]);

  const filteredRestaurants = useMemo(() => {
    if (activeTab === 'bars') return visibleBars;
    if (activeTab === 'restaurants') return visibleRestaurants;
    return filterRestaurants(ALL_VENUES, filters);
  }, [ALL_VENUES, filters, activeTab, visibleBars, visibleRestaurants]);

  const favoriteRestaurantsList = resolvedSavedVenues;

  const filteredFavoritesList = useMemo(() => {
    if (favCategoryFilter === 'all') return favoriteRestaurantsList;
    if (favCategoryFilter === 'restaurant') {
      return favoriteRestaurantsList.filter(r => ['restaurant', 'gastrobar', 'cafe', 'bistro', 'steakhouse'].includes(r.primaryType));
    }
    if (favCategoryFilter === 'bar') {
      return favoriteRestaurantsList.filter(r => r.primaryType === 'bar');
    }
    return favoriteRestaurantsList.filter(r => r.primaryType === favCategoryFilter);
  }, [favoriteRestaurantsList, favCategoryFilter]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Tavoo Diagnostics] Active Tab:', activeTab, '| City:', filters.city, '| PrimaryType:', filters.primaryType, '| Filtered Count:', filteredRestaurants.length, '| Saved Count:', savedVenuesCount, '| Saved Resolved:', favoriteRestaurantsList.length);
    }
  }, [activeTab, filters, filteredRestaurants.length, savedVenuesCount, favoriteRestaurantsList.length]);

  const resetAllFilters = useCallback(() => {
    const cleared = {
      ...DEFAULT_FILTER_STATE,
      city: filters.city,
    };
    handleUpdateFilters(cleared);
  }, [filters.city, handleUpdateFilters]);

  const activeFiltersCount = getActiveFiltersCount(filters);

  if (currentPathname.startsWith('/partner')) {
    if (currentPathname === '/partner/dashboard') {
      return (
        <PartnerAuthGuard onNavigate={navigate}>
          {(member) => <PartnerDashboard member={member} onNavigate={navigate} />}
        </PartnerAuthGuard>
      );
    }
    return <PartnerLogin onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#D9D0C2] text-[#211E19] font-['Geologica']">
      
      {/* Top Header Bar */}
      <Header
        currentPathname={currentPathname}
        onNavigate={navigate}
        favoritesCount={savedVenuesCount}
        currentCity={filters.city}
        setCurrentCity={(city) => handleUpdateFilters({ ...filters, city, district: '' })}
        onOpenSearch={() => setIsFilterModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenAdminBookings={() => setIsAdminBookingsOpen(true)}
        selectedCuisine={filters.primaryType}
        onSelectCategory={(catName) => {
          if (catName === 'bar') {
            navigate('/bars');
          } else if (catName === 'restaurant') {
            navigate('/restaurants');
          } else if (catName) {
            handlePerformSearch({ ...filters, cuisines: [catName] });
          }
        }}
      />

      {/* Main Container */}
      <main className="flex-1 w-full">
        
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div key="home" className="w-full page-transition">
            
            {/* Full-width Hero Search Block */}
            <HeroSection
              filters={filters}
              onUpdateFilters={handleUpdateFilters}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              onPerformSearch={handlePerformSearch}
              allRestaurants={ALL_VENUES}
              onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
              onNavigate={navigate}
              currentPathname={currentPathname}
            />

            {/* Subsequent Homepage Sections with 64px safe top padding */}
            <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-16 pb-12">
              
              {/* Applied Filter Chips */}
              <ActiveFilterChips
                filters={filters}
                onUpdateFilters={handleUpdateFilters}
                onResetFilters={resetAllFilters}
              />

              {/* Cuisine Categories Section */}
              <ScrollReveal staggerChildren>
                <CategoriesSection
                  selectedCategory={filters.cuisines[0] || null}
                  onSelectCategory={(catName) => {
                    if (['restaurant', 'bar', 'sports_bar', 'hookah_lounge', 'gastrobar', 'all'].includes(catName || '')) {
                      handlePerformSearch({ ...filters, primaryType: catName as any, subBarType: 'all', cuisines: [] });
                    } else if (catName) {
                      handlePerformSearch({ ...filters, cuisines: [catName] });
                    } else {
                      handleUpdateFilters({ ...filters, cuisines: [] });
                    }
                  }}
                  onViewAllCuisines={() => {
                    handleUpdateFilters({ ...filters, cuisines: [] });
                    navigate('/restaurants');
                  }}
                />
              </ScrollReveal>

              {/* Curated Collections */}
              <ScrollReveal staggerChildren>
                <CollectionsSection
                  selectedCollection={filters.query || null}
                  onSelectCollection={(colId) => {
                    if (colId) {
                      const col = COLLECTIONS.find(c => c.id === colId);
                      const name = col ? col.name : colId;
                      handlePerformSearch({ ...filters, query: name });
                    } else {
                      handleUpdateFilters({ ...filters, query: '' });
                    }
                  }}
                />
              </ScrollReveal>

              {/* Popular Restaurants Grid */}
              <ScrollReveal staggerChildren>
                <section className="py-8 border-t border-[#BFB3A2]">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-6 h-6 text-[#707437]" />
                        <h2 className="font-['Sora',sans-serif] font-semibold text-[32px] sm:text-[40px] lg:text-[46px] leading-[1.08] tracking-[-0.035em] text-[#25211C]">
                          Популярные рестораны
                        </h2>
                      </div>
                      <p className="font-['Geologica',sans-serif] font-normal text-[17px] sm:text-[19px] leading-[1.45] text-[#6B645A] max-w-[620px] mt-2 sm:mt-2.5">
                        Самые высокооцененные заведения г. {filters.city} с наилучшими отзывами
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/restaurants')}
                      className="font-['Geologica',sans-serif] text-sm font-semibold text-[#25211C] hover:text-[#707437] transition-colors underline underline-offset-4 cursor-pointer whitespace-nowrap self-start sm:self-end"
                    >
                      Все заведения ({ALL_VENUES.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ALL_VENUES.slice(0, 6).map((rest) => (
                      <RestaurantCard
                        key={rest.id}
                        restaurant={rest}
                        isFavorite={isSaved(rest.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={() => setSelectedRestaurant(rest)}
                        searchDate={filters.date}
                        searchTime={filters.time}
                        searchGuests={filters.guests}
                        onBookRestaurant={handleOpenBookingModal}
                      />
                    ))}
                  </div>
                </section>
              </ScrollReveal>

              {/* Promo / Festival Section ("Акции") */}
              <ScrollReveal>
                <FestivalSection
                  onSelectFestival={(fest) => setSelectedFestival(fest)}
                />
              </ScrollReveal>

            </div>

          </div>
        )}

        {/* TAB 2: RESTAURANTS CATALOG */}
        {activeTab === 'restaurants' && (
          <div key="restaurants" className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 page-transition">
            
            {/* Embedded Search Header in Catalog */}
            <div className="space-y-6 bg-[#F2EBDD] p-6 sm:p-8 rounded-[24px] border border-[#BFB3A2] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="font-['Sora',sans-serif] font-semibold text-[34px] sm:text-[38px] lg:text-[42px] leading-[1.1] tracking-[-0.03em] text-[#4F5328]">
                    {filters.city && filters.city.toLowerCase() === 'минск' ? 'Рестораны Минска' : `Рестораны ${filters.city || 'Минска'}`}
                  </h1>
                  <p className="font-['Geologica',sans-serif] font-medium text-[15px] text-[#756D5E] mt-1.5">
                    Найдено ресторанов: {visibleRestaurants.length}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start">
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#F8F2E7] border border-[#BFB3A2] hover:border-[#707437] text-xs font-semibold text-[#4F5328] hover:bg-[#FFF4B8]/55 shadow-xs transition-all flex items-center gap-2 cursor-pointer min-h-[40px]"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#A64F2C]" />
                    <span>Фильтры</span>
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#A64F2C] text-white text-[10px] font-bold flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-xs font-semibold text-[#756D5E] hover:text-[#4F5328] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#A64F2C]" />
                      Сбросить
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Categories Selection Row */}
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: 'Все рестораны' },
                  { id: 'breakfast', label: 'Завтраки' },
                  { id: 'date-night', label: 'Для свидания' },
                  { id: 'family', label: 'Семейные' },
                  { id: 'panoramic-view', label: 'Панорамные' },
                  { id: 'terrace', label: 'С террасой' },
                ].map((cat) => {
                  const isSelected = (filters.quickCategory || 'all') === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleUpdateFilters({ ...filters, quickCategory: cat.id as any })}
                      className={`font-['Geologica',sans-serif] text-[14px] font-medium min-h-[38px] px-[17px] rounded-full transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#707437] text-[#FFF4B8] border border-[#707437] font-semibold shadow-xs'
                          : 'bg-[#F8F2E7] text-[#4F5328] border border-[#707437]/28 hover:bg-[#FFF4B8]/55 hover:border-[#707437]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar inside Catalog */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#707437] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleUpdateFilters({ ...filters, query: e.target.value })}
                  placeholder="Поиск по названию, кухне, блюду или адресу..."
                  className="w-full pl-11 pr-4 py-3 bg-[#F8F2E7] border border-[#BFB3A2] focus:border-[#707437] rounded-2xl text-sm font-medium text-[#211E19] placeholder-[#756D5E] focus:outline-none transition-colors shadow-xs"
                />
              </div>

              {/* Active Filter Chips */}
              <ActiveFilterChips
                filters={filters}
                onUpdateFilters={handleUpdateFilters}
                onResetFilters={resetAllFilters}
              />
            </div>

            {/* Restaurant Cards Grid or Loading/Empty States */}
            {isSearching ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#A64F2C] animate-spin" />
                <p className="text-xs font-semibold text-[#756D5E]">Применение фильтров...</p>
              </div>
            ) : visibleRestaurants.length === 0 ? (
              <div className="py-16 text-center bg-[#F2EBDD] rounded-[24px] border border-[#BFB3A2] space-y-3 px-4">
                <Utensils className="w-10 h-10 text-[#756D5E] mx-auto" />
                <h3 className="text-lg font-semibold text-[#4F5328]">
                  По выбранным условиям ничего не найдено
                </h3>
                <p className="text-xs text-[#756D5E] max-w-sm mx-auto">
                  Попробуйте убрать один из фильтров или изменить поисковый запрос
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 bg-[#A64F2C] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#854023] transition-colors cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleRestaurants.map((rest) => (
                  <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    isFavorite={isSaved(rest.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => setSelectedRestaurant(rest)}
                    searchDate={filters.date}
                    searchTime={filters.time}
                    searchGuests={filters.guests}
                    onBookRestaurant={handleOpenBookingModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2B: BARS CATALOG */}
        {activeTab === 'bars' && (
          <div key="bars" className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 page-transition">
            
            {/* Embedded Header in Bars Catalog */}
            <div className="space-y-6 bg-[#F2EBDD] p-6 sm:p-8 rounded-[24px] border border-[#BFB3A2] shadow-xs">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="font-['Sora',sans-serif] font-semibold text-[34px] sm:text-[38px] lg:text-[42px] leading-[1.1] tracking-[-0.03em] text-[#4F5328]">
                    {filters.city && filters.city.toLowerCase() === 'минск' ? 'Бары Минска' : `Бары ${filters.city || 'Минска'}`}
                  </h1>
                  <p className="font-['Geologica',sans-serif] font-medium text-[15px] text-[#756D5E] mt-1.5">
                    Найдено заведений: {visibleBars.length}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start">
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-[#F8F2E7] border border-[#BFB3A2] hover:border-[#707437] text-xs font-semibold text-[#4F5328] hover:bg-[#FFF4B8]/55 shadow-xs transition-all flex items-center gap-2 cursor-pointer min-h-[40px]"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#A64F2C]" />
                    <span>Фильтры</span>
                    {activeFiltersCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#A64F2C] text-white text-[10px] font-bold flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="text-xs font-semibold text-[#756D5E] hover:text-[#4F5328] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#A64F2C]" />
                      Сбросить
                    </button>
                  )}
                </div>
              </div>

              {/* Bar Subtypes Selection Row (Single segmented selector, NO search input) */}
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: 'Все бары' },
                  { id: 'bar', label: 'Бары' },
                  { id: 'sports_bar', label: 'Спорт-бары' },
                  { id: 'hookah_lounge', label: 'Кальянные' },
                  { id: 'gastrobar', label: 'Гастробары' },
                  { id: 'wine_bar', label: 'Винные бары' },
                ].map((sub) => {
                  const isSelected = (filters.subBarType || 'all') === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleUpdateFilters({ ...filters, subBarType: sub.id as any })}
                      className={`font-['Geologica',sans-serif] text-[14px] font-medium min-h-[38px] px-[17px] rounded-full transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#707437] text-[#FFF4B8] border border-[#707437] font-semibold shadow-xs'
                          : 'bg-[#F8F2E7] text-[#4F5328] border border-[#707437]/28 hover:bg-[#FFF4B8]/55 hover:border-[#707437]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Filter Chips */}
              <ActiveFilterChips
                filters={filters}
                onUpdateFilters={handleUpdateFilters}
                onResetFilters={resetAllFilters}
              />
            </div>

            {/* Bar Cards Grid or Loading/Empty States */}
            {isSearching ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#A64F2C] animate-spin" />
                <p className="text-xs font-semibold text-[#756D5E]">Применение фильтров...</p>
              </div>
            ) : visibleBars.length === 0 ? (
              <div className="py-16 text-center bg-[#F2EBDD] rounded-[24px] border border-[#BFB3A2] space-y-3 px-4">
                <Utensils className="w-10 h-10 text-[#756D5E] mx-auto" />
                <h3 className="text-lg font-semibold text-[#4F5328]">
                  По выбранным условиям ничего не найдено
                </h3>
                <p className="text-xs text-[#756D5E] max-w-sm mx-auto">
                  Попробуйте убрать один из фильтров или выбрать другую категорию
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 bg-[#A64F2C] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#854023] transition-colors cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleBars.map((rest) => (
                  <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    isFavorite={isSaved(rest.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => setSelectedRestaurant(rest)}
                    searchDate={filters.date}
                    searchTime={filters.time}
                    searchGuests={filters.guests}
                    onBookRestaurant={handleOpenBookingModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FESTIVALS / АКЦИИ */}
        {activeTab === 'festivals' && (
          <div key="festivals" className="page-transition">
            <FestivalSection
              filters={offersFilters}
              onFilterChange={(newFilters) => setOffersFilters(newFilters)}
              onResetFilters={() => setOffersFilters(DEFAULT_OFFERS_FILTERS)}
              onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
              onBookVenue={(rest) => handleOpenBookingModal(rest)}
            />
          </div>
        )}

        {/* TAB 4: RESTAURANT MAP */}
        {activeTab === 'map' && (
          <div key="map" className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <RestaurantMap
              restaurants={filteredRestaurants}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
              favorites={savedVenueIds}
              onToggleFavorite={handleToggleFavorite}
              onBookRestaurant={handleOpenBookingModal}
            />
          </div>
        )}

        {/* TAB 5: ABOUT PROJECT */}
        {activeTab === 'about' && (
          <div key="about" className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 page-transition">
            <AboutSection />
          </div>
        )}

        {/* TAB 6: EDITORIAL COLLECTIONS */}
        {activeTab === 'collections' && (
          <div key="collections" className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
            <CollectionsView
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={(id) => setSelectedCollectionId(id)}
              favorites={savedVenueIds}
              onToggleFavorite={handleToggleFavorite}
              onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
              onBookRestaurant={handleOpenBookingModal}
              searchDate={filters.date}
              searchTime={filters.time}
              searchGuests={filters.guests}
            />
          </div>
        )}

        {/* TAB 7: FAVORITES */}
        {activeTab === 'favorites' && (
          <div key="favorites" className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 page-transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-normal font-['Tenor_Sans',serif] uppercase tracking-wide text-[#211E19]">
                  Сохранённые заведения ({favoriteRestaurantsList.length})
                </h1>
                <p className="text-xs text-[#6B645A] mt-1">
                  Ваша персональная подборка избранных мест
                </p>
              </div>

              {/* Category Filter Pills in Favorites */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'restaurant', label: 'Рестораны' },
                  { id: 'bar', label: 'Бары' },
                  { id: 'sports_bar', label: 'Спорт-бары' },
                  { id: 'hookah_lounge', label: 'Кальянные' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFavCategoryFilter(c.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                      favCategoryFilter === c.id
                        ? 'bg-[#707437] text-white font-bold shadow-xs'
                        : 'bg-[#F2EBDD] border border-[#BFB3A2] text-[#211E19] hover:bg-[#FFF4B8]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {favoriteRestaurantsList.length === 0 ? (
              <div className="py-20 text-center bg-[#F2EBDD] rounded-3xl border border-[#BFB3A2] space-y-4 px-6 max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#FFF4B8] border border-[#BFB3A2] flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-[#A64F2C] fill-[#A64F2C]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#211E19]">
                    Здесь появятся заведения, которые вы сохраните
                  </h3>
                  <p className="text-xs text-[#6B645A]">
                    Нажмите на сердце в карточке ресторана или бара
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/restaurants')}
                  className="px-8 py-3 bg-[#707437] hover:bg-[#585c2b] text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2 min-h-[44px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Найти заведение</span>
                </button>
              </div>
            ) : filteredFavoritesList.length === 0 ? (
              <div className="py-12 text-center bg-[#F2EBDD] rounded-3xl border border-[#BFB3A2] space-y-2 px-4">
                <p className="text-sm font-semibold text-[#211E19]">
                  В этой категории пока нет сохранённых заведений
                </p>
                <button
                  type="button"
                  onClick={() => setFavCategoryFilter('all')}
                  className="text-xs font-bold text-[#707437] underline cursor-pointer"
                >
                  Показать все сохранённые ({favoriteRestaurantsList.length})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavoritesList.map((rest) => (
                  <RestaurantCard
                    key={rest.id}
                    restaurant={rest}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={() => setSelectedRestaurant(rest)}
                    searchDate={filters.date}
                    searchTime={filters.time}
                    searchGuests={filters.guests}
                    onBookRestaurant={handleOpenBookingModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: NOT FOUND 404 FALLBACK */}
        {activeTab === '404' && (
          <div key="404" className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
            <NotFoundPage onNavigate={navigate} />
          </div>
        )}

      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2000] bg-[#211E19] text-[#FFF4B8] px-5 py-3 rounded-2xl shadow-xl border border-[#BFB3A2]/40 flex items-center gap-3 animate-fade-in font-medium text-xs sm:text-sm">
          <Heart className="w-4 h-4 text-[#A64F2C] fill-[#A64F2C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <Footer onNavigate={(target) => {
        if (target === 'home') navigate('/');
        else if (target === 'restaurants') navigate('/restaurants');
        else if (target === 'bars') navigate('/bars');
        else if (target === 'festivals' || target === 'offers') navigate('/offers');
        else if (target === 'collections') navigate('/collections');
        else if (target === 'map') navigate('/map');
        else if (target === 'about') navigate('/about');
        else if (typeof target === 'string' && target.startsWith('/')) navigate(target);
      }} />

      {/* FILTER MODAL */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          handlePerformSearch(newFilters);
        }}
        allRestaurants={ALL_VENUES}
      />

      {/* MODAL 1: Restaurant Detail Modal */}
      {selectedRestaurant && (
        <RestaurantDetailModal
          restaurant={selectedRestaurant}
          isFavorite={isSaved(selectedRestaurant.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedRestaurant(null)}
          onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
          onOpenBookingModal={handleOpenBookingModal}
          isBookingOpen={isBookingModalOpen}
        />
      )}

      {/* MODAL 2: Booking Form Modal */}
      {isBookingModalOpen && bookingTargetRestaurant && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          restaurant={bookingTargetRestaurant}
          initialDate={bookingInitialDate}
          initialTime={bookingInitialTime}
          initialGuests={bookingInitialGuests}
          onOpenMyBookings={() => setIsMyBookingsOpen(true)}
          onShowToast={showToast}
        />
      )}

      {/* MODAL 3: My Bookings Modal */}
      <MyBookingsModal
        isOpen={isMyBookingsOpen || activeTab === 'my-bookings'}
        onClose={() => {
          setIsMyBookingsOpen(false);
          if (currentPathname.startsWith('/bookings')) {
            navigate('/');
          }
        }}
        onSelectRestaurant={(restaurantId) => {
          const rest = ALL_VENUES.find(r => r.id === restaurantId || String(r.id) === String(restaurantId));
          if (rest) setSelectedRestaurant(rest);
        }}
        onShowToast={showToast}
      />

      {/* MODAL 4: Admin Bookings Management Modal */}
      <AdminBookingsModal
        isOpen={isAdminBookingsOpen}
        onClose={() => setIsAdminBookingsOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* MODAL 5: Festival Detail Modal */}
      {selectedFestival && (
        <FestivalDetailModal
          festival={selectedFestival}
          onClose={() => setSelectedFestival(null)}
          onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
        />
      )}

      {/* MODAL 6: Profile Drawer / Modal */}
      {isProfileOpen && (
        <ProfileModal
          onClose={() => setIsProfileOpen(false)}
          favorites={favoriteRestaurantsList}
          currentCity={filters.city}
          setCurrentCity={(c) => handleUpdateFilters({ ...filters, city: c, district: '' })}
          onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <SavedVenuesProvider>
      <MainApp />
    </SavedVenuesProvider>
  );
}
