import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CUISINES, CuisineDefinition, getVenueCuisineSlugs } from '../data/cuisines';
import { getAllNormalizedVenues } from '../utils/data';
import {
  UtensilsCrossed,
  Fish,
  Flame,
  Beef,
  Coffee,
  CupSoda,
  Wine,
  Soup,
  CookingPot,
  Salad,
  Pizza,
  Cake,
  Anchor,
  Sparkles,
  ChefHat,
  Search,
  X,
  ChevronRight
} from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategory: (categoryName: string) => void;
  onViewAllCuisines?: () => void;
  selectedCategory?: string | null;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Fish: <Fish className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Flame: <Flame className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Beef: <Beef className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Coffee: <Coffee className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  CupSoda: <CupSoda className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Wine: <Wine className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Soup: <Soup className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  CookingPot: <CookingPot className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Salad: <Salad className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Pizza: <Pizza className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Cake: <Cake className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Anchor: <Anchor className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  Sparkles: <Sparkles className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />,
  ChefHat: <ChefHat className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
};

function getRestaurantCountLabel(count: number): string | null {
  if (count <= 0) return null;
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return `${count} заведений`;
  if (lastOne === 1) return `${count} заведение`;
  if (lastOne >= 2 && lastOne <= 4) return `${count} заведения`;
  return `${count} заведений`;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allVenues = useMemo(() => getAllNormalizedVenues(), []);

  const displayedCuisines = useMemo(() => {
    return CUISINES.slice(0, 10);
  }, []);

  const cuisineCounts = useMemo(() => {
    const countsMap: Record<string, number> = {};
    CUISINES.forEach((c) => {
      const count = allVenues.filter((v) => getVenueCuisineSlugs(v).includes(c.slug)).length;
      countsMap[c.slug] = count;
      countsMap[c.label] = count;
    });
    return countsMap;
  }, [allVenues]);

  const modalFilteredCuisines = useMemo(() => {
    if (!searchQuery.trim()) return CUISINES;
    const q = searchQuery.toLowerCase().trim();
    return CUISINES.filter((cat) =>
      cat.label.toLowerCase().includes(q) || cat.aliases.some(a => a.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      if (triggerButtonRef.current) {
        triggerButtonRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleSelectAndCloseModal = (cuisine: CuisineDefinition) => {
    setIsModalOpen(false);
    onSelectCategory(cuisine.label);
  };

  const hasMoreCuisines = CUISINES.length > displayedCuisines.length;

  return (
    <section id="categories-section" className="py-8 sm:py-12 font-['Geologica']">
      
      {/* Section Header */}
      <div className="flex flex-col mb-8 sm:mb-10">
        <h2 className="font-['Sora',sans-serif] font-semibold text-[32px] sm:text-[40px] lg:text-[46px] leading-[1.08] tracking-[-0.035em] text-[#4F5328]">
          Выберите кухню
        </h2>
        <p className="font-['Geologica',sans-serif] font-normal text-[17px] sm:text-[19px] leading-[1.45] text-[#7C725F] max-w-[620px] mt-2 sm:mt-2.5">
          Найдите заведение по своим гастрономическим предпочтениям
        </p>
      </div>

      {/* Cards Grid: Desktop 5 per row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 gap-y-7 sm:gap-y-8">
        {displayedCuisines.map((cat) => {
          const count = cuisineCounts[cat.slug] || cuisineCounts[cat.label] || 0;
          const countLabel = getRestaurantCountLabel(count);
          const isSelected = selectedCategory === cat.label || selectedCategory === cat.slug;

          return (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory(cat.label)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory(cat.label);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Кухня ${cat.label}`}
              className="group flex flex-col cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#707437] focus-visible:ring-offset-2 rounded-[16px] w-full transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
            >
              {/* Photo Container with 4:3 Aspect Ratio and 16px Rounded Corners */}
              <div className={`relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-[#FAF5E8] border transition-all duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-xs ${
                isSelected ? 'border-[#707437] ring-2 ring-[#707437]' : 'border-[#D8CFBE] group-hover:border-[#707437] group-hover:shadow-md'
              }`}>
                
                {/* Center Icon Container: Soft, dignified hover state */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] flex items-center justify-center border shadow-xs transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isSelected 
                    ? 'bg-[#707437] border-[#707437] text-[#FFF4B8]' 
                    : 'bg-[#FFFDF7]/95 backdrop-blur-xs border-[#D8CFBE] text-[#4F5328] group-hover:bg-[#707437] group-hover:border-[#707437] group-hover:text-[#FFF4B8]'
                }`}>
                  {ICON_MAP[cat.iconName] || <ChefHat className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />}
                </div>

                <img
                  src={cat.photo}
                  alt={cat.label}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.012]"
                />
              </div>

              {/* Title & Secondary Count Info */}
              <div className="mt-3 flex flex-col text-left">
                <span className={`text-base font-semibold transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] truncate ${
                  isSelected ? 'text-[#707437]' : 'text-[#4F5328] group-hover:text-[#707437]'
                }`}>
                  {cat.label}
                </span>
                {countLabel && (
                  <span className="text-xs text-[#7C725F] mt-0.5 font-medium">
                    {countLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Button "Все кухни" */}
      {hasMoreCuisines && (
        <div className="mt-8 sm:mt-10 flex justify-center">
          <button
            ref={triggerButtonRef}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-7 py-3 text-xs sm:text-sm font-semibold text-[#4F5328] bg-[#FFFDF7] hover:bg-[#FFF4B8] border border-[#D8CFBE] hover:border-[#707437] rounded-full transition-all duration-180 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#707437] min-h-[44px] shadow-xs"
          >
            <span>Все кухни ({CUISINES.length})</span>
            <ChevronRight className="w-4 h-4 text-[#707437]" />
          </button>
        </div>
      )}

      {/* Modal / Bottom Sheet for "Все кухни" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 font-['Geologica']">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Выберите кухню"
            className="relative z-10 w-full sm:max-w-xl bg-[#F2EBDD] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] border border-[#BFB3A2] text-[#211E19]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#BFB3A2]">
              <h3 className="text-xl font-normal uppercase tracking-wider font-['Tenor_Sans',serif] text-[#211E19]">
                Выберите кухню
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-[#6B645A] hover:text-[#211E19] hover:bg-[#F8F2E7] transition-colors cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 relative">
              <Search className="w-4 h-4 text-[#6B645A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Найти кухню..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#F8F2E7] border border-[#BFB3A2] rounded-2xl text-sm text-[#211E19] placeholder-[#6B645A] focus:outline-none focus:border-[#707437]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B645A] hover:text-[#211E19] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="overflow-y-auto pr-1 space-y-2 flex-1 max-h-[50vh] sm:max-h-[55vh] no-scrollbar">
              {modalFilteredCuisines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {modalFilteredCuisines.map((cat) => {
                    const count = cuisineCounts[cat.slug] || cuisineCounts[cat.label] || 0;
                    const countLabel = getRestaurantCountLabel(count);

                    return (
                      <button
                        key={cat.slug}
                        onClick={() => handleSelectAndCloseModal(cat)}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-[#BFB3A2] bg-[#F8F2E7] hover:border-[#707437] hover:bg-[#FFF4B8] transition-all cursor-pointer text-left group min-h-[52px]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#F2EBDD] group-hover:bg-[#707437] text-[#211E19] group-hover:text-[#FFF4B8] flex items-center justify-center flex-shrink-0 transition-colors duration-180">
                          {ICON_MAP[cat.iconName] || <ChefHat className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold text-[#211E19] group-hover:text-[#4E5328] transition-colors truncate">
                            {cat.label}
                          </span>
                          {countLabel && (
                            <span className="text-xs text-[#6B645A]">
                              {countLabel}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <Search className="w-8 h-8 text-[#6B645A] mb-2" />
                  <p className="text-sm font-semibold text-[#211E19]">
                    Кухня не найдена
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

