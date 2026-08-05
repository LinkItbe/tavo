import React, { useState } from 'react';
import { Restaurant } from '../types';
import { Heart, Star, ChevronLeft, ChevronRight, MapPin, Clock, Calendar, Zap, Send } from 'lucide-react';
import { getClosestAvailableSlots, getTodayStr, formatDateRu } from '../utils/bookingUtils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
  searchDate?: string;
  searchTime?: string;
  searchGuests?: number;
  onBookRestaurant?: (restaurant: Restaurant, initialDate?: string, initialTime?: string, initialGuests?: number) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isFavorite,
  onToggleFavorite,
  onClick,
  searchDate,
  searchTime,
  searchGuests,
  onBookRestaurant,
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const photos = (Array.isArray(restaurant?.photos) && restaurant.photos.length > 0)
    ? restaurant.photos
    : (restaurant?.image ? [restaurant.image] : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80']);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const [isPopActive, setIsPopActive] = useState(false);

  const handleHeartClick = (e: React.MouseEvent) => {
    setIsPopActive(true);
    setTimeout(() => setIsPopActive(false), 300);
    onToggleFavorite(restaurant.id, e);
  };

  const isReservable = restaurant.isReservable ?? true;
  const bookingMode = restaurant.reservationMode || (isReservable ? 'instant' : 'unavailable');

  const targetDate = searchDate || getTodayStr();
  const targetTime = searchTime || '19:00';
  const targetGuests = searchGuests || 2;

  const availableSlots = isReservable
    ? getClosestAvailableSlots(restaurant, targetDate, targetTime, targetGuests, 3)
    : [];

  const handleSlotClick = (slotTime: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookRestaurant) {
      onBookRestaurant(restaurant, targetDate, slotTime, targetGuests);
    }
  };

  const handleQuickBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookRestaurant) {
      onBookRestaurant(restaurant, targetDate, availableSlots[0] || targetTime, targetGuests);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="stagger-card hover-card-anim group relative bg-[#FFFDF7] rounded-[18px] border border-[#D8CFBE] overflow-hidden cursor-pointer flex flex-col justify-between select-none font-['Geologica'] shadow-xs hover:border-[#707437]"
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF5E8]">
        <img
          src={photos[currentPhotoIndex] || photos[0]}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015] warm-food-photo"
        />

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-[#FFFDF7]/90 hover:bg-[#FFFDF7] text-[#4F5328] border border-[#D8CFBE] shadow-xs transition-all active:scale-90 z-10 cursor-pointer"
          title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isPopActive ? 'heart-pop-anim' : ''} ${isFavorite ? 'fill-[#A64F2C] text-[#A64F2C]' : 'text-[#707437]'}`} />
        </button>

        {/* Badges on Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
          {isReservable && (
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 ${
              bookingMode === 'instant'
                ? 'bg-[#707437] text-[#FFF4B8]'
                : 'bg-[#A64F2C] text-[#FFF4B8]'
            }`}>
              {bookingMode === 'instant' ? (
                <>
                  <Zap className="w-3 h-3 fill-current text-[#FFF4B8]" />
                  <span>Мгновенно</span>
                </>
              ) : (
                <>
                  <Send className="w-2.5 h-2.5" />
                  <span>По запросу</span>
                </>
              )}
            </span>
          )}
          {restaurant.isEditorsPick && (
            <span className="px-2.5 py-1 bg-[#FFF4B8] text-[#4F5328] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs border border-[#707437]/30">
              Выбор редакции
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full backdrop-blur-md shadow-xs flex items-center gap-1.5 ${
            restaurant.isOpen 
              ? 'bg-[#4F5328]/90 text-white' 
              : 'bg-[#7C725F]/90 text-white'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? 'bg-[#FFF4B8] animate-pulse' : 'bg-[#D8CFBE]'}`} />
            {restaurant.isOpen ? 'Открыто' : 'Закрыто'}
          </span>
        </div>

        {/* Carousel Navigation Arrows */}
        {photos.length > 1 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#FFFDF7]/90 hover:bg-[#FFFDF7] text-[#4F5328] border border-[#D8CFBE] shadow-xs transition-all hover:scale-105 z-10 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#FFFDF7]/90 hover:bg-[#FFFDF7] text-[#4F5328] border border-[#D8CFBE] shadow-xs transition-all hover:scale-105 z-10 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 bg-[#FFFDF7] flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-[#4F5328] leading-snug group-hover:text-[#707437] transition-colors">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 bg-[#FAF5E8] px-2.5 py-1 rounded-full border border-[#D8CFBE] flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#A64F2C] text-[#A64F2C]" />
              <span className="text-xs font-bold text-[#4F5328]">{restaurant.rating}</span>
              <span className="text-[10px] text-[#7C725F]">({restaurant.reviewCount})</span>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-[#7C725F]">
            <span className="font-semibold text-[#4F5328]">{restaurant.primaryCuisine}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#7C725F]">
              <MapPin className="w-3 h-3 text-[#707437]" />
              {restaurant.district}
            </span>
          </div>

          <div className="mt-2 text-xs text-[#7C725F] flex items-center justify-between">
            <span>Средний чек: <strong className="text-[#4F5328] font-semibold">{restaurant.averageCheck} BYN</strong></span>
            <span className="flex items-center gap-1 text-[11px] text-[#7C725F]">
              <Clock className="w-3 h-3 text-[#707437]" />
              {restaurant.workingHours}
            </span>
          </div>
        </div>

        {/* Booking Section */}
        {isReservable && (
          <div className="mt-4 pt-3.5 border-t border-[#D8CFBE]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#7C725F] uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#707437]" />
                Свободно ({formatDateRu(targetDate)}):
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {availableSlots.length > 0 ? (
                  availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={(e) => handleSlotClick(slot, e)}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#FFF4B8] hover:bg-[#707437] text-[#4F5328] hover:text-[#FFF4B8] rounded-lg border border-[#D8CFBE] hover:border-[#707437] transition-all cursor-pointer"
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <span className="text-[11px] text-[#7C725F] italic">Выберите время</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleQuickBook}
                className="px-3.5 py-2 bg-[#A64F2C] hover:bg-[#854023] text-[#FFF4B8] text-xs font-semibold rounded-xl shadow-xs hover:shadow-md hover:-translate-y-[1px] transition-all flex-shrink-0 cursor-pointer"
              >
                Забронировать
              </button>
            </div>
          </div>
        )}

        {!isReservable && (
          <div className="mt-4 pt-3.5 border-t border-[#D8CFBE] flex flex-wrap gap-1.5">
            {(restaurant.tags || []).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-[#FAF5E8] text-[#7C725F] text-[10px] font-medium rounded-full border border-[#D8CFBE]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
