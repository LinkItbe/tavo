import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { Restaurant, Dish, Review } from '../types';
import { RESTAURANTS } from '../data/mockData';
import { BRAND_NAME } from '../constants/brand';
import { normalizeCoordinates } from '../utils/mapUtils';
import { 
  X, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Heart, 
  Share2, 
  UtensilsCrossed, 
  Sparkles, 
  Check, 
  Send,
  Camera,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ArrowLeft,
  Sun,
  Music,
  Wifi,
  Tv,
  Flame,
  Shield,
  Crown,
  Smile,
  Car,
  Navigation,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle2,
  Award,
  ThumbsUp,
  Info,
  Zap,
  Eye,
  Dog,
  Baby,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  CheckCheck
} from 'lucide-react';

interface RestaurantDetailModalProps {
  restaurant: Restaurant;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onOpenBookingModal?: (restaurant: Restaurant, initialDate?: string, initialTime?: string, initialGuests?: number) => void;
  isBookingOpen?: boolean;
}

// Helper to map feature names to linear Lucide icons
function getFeatureIcon(feature: string) {
  const lower = feature.toLowerCase();
  if (lower.includes('терраса') || lower.includes('летняя')) return <Sun className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('музыка') || lower.includes('dj') || lower.includes('концерт')) return <Music className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('кальян') || lower.includes('дым')) return <Flame className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('трансляц') || lower.includes('спорт') || lower.includes('экран')) return <Tv className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('парковк') || lower.includes('авто')) return <Car className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('vip') || lower.includes('вип') || lower.includes('комната')) return <Crown className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('свидани') || lower.includes('романтик') || lower.includes('парам')) return <Heart className="w-4 h-4 text-[#A64F2C]" />;
  if (lower.includes('панорам') || lower.includes('вид')) return <Eye className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('детск') || lower.includes('семь') || lower.includes('стульчик')) return <Smile className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('животн') || lower.includes('dog') || lower.includes('питомц')) return <Dog className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('wi-fi') || lower.includes('вайфай') || lower.includes('интернет')) return <Wifi className="w-4 h-4 text-[#707437]" />;
  if (lower.includes('печь') || lower.includes('гриль') || lower.includes('авторск')) return <UtensilsCrossed className="w-4 h-4 text-[#A64F2C]" />;
  return <Sparkles className="w-4 h-4 text-[#707437]" />;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  restaurant,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectRestaurant,
  onOpenBookingModal,
  isBookingOpen,
}) => {
  // Mobile photo slider state
  const [mobilePhotoIndex, setMobilePhotoIndex] = useState(0);
  const [fullscreenPhotoIndex, setFullscreenPhotoIndex] = useState<number | null>(null);

  // Expandable description toggle
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Full Menu Overlay state
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('all');

  // Full Reviews Overlay state
  const [isFullReviewsOpen, setIsFullReviewsOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  
  // Review form state
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<Review[]>(restaurant.reviews || []);

  // Features list expansion toggle
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);

  // Booking quick form state
  const [bookingGuests, setBookingGuests] = useState('2');
  const [bookingTime, setBookingTime] = useState('19:00');
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Copy share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Refs
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);

  // Content section refs for desktop smooth scroll anchor navigation
  const aboutRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const [activeAnchor, setActiveAnchor] = useState<'about' | 'menu' | 'features' | 'reviews' | 'map'>('about');

  // Sync reviews when restaurant prop changes
  useEffect(() => {
    setReviewsList(restaurant.reviews || []);
  }, [restaurant]);

  // Lock body scroll while open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // Trap focus & Keyboard navigation (Escape key & Arrow keys)
  useEffect(() => {
    if (isBookingOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBookingOpen) return;

      if (fullscreenPhotoIndex !== null) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setFullscreenPhotoIndex(null);
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setFullscreenPhotoIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setFullscreenPhotoIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
          return;
        }
      }

      if (isFullMenuOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsFullMenuOpen(false);
          return;
        }
      }

      if (isFullReviewsOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsFullReviewsOpen(false);
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, fullscreenPhotoIndex, isFullMenuOpen, isFullReviewsOpen, isBookingOpen]);

  // Mini Leaflet Map initialization for Location section
  useEffect(() => {
    const container = miniMapContainerRef.current;
    if (!container) return;

    const coords = normalizeCoordinates(restaurant);
    if (!coords) return;

    if (!miniMapInstanceRef.current) {
      const map = L.map(container, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'tavoo-mini-marker',
        html: `
          <div class="flex items-center gap-1.5 px-3 py-1.5 bg-[#A64F2C] text-white rounded-full font-bold text-xs shadow-lg border-2 border-[#FAF5EB] animate-bounce">
            <span>★ ${restaurant.rating}</span>
            <span>${restaurant.name}</span>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 18],
      });

      L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
      miniMapInstanceRef.current = map;
    } else {
      miniMapInstanceRef.current.setView([coords.lat, coords.lng], 15);
    }

    const observer = new ResizeObserver(() => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.invalidateSize();
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [restaurant]);

  // Scroll to section helper
  const scrollToSection = (sectionId: 'about' | 'menu' | 'features' | 'reviews' | 'map') => {
    setActiveAnchor(sectionId);
    let targetRef: React.RefObject<HTMLDivElement> | null = null;
    if (sectionId === 'about') targetRef = aboutRef;
    if (sectionId === 'menu') targetRef = menuRef;
    if (sectionId === 'features') targetRef = featuresRef;
    if (sectionId === 'reviews') targetRef = reviewsRef;
    if (sectionId === 'map') targetRef = mapRef;

    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: restaurant.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: `Вы (Пользователь ${BRAND_NAME})`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      rating: newReviewRating,
      date: 'Только что',
      text: newReviewText,
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewText('');
    setIsAddReviewOpen(false);
  };

  const handleTriggerBooking = () => {
    if (onOpenBookingModal) {
      onOpenBookingModal(restaurant, bookingDate, bookingTime, Number(bookingGuests));
    }
  };

  const photos = restaurant.photos && restaurant.photos.length > 0
    ? restaurant.photos
    : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'];

  const similarRestaurants = RESTAURANTS.filter(
    (r) => r.id !== restaurant.id && r.primaryCuisine === restaurant.primaryCuisine
  ).slice(0, 3);

  // Flatten dishes for popular dishes grid
  const allDishes = useMemo(() => {
    if (!restaurant.menu || restaurant.menu.length === 0) return [];
    return restaurant.menu.flatMap(cat => cat.dishes || []);
  }, [restaurant]);

  const popularDishes = useMemo(() => {
    const popular = allDishes.filter(d => d.isPopular);
    return popular.length >= 3 ? popular : allDishes.slice(0, 6);
  }, [allDishes]);

  // Combine features & tags
  const combinedFeatures = useMemo(() => {
    const list = [...(restaurant.tags || []), ...(restaurant.features || []), ...(restaurant.amenities || [])];
    return Array.from(new Set(list));
  }, [restaurant]);

  const visibleFeatures = isFeaturesExpanded ? combinedFeatures : combinedFeatures.slice(0, 6);

  const modalMarkup = (
    <div 
      ref={backdropRef}
      inert={isBookingOpen ? true : undefined}
      aria-hidden={isBookingOpen ? 'true' : undefined}
      onClick={(e) => {
        if (e.target === backdropRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[3000] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-[#211E19]/62 backdrop-blur-[6px] animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(33, 30, 25, 0.62)' }}
    >
      <div 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Ресторан ${restaurant.name}`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-[1140px] h-full sm:h-auto sm:max-h-[calc(100dvh-32px)] bg-[#F3ECDF] border-0 sm:border border-[#D8CFBE] rounded-none sm:rounded-[28px] overflow-hidden flex flex-col shadow-[0_30px_90px_rgba(28,22,15,0.32)] z-[3010] outline-none font-['Onest',sans-serif] text-[#211E19]"
      >

        {/* Desktop Sticky Header Bar */}
        <div className="hidden sm:flex items-center justify-between px-6 py-3.5 bg-[#FAF5EB] border-b border-[#D8CFBE] flex-shrink-0 z-20 font-['Onest',sans-serif]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-[#F3ECDF] hover:bg-[#A64F2C] hover:text-white text-[#211E19] transition-all cursor-pointer border border-[#D8CFBE]"
              title="Вернуться к списку"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-base font-semibold text-[#4F5328] leading-tight truncate font-['Onest',sans-serif]">
                {restaurant.name}
              </h2>
              <p className="text-xs text-[#756D5E] font-['Onest',sans-serif]">
                {restaurant.primaryCuisine} • {restaurant.district || restaurant.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => onToggleFavorite(restaurant.id, e)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isFavorite 
                  ? 'bg-[#EFEAD8] border-[#A64F2C] text-[#A64F2C]' 
                  : 'bg-[#F3ECDF] border-[#D8CFBE] hover:bg-[#FAF5EB] text-[#211E19]'
              }`}
              title={isFavorite ? 'В сохраненном' : 'Сохранить'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#A64F2C] text-[#A64F2C]' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Сохранено' : 'Сохранить'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-full bg-[#F3ECDF] border border-[#D8CFBE] hover:bg-[#FAF5EB] text-[#211E19] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Поделиться"
            >
              {copiedLink ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Скопировано' : 'Поделиться'}</span>
            </button>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#F3ECDF] border border-[#D8CFBE] text-[#5C5446] hover:text-white hover:border-[#A64F2C] hover:bg-[#A64F2C] transition-all cursor-pointer flex items-center justify-center ml-2"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-0 sm:p-6 space-y-6">

          {/* GALLERY BLOCK */}
          <div className="relative w-full bg-[#211E19]">
            
            {/* Desktop Collage Layout */}
            <div className="hidden sm:grid grid-cols-12 gap-1.5 h-[360px] rounded-2xl overflow-hidden border border-[#D8CFBE]">
              {photos.length === 1 && (
                <div 
                  className="col-span-12 h-full overflow-hidden group cursor-pointer relative" 
                  onClick={() => setFullscreenPhotoIndex(0)}
                >
                  <img src={photos[0]} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                </div>
              )}

              {photos.length === 2 && (
                <>
                  <div className="col-span-6 h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(0)}>
                    <img src={photos[0]} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                  </div>
                  <div className="col-span-6 h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(1)}>
                    <img src={photos[1]} alt={`${restaurant.name} 2`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                  </div>
                </>
              )}

              {photos.length === 3 && (
                <>
                  <div className="col-span-7 h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(0)}>
                    <img src={photos[0]} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                  </div>
                  <div className="col-span-5 grid grid-rows-2 gap-1.5 h-full">
                    <div className="h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(1)}>
                      <img src={photos[1]} alt={`${restaurant.name} 2`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                    </div>
                    <div className="h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(2)}>
                      <img src={photos[2]} alt={`${restaurant.name} 3`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                    </div>
                  </div>
                </>
              )}

              {photos.length >= 4 && (
                <>
                  <div className="col-span-7 h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(0)}>
                    <img src={photos[0]} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                  </div>
                  <div className="col-span-5 grid grid-rows-2 gap-1.5 h-full">
                    <div className="h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(1)}>
                      <img src={photos[1]} alt={`${restaurant.name} 2`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 h-full">
                      <div className="h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(2)}>
                        <img src={photos[2]} alt={`${restaurant.name} 3`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                      </div>
                      <div className="h-full overflow-hidden group cursor-pointer" onClick={() => setFullscreenPhotoIndex(3)}>
                        <img src={photos[3]} alt={`${restaurant.name} 4`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 warm-food-photo" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Touch Swipe Gallery */}
            <div className="sm:hidden relative w-full h-[46dvh] overflow-hidden">
              <img 
                src={photos[mobilePhotoIndex]} 
                alt={restaurant.name} 
                onClick={() => setFullscreenPhotoIndex(mobilePhotoIndex)}
                className="w-full h-full object-cover warm-food-photo cursor-pointer" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />

              {/* Top Mobile Floating Action Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 rounded-full bg-[#FAF5EB]/90 backdrop-blur-md text-[#211E19] flex items-center justify-center shadow-md active:scale-95 transition-all"
                  aria-label="Назад"
                >
                  <ArrowLeft className="w-5 h-5 text-[#4F5328]" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(restaurant.id, e)}
                    className="w-11 h-11 rounded-full bg-[#FAF5EB]/90 backdrop-blur-md text-[#211E19] flex items-center justify-center shadow-md active:scale-95 transition-all"
                    aria-label="Сохранить"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#A64F2C] text-[#A64F2C]' : 'text-[#4F5328]'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-11 h-11 rounded-full bg-[#FAF5EB]/90 backdrop-blur-md text-[#211E19] flex items-center justify-center shadow-md active:scale-95 transition-all"
                    aria-label="Поделиться"
                  >
                    {copiedLink ? <CheckCheck className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5 text-[#4F5328]" />}
                  </button>
                </div>
              </div>

              {/* Mobile Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setMobilePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobilePhotoIndex((prev) => (prev + 1) % photos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Mobile Photo Counter */}
              <div className="absolute bottom-6 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                {mobilePhotoIndex + 1} / {photos.length}
              </div>
            </div>

            {/* Desktop View All Photos Trigger */}
            <button
              type="button"
              onClick={() => setFullscreenPhotoIndex(0)}
              className="hidden sm:flex absolute bottom-4 right-4 bg-[#FAF5EB] text-[#211E19] border border-[#D8CFBE] rounded-full px-4 py-2 text-xs font-bold shadow-md items-center gap-1.5 hover:bg-[#EFEAD8] hover:border-[#707437] transition-all cursor-pointer z-10"
            >
              <Camera className="w-4 h-4 text-[#A64F2C]" />
              <span>Все фотографии ({photos.length})</span>
            </button>

          </div>

          {/* MAIN CONTENT AREA */}
          <div className="relative -mt-5 sm:mt-0 rounded-t-[28px] sm:rounded-none bg-[#F3ECDF] px-4 pt-6 pb-4 sm:p-0 z-10 space-y-6">

            {/* Title & Tagline Header */}
            <div className="border-b border-[#D8CFBE] pb-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${
                  restaurant.isOpen 
                    ? 'bg-[#707437] text-[#FFF4B8]' 
                    : 'bg-[#EAE5D9] text-[#7C725F] border border-[#D8CFBE]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? 'bg-[#FFF4B8]' : 'bg-[#7C725F]'}`} />
                  {restaurant.isOpen ? 'Открыто сейчас' : 'Закрыто'}
                </span>

                {restaurant.isEditorsPick && (
                  <span className="px-3 py-1 bg-[#FFF4B8] text-[#4F5328] border border-[#707437]/20 text-xs font-bold rounded-full">
                    Выбор редакции
                  </span>
                )}

                {restaurant.reservationMode === 'instant' && (
                  <span className="px-3 py-1 bg-[#EFEAD8] text-[#707437] border border-[#C8C0A8] text-xs font-bold rounded-full flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#707437]" />
                    Мгновенное подтверждение
                  </span>
                )}
              </div>

              <h1 className="font-['Onest',sans-serif] text-[30px] sm:text-[38px] lg:text-[42px] font-semibold leading-[1.12] sm:leading-[1.08] tracking-[-0.025em] sm:tracking-[-0.035em] text-[#4F5328]">
                {restaurant.name}
              </h1>

              <p className="font-['Onest',sans-serif] text-[15px] sm:text-[16px] text-[#756D5E] leading-[1.58] max-w-2xl font-normal">
                {restaurant.tagline}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3 font-['Onest',sans-serif] text-xs sm:text-sm text-[#756D5E]">
                <span className="font-semibold text-[#4F5328] flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{restaurant.rating}</span>
                  <span className="font-normal text-[#756D5E]">({restaurant.reviewCount} отзывов)</span>
                </span>
                <span>•</span>
                <span>{restaurant.primaryCuisine || restaurant.cuisine.join(', ')}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#707437]" />
                  {restaurant.address} ({restaurant.district})
                </span>
              </div>
            </div>

            {/* KEY METRICS BLOCK (3 Columns) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3.5 sm:p-4 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] text-center font-['Onest',sans-serif]">
              <div className="space-y-0.5">
                <div className="text-base sm:text-xl font-extrabold text-[#4F5328] flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#A64F2C] text-[#A64F2C]" />
                  <span>{restaurant.rating}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#756D5E] font-semibold">Высший рейтинг</div>
              </div>

              <div className="border-x border-[#D8CFBE] space-y-0.5 px-1">
                <div className="text-xs sm:text-sm font-extrabold text-[#4F5328] flex items-center justify-center gap-1 truncate">
                  <Award className="w-4 h-4 text-[#707437] flex-shrink-0" />
                  <span className="truncate">Выбор гостей</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#756D5E] font-semibold truncate">Топ в Минске</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-base sm:text-xl font-extrabold text-[#A64F2C]">
                  {restaurant.averageCheck} <span className="text-xs font-semibold text-[#756D5E]">BYN</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#756D5E] font-semibold">Средний чек</div>
              </div>
            </div>

            {/* HIGHLIGHTS / ADVANTAGES BLOCK */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-['Onest',sans-serif]">
              <div className="p-3.5 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAD8] flex items-center justify-center text-[#707437] flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#4F5328]">Мгновенное бронирование</h4>
                  <p className="text-[11px] text-[#756D5E] mt-0.5">Подтверждение бронирования за 1 секунду</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAD8] flex items-center justify-center text-[#707437] flex-shrink-0">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#4F5328]">Авторская кухня</h4>
                  <p className="text-[11px] text-[#756D5E] mt-0.5">Свежие локальные ингредиенты и шеф-повар</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAD8] flex items-center justify-center text-[#707437] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#4F5328]">Удобная локация</h4>
                  <p className="text-[11px] text-[#756D5E] mt-0.5">{restaurant.district}, хорошая транспортная доступность</p>
                </div>
              </div>
            </div>

            {/* STICKY ANCHOR NAV */}
            <div className="sticky top-0 bg-[#F3ECDF] border-y border-[#D8CFBE] py-2 px-2 sm:px-0 z-20 flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar font-['Onest',sans-serif] text-[14px] font-semibold">
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className={`relative py-1.5 font-['Onest',sans-serif] text-[14px] font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#707437]/45 focus-visible:outline-offset-[3px] rounded-sm ${
                  activeAnchor === 'about' ? 'text-[#4F5328]' : 'text-[#756D5E] hover:text-[#4F5328]'
                }`}
              >
                <span>О ресторане</span>
                {activeAnchor === 'about' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#707437] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('menu')}
                className={`relative py-1.5 font-['Onest',sans-serif] text-[14px] font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#707437]/45 focus-visible:outline-offset-[3px] rounded-sm ${
                  activeAnchor === 'menu' ? 'text-[#4F5328]' : 'text-[#756D5E] hover:text-[#4F5328]'
                }`}
              >
                <span>Меню</span>
                {activeAnchor === 'menu' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#707437] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className={`relative py-1.5 font-['Onest',sans-serif] text-[14px] font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#707437]/45 focus-visible:outline-offset-[3px] rounded-sm ${
                  activeAnchor === 'features' ? 'text-[#4F5328]' : 'text-[#756D5E] hover:text-[#4F5328]'
                }`}
              >
                <span>Особенности</span>
                {activeAnchor === 'features' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#707437] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('reviews')}
                className={`relative py-1.5 font-['Onest',sans-serif] text-[14px] font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#707437]/45 focus-visible:outline-offset-[3px] rounded-sm ${
                  activeAnchor === 'reviews' ? 'text-[#4F5328]' : 'text-[#756D5E] hover:text-[#4F5328]'
                }`}
              >
                <span>Отзывы ({reviewsList.length})</span>
                {activeAnchor === 'reviews' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#707437] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('map')}
                className={`relative py-1.5 font-['Onest',sans-serif] text-[14px] font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#707437]/45 focus-visible:outline-offset-[3px] rounded-sm ${
                  activeAnchor === 'map' ? 'text-[#4F5328]' : 'text-[#756D5E] hover:text-[#4F5328]'
                }`}
              >
                <span>Карта и контакты</span>
                {activeAnchor === 'map' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#707437] rounded-full" />
                )}
              </button>
            </div>

            {/* TWO-COLUMN LAYOUT (Content Left, Booking Card Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 pt-2">

              {/* LEFT COLUMN */}
              <div className="min-w-0 space-y-8">

                {/* SECTION 1: ABOUT & DESCRIPTION */}
                <div ref={aboutRef} className="space-y-3 scroll-mt-16">
                  <h3 className="font-['Onest',sans-serif] text-[24px] sm:text-[28px] lg:text-[30px] font-semibold leading-[1.2] sm:leading-[1.16] tracking-[-0.025em] text-[#4F5328]">
                    О ресторане
                  </h3>

                  <div className="font-['Onest',sans-serif] text-[15px] sm:text-[16px] text-[#756D5E] leading-[1.58] space-y-2 font-normal">
                    <p className={!isDescriptionExpanded ? 'line-clamp-4' : ''}>
                      {restaurant.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-xs sm:text-sm font-semibold text-[#A64F2C] hover:underline flex items-center gap-1 pt-1 cursor-pointer font-['Onest',sans-serif]"
                    >
                      <span>{isDescriptionExpanded ? 'Свернуть' : 'Читать полностью'}</span>
                      {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* SECTION 2: POPULAR MENU & DISHES */}
                <div ref={menuRef} className="space-y-4 scroll-mt-16">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Onest',sans-serif] text-[24px] sm:text-[28px] lg:text-[30px] font-semibold leading-[1.2] sm:leading-[1.16] tracking-[-0.025em] text-[#4F5328] flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-[#A64F2C]" />
                      <span>Популярные блюда</span>
                    </h3>

                    <button
                      type="button"
                      onClick={() => setIsFullMenuOpen(true)}
                      className="font-['Onest',sans-serif] text-xs sm:text-sm font-semibold text-[#707437] hover:text-[#4F5328] hover:underline cursor-pointer"
                    >
                      Смотреть всё меню →
                    </button>
                  </div>

                  {popularDishes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {popularDishes.slice(0, 4).map((dish) => (
                        <div 
                          key={dish.id}
                          className="p-3 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] flex gap-3 hover:border-[#707437] transition-colors"
                        >
                          <img
                            src={dish.photo}
                            alt={dish.name}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 warm-food-photo"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-['Onest',sans-serif] text-[14px] sm:text-[15px] font-semibold text-[#4F5328] truncate">{dish.name}</h4>
                                {dish.isPopular && (
                                  <span className="font-['Onest',sans-serif] text-[9px] font-semibold text-[#707437] bg-[#EFEAD8] px-1.5 py-0.5 rounded">
                                    Хит
                                  </span>
                                )}
                              </div>
                              <p className="font-['Onest',sans-serif] text-[13px] sm:text-[14px] font-normal leading-[1.4] text-[#756D5E] line-clamp-2 mt-0.5">{dish.description}</p>
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#E2D9C8]">
                              <span className="font-['Onest',sans-serif] text-xs sm:text-sm font-bold text-[#A64F2C]">{dish.price} BYN</span>
                              {dish.weight && <span className="font-['Onest',sans-serif] text-[12px] sm:text-[13px] font-normal text-[#756D5E]">{dish.weight}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] font-['Onest',sans-serif] text-xs text-[#756D5E] text-center">
                      Меню уточняется. Вы можете запросить актуальное меню при бронировании.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsFullMenuOpen(true)}
                    className="w-full py-3 bg-[#FAF5EB] hover:bg-[#EFEAD8] text-[#4F5328] font-['Onest',sans-serif] text-xs sm:text-sm font-semibold rounded-xl border border-[#D8CFBE] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Открыть полное меню ресторана</span>
                    <ChevronRight className="w-4 h-4 text-[#707437]" />
                  </button>
                </div>

                {/* SECTION 3: FEATURES & AMENITIES ("Особенности") */}
                <div ref={featuresRef} className="space-y-3 scroll-mt-16">
                  <h3 className="font-['Onest',sans-serif] text-[24px] sm:text-[28px] lg:text-[30px] font-semibold leading-[1.2] sm:leading-[1.16] tracking-[-0.025em] text-[#4F5328]">
                    Особенности
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {visibleFeatures.map((feat) => (
                      <div 
                        key={feat}
                        className="p-3.5 sm:p-4 bg-[#FAF5EB] rounded-[16px] border border-[#707437]/22 flex items-center gap-3 hover:border-[#707437]/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#EFEAD8] flex items-center justify-center flex-shrink-0">
                          {getFeatureIcon(feat)}
                        </div>
                        <span className="font-['Onest',sans-serif] text-[14px] sm:text-[15px] font-semibold text-[#4F5328]">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {combinedFeatures.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
                      className="font-['Onest',sans-serif] text-xs sm:text-sm font-semibold text-[#707437] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <span>{isFeaturesExpanded ? 'Свернуть особенности' : `Показать все особенности (${combinedFeatures.length})`}</span>
                      {isFeaturesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* SECTION 4: EXPRESSIVE RATING BREAKDOWN */}
                <div className="p-5 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] space-y-4 font-['Onest',sans-serif]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8CFBE] pb-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#4F5328]">{restaurant.rating}</span>
                        <span className="text-xs text-[#756D5E]">из 5.0</span>
                        <div className="flex text-amber-500 gap-0.5 ml-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#756D5E] mt-1 font-semibold">
                        На основе {restaurant.reviewCount} проверенных оценок гостей Tavoo
                      </p>
                    </div>

                    <div className="px-3 py-1.5 bg-[#EFEAD8] rounded-xl border border-[#C8C0A8] text-xs font-bold text-[#4F5328] self-start sm:self-auto">
                      Выбор гостей 2025
                    </div>
                  </div>

                  {/* Sub-ratings Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[#4F5328]">
                        <span>Кухня и блюда</span>
                        <span>4.9 / 5</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E2D9C8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#707437] rounded-full w-[98%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[#4F5328]">
                        <span>Обслуживание</span>
                        <span>4.8 / 5</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E2D9C8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#707437] rounded-full w-[96%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[#4F5328]">
                        <span>Атмосфера</span>
                        <span>4.9 / 5</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E2D9C8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#707437] rounded-full w-[98%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[#4F5328]">
                        <span>Соотношение цена/качество</span>
                        <span>4.7 / 5</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E2D9C8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#707437] rounded-full w-[94%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: REVIEWS */}
                <div ref={reviewsRef} className="space-y-4 scroll-mt-16 font-['Onest',sans-serif]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Onest',sans-serif] text-[24px] sm:text-[28px] lg:text-[30px] font-semibold leading-[1.2] sm:leading-[1.16] tracking-[-0.025em] text-[#4F5328]">
                      Отзывы гостей ({reviewsList.length})
                    </h3>

                    <button
                      type="button"
                      onClick={() => setIsAddReviewOpen(!isAddReviewOpen)}
                      className="px-3.5 py-1.5 bg-[#A64F2C] hover:bg-[#8C3E20] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer font-['Onest',sans-serif]"
                    >
                      Написать отзыв
                    </button>
                  </div>

                  {/* Add Review Inline Form */}
                  {isAddReviewOpen && (
                    <form onSubmit={handleAddReview} className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#4F5328]">Ваша оценка:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setNewReviewRating(st)}
                              className="p-1 cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${st <= newReviewRating ? 'fill-amber-500 text-amber-500' : 'text-[#D8CFBE]'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        required
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Поделитесь впечатлениями о заведении..."
                        className="w-full p-3 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs text-[#211E19] focus:outline-none focus:border-[#A64F2C] resize-none font-['Onest',sans-serif]"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddReviewOpen(false)}
                          className="px-3 py-1.5 bg-[#FFFDF7] text-[#211E19] border border-[#D8CFBE] rounded-xl text-xs font-semibold"
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#A64F2C] text-white rounded-xl text-xs font-semibold hover:bg-[#8C3E20]"
                        >
                          Отправить
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reviews List Cards */}
                  <div className="space-y-3">
                    {reviewsList.slice(0, 3).map((rev) => (
                      <div key={rev.id} className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={rev.avatar} alt={rev.author} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <span className="text-xs sm:text-sm font-semibold text-[#4F5328] block">{rev.author}</span>
                              <span className="text-[10px] text-[#756D5E]">{rev.date}</span>
                            </div>
                          </div>

                          <div className="flex text-amber-500 gap-0.5">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#5C5446] leading-relaxed">{rev.text}</p>
                      </div>
                    ))}
                  </div>

                  {reviewsList.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setIsFullReviewsOpen(true)}
                      className="w-full py-3 bg-[#FAF5EB] hover:bg-[#EFEAD8] text-[#4F5328] text-xs sm:text-sm font-semibold rounded-xl border border-[#D8CFBE] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Показать все {reviewsList.length} отзывов</span>
                      <ChevronRight className="w-4 h-4 text-[#707437]" />
                    </button>
                  )}
                </div>

                {/* SECTION 6: MAP & LOCATION */}
                <div ref={mapRef} className="space-y-3 scroll-mt-16 font-['Onest',sans-serif]">
                  <h3 className="font-['Onest',sans-serif] text-[24px] sm:text-[28px] lg:text-[30px] font-semibold leading-[1.2] sm:leading-[1.16] tracking-[-0.025em] text-[#4F5328]">
                    Где находится ресторан
                  </h3>

                  <div className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] space-y-3">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-5 h-5 text-[#A64F2C] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-[#4F5328]">{restaurant.address}</div>
                        <div className="text-[11px] text-[#756D5E]">{restaurant.district} • Минск</div>
                      </div>
                    </div>

                    {/* Interactive Leaflet Mini Map Container */}
                    <div 
                      ref={miniMapContainerRef} 
                      className="w-full h-48 sm:h-56 rounded-xl border border-[#D8CFBE] overflow-hidden bg-[#FAF5E8] relative"
                    />

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <a
                        href={`https://yandex.ru/maps/?text=${encodeURIComponent(restaurant.address + ' ' + restaurant.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 bg-[#707437] hover:bg-[#565A27] text-white rounded-xl text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Построить маршрут</span>
                      </a>

                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-[#FAF5EB] hover:bg-[#EFEAD8] text-[#4F5328] border border-[#D8CFBE] rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer"
                      >
                        Открыть на карте Tavoo
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 7: CONTACTS & USEFUL INFO */}
                <div className="space-y-3 font-['Onest',sans-serif]">
                  <h3 className="font-['Onest',sans-serif] text-[24px] sm:text-[28px] lg:text-[30px] font-semibold leading-[1.2] sm:leading-[1.16] tracking-[-0.025em] text-[#4F5328]">
                    Полезная информация
                  </h3>

                  <div className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] space-y-2.5 text-xs sm:text-sm text-[#756D5E]">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#707437] flex-shrink-0" />
                      <span>Режим работы: <strong className="text-[#4F5328]">{restaurant.workingHours}</strong></span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#707437] flex-shrink-0" />
                      <span>Телефон: <a href={`tel:${restaurant.phone}`} className="font-semibold text-[#A64F2C] hover:underline">{restaurant.phone}</a></span>
                    </div>

                    {restaurant.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-[#707437] flex-shrink-0" />
                        <span>Сайт: <a href={restaurant.website} target="_blank" rel="noreferrer" className="font-semibold text-[#A64F2C] hover:underline">{restaurant.website}</a></span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-[#E2D9C8] text-[11px] text-[#756D5E]">
                      <Shield className="w-4 h-4 text-[#707437] flex-shrink-0" />
                      <span>Правила бронирования: бесплатное подтверждение и отмена за 1 час до визита.</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 8: SIMILAR PLACES */}
                {similarRestaurants.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#D8CFBE] font-['Onest',sans-serif]">
                    <h3 className="font-['Onest',sans-serif] text-[24px] sm:text-[28px] lg:text-[30px] font-semibold leading-[1.2] sm:leading-[1.16] tracking-[-0.025em] text-[#4F5328]">
                      Похожие рестораны
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {similarRestaurants.map((sim) => (
                        <div
                          key={sim.id}
                          onClick={() => onSelectRestaurant(sim)}
                          className="p-3 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] hover:border-[#707437] cursor-pointer transition-all space-y-2 group"
                        >
                          <img
                            src={sim.photos[0]}
                            alt={sim.name}
                            className="w-full h-24 rounded-xl object-cover group-hover:scale-[1.02] transition-transform warm-food-photo"
                          />
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-[#4F5328] truncate group-hover:text-[#A64F2C]">
                              {sim.name}
                            </h4>
                            <p className="text-[11px] text-[#756D5E]">{sim.primaryCuisine} • ~{sim.averageCheck} BYN</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: DESKTOP STICKY BOOKING CARD */}
              <div className="hidden lg:block min-w-0 font-['Onest',sans-serif]">
                <div className="sticky top-4 bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] p-5 shadow-lg space-y-4">
                  
                  {/* Card Header */}
                  <div className="flex items-baseline justify-between border-b border-[#D8CFBE] pb-3 font-['Onest',sans-serif]">
                    <div>
                      <span className="text-[11px] text-[#756D5E] font-semibold block">Средний чек</span>
                      <div className="text-2xl font-bold text-[#4F5328]">
                        {restaurant.averageCheck} <span className="text-xs font-semibold text-[#756D5E]">BYN</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold text-xs text-[#4F5328]">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{restaurant.rating}</span>
                      </div>
                      <span className="text-[10px] text-[#756D5E]">{restaurant.reviewCount} отзывов</span>
                    </div>
                  </div>

                  {/* Form Selectors */}
                  <div className="space-y-3 text-xs font-['Onest',sans-serif]">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#4F5328] mb-1">
                        Дата визита
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full p-2.5 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs sm:text-sm font-medium text-[#211E19] focus:outline-none focus:border-[#A64F2C] font-['Onest',sans-serif]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[13px] font-semibold text-[#4F5328] mb-1">
                          Время
                        </label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full p-2.5 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs sm:text-sm font-medium text-[#211E19] focus:outline-none focus:border-[#A64F2C] font-['Onest',sans-serif]"
                        >
                          {['12:00', '13:00', '14:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[13px] font-semibold text-[#4F5328] mb-1">
                          Гости
                        </label>
                        <select
                          value={bookingGuests}
                          onChange={(e) => setBookingGuests(e.target.value)}
                          className="w-full p-2.5 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs sm:text-sm font-medium text-[#211E19] focus:outline-none focus:border-[#A64F2C] font-['Onest',sans-serif]"
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10].map(g => (
                            <option key={g} value={g}>{g} чел.</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={handleTriggerBooking}
                    className="w-full py-3.5 bg-[#A64F2C] hover:bg-[#8C3E20] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 font-['Onest',sans-serif]"
                  >
                    <span>Забронировать стол</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="p-2.5 bg-[#EFEAD8] rounded-xl text-[11px] text-[#4F5328] text-center border border-[#C8C0A8] font-['Onest',sans-serif]">
                    Бесплатное моментальное бронирование через Tavoo
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>

        {/* MOBILE STICKY BOTTOM BOOKING BAR */}
        <div className="lg:hidden sticky bottom-0 bg-[#FAF5EB] border-t border-[#D8CFBE] p-3.5 px-4 flex items-center justify-between gap-3 z-30 shadow-[0_-8px_24px_rgba(28,22,15,0.12)] font-['Onest',sans-serif]">
          <div>
            <span className="text-[10px] text-[#756D5E] font-semibold block uppercase tracking-wider">
              Средний чек
            </span>
            <span className="text-base font-bold text-[#4F5328]">
              ~{restaurant.averageCheck} BYN
            </span>
          </div>

          <button
            type="button"
            onClick={handleTriggerBooking}
            className="px-6 py-3 bg-[#A64F2C] hover:bg-[#8C3E20] active:scale-[0.98] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5 font-['Onest',sans-serif]"
          >
            <span>Забронировать стол</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {fullscreenPhotoIndex !== null && (
        <div 
          onClick={() => setFullscreenPhotoIndex(null)}
          className="fixed inset-0 z-[4000] bg-[#211E19]/92 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-['Onest',sans-serif]"
        >
          <button
            type="button"
            onClick={() => setFullscreenPhotoIndex(null)}
            className="absolute top-4 right-4 text-white p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer z-10"
            aria-label="Закрыть фото"
          >
            <X className="w-6 h-6" />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenPhotoIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <div onClick={(e) => e.stopPropagation()} className="relative max-w-full max-h-[85vh] flex flex-col items-center">
            <img
              src={photos[fullscreenPhotoIndex]}
              alt={`${restaurant.name} photo ${fullscreenPhotoIndex + 1}`}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl warm-food-photo"
            />
            <div className="mt-3 text-xs text-white/80 font-bold">
              {fullscreenPhotoIndex + 1} из {photos.length}
            </div>
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenPhotoIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer z-10"
              aria-label="Следующее фото"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}

      {/* FULL MENU OVERLAY MODAL */}
      {isFullMenuOpen && (
        <div 
          onClick={() => setIsFullMenuOpen(false)}
          className="fixed inset-0 z-[3500] bg-[#211E19]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-['Onest',sans-serif]"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl font-['Onest',sans-serif] text-[#211E19]"
          >
            <div className="p-4 sm:p-5 border-b border-[#D8CFBE] bg-[#F4EFE6] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-[#4F5328]">
                  Меню ресторана {restaurant.name}
                </h3>
                <p className="text-xs text-[#756D5E]">Все категории и блюда</p>
              </div>

              <button
                type="button"
                onClick={() => setIsFullMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-[#FAF5EB] border border-[#D8CFBE] text-[#5C5446] hover:bg-[#A64F2C] hover:text-white transition-all cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Categories Pills */}
            <div className="p-3 border-b border-[#D8CFBE] flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0 bg-[#FFFDF7] font-['Onest',sans-serif]">
              <button
                type="button"
                onClick={() => setSelectedMenuCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  selectedMenuCategory === 'all'
                    ? 'bg-[#707437] text-white border-[#707437]'
                    : 'bg-[#FAF5EB] text-[#211E19] border-[#D8CFBE]'
                }`}
              >
                Все категории
              </button>
              {(restaurant.menu || []).map(cat => (
                <button
                  key={cat.categoryName}
                  type="button"
                  onClick={() => setSelectedMenuCategory(cat.categoryName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    selectedMenuCategory === cat.categoryName
                      ? 'bg-[#707437] text-white border-[#707437]'
                      : 'bg-[#FAF5EB] text-[#211E19] border-[#D8CFBE]'
                  }`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>

            {/* Menu Dishes Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar font-['Onest',sans-serif]">
              {(restaurant.menu || []).map((sec, idx) => {
                if (selectedMenuCategory !== 'all' && selectedMenuCategory !== sec.categoryName) {
                  return null;
                }

                return (
                  <div key={idx} className="space-y-3">
                    <h4 className="font-['Onest',sans-serif] text-lg font-semibold text-[#4F5328] border-b border-[#D8CFBE] pb-1.5">
                      {sec.categoryName}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sec.dishes.map(dish => (
                        <div key={dish.id} className="p-3 bg-[#FFFDF7] rounded-xl border border-[#D8CFBE] flex gap-3">
                          <img src={dish.photo} alt={dish.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 warm-food-photo" />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="font-semibold text-xs sm:text-sm text-[#4F5328] truncate">{dish.name}</div>
                              <p className="text-[11px] sm:text-xs text-[#756D5E] line-clamp-2 mt-0.5">{dish.description}</p>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-[#A64F2C] mt-1 pt-1 border-t border-[#E2D9C8]">
                              <span>{dish.price} BYN</span>
                              {dish.weight && <span className="text-[10px] sm:text-xs text-[#756D5E] font-normal">{dish.weight}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* FULL REVIEWS OVERLAY MODAL */}
      {isFullReviewsOpen && (
        <div 
          onClick={() => setIsFullReviewsOpen(false)}
          className="fixed inset-0 z-[3500] bg-[#211E19]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-['Onest',sans-serif]"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF5EB] rounded-2xl border border-[#D8CFBE] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl font-['Onest',sans-serif] text-[#211E19]"
          >
            <div className="p-4 sm:p-5 border-b border-[#D8CFBE] bg-[#F4EFE6] flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-[#4F5328]">
                  Все отзывы ({reviewsList.length})
                </h3>
                <p className="text-xs text-[#756D5E]">Ресторан {restaurant.name}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsFullReviewsOpen(false)}
                className="w-9 h-9 rounded-full bg-[#FAF5EB] border border-[#D8CFBE] text-[#5C5446] hover:bg-[#A64F2C] hover:text-white transition-all cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar font-['Onest',sans-serif]">
              {reviewsList.map(rev => (
                <div key={rev.id} className="p-4 bg-[#FFFDF7] rounded-xl border border-[#D8CFBE] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={rev.avatar} alt={rev.author} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-[#4F5328] block">{rev.author}</span>
                        <span className="text-[10px] text-[#756D5E]">{rev.date}</span>
                      </div>
                    </div>

                    <div className="flex text-amber-500 gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5C5446] leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return createPortal(modalMarkup, document.body);
};
