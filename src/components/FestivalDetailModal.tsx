import React from 'react';
import { Promotion, Restaurant } from '../types';
import { getAllNormalizedVenues } from '../utils/data';
import { X, Calendar, UtensilsCrossed, Sparkles, MapPin, ArrowRight, Star, Tag, CheckCircle } from 'lucide-react';

interface FestivalDetailModalProps {
  festival: Promotion | any;
  venue?: Restaurant | null;
  onClose: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onBookVenue?: (venue: Restaurant) => void;
}

export const FestivalDetailModal: React.FC<FestivalDetailModalProps> = ({
  festival,
  venue: directVenue,
  onClose,
  onSelectRestaurant,
  onBookVenue,
}) => {
  const allVenues = getAllNormalizedVenues();

  // Find linked primary venue
  const primaryVenue = directVenue || allVenues.find(v => String(v.id) === String(festival.venueId || festival.restaurantId || festival.placeId));

  // Find other participating venues if festival has multiple participating IDs
  const participatingIds = Array.isArray(festival.participatingRestaurantIds) ? festival.participatingRestaurantIds : [];
  const participatingRestaurants = allVenues.filter(r =>
    participatingIds.includes(r.id) || String(r.id) === String(festival.venueId)
  );

  const title = festival.title || festival.name || 'Специальное предложение';
  const desc = festival.description || festival.tagline || '';
  const dates = festival.datesText || festival.dates || `${festival.startDate || ''} — ${festival.endDate || ''}`;
  const price = typeof festival.price === 'number' ? festival.price : festival.specialSetPrice;
  const image = festival.image || festival.bannerUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80';
  const badge = festival.badge || festival.highlight || 'Спецпредложение';

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-['Geologica']">
      <div
        className="relative w-full max-w-4xl bg-[#F2EBDD] rounded-3xl shadow-2xl overflow-hidden border border-[#BFB3A2] my-8 max-h-[90vh] flex flex-col text-[#211E19]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#F8F2E7]/80 hover:bg-[#F8F2E7] text-[#211E19] backdrop-blur-md shadow-md transition-all hover:scale-105 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#211E19] text-white flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#211E19]/95 via-[#211E19]/40 to-black/20" />

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#A64F2C] text-white text-xs font-bold rounded-full shadow-xs">
                {badge}
              </span>
              <span className="px-3 py-1 bg-[#F8F2E7]/20 backdrop-blur-md text-white text-xs font-medium rounded-full flex items-center gap-1.5 border border-white/20">
                <Calendar className="w-3.5 h-3.5 text-[#FFF4B8]" />
                {dates}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-normal font-['Tenor_Sans',serif] tracking-wide text-white">
              {title}
            </h2>
            {festival.tagline && (
              <p className="text-sm text-[#F8F2E7]/90 font-medium">
                {festival.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 no-scrollbar">

          {/* Overview & Special Price Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 bg-[#F8F2E7] rounded-2xl border border-[#BFB3A2]">
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-base font-semibold text-[#211E19] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A64F2C]" />
                Концепция и описание акции
              </h3>
              <p className="text-xs sm:text-sm text-[#6B645A] leading-relaxed">
                {desc}
              </p>

              {/* Tags & Cuisines */}
              {((festival.tags && festival.tags.length > 0) || (festival.cuisines && festival.cuisines.length > 0)) && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {(festival.tags || []).map((t: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-[#FFF4B8] text-[#211E19] text-[11px] font-bold rounded-full border border-[#BFB3A2]">
                      #{t}
                    </span>
                  ))}
                  {(festival.cuisines || []).map((c: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-[#F2EBDD] text-[#707437] text-[11px] font-bold rounded-full border border-[#BFB3A2]">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {price ? (
              <div className="bg-[#F2EBDD] p-5 rounded-2xl border border-[#BFB3A2] text-center flex flex-col items-center justify-center shadow-xs space-y-1">
                <span className="text-xs text-[#6B645A] uppercase tracking-wider font-bold">Стоимость сета</span>
                <span className="text-3xl font-extrabold text-[#211E19]">{price} BYN</span>
                <span className="text-[11px] text-[#A64F2C] font-semibold">Специальная цена акции</span>
              </div>
            ) : (
              <div className="bg-[#F2EBDD] p-5 rounded-2xl border border-[#BFB3A2] text-center flex flex-col items-center justify-center shadow-xs">
                <span className="text-xs text-[#707437] font-bold uppercase">Спецпредложение</span>
                <span className="text-sm font-semibold text-[#211E19] mt-1">Подробности у заведения</span>
              </div>
            )}
          </div>

          {/* Dishes List if available */}
          {Array.isArray(festival.dishes) && festival.dishes.length > 0 && (
            <div className="bg-[#F8F2E7] p-5 rounded-2xl border border-[#BFB3A2] space-y-3">
              <h3 className="text-sm font-bold text-[#211E19] flex items-center gap-2 uppercase tracking-wider">
                <UtensilsCrossed className="w-4 h-4 text-[#A64F2C]" />
                Блюда и напитки в рамках акции
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {festival.dishes.map((dish: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#211E19] bg-[#F2EBDD] px-3 py-2 rounded-xl border border-[#BFB3A2]/60">
                    <CheckCircle className="w-3.5 h-3.5 text-[#707437] flex-shrink-0" />
                    <span>{dish}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Connected Venue Card */}
          {primaryVenue && (
            <div>
              <h3 className="text-lg font-normal font-['Tenor_Sans',serif] uppercase tracking-wider text-[#211E19] mb-3">
                Организатор и заведение
              </h3>
              <div className="bg-[#F8F2E7] p-5 rounded-2xl border border-[#707437] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={primaryVenue.photos[0]}
                    alt={primaryVenue.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#BFB3A2] flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#211E19]">{primaryVenue.name}</h4>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-[#FFF4B8] border border-[#BFB3A2] rounded-full text-xs font-bold text-[#211E19]">
                        <Star className="w-3 h-3 fill-[#A64F2C] text-[#A64F2C]" />
                        <span>{primaryVenue.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B645A] mt-0.5">
                      {primaryVenue.type || primaryVenue.primaryType} • {primaryVenue.primaryCuisine} • {primaryVenue.district}
                    </p>
                    <p className="text-[11px] text-[#7C725F] mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#A64F2C]" />
                      <span>{primaryVenue.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectRestaurant(primaryVenue);
                    }}
                    className="flex-1 sm:w-full px-4 py-2 bg-[#707437] hover:bg-[#585c2b] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Посмотреть заведение
                  </button>

                  {(festival.reservable !== false && primaryVenue.isReservable) && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onBookVenue) {
                          onBookVenue(primaryVenue);
                        } else {
                          onSelectRestaurant(primaryVenue);
                        }
                      }}
                      className="flex-1 sm:w-full px-4 py-2 bg-[#A64F2C] hover:bg-[#854023] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                    >
                      Забронировать стол
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other Participating Restaurants List */}
          {participatingRestaurants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-normal font-['Tenor_Sans',serif] uppercase tracking-wider text-[#211E19]">
                  Все заведения-участники ({participatingRestaurants.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {participatingRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => {
                      onClose();
                      onSelectRestaurant(restaurant);
                    }}
                    className="group flex gap-4 p-4 rounded-2xl bg-[#F8F2E7] hover:bg-[#FFF4B8] border border-[#BFB3A2] hover:border-[#707437] cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    <img
                      src={restaurant.photos[0]}
                      alt={restaurant.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#211E19] group-hover:text-[#4E5328] transition-colors">
                            {restaurant.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs font-bold text-[#211E19]">
                            <Star className="w-3 h-3 fill-[#A64F2C] text-[#A64F2C]" />
                            <span>{restaurant.rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#6B645A] mt-0.5 line-clamp-1">
                          {restaurant.primaryCuisine} • {restaurant.district}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#BFB3A2]">
                        <span className="text-[11px] font-semibold text-[#A64F2C] flex items-center gap-1">
                          <UtensilsCrossed className="w-3 h-3" />
                          Сет доступен
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6B645A] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
