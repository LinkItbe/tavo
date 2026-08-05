import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Utensils, 
  SlidersHorizontal, 
  X, 
  Check, 
  Sparkles, 
  Flame, 
  Building2, 
  Loader2,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Users
} from 'lucide-react';
import { FilterState, Restaurant } from '../types';
import { CITIES, CATEGORIES, COLLECTIONS } from '../data/mockData';
import { getActiveFiltersCount, filterRestaurants } from '../utils/filterUtils';
import { formatDateTimeRu, formatPartySizeRu } from '../utils/bookingUtils';
import { DateTimePickerPopover } from './DateTimePickerPopover';
import { GuestsPickerPopover } from './GuestsPickerPopover';

interface HeroSectionProps {
  filters: FilterState;
  onUpdateFilters: (newFilters: FilterState) => void;
  onOpenFilterModal: () => void;
  onPerformSearch: (overrideFilters?: FilterState) => void;
  allRestaurants: Restaurant[];
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  onNavigate?: (path: string) => void;
  currentPathname?: string;
}

interface SuggestionItem {
  id: string;
  type: 'restaurant' | 'cuisine' | 'dish' | 'feature' | 'collection';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  action: () => void;
  data?: any;
}

// 1. Stylized Ceramic Dinner Plate
const StylizedPlate = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_22px_40px_rgba(30,27,23,0.10)]">
    <circle cx="100" cy="100" r="96" fill="#F2EBDD" stroke="#BFB3A2" strokeWidth="2" />
    <circle cx="100" cy="100" r="82" fill="#F8F2E7" opacity="0.7" />
    <circle cx="100" cy="100" r="88" fill="none" stroke="#707437" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.8" />
    <circle cx="100" cy="100" r="68" fill="#F2EBDD" stroke="#BFB3A2" strokeWidth="1" />
    <circle cx="100" cy="100" r="14" fill="#FFF4B8" stroke="#A64F2C" strokeWidth="1" opacity="0.85" />
    <circle cx="100" cy="100" r="4" fill="#A64F2C" />
  </svg>
);

// 2. Stylized Crystal Wine Glass / Coupe
const StylizedGlass = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_20px_35px_rgba(30,27,23,0.11)]">
    <circle cx="80" cy="80" r="74" fill="#F2EBDD" opacity="0.5" />
    <circle cx="80" cy="80" r="72" fill="#FFF4B8" opacity="0.65" stroke="#BFB3A2" strokeWidth="1.5" />
    <circle cx="80" cy="80" r="54" fill="#FFF4B8" stroke="#A64F2C" strokeWidth="1" opacity="0.9" />
    <circle cx="80" cy="80" r="32" fill="#A64F2C" opacity="0.2" />
    <path d="M 30 80 A 50 50 0 0 1 130 80" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.9" strokeLinecap="round" />
  </svg>
);

// 3. Stylized Cutlery Set (Fork & Knife on Linen)
const StylizedCutlery = () => (
  <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-[0_20px_38px_rgba(30,27,23,0.11)]">
    <rect x="25" y="20" width="130" height="140" rx="18" fill="#F8F2E7" stroke="#BFB3A2" strokeWidth="1.5" />
    <rect x="35" y="30" width="110" height="120" rx="12" fill="#F2EBDD" stroke="#707437" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
    <g transform="translate(60, 35)">
      <rect x="12" y="45" width="8" height="65" rx="4" fill="#707437" />
      <rect x="14" y="47" width="4" height="61" rx="2" fill="#4E5328" />
      <rect x="13" y="25" width="6" height="20" rx="2" fill="#BFB3A2" />
      <path d="M 5 5 L 5 28 C 5 32 27 32 27 28 L 27 5" fill="none" stroke="#BFB3A2" strokeWidth="2.5" />
      <line x1="12" y1="5" x2="12" y2="28" stroke="#BFB3A2" strokeWidth="2" />
      <line x1="20" y1="5" x2="20" y2="28" stroke="#BFB3A2" strokeWidth="2" />
    </g>
    <g transform="translate(100, 35)">
      <rect x="12" y="45" width="8" height="65" rx="4" fill="#A64F2C" />
      <rect x="14" y="47" width="4" height="61" rx="2" fill="#854023" />
      <path d="M 14 5 C 24 15 22 35 14 45 Z" fill="#BFB3A2" stroke="#A89C8B" strokeWidth="1" />
    </g>
  </svg>
);

// 4. Stylized Napkin with Terracotta Ring
const StylizedNapkin = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_18px_32px_rgba(30,27,23,0.10)]">
    <path d="M 30 20 L 130 50 L 110 140 L 20 110 Z" fill="#F2EBDD" stroke="#BFB3A2" strokeWidth="1.5" />
    <path d="M 30 20 L 110 140" stroke="#F8F2E7" strokeWidth="2" />
    <rect x="55" y="65" width="50" height="22" rx="6" fill="#A64F2C" stroke="#854023" strokeWidth="1.5" transform="rotate(-15 80 76)" />
    <rect x="65" y="70" width="30" height="12" rx="3" fill="#FFF4B8" opacity="0.7" transform="rotate(-15 80 76)" />
  </svg>
);

// 5. Stylized Small Saucer with Olive & Herb Oil
const StylizedSaucer = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_18px_32px_rgba(30,27,23,0.10)]">
    <circle cx="80" cy="80" r="74" fill="#F2EBDD" stroke="#BFB3A2" strokeWidth="2" />
    <circle cx="80" cy="80" r="58" fill="#F8F2E7" />
    <circle cx="80" cy="80" r="44" fill="#FFF4B8" stroke="#707437" strokeWidth="1.5" opacity="0.9" />
    <circle cx="70" cy="72" r="5" fill="#707437" />
    <circle cx="90" cy="82" r="4" fill="#707437" />
    <circle cx="78" cy="92" r="3" fill="#A64F2C" />
  </svg>
);

// 6. Stylized Espresso Cup & Saucer
const StylizedCup = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_18px_32px_rgba(30,27,23,0.11)]">
    <circle cx="80" cy="80" r="74" fill="#F2EBDD" stroke="#BFB3A2" strokeWidth="2" />
    <circle cx="80" cy="80" r="56" fill="#F8F2E7" stroke="#BFB3A2" strokeWidth="1" />
    <circle cx="80" cy="80" r="42" fill="#F2EBDD" stroke="#211E19" strokeWidth="2" />
    <circle cx="80" cy="80" r="34" fill="#A64F2C" opacity="0.85" />
    <circle cx="80" cy="80" r="22" fill="#FFF4B8" opacity="0.3" />
    <rect x="122" y="40" width="6" height="50" rx="3" fill="#BFB3A2" transform="rotate(25 125 65)" />
  </svg>
);

interface TablewareObjectItem {
  id: string;
  name: string;
  component: React.FC;
  className: string;
  mobileHidden?: boolean;
}

const TABLEWARE_ITEMS: TablewareObjectItem[] = [
  {
    id: 'plate',
    name: 'Керамическая тарелка',
    component: StylizedPlate,
    className: 'top-[10%] left-[2%] sm:left-[3%] w-36 sm:w-52 lg:w-60 h-36 sm:h-52 lg:h-60',
  },
  {
    id: 'glass',
    name: 'Бокал',
    component: StylizedGlass,
    className: 'top-[9%] right-[2%] sm:right-[3%] w-32 sm:w-48 lg:w-52 h-32 sm:h-48 lg:h-52',
  },
  {
    id: 'cutlery',
    name: 'Приборы',
    component: StylizedCutlery,
    className: 'bottom-[10%] left-[2%] sm:left-[4%] w-36 sm:w-48 lg:w-56 h-36 sm:h-48 lg:h-56',
  },
  {
    id: 'napkin',
    name: 'Салфетка',
    component: StylizedNapkin,
    className: 'bottom-[8%] right-[2%] sm:right-[3%] w-32 sm:w-48 lg:w-52 h-32 sm:h-48 lg:h-52',
  },
  {
    id: 'saucer',
    name: 'Соусник',
    component: StylizedSaucer,
    className: 'top-[47%] left-[1%] sm:left-[1.5%] w-28 sm:w-40 lg:w-44 h-28 sm:h-40 lg:h-44',
    mobileHidden: true,
  },
  {
    id: 'cup',
    name: 'Чашка',
    component: StylizedCup,
    className: 'top-[45%] right-[1%] sm:right-[1.5%] w-28 sm:w-40 lg:w-44 h-28 sm:h-40 lg:h-44',
    mobileHidden: true,
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  filters,
  onUpdateFilters,
  onOpenFilterModal,
  onPerformSearch,
  allRestaurants,
  onSelectRestaurant,
  onNavigate,
  currentPathname,
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [queryInput, setQueryInput] = useState(filters?.query || '');
  const [debouncedQuery, setDebouncedQuery] = useState(filters?.query || '');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Popover controls
  const [dateTimePickerOpen, setDateTimePickerOpen] = useState(false);
  const [guestsPickerOpen, setGuestsPickerOpen] = useState(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const dateTimeRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mobile Hero Category Track Scrollbar Logic
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileScrollbarRef = useRef<HTMLDivElement>(null);
  const mobileThumbRef = useRef<HTMLDivElement>(null);

  const updateMobileScrollbar = useCallback(() => {
    const track = mobileTrackRef.current;
    const bar = mobileScrollbarRef.current;
    const thumb = mobileThumbRef.current;
    if (!track || !bar || !thumb) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    if (scrollWidth <= clientWidth + 1) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'block';

    const trackWidth = 72; // fixed width of .mobile-category-scrollbar
    const scrollableWidth = scrollWidth - clientWidth;
    const scrollProgress = scrollableWidth > 0 ? Math.min(1, Math.max(0, scrollLeft / scrollableWidth)) : 0;

    const thumbRatio = Math.min(1, clientWidth / scrollWidth);
    const thumbWidth = Math.min(trackWidth, Math.max(22, Math.round(thumbRatio * trackWidth)));
    const maxThumbOffset = trackWidth - thumbWidth;
    const thumbOffset = Math.round(scrollProgress * maxThumbOffset);

    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translateX(${thumbOffset}px)`;
  }, []);

  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateMobileScrollbar();
        rafId = null;
      });
    };

    const handleResize = () => {
      updateMobileScrollbar();
    };

    updateMobileScrollbar();
    // Re-check after layout settles
    const timeoutId = setTimeout(updateMobileScrollbar, 100);

    track.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateMobileScrollbar();
      });
      ro.observe(track);
    }

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      track.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [updateMobileScrollbar]);

  const activePathname = currentPathname || (typeof window !== 'undefined' ? window.location.pathname : '/');

  const isMobileItemActive = (path: string) => {
    if (activePathname === '/' || activePathname === '') return false;
    if (path === '/offers') {
      return activePathname.startsWith('/offers') || activePathname.startsWith('/festivals');
    }
    return activePathname === path || activePathname.startsWith(path + '/');
  };

  const handleMobileLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Smooth Interactive Float / Repulsion Physics for Tableware
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    let animationFrameId: number;
    let mouseX = -9999;
    let mouseY = -9999;

    const offsets = TABLEWARE_ITEMS.map(() => ({ x: 0, y: 0, rot: 0, scale: 1 }));

    const handleMouseMove = (e: MouseEvent) => {
      if (isTouch || prefersReduced) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    const startTime = Date.now();

    const updatePositions = () => {
      if (prefersReduced) return;

      const time = (Date.now() - startTime) / 1000;

      itemRefs.current.forEach((el, index) => {
        if (!el) return;

        let targetX = 0;
        let targetY = 0;
        let targetRot = 0;
        let targetScale = 1;

        if (isTouch) {
          const speed = 0.7 + index * 0.12;
          targetX = Math.sin(time * speed) * 4;
          targetY = Math.cos(time * speed * 0.8) * 4;
        } else {
          const windowCenterX = window.innerWidth / 2;
          const windowCenterY = window.innerHeight / 2;
          const cursorRatioX = mouseX > -9000 ? (mouseX - windowCenterX) / windowCenterX : 0;
          const cursorRatioY = mouseY > -9000 ? (mouseY - windowCenterY) / windowCenterY : 0;

          // Gentle 4-8px mouse parallax shift based on viewport position
          const parallaxFactor = 4 + (index % 3) * 2;
          const parallaxX = cursorRatioX * parallaxFactor;
          const parallaxY = cursorRatioY * parallaxFactor;

          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const dx = centerX - mouseX;
          const dy = centerY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 160;

          if (dist < radius && dist > 0) {
            const force = (1 - dist / radius);
            const maxPush = 8;
            targetX = parallaxX + (dx / dist) * force * maxPush;
            targetY = parallaxY + (dy / dist) * force * maxPush;
            targetRot = (dx / dist) * force * 1.5;
            targetScale = 1 + force * 0.01;
          } else {
            targetX = parallaxX + Math.sin(time * 0.4 + index) * 1.5;
            targetY = parallaxY + Math.cos(time * 0.35 + index) * 1.5;
          }
        }

        offsets[index].x += (targetX - offsets[index].x) * 0.1;
        offsets[index].y += (targetY - offsets[index].y) * 0.1;
        offsets[index].rot += (targetRot - offsets[index].rot) * 0.1;
        offsets[index].scale += (targetScale - offsets[index].scale) * 0.1;

        el.style.transform = `translate3d(${offsets[index].x.toFixed(2)}px, ${offsets[index].y.toFixed(2)}px, 0) rotate(${offsets[index].rot.toFixed(2)}deg) scale(${offsets[index].scale.toFixed(3)})`;
      });

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleScrollToCuisines = () => {
    const el = document.getElementById('categories-section') || document.getElementById('quick-filters-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setQueryInput(filters?.query || '');
  }, [filters?.query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(queryInput);
    }, 200);
    return () => clearTimeout(timer);
  }, [queryInput]);

  useEffect(() => {
    if (queryInput.trim().length >= 2) {
      setIsLoadingSuggestions(true);
      const timer = setTimeout(() => {
        setIsLoadingSuggestions(false);
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setIsLoadingSuggestions(false);
    }
  }, [queryInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return CITIES;
    return CITIES.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()));
  }, [citySearchQuery]);

  const suggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: SuggestionItem[] = [];

    // Filter restaurants by category first so search suggestions respect primaryType
    const categoryFiltered = filterRestaurants(allRestaurants, { ...filters, query: '' });

    const matchedRestaurants = categoryFiltered.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.cuisine.some(c => c.toLowerCase().includes(q)) ||
      r.features?.some(f => f.toLowerCase().includes(q)) ||
      r.menu.some(cat => cat.dishes.some(d => d.name.toLowerCase().includes(q)))
    ).slice(0, 4);

    matchedRestaurants.forEach(r => {
      results.push({
        id: `rest-${r.id}`,
        type: 'restaurant',
        title: r.name,
        subtitle: `${r.cuisine.join(', ')} · ${r.address}`,
        icon: Building2,
        action: () => {
          if (onSelectRestaurant) {
            onSelectRestaurant(r);
          } else {
            const updated = { ...filters, query: r.name };
            onUpdateFilters(updated);
            onPerformSearch(updated);
          }
          setSuggestionsOpen(false);
        },
        data: r
      });
    });

    const matchedCategories = CATEGORIES.filter(c => 
      c.name.toLowerCase().includes(q)
    ).slice(0, 3);

    matchedCategories.forEach(c => {
      results.push({
        id: `cat-${c.id}`,
        type: 'cuisine',
        title: c.name,
        subtitle: 'Кухня и категорийный выбор',
        icon: Utensils,
        action: () => {
          const updated = { 
            ...filters, 
            query: '', 
            cuisines: filters.cuisines.includes(c.name) ? filters.cuisines : [...filters.cuisines, c.name] 
          };
          onUpdateFilters(updated);
          onPerformSearch(updated);
          setSuggestionsOpen(false);
        }
      });
    });

    const dishes = ['Пицца', 'Паста', 'Суши', 'Стейк', 'Бургеры', 'Рамен', 'Хинкали', 'Десерты', 'Кофе', 'Завтраки'];
    const matchedDishes = dishes.filter(d => d.toLowerCase().includes(q)).slice(0, 2);

    matchedDishes.forEach(d => {
      results.push({
        id: `dish-${d}`,
        type: 'dish',
        title: d,
        subtitle: 'Блюдо или позиция меню',
        icon: Flame,
        action: () => {
          setQueryInput(d);
          const updated = { ...filters, query: d };
          onUpdateFilters(updated);
          onPerformSearch(updated);
          setSuggestionsOpen(false);
        }
      });
    });

    const matchedCollections = COLLECTIONS.filter(col => 
      col.name.toLowerCase().includes(q) || col.subtitle.toLowerCase().includes(q)
    ).slice(0, 2);

    matchedCollections.forEach(col => {
      results.push({
        id: `col-${col.id}`,
        type: 'collection',
        title: col.name,
        subtitle: col.subtitle,
        icon: Sparkles,
        action: () => {
          setQueryInput(col.name);
          const updated = { ...filters, query: col.name };
          onUpdateFilters(updated);
          onPerformSearch(updated);
          setSuggestionsOpen(false);
        }
      });
    });

    return results;
  }, [debouncedQuery, allRestaurants, filters, onUpdateFilters, onPerformSearch, onSelectRestaurant]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        const updated = { ...filters, query: queryInput };
        onUpdateFilters(updated);
        onPerformSearch(updated);
        setSuggestionsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        suggestions[selectedIndex].action();
      } else {
        const updated = { ...filters, query: queryInput };
        onUpdateFilters(updated);
        onPerformSearch(updated);
        setSuggestionsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  };

  const activeFiltersCount = getActiveFiltersCount(filters);

  const QUICK_TAGS = [
    { label: 'Открыто сейчас', isOpenNow: true },
    { label: 'Завтраки', cuisineName: 'Завтраки' },
    { label: 'Для свидания', featureName: 'Романтическая атмосфера' },
    { label: 'Летняя терраса', featureName: 'Терраса' },
    { label: 'Живая музыка', featureName: 'Живая музыка' },
    { label: 'Парковка', featureName: 'Парковка' },
  ];

  return (
    <div className="w-full flex flex-col font-['Geologica']">
      
      {/* 1. HERO SECTION WITH DOCUMENT FLOW STACK */}
      <section 
        className="relative w-full min-h-[calc(100vh-76px)] bg-gradient-to-b from-[#8A4B2D] via-[#814326] to-[#6E3A21] flex flex-col items-center justify-center px-4 sm:px-8 pt-16 sm:pt-20 pb-[72px] select-none overflow-hidden"
      >
        
        {/* STYLIZED TABLEWARE BACKGROUND OBJECTS */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden opacity-30">
          {TABLEWARE_ITEMS.map((item, index) => {
            const Comp = item.component;
            return (
              <div
                key={item.id}
                ref={(el) => { itemRefs.current[index] = el; }}
                className={`absolute transition-transform duration-75 ease-out ${item.className} ${item.mobileHidden ? 'hidden sm:block' : 'block'}`}
              >
                <Comp />
              </div>
            );
          })}
        </div>

        {/* SINGLE CENTRAL CONTENT STACK */}
        <div className="relative z-20 w-full max-w-[1060px] mx-auto flex flex-col items-center gap-5 sm:gap-6 text-center my-auto">
          
          {/* Eyebrow / Hero Phrase */}
          <h1 className="hero-phrase-enter m-0 text-center font-['Geologica'] text-[14px] sm:text-[15px] md:text-[17px] font-semibold tracking-[0.16em] uppercase text-[#FFF4B8] leading-[1.3] opacity-90">
            ВЫБЕРИ · ЗАБРОНИРУЙ · ИЗУЧИ КУХНИ
          </h1>

          {/* Primary Category Segmented Control (Desktop) */}
          <div className="hidden md:flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-[#4F5328]/40 backdrop-blur-md border border-[#FFF4B8]/30 rounded-full shadow-md max-w-full overflow-x-auto no-scrollbar relative z-30">
            {[
              { id: 'restaurant', label: 'Рестораны', path: '/restaurants' },
              { id: 'bar', label: 'Бары', path: '/bars?type=bar' },
              { id: 'sports_bar', label: 'Спорт-бары', path: '/bars?type=sports_bar' },
              { id: 'hookah_lounge', label: 'Кальянные', path: '/bars?type=hookah_lounge' },
              { id: 'gastrobar', label: 'Гастробары', path: '/bars?type=gastrobar' },
            ].map((cat) => {
              const isSelected = filters.primaryType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(cat.path);
                    } else {
                      onUpdateFilters({
                        ...filters,
                        primaryType: cat.id as any,
                        subBarType: cat.id === 'restaurant' ? 'all' : (cat.id as any),
                      });
                    }
                  }}
                  className={`px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FFF4B8] text-[#4F5328] shadow-sm font-bold scale-[1.02]'
                      : 'text-[#FFF4B8] hover:bg-[#FFF4B8]/20 hover:text-white'
                  }`}
                >
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-[#4F5328]" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Hero Category Track (< 768px) */}
          <div className="md:hidden relative w-full max-w-[calc(100vw-28px)] mx-auto z-30">
            {/* Scrollable Track */}
            <div
              ref={mobileTrackRef}
              className="mobile-category-track"
            >
              {[
                { label: 'Рестораны', path: '/restaurants' },
                { label: 'Бары', path: '/bars' },
                { label: 'Подборки', path: '/collections' },
                { label: 'Акции', path: '/offers' },
              ].map((item) => {
                const active = isMobileItemActive(item.path);
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => handleMobileLinkClick(e, item.path)}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      flex: '0 0 auto',
                      scrollSnapAlign: 'start',
                      minHeight: '42px',
                      padding: '0 17px',
                      borderRadius: '999px',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: 1,
                      textDecoration: 'none',
                      backgroundColor: active ? '#FFF4B8' : 'rgba(79, 83, 40, 0.52)',
                      color: active ? '#4F5328' : '#FFF4B8',
                      borderColor: active ? '#FFF4B8' : 'rgba(255, 244, 184, 0.32)',
                      boxShadow: 'none',
                    }}
                    className={`border transition-colors outline-none focus-visible:outline-2 focus-visible:outline-[#FFF4B8] focus-visible:outline-offset-2 ${
                      active
                        ? 'font-bold'
                        : 'hover:bg-[rgba(79,83,40,0.72)] hover:border-[rgba(255,244,184,0.55)] active:bg-[rgba(79,83,40,0.82)]'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            {/* Custom Thin Scrollbar Indicator */}
            <div ref={mobileScrollbarRef} className="mobile-category-scrollbar" aria-hidden="true">
              <div ref={mobileThumbRef} className="mobile-category-scrollbar-thumb" />
            </div>
          </div>

          {/* OVAL HERO SEARCH PANEL */}
          <div className="hero-search-enter relative z-30 w-full bg-[#FFFDF7] border border-[#D8CFBE] rounded-3xl lg:rounded-full p-2 pl-4 sm:pl-6 shadow-[0_22px_50px_rgba(40,20,10,0.35)] text-[#4F5328]">
            
            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.7fr_1.2fr_0.8fr_auto] items-stretch gap-2 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#D8CFBE]">
              
              {/* Segment 1: Where ("Где") */}
              <div 
                ref={cityDropdownRef} 
                className="relative flex flex-col justify-center min-h-[60px] px-3 sm:px-4 text-left"
              >
                <div
                  onClick={() => {
                    setCityDropdownOpen(!cityDropdownOpen);
                    setSuggestionsOpen(false);
                    setDateTimePickerOpen(false);
                    setGuestsPickerOpen(false);
                  }}
                  className="cursor-pointer hover:opacity-85 transition-opacity min-w-0"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7C725F] block">
                    Где
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#A64F2C] flex-shrink-0" />
                    <span className="text-[14px] font-semibold text-[#4F5328] truncate">
                      {filters.city}{filters.district ? `, ${filters.district}` : ''}
                    </span>
                  </div>
                </div>

                {/* City & District Dropdown */}
                {cityDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-72 bg-[#FFFDF7] rounded-2xl shadow-[0_22px_60px_rgba(52,39,24,0.22)] border border-[#D8CFBE] p-3.5 z-[2500] animate-in fade-in slide-in-from-top-2 duration-150 text-[#4F5328]">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-[#7C725F] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={citySearchQuery}
                        onChange={(e) => setCitySearchQuery(e.target.value)}
                        placeholder="Поиск города..."
                        className="w-full pl-8 pr-3 py-2 bg-[#FAF5E8] border border-[#D8CFBE] rounded-xl text-xs font-semibold text-[#4F5328] focus:outline-none focus:border-[#707437] placeholder:text-[#7C725F]"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                      {filteredCities.map((city) => {
                        const isSelected = filters.city === city;
                        return (
                          <div key={city}>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateFilters({ ...filters, city, district: '' });
                                setCityDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#FFF4B8] text-[#4F5328] font-bold'
                                  : 'hover:bg-[#FAF5E8] text-[#4F5328]'
                              }`}
                            >
                              <span>{city}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#707437]" />}
                            </button>

                            {city === 'Минск' && isSelected && (
                              <div className="ml-3 pl-2 border-l border-[#D8CFBE] my-1 space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateFilters({ ...filters, city, district: '' });
                                    setCityDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] cursor-pointer ${
                                    !filters.district ? 'text-[#707437] font-bold' : 'text-[#7C725F] hover:text-[#4F5328]'
                                  }`}
                                >
                                  Все районы
                                </button>
                                {['Центральный', 'Советский', 'Первомайский', 'Партизанский', 'Заводской', 'Ленинский', 'Октябрьский', 'Московский', 'Фрунзенский'].map((dist) => (
                                  <button
                                    key={dist}
                                    type="button"
                                    onClick={() => {
                                      onUpdateFilters({ ...filters, city: 'Минск', district: dist });
                                      setCityDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] cursor-pointer ${
                                      filters.district === dist ? 'text-[#707437] font-bold' : 'text-[#7C725F] hover:text-[#4F5328]'
                                    }`}
                                  >
                                    {dist}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Segment 2: What ("Что ищете") */}
              <div className="relative flex flex-col justify-center min-h-[60px] px-3 sm:px-4 text-left min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7C725F] block">
                  Что ищете
                </span>
                
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <Utensils className="w-3.5 h-3.5 text-[#707437] flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={queryInput}
                    onChange={(e) => {
                      setQueryInput(e.target.value);
                      setSuggestionsOpen(true);
                      setSelectedIndex(-1);
                    }}
                    onFocus={() => {
                      if (queryInput.trim().length >= 2) {
                        setSuggestionsOpen(true);
                      }
                      setCityDropdownOpen(false);
                      setDateTimePickerOpen(false);
                      setGuestsPickerOpen(false);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Кухня, блюдо или название..."
                    className="w-full bg-transparent text-[14px] font-semibold text-[#4F5328] placeholder:text-[#7C725F]/70 placeholder:truncate focus:outline-none min-w-0"
                  />
                  {queryInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setQueryInput('');
                        onUpdateFilters({ ...filters, query: '' });
                        setSuggestionsOpen(false);
                      }}
                      className="p-1 hover:bg-black/5 rounded-full text-[#7C725F] hover:text-[#4F5328]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {suggestionsOpen && debouncedQuery.trim().length >= 2 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-3 bg-[#FFFDF7] rounded-2xl shadow-[0_22px_60px_rgba(52,39,24,0.22)] border border-[#D8CFBE] p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto no-scrollbar text-[#4F5328]"
                  >
                    {isLoadingSuggestions ? (
                      <div className="flex items-center justify-center py-6 gap-2 text-xs text-[#7C725F]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#A64F2C]" />
                        <span>Поиск подходящих мест...</span>
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#7C725F]">
                        Ничего не найдено по запросу «{debouncedQuery}»
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {suggestions.map((item, idx) => {
                          const IconComp = item.icon;
                          const isSelected = idx === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={item.action}
                              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected ? 'bg-[#FFF4B8] text-[#707437]' : 'hover:bg-[#FAF5E8] text-[#4F5328]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#707437] text-white' : 'bg-[#FAF5E8] text-[#7C725F]'}`}>
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-semibold">{item.title}</div>
                                  <div className="text-[11px] text-[#7C725F] truncate">{item.subtitle}</div>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Segment 3: Date & Time ("Дата и время") */}
              <div 
                ref={dateTimeRef}
                className="relative flex flex-col justify-center min-h-[60px] px-3 sm:px-4 text-left min-w-0"
              >
                <div
                  onClick={() => {
                    setDateTimePickerOpen(!dateTimePickerOpen);
                    setGuestsPickerOpen(false);
                    setCityDropdownOpen(false);
                    setSuggestionsOpen(false);
                  }}
                  className="cursor-pointer hover:opacity-85 transition-opacity min-w-0"
                  id="segment-datetime"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7C725F] block">
                    Дата и время
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#A64F2C] flex-shrink-0" />
                    <span className="text-[14px] font-semibold text-[#4F5328] truncate">
                      {formatDateTimeRu(filters.date, filters.time)}
                    </span>
                  </div>
                </div>

                {dateTimePickerOpen && (
                  <DateTimePickerPopover
                    anchorEl={dateTimeRef.current}
                    selectedDate={filters.date}
                    selectedTime={filters.time}
                    onChange={(d, t) => {
                      onUpdateFilters({ ...filters, date: d, time: t });
                    }}
                    onClose={() => setDateTimePickerOpen(false)}
                  />
                )}
              </div>

              {/* Segment 4: Guests ("Гости") */}
              <div 
                ref={guestsRef}
                className="relative flex flex-col justify-center min-h-[60px] px-3 sm:px-4 text-left min-w-0"
              >
                <div
                  onClick={() => {
                    setGuestsPickerOpen(!guestsPickerOpen);
                    setDateTimePickerOpen(false);
                    setCityDropdownOpen(false);
                    setSuggestionsOpen(false);
                  }}
                  className="cursor-pointer hover:opacity-85 transition-opacity min-w-0"
                  id="segment-guests"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7C725F] block">
                    Гости
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <Users className="w-3.5 h-3.5 text-[#A64F2C] flex-shrink-0" />
                    <span className="text-[14px] font-semibold text-[#4F5328] truncate">
                      {formatPartySizeRu(filters.guests || 2)}
                    </span>
                  </div>
                </div>

                {guestsPickerOpen && (
                  <GuestsPickerPopover
                    anchorEl={guestsRef.current}
                    value={filters.guests || 2}
                    onChange={(g) => {
                      onUpdateFilters({ ...filters, guests: g });
                    }}
                    onClose={() => setGuestsPickerOpen(false)}
                  />
                )}
              </div>

              {/* Segment 5: Round Olive Search Button (#707437) with #4F5328 hover */}
              <div className="flex items-center justify-center p-1 sm:p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...filters, query: queryInput };
                    onUpdateFilters(updated);
                    onPerformSearch(updated);
                  }}
                  aria-label="Найти столик"
                  className="w-full lg:w-[58px] h-[48px] lg:h-[58px] bg-[#707437] hover:bg-[#4F5328] text-white rounded-full flex items-center justify-center gap-2 font-semibold text-[14px] transition-all hover:scale-[1.035] cursor-pointer shadow-md"
                  id="btn-find-table"
                >
                  <Search className="w-5 h-5 text-[#FFF4B8] stroke-[2.2]" />
                  <span className="lg:hidden text-[#FFF4B8]">Найти столик</span>
                </button>
              </div>

            </div>
          </div>

          {/* QUICK FILTERS CONTAINER (Directly below search bar) */}
          <div className="hero-filters-enter w-full max-w-[1060px] flex flex-wrap justify-center gap-2.5 mt-1">
            {QUICK_TAGS.map((item) => {
              let isSelected = false;
              if (item.isOpenNow) {
                isSelected = !!filters.isOpenNow;
              } else if (item.cuisineName) {
                isSelected = filters.cuisines.includes(item.cuisineName);
              } else if (item.featureName) {
                isSelected = filters.features.includes(item.featureName);
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    let updated = { ...filters };
                    if (item.isOpenNow) {
                      updated.isOpenNow = !filters.isOpenNow;
                    } else if (item.cuisineName) {
                      if (filters.cuisines.includes(item.cuisineName)) {
                        updated.cuisines = filters.cuisines.filter(c => c !== item.cuisineName);
                      } else {
                        updated.cuisines = [...filters.cuisines, item.cuisineName];
                      }
                    } else if (item.featureName) {
                      if (filters.features.includes(item.featureName)) {
                        updated.features = filters.features.filter(f => f !== item.featureName);
                      } else {
                        updated.features = [...filters.features, item.featureName];
                      }
                    }
                    onUpdateFilters(updated);
                    onPerformSearch(updated);
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FFF4B8] border-[#FFF4B8] text-[#4F5328] font-bold shadow-xs'
                      : 'bg-[#4F5328]/40 border-[#FFF4B8]/30 text-[#FFF4B8] hover:bg-[#FFF4B8]/20'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#4F5328]" />}
                </button>
              );
            })}

            {/* All Filters button as part of the group */}
            <button
              type="button"
              onClick={onOpenFilterModal}
              className={`px-3.5 py-2 rounded-xl border text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-[#A64F2C] border-[#A64F2C] text-[#FFF4B8] font-bold shadow-xs'
                  : 'bg-[#4F5328]/40 border-[#FFF4B8]/30 text-[#FFF4B8] hover:bg-[#FFF4B8]/20'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFF4B8]" />
              <span>Все фильтры</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#FFF4B8] text-[#A64F2C] text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* CENTRALLY POSITIONED "ВСЕ КУХНИ" TAB AT BOTTOM HERO BOUNDARY */}
        <button
          type="button"
          onClick={handleScrollToCuisines}
          className="all-cuisines-tab hero-tab-enter flex flex-col items-center justify-center cursor-pointer group focus:outline-none"
          title="Перейти к выбору кухни"
          aria-label="Перейти к выбору кухни"
        >
          <div className="flex items-center gap-1">
            <span>ВСЕ КУХНИ</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 mt-0.5 text-[#4F5328] group-hover:text-[#FFF4B8] transition-colors stroke-[2]" />
        </button>

      </section>

    </div>
  );
};
