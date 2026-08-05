import React, { useState } from 'react';
import { Collection, Restaurant } from '../types';
import { COLLECTIONS, RESTAURANTS } from '../data/mockData';
import { RestaurantCard } from './RestaurantCard';
import { isVenueSaved } from '../utils/savedVenuesStore';
import { 
  Sparkles, 
  ArrowLeft, 
  Share2, 
  Check, 
  MapPin, 
  Utensils, 
  Calendar, 
  Flame, 
  Heart,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface CollectionsViewProps {
  selectedCollectionId?: string | null;
  onSelectCollection: (id: string | null) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onBookRestaurant: (restaurant: Restaurant) => void;
  searchDate?: string;
  searchTime?: string;
  searchGuests?: number;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  selectedCollectionId,
  onSelectCollection,
  favorites,
  onToggleFavorite,
  onSelectRestaurant,
  onBookRestaurant,
  searchDate,
  searchTime,
  searchGuests,
}) => {
  const [copied, setCopied] = useState(false);

  const activeCollection = COLLECTIONS.find(c => c.id === selectedCollectionId || c.slug === selectedCollectionId);

  const getCollectionRestaurants = (col: Collection): Restaurant[] => {
    if (col.venueIds && col.venueIds.length > 0) {
      const byIds = RESTAURANTS.filter(r => col.venueIds.includes(r.id));
      if (byIds.length > 0) return byIds;
    }
    const tag = col.filterTag || col.id;
    return RESTAURANTS.filter(r => 
      r.collections.includes(tag) || 
      r.tags.some(t => t.toLowerCase().includes(col.title.toLowerCase()) || t.toLowerCase().includes(col.name?.toLowerCase() || ''))
    );
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (activeCollection) {
    const venueList = getCollectionRestaurants(activeCollection);

    return (
      <div className="w-full space-y-8 animate-in fade-in duration-200 font-['Geologica'] text-[#211E19]">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelectCollection(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F2EBDD] border border-[#BFB3A2] text-xs font-semibold text-[#211E19] hover:bg-[#FFF4B8] hover:border-[#707437] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#A64F2C]" />
            <span>Все подборки</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F2EBDD] border border-[#BFB3A2] text-xs font-semibold text-[#211E19] hover:bg-[#FFF4B8] hover:border-[#707437] transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#707437]" />}
            <span>{copied ? 'Ссылка скопирована!' : 'Поделиться подборкой'}</span>
          </button>
        </div>

        {/* Collection Hero Header */}
        <div className="relative rounded-3xl overflow-hidden border border-[#BFB3A2] shadow-md bg-[#25211C] text-white">
          <div className="absolute inset-0">
            <img
              src={activeCollection.coverImage || activeCollection.photo}
              alt={activeCollection.title || activeCollection.name}
              className="w-full h-full object-cover opacity-40 blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#25211C] via-[#25211C]/70 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF4B8] text-[#211E19] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#707437]" />
              <span>{activeCollection.badge || 'Редакционная подборка'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-['Tenor_Sans',serif] leading-tight text-[#FFF4B8]">
              {activeCollection.title || activeCollection.name}
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              {activeCollection.description || activeCollection.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-medium text-stone-400">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <Utensils className="w-3.5 h-3.5 text-[#FFF4B8]" />
                {venueList.length} {venueList.length === 1 ? 'заведение' : venueList.length < 5 ? 'заведения' : 'заведений'}
              </span>
            </div>
          </div>
        </div>

        {/* Venue Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-normal font-['Tenor_Sans',serif] uppercase text-[#211E19]">
              Заведения в подборке ({venueList.length})
            </h2>
          </div>

          {venueList.length === 0 ? (
            <div className="py-16 text-center bg-[#F2EBDD] rounded-3xl border border-[#BFB3A2] p-6 space-y-3">
              <Utensils className="w-10 h-10 text-[#6B645A] mx-auto" />
              <p className="text-sm font-semibold text-[#211E19]">
                В этой подборке пока нет опубликованных мест
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {venueList.map(rest => (
                <RestaurantCard
                  key={rest.id}
                  restaurant={rest}
                  isFavorite={isVenueSaved(rest.id, favorites)}
                  onToggleFavorite={onToggleFavorite}
                  onClick={() => onSelectRestaurant(rest)}
                  searchDate={searchDate}
                  searchTime={searchTime}
                  searchGuests={searchGuests}
                  onBookRestaurant={onBookRestaurant}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200 font-['Geologica'] text-[#211E19]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#4F5328] shrink-0" />
          <h1 className="font-['Sora',sans-serif] font-semibold text-[38px] sm:text-[44px] lg:text-[50px] leading-[1.08] tracking-[-0.035em] text-[#4F5328] max-w-[900px]">
            Редакционные подборки Tavoo
          </h1>
        </div>
        <p className="font-['Geologica',sans-serif] font-normal text-[17px] sm:text-[18px] leading-[1.5] text-[#756D5E] max-w-[720px] mt-3">
          Авторские коллекции ресторанов, баров и кафе, собранные гастрономическими экспертами для любых поводов.
        </p>
      </div>

      {/* Grid of All Collections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COLLECTIONS.map(col => {
          const venues = getCollectionRestaurants(col);
          const count = venues.length;

          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col.id)}
              className="group relative rounded-3xl overflow-hidden bg-[#F2EBDD] border border-[#BFB3A2] hover:border-[#707437] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#BFB3A2]">
                <img
                  src={col.coverImage || col.photo}
                  alt={col.title || col.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <span className="absolute top-3 left-3 px-3 py-1 bg-[#FFF4B8] text-[#211E19] text-xs font-bold rounded-full shadow-xs">
                  {col.badge || 'Редакционный выбор'}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-semibold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
                    {count} {count === 1 ? 'место' : count < 5 ? 'места' : 'мест'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1 bg-[#F2EBDD]">
                <div>
                  <h3 className="text-lg font-semibold text-[#211E19] group-hover:text-[#707437] transition-colors leading-snug">
                    {col.title || col.name}
                  </h3>
                  <p className="text-xs text-[#6B645A] mt-2 line-clamp-3 leading-relaxed">
                    {col.description || col.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#BFB3A2]/50 flex items-center justify-between text-xs font-bold text-[#707437]">
                  <span>Смотреть подборку</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
