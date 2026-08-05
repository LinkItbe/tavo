import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Check, RotateCcw, Filter as FilterIcon } from 'lucide-react';
import { FilterState, Restaurant } from '../types';
import { filterRestaurants, getActiveFiltersCount } from '../utils/filterUtils';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  allRestaurants: Restaurant[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  allRestaurants,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [showAllCuisines, setShowAllCuisines] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      if (filters.cuisines.some(c => EXPANDED_CUISINES.includes(c))) {
        setShowAllCuisines(true);
      }
    }
  }, [isOpen, filters]);

  const matchingCount = useMemo(() => {
    return filterRestaurants(allRestaurants, localFilters).length;
  }, [allRestaurants, localFilters]);

  if (!isOpen) return null;

  const TYPES_OPTIONS = [
    'Ресторан',
    'Кафе',
    'Кофейня',
    'Бар',
    'Винный бар',
    'Гастробар',
    'Бистро',
    'Стейк-хаус',
  ];

  const POPULAR_CUISINES = [
    'Итальянская',
    'Японская',
    'Белорусская',
    'Грузинская',
    'Европейская',
    'Паназиатская',
    'Средиземноморская',
    'Мексиканская',
  ];

  const EXPANDED_CUISINES = [
    'Американская',
    'Китайская',
    'Кавказская',
    'Восточная',
    'Французская',
    'Индийская',
    'Узбекская',
    'BBQ',
  ];

  const CHECK_OPTIONS = [
    { id: 'under-30', label: 'До 30 BYN' },
    { id: '30-50', label: '30–50 BYN' },
    { id: '50-80', label: '50–80 BYN' },
    { id: 'above-80', label: 'От 80 BYN' },
  ];

  const FEATURES_OPTIONS = [
    { label: 'Открыто сейчас', value: 'openNow' },
    { label: 'Завтраки', value: 'Завтраки' },
    { label: 'Для свидания', value: 'Для свидания' },
    { label: 'Летняя терраса', value: 'Летняя терраса' },
    { label: 'Панорамный вид или вид на воду', value: 'Панорамный вид или вид на воду' },
    { label: 'Можно с животными', value: 'Можно с животными' },
    { label: 'Подходит для детей', value: 'Подходит для детей' },
    { label: 'Для больших компаний и банкетов', value: 'Для больших компаний и банкетов' },
  ];

  const AMENITIES_OPTIONS = [
    'Парковка',
    'Бесплатный Wi-Fi',
    'Кондиционер',
    'Безбарьерный вход',
  ];

  const FOOD_OPTIONS = [
    'Бар',
    'Вегетарианское меню',
    'Веганское меню',
    'Детское меню',
  ];

  const ENTERTAINMENT_OPTIONS = [
    'Живая музыка',
    'Танцпол',
  ];

  const SMOKING_OPTIONS = [
    { id: 'any', label: 'Неважно' },
    { id: 'non-smoking', label: 'Только для некурящих' },
    { id: 'smoking-zone', label: 'Есть зона для курения' },
    { id: 'smoking-allowed', label: 'Курение разрешено' },
  ];

  const BOOKING_OPTIONS = [
    { id: 'online', label: 'Можно забронировать онлайн' },
    { id: 'instant', label: 'Мгновенное подтверждение' },
    { id: 'request', label: 'Бронирование по запросу' },
  ];

  const toggleType = (type: string) => {
    setLocalFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setLocalFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const toggleCheck = (id: string) => {
    setLocalFilters(prev => ({
      ...prev,
      checkRanges: prev.checkRanges.includes(id) ? [] : [id],
    }));
  };

  const toggleFeature = (val: string) => {
    if (val === 'openNow') {
      setLocalFilters(prev => ({ ...prev, openNow: !prev.openNow }));
      return;
    }
    setLocalFilters(prev => ({
      ...prev,
      features: prev.features.includes(val)
        ? prev.features.filter(f => f !== val)
        : [...prev.features, val],
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setLocalFilters(prev => {
      const current = prev.amenities || [];
      return {
        ...prev,
        amenities: current.includes(amenity)
          ? current.filter(a => a !== amenity)
          : [...current, amenity],
      };
    });
  };

  const toggleFoodOption = (food: string) => {
    setLocalFilters(prev => {
      const current = prev.foodOptions || prev.specialMenu || [];
      const updated = current.includes(food)
        ? current.filter(f => f !== food)
        : [...current, food];
      return {
        ...prev,
        foodOptions: updated,
        specialMenu: updated,
      };
    });
  };

  const toggleEntertainment = (item: string) => {
    setLocalFilters(prev => {
      const current = prev.entertainment || [];
      return {
        ...prev,
        entertainment: current.includes(item)
          ? current.filter(e => e !== item)
          : [...current, item],
      };
    });
  };

  const SEATING_OPTIONS = [
    'Обычный стол',
    'Стол у окна',
    'На террасе',
    'У экрана',
    'За барной стойкой',
    'Кальянная зона',
    'VIP-комната',
    'Диван или кабинка',
    'Большой стол',
  ];

  const toggleSeating = (pref: string) => {
    setLocalFilters(prev => {
      const current = prev.seatingPreferences || [];
      return {
        ...prev,
        seatingPreferences: current.includes(pref)
          ? current.filter(p => p !== pref)
          : [...current, pref],
      };
    });
  };

  const resetLocalFilters = () => {
    setLocalFilters(prev => ({
      ...prev,
      primaryType: 'all',
      subBarType: 'all',
      types: [],
      cuisines: [],
      checkRanges: [],
      features: [],
      seatingPreferences: [],
      amenities: [],
      foodOptions: [],
      specialMenu: [],
      entertainment: [],
      smokingPolicy: 'any',
      smoking: 'any',
      reservationMode: 'all',
      openNow: false,
      lateWorking: false,
      reservable: false,
      district: '',
    }));
  };

  const activeCount = getActiveFiltersCount(localFilters);

  const displayedCuisines = showAllCuisines
    ? [...POPULAR_CUISINES, ...EXPANDED_CUISINES]
    : POPULAR_CUISINES;

  const filteredCuisines = displayedCuisines.filter(c =>
    c.toLowerCase().includes(cuisineSearch.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-end md:items-center justify-end md:justify-center bg-black/50 backdrop-blur-xs transition-opacity p-0 md:p-4 font-['Geologica'] text-[#211E19]">
      
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full md:max-w-2xl bg-[#F2EBDD] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col h-[92vh] md:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom duration-200 border border-[#BFB3A2]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#BFB3A2] flex items-center justify-between bg-[#F2EBDD] sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <FilterIcon className="w-5 h-5 text-[#A64F2C]" />
            <h2 className="text-lg font-normal font-['Tenor_Sans',serif] uppercase tracking-wider text-[#211E19]">
              {activeCount > 0 ? `Фильтры · ${activeCount}` : 'Фильтры'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F8F2E7] text-[#6B645A] hover:text-[#211E19] transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-2 overflow-y-auto flex-1 no-scrollbar space-y-6 divide-y divide-[#BFB3A2]/60">
          
          {/* Section 0: Основная категория */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Категория заведения
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Все заведения' },
                { id: 'restaurant', label: 'Рестораны' },
                { id: 'bar', label: 'Бары' },
                { id: 'sports_bar', label: 'Спорт-бары' },
                { id: 'hookah_lounge', label: 'Кальянные' },
              ].map(cat => {
                const isSelected = (localFilters.primaryType || 'all') === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setLocalFilters(prev => ({ ...prev, primaryType: cat.id as any }))}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#707437] text-white font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Формат и тип */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Тип заведения
            </h3>
            <div className="flex flex-wrap gap-2">
              {TYPES_OPTIONS.map(type => {
                const isSelected = localFilters.types.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Кухня */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Кухня
            </h3>

            {showAllCuisines && (
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-[#6B645A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cuisineSearch}
                  onChange={(e) => setCuisineSearch(e.target.value)}
                  placeholder="Поиск кухни..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F2E7] border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {filteredCuisines.map(cuisine => {
                const isSelected = localFilters.cuisines.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                    {cuisine}
                  </button>
                );
              })}
            </div>

            {!showAllCuisines && (
              <button
                type="button"
                onClick={() => setShowAllCuisines(true)}
                className="mt-3 text-xs font-bold text-[#707437] hover:underline transition-colors cursor-pointer py-1.5"
              >
                Все кухни →
              </button>
            )}
          </div>

          {/* Section 3: Средний чек */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Средний чек
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHECK_OPTIONS.map(check => {
                const isSelected = localFilters.checkRanges.includes(check.id);
                return (
                  <button
                    key={check.id}
                    type="button"
                    onClick={() => toggleCheck(check.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {check.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Посадка и предпочтения по столу */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Предпочтения по посадке и столу
            </h3>
            <div className="flex flex-wrap gap-2">
              {SEATING_OPTIONS.map(pref => {
                const isSelected = (localFilters.seatingPreferences || []).includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleSeating(pref)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Особенности */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Особенности
            </h3>
            <div className="flex flex-wrap gap-2">
              {FEATURES_OPTIONS.map(item => {
                const isSelected = item.value === 'openNow'
                  ? localFilters.openNow
                  : localFilters.features.includes(item.value);

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleFeature(item.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Удобства */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Удобства
            </h3>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_OPTIONS.map(amenity => {
                const isSelected = (localFilters.amenities || []).includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Еда и напитки */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Еда и напитки
            </h3>
            <div className="flex flex-wrap gap-2">
              {FOOD_OPTIONS.map(food => {
                const activeList = localFilters.foodOptions || localFilters.specialMenu || [];
                const isSelected = activeList.includes(food);
                return (
                  <button
                    key={food}
                    type="button"
                    onClick={() => toggleFoodOption(food)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                    {food}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 7: Развлечения */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Развлечения
            </h3>
            <div className="flex flex-wrap gap-2">
              {ENTERTAINMENT_OPTIONS.map(item => {
                const isSelected = (localFilters.entertainment || []).includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEntertainment(item)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 8: Курение */}
          <div className="pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Курение
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SMOKING_OPTIONS.map(opt => {
                const currentSmoking = localFilters.smokingPolicy || localFilters.smoking || 'any';
                const isSelected = currentSmoking === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLocalFilters(prev => ({ ...prev, smokingPolicy: opt.id as any, smoking: opt.id as any }))}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 9: Бронирование */}
          <div className="pt-6 pb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#211E19] mb-3">
              Бронирование
            </h3>
            <div className="space-y-2">
              {BOOKING_OPTIONS.map(mode => {
                const isSelected = localFilters.reservationMode === mode.id || (mode.id === 'online' && localFilters.reservable);
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setLocalFilters(prev => ({ ...prev, reservationMode: 'all', reservable: false }));
                      } else {
                        if (mode.id === 'online') {
                          setLocalFilters(prev => ({ ...prev, reservationMode: 'online', reservable: true }));
                        } else {
                          setLocalFilters(prev => ({ ...prev, reservationMode: mode.id as any, reservable: true }));
                        }
                      }
                    }}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFF4B8] border border-[#707437] text-[#4E5328] font-bold shadow-xs'
                        : 'bg-[#F8F2E7] border border-[#BFB3A2] text-[#211E19] hover:bg-[#F5EBC3]'
                    }`}
                  >
                    <span>{mode.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#BFB3A2] bg-[#F2EBDD] sticky bottom-0 z-10 flex items-center justify-between gap-4 flex-shrink-0">
          <button
            type="button"
            onClick={resetLocalFilters}
            disabled={activeCount === 0}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors py-2 px-1 ${
              activeCount === 0
                ? 'text-[#6B645A] cursor-not-allowed opacity-50'
                : 'text-[#211E19] hover:text-[#A64F2C] cursor-pointer'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Сбросить всё
          </button>

          <button
            type="button"
            onClick={() => {
              onApplyFilters(localFilters);
              onClose();
            }}
            className="px-6 py-3 bg-[#A64F2C] hover:bg-[#854023] text-white text-xs font-bold rounded-full transition-all duration-200 shadow-md active:scale-95 cursor-pointer flex items-center gap-2 min-h-[44px]"
          >
            Показать {matchingCount} {getNounPlural(matchingCount, 'место', 'места', 'мест')}
          </button>
        </div>

      </div>
    </div>
  );
};

function getNounPlural(number: number, one: string, two: string, five: string) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}
