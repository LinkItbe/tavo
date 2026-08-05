import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Sparkles,
  Calendar,
  UtensilsCrossed,
  MapPin,
  Star,
  RefreshCw,
  Plus,
  AlertCircle,
  Tag,
  Clock,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { Promotion, OffersFilterState, Restaurant } from '../types';
import {
  DEFAULT_OFFERS_FILTERS,
  getPromotionsWithVenues,
  filterPromotions,
  getPromotionStatus,
  PromotionWithVenue
} from '../utils/promotionUtils';
import { getStoredPromotions } from '../utils/promotionStore';
import { FestivalDetailModal } from './FestivalDetailModal';
import { AdminPromotionModal } from './AdminPromotionModal';

interface FestivalSectionProps {
  filters?: OffersFilterState;
  onFilterChange?: (newFilters: OffersFilterState) => void;
  onResetFilters?: () => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  onBookVenue?: (restaurant: Restaurant) => void;
}

export const FestivalSection: React.FC<FestivalSectionProps> = ({
  filters: rawFilters,
  onFilterChange,
  onResetFilters,
  onSelectRestaurant,
  onBookVenue,
}) => {
  const filters = rawFilters || DEFAULT_OFFERS_FILTERS;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawPromotions, setRawPromotions] = useState<Promotion[]>([]);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<PromotionWithVenue | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Load data on mount & refresh
  const loadData = () => {
    setLoading(true);
    setError(null);
    try {
      const stored = getStoredPromotions();
      setRawPromotions(stored);
    } catch (err: any) {
      setError('Не удалось загрузить список акций');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Selector: get promotions linked to venues
  const promotionsWithVenues = useMemo(() => {
    return getPromotionsWithVenues(rawPromotions);
  }, [rawPromotions]);

  // Filtered result
  const filteredPromotions = useMemo(() => {
    return filterPromotions(promotionsWithVenues, filters);
  }, [promotionsWithVenues, filters]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.type !== 'all') count++;
    if (filters.venueType !== 'all') count++;
    if (filters.cuisine !== 'all') count++;
    if (filters.reservable !== 'all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  // Helpers for filter updates
  const setField = <K extends keyof OffersFilterState>(field: K, val: OffersFilterState[K]) => {
    onFilterChange?.({ ...filters, [field]: val });
  };

  return (
    <div className="min-h-screen bg-[#F8F2E7] text-[#211E19] font-['Geologica'] pb-20">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#BFB3A2]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF4B8] border border-[#BFB3A2] rounded-full text-xs font-bold text-[#211E19] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#A64F2C]" />
              <span>Спецпредложения & Акции Tavoo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal font-['Tenor_Sans',serif] tracking-wide text-[#211E19]">
              Акции
            </h1>
            <p className="text-sm text-[#7C725F] mt-1.5 max-w-2xl">
              Специальные предложения и меню заведений Tavoo: авторские сеты, сезонные новинки, завтраки и дегустационные карты.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="px-4 py-2.5 bg-[#211E19] hover:bg-[#3D372F] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FFF4B8]" />
              <span>Управление акциями</span>
            </button>
          </div>
        </div>

        {/* Date Status Tabs (Requirement 6) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'all', label: 'Все акции', desc: 'Действующие и предстоящие' },
            { id: 'active', label: 'Действуют сейчас', desc: 'Проходят прямо сейчас' },
            { id: 'upcoming', label: 'Скоро', desc: 'Предстоящие предложения' },
            { id: 'expired', label: 'Завершённые', desc: 'Архив прошлых акций' },
          ].map((tab) => {
            const isActive = filters.status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setField('status', tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#707437] text-white border-[#707437] shadow-sm'
                    : 'bg-[#F2EBDD] text-[#211E19] border-[#BFB3A2] hover:bg-[#EADBCE]'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FFF4B8]" />}
              </button>
            );
          })}
        </div>

        {/* Comprehensive Filter Bar (Requirement 8 & 9) */}
        <div className="bg-[#F2EBDD] p-4 sm:p-5 rounded-3xl border border-[#BFB3A2] space-y-4 shadow-xs">
          
          {/* Top Bar: Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#7C725F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setField('query', e.target.value)}
              placeholder="Поиск по акции, заведению, блюду, кухне или тегу..."
              className="w-full pl-10 pr-10 py-3 bg-[#F8F2E7] border border-[#BFB3A2] rounded-2xl text-xs font-medium text-[#211E19] placeholder-[#7C725F] focus:outline-none focus:border-[#707437] transition-all"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => setField('query', '')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C725F] hover:text-[#211E19]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selectors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* Promotion Type */}
            <div>
              <label className="block text-[11px] font-bold text-[#7C725F] mb-1 uppercase tracking-wider">
                Тип акции
              </label>
              <select
                value={filters.type}
                onChange={(e) => setField('type', e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8F2E7] border border-[#BFB3A2] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#707437]"
              >
                <option value="all">Все типы акций</option>
                <option value="special_menu">Специальное меню</option>
                <option value="brunch">Завтраки & Бранчи</option>
                <option value="tasting">Дегустации</option>
                <option value="seasonal">Сезонное меню</option>
                <option value="discount">Скидки & Спеццены</option>
              </select>
            </div>

            {/* Venue Type */}
            <div>
              <label className="block text-[11px] font-bold text-[#7C725F] mb-1 uppercase tracking-wider">
                Тип заведения
              </label>
              <select
                value={filters.venueType}
                onChange={(e) => setField('venueType', e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8F2E7] border border-[#BFB3A2] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#707437]"
              >
                <option value="all">Все заведения</option>
                <option value="restaurant">Рестораны</option>
                <option value="bar">Бары & Пабы</option>
                <option value="gastrobar">Гастробары</option>
                <option value="sports_bar">Спорт-бары</option>
                <option value="hookah_lounge">Кальянные</option>
              </select>
            </div>

            {/* Cuisine */}
            <div>
              <label className="block text-[11px] font-bold text-[#7C725F] mb-1 uppercase tracking-wider">
                Кухня
              </label>
              <select
                value={filters.cuisine}
                onChange={(e) => setField('cuisine', e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F2E7] border border-[#BFB3A2] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#707437]"
              >
                <option value="all">Любая кухня</option>
                <option value="Итальянская">Итальянская</option>
                <option value="Европейская">Европейская</option>
                <option value="Завтраки">Завтраки</option>
                <option value="Бургеры">Бургеры</option>
                <option value="Кофейни">Спешелти Кофе</option>
                <option value="Французская">Французская</option>
                <option value="Закуски к пиву">Закуски к пиву</option>
                <option value="Авторские кальяны">Кальяны</option>
              </select>
            </div>

            {/* Reservable / Booking */}
            <div>
              <label className="block text-[11px] font-bold text-[#7C725F] mb-1 uppercase tracking-wider">
                Бронирование
              </label>
              <select
                value={filters.reservable}
                onChange={(e) => setField('reservable', e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8F2E7] border border-[#BFB3A2] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#707437]"
              >
                <option value="all">Любая бронь</option>
                <option value="reservable">Можно забронировать</option>
                <option value="instant">Мгновенная бронь</option>
                <option value="request">Бронь по запросу</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-[11px] font-bold text-[#7C725F] mb-1 uppercase tracking-wider">
                Цена сета
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => setField('priceRange', e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8F2E7] border border-[#BFB3A2] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#707437]"
              >
                <option value="all">Все цены</option>
                <option value="under-30">до 30 BYN</option>
                <option value="30-50">30 — 50 BYN</option>
                <option value="50-80">50 — 80 BYN</option>
                <option value="above-80">от 80 BYN</option>
              </select>
            </div>

          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#BFB3A2]/60">
              <span className="text-[11px] font-bold text-[#7C725F]">Активные фильтры:</span>

              {filters.query && (
                <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#211E19] border border-[#BFB3A2] rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>Поиск: "{filters.query}"</span>
                  <button type="button" onClick={() => setField('query', '')} className="hover:text-[#A64F2C]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.status !== 'all' && (
                <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#211E19] border border-[#BFB3A2] rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>Статус: {filters.status}</span>
                  <button type="button" onClick={() => setField('status', 'all')} className="hover:text-[#A64F2C]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.type !== 'all' && (
                <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#211E19] border border-[#BFB3A2] rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>Тип: {filters.type}</span>
                  <button type="button" onClick={() => setField('type', 'all')} className="hover:text-[#A64F2C]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.venueType !== 'all' && (
                <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#211E19] border border-[#BFB3A2] rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>Заведение: {filters.venueType}</span>
                  <button type="button" onClick={() => setField('venueType', 'all')} className="hover:text-[#A64F2C]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.cuisine !== 'all' && (
                <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#211E19] border border-[#BFB3A2] rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>Кухня: {filters.cuisine}</span>
                  <button type="button" onClick={() => setField('cuisine', 'all')} className="hover:text-[#A64F2C]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.priceRange !== 'all' && (
                <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#211E19] border border-[#BFB3A2] rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>Цена: {filters.priceRange}</span>
                  <button type="button" onClick={() => setField('priceRange', 'all')} className="hover:text-[#A64F2C]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-bold text-[#A64F2C] hover:underline ml-auto cursor-pointer"
              >
                Сбросить всё
              </button>
            </div>
          )}

        </div>

        {/* Content States */}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#F2EBDD] rounded-3xl border border-[#BFB3A2] h-96 animate-pulse p-4 flex flex-col justify-between">
                <div className="w-full h-48 bg-[#E2D8C6] rounded-2xl" />
                <div className="space-y-2 mt-4">
                  <div className="w-3/4 h-5 bg-[#E2D8C6] rounded-md" />
                  <div className="w-1/2 h-4 bg-[#E2D8C6] rounded-md" />
                </div>
                <div className="w-full h-10 bg-[#E2D8C6] rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="text-lg font-bold text-red-900">Не удалось загрузить акции</h3>
            <p className="text-xs text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="px-6 py-2.5 bg-[#A64F2C] text-white rounded-full text-xs font-bold hover:bg-[#854023] transition-colors cursor-pointer"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Empty State: Case A - No raw promotions in data source */}
        {!loading && !error && rawPromotions.length === 0 && (
          <div className="p-12 bg-[#F2EBDD] border border-[#BFB3A2] rounded-3xl text-center space-y-4 max-w-xl mx-auto my-12">
            <div className="p-4 bg-[#FFF4B8] rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-[#BFB3A2]">
              <Sparkles className="w-8 h-8 text-[#A64F2C]" />
            </div>
            <h3 className="text-xl font-normal font-['Tenor_Sans',serif] text-[#211E19]">
              Пока нет активных акций
            </h3>
            <p className="text-xs text-[#7C725F] leading-relaxed">
              Новые предложения ресторанов и баров скоро появятся здесь.
            </p>
            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="px-6 py-2.5 bg-[#707437] text-white rounded-full text-xs font-bold hover:bg-[#585c2b] transition-colors cursor-pointer"
            >
              Добавить первую акцию
            </button>
          </div>
        )}

        {/* Empty State: Case B - Filter result is 0 (Requirement 11) */}
        {!loading && !error && rawPromotions.length > 0 && filteredPromotions.length === 0 && (
          <div className="p-12 bg-[#F2EBDD] border border-[#BFB3A2] rounded-3xl text-center space-y-4 max-w-xl mx-auto my-12">
            <div className="p-4 bg-[#FFF4B8] rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-[#BFB3A2]">
              <Search className="w-8 h-8 text-[#A64F2C]" />
            </div>
            <h3 className="text-xl font-normal font-['Tenor_Sans',serif] text-[#211E19]">
              По выбранным условиям ничего не найдено
            </h3>
            <p className="text-xs text-[#7C725F] leading-relaxed">
              Попробуйте изменить запрос или убрать один из фильтров.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onResetFilters}
                className="px-5 py-2.5 bg-[#A64F2C] text-white rounded-full text-xs font-bold hover:bg-[#854023] transition-colors cursor-pointer"
              >
                Сбросить фильтры
              </button>
              <button
                type="button"
                onClick={() => onFilterChange(DEFAULT_OFFERS_FILTERS)}
                className="px-5 py-2.5 bg-[#707437] text-white rounded-full text-xs font-bold hover:bg-[#585c2b] transition-colors cursor-pointer"
              >
                Показать все акции
              </button>
            </div>
          </div>
        )}

        {/* Promotions Card Grid */}
        {!loading && !error && filteredPromotions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[#7C725F] font-semibold">
              <span>Найдено предложений: <strong className="text-[#211E19]">{filteredPromotions.length}</strong></span>
              <span>Данные синхронизированы c каталогом</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map((item) => {
                const { promotion: p, venue: v } = item;
                const status = getPromotionStatus(p.startDate, p.endDate);

                return (
                  <div
                    key={p.id}
                    className="group bg-[#F2EBDD] rounded-3xl border border-[#BFB3A2] overflow-hidden hover:border-[#707437] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Card Top / Image */}
                    <div>
                      <div className="relative h-52 w-full overflow-hidden bg-[#211E19]">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-3 py-1 bg-[#A64F2C] text-white text-[11px] font-bold rounded-full shadow-xs">
                            {p.badge || 'Акция'}
                          </span>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                            status === 'active'
                              ? 'bg-[#707437] text-white border-[#707437]'
                              : status === 'upcoming'
                              ? 'bg-[#FFF4B8] text-[#211E19] border-[#BFB3A2]'
                              : 'bg-black/60 text-white/80 border-white/20'
                          }`}>
                            {status === 'active' ? 'Сейчас' : status === 'upcoming' ? 'Скоро' : 'Завершено'}
                          </span>
                        </div>

                        {/* Price Badge on Banner */}
                        {typeof p.price === 'number' && (
                          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#FFF4B8] text-[#211E19] font-extrabold text-xs rounded-xl shadow-md border border-[#BFB3A2]">
                            {p.price} BYN
                          </div>
                        )}

                        {/* Dates text on banner */}
                        <div className="absolute bottom-3 left-3 text-[11px] text-white/90 font-medium flex items-center gap-1.5 drop-shadow-sm">
                          <Calendar className="w-3.5 h-3.5 text-[#FFF4B8]" />
                          <span>{p.startDate} — {p.endDate}</span>
                        </div>
                      </div>

                      {/* Card Middle: Content */}
                      <div className="p-5 space-y-3">
                        
                        {/* Title */}
                        <h3 className="text-lg font-normal font-['Tenor_Sans',serif] text-[#211E19] group-hover:text-[#707437] transition-colors line-clamp-1">
                          {p.title}
                        </h3>

                        {/* Short Description */}
                        <p className="text-xs text-[#7C725F] line-clamp-2 leading-relaxed">
                          {p.shortDescription || p.description}
                        </p>

                        {/* Tags */}
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {p.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-[#F8F2E7] border border-[#BFB3A2] rounded-md text-[10px] font-bold text-[#6B645A]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Connected Venue Footer Box */}
                        <div className="p-3 bg-[#F8F2E7] rounded-2xl border border-[#BFB3A2] flex items-center justify-between gap-3 mt-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={v.photos[0]}
                              alt={v.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#BFB3A2] flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#211E19] truncate">{v.name}</h4>
                              <p className="text-[10px] text-[#7C725F] truncate">
                                {v.primaryCuisine || v.type} • {v.district}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFF4B8] border border-[#BFB3A2] rounded-xl text-[11px] font-bold text-[#211E19] flex-shrink-0">
                            <Star className="w-3 h-3 fill-[#A64F2C] text-[#A64F2C]" />
                            <span>{v.rating}</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="w-full py-2.5 bg-[#E2D8C6] hover:bg-[#D5C8B2] text-[#211E19] text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Подробнее
                      </button>

                      {p.reservable !== false && v.isReservable ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onBookVenue) {
                              onBookVenue(v);
                            } else {
                              onSelectRestaurant(v);
                            }
                          }}
                          className="w-full py-2.5 bg-[#A64F2C] hover:bg-[#854023] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                        >
                          Забронировать
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectRestaurant(v)}
                          className="w-full py-2.5 bg-[#707437] hover:bg-[#585c2b] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                        >
                          В заведение
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Promotion Detail Modal */}
      {selectedItem && (
        <FestivalDetailModal
          festival={selectedItem.promotion}
          venue={selectedItem.venue}
          onClose={() => setSelectedItem(null)}
          onSelectRestaurant={(rest) => {
            setSelectedItem(null);
            onSelectRestaurant(rest);
          }}
          onBookVenue={(rest) => {
            setSelectedItem(null);
            if (onBookVenue) onBookVenue(rest);
          }}
        />
      )}

      {/* Admin Promotion Modal */}
      <AdminPromotionModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onPromotionsUpdated={loadData}
      />

    </div>
  );
};
