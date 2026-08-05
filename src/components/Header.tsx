import React, { useState } from 'react';
import { 
  Heart, 
  Calendar,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  currentPathname: string;
  onNavigate: (path: string) => void;
  favoritesCount: number;
  currentCity?: string;
  setCurrentCity?: (city: string) => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenMyBookings?: () => void;
  onOpenAdminBookings?: () => void;
  selectedCuisine?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPathname,
  onNavigate,
  favoritesCount,
  onOpenMyBookings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const LEFT_NAV = [
    { id: 'restaurants', label: 'Рестораны', path: '/restaurants' },
    { id: 'bars', label: 'Бары', path: '/bars' },
    { id: 'collections', label: 'Подборки', path: '/collections' },
    { id: 'festivals', label: 'Акции', path: '/offers' },
  ];

  return (
    <header 
      className="sticky top-0 left-0 right-0 z-[1000] h-[76px] bg-[#FAF5E8] border-b border-[#D8CFBE] transition-colors select-none shadow-xs pointer-events-auto relative"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 h-full flex items-center justify-between relative">
        
        {/* LEFT NAV (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 h-full min-w-0">
          {LEFT_NAV.map((item) => {
            let isActive = false;
            if (item.path === '/restaurants') {
              isActive = currentPathname === '/restaurants' || currentPathname.startsWith('/restaurants/');
            } else if (item.path === '/bars') {
              isActive = currentPathname === '/bars' || currentPathname.startsWith('/bars/');
            } else if (item.path === '/collections') {
              isActive = currentPathname === '/collections' || currentPathname.startsWith('/collections/');
            } else if (item.path === '/offers') {
              isActive = currentPathname === '/offers' || currentPathname.startsWith('/offers/') || currentPathname === '/festivals' || currentPathname.startsWith('/festivals/');
            }

            return (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`nav-link relative h-full flex items-center font-['Geologica',sans-serif] text-[15px] font-semibold leading-none tracking-[-0.015em] transition-colors duration-[180ms] cursor-pointer whitespace-nowrap ${
                  isActive ? 'text-[#707437] is-active' : 'text-[#4F5328] hover:text-[#707437]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile Hamburger Toggle (Left side on mobile) */}
        <div className="lg:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#4F5328] hover:bg-[#707437]/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* CENTER LOGO */}
        <a 
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="header-logo-link select-none"
          aria-label="Tavoo — на главную"
        >
          <img
            src="/tavoo-logo-v3.png"
            alt="Tavoo"
            className="header-logo-img"
          />
        </a>

        {/* RIGHT NAV & ACTIONS (Aligned Right) */}
        <div className="flex items-center justify-end gap-5 xl:gap-7 h-full min-w-0">
          
          {/* Map Link */}
          <a
            href="/map"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/map');
            }}
            aria-current={currentPathname.startsWith('/map') ? 'page' : undefined}
            className={`nav-link hidden lg:relative lg:flex h-full items-center font-['Geologica',sans-serif] text-[15px] font-semibold leading-none tracking-[-0.015em] transition-colors duration-[180ms] cursor-pointer whitespace-nowrap ${
              currentPathname.startsWith('/map') 
                ? 'text-[#707437] is-active' 
                : 'text-[#4F5328] hover:text-[#707437]'
            }`}
          >
            Карта
          </a>

          {/* Bookings Link */}
          <a
            href="/bookings"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenMyBookings) onOpenMyBookings();
              onNavigate('/bookings');
            }}
            aria-current={currentPathname.startsWith('/bookings') ? 'page' : undefined}
            className={`nav-link hidden sm:inline-flex items-center gap-2 font-['Geologica',sans-serif] text-[15px] font-semibold leading-none tracking-[-0.015em] transition-colors duration-[180ms] cursor-pointer whitespace-nowrap ${
              currentPathname.startsWith('/bookings') ? 'text-[#707437] is-active' : 'text-[#4F5328] hover:text-[#707437]'
            }`}
            title="Бронирования"
          >
            <Calendar className="w-4 h-4 text-[#707437]" />
            <span className="hidden xl:inline">Бронирования</span>
          </a>

          {/* Saved / Favorites */}
          <a
            href="/saved"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/saved');
            }}
            aria-current={currentPathname.startsWith('/saved') ? 'page' : undefined}
            className={`nav-link inline-flex items-center gap-2 font-['Geologica',sans-serif] text-[15px] font-semibold leading-none tracking-[-0.015em] transition-colors duration-[180ms] cursor-pointer whitespace-nowrap ${
              currentPathname.startsWith('/saved')
                ? 'text-[#707437] is-active'
                : 'text-[#4F5328] hover:text-[#707437]'
            }`}
            title="Сохранённое"
            aria-label="Сохранённое"
          >
            <Heart className={`w-4 h-4 ${currentPathname.startsWith('/saved') ? 'text-[#A64F2C] fill-current' : 'text-[#707437]'}`} />
            <span className="hidden min-[1180px]:inline">Сохранённое</span>
            {favoritesCount > 0 && (
              <span className="text-[11px] font-bold bg-[#A64F2C] text-[#FFF4B8] px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shadow-xs">
                {favoritesCount}
              </span>
            )}
          </a>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF5E8] text-[#4F5328] border-b border-[#D8CFBE] px-6 py-6 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="flex flex-col gap-4 font-['Geologica'] text-[16px]">
            <a 
              href="/restaurants"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigate('/restaurants');
              }}
              aria-current={currentPathname.startsWith('/restaurants') ? 'page' : undefined}
              className={`text-left py-2 font-semibold border-b border-[#D8CFBE] transition-colors ${
                currentPathname.startsWith('/restaurants') ? 'text-[#707437]' : 'hover:text-[#707437]'
              }`}
            >
              Рестораны
            </a>
            <a 
              href="/bars"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigate('/bars');
              }}
              aria-current={currentPathname.startsWith('/bars') ? 'page' : undefined}
              className={`text-left py-2 font-semibold border-b border-[#D8CFBE] transition-colors ${
                currentPathname.startsWith('/bars') ? 'text-[#707437]' : 'hover:text-[#707437]'
              }`}
            >
              Бары
            </a>
            <a 
              href="/collections"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigate('/collections');
              }}
              aria-current={currentPathname.startsWith('/collections') ? 'page' : undefined}
              className={`text-left py-2 font-semibold border-b border-[#D8CFBE] transition-colors ${
                currentPathname.startsWith('/collections') ? 'text-[#707437]' : 'hover:text-[#707437]'
              }`}
            >
              Подборки
            </a>
            <a 
              href="/offers"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigate('/offers');
              }}
              aria-current={currentPathname.startsWith('/offers') || currentPathname.startsWith('/festivals') ? 'page' : undefined}
              className={`text-left py-2 font-semibold border-b border-[#D8CFBE] transition-colors ${
                currentPathname.startsWith('/offers') || currentPathname.startsWith('/festivals') ? 'text-[#707437]' : 'hover:text-[#707437]'
              }`}
            >
              Акции
            </a>
            <a 
              href="/map"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                onNavigate('/map');
              }}
              aria-current={currentPathname.startsWith('/map') ? 'page' : undefined}
              className={`text-left py-2 font-semibold border-b border-[#D8CFBE] transition-colors ${
                currentPathname.startsWith('/map') ? 'text-[#707437]' : 'hover:text-[#707437]'
              }`}
            >
              Карта
            </a>
            <div className="pt-2 flex flex-col gap-3">
              <a
                href="/bookings"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  if (onOpenMyBookings) onOpenMyBookings();
                  onNavigate('/bookings');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#707437] text-white font-semibold text-center text-sm flex items-center justify-center gap-2 hover:bg-[#4E5328] transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#FFF4B8]" />
                <span>Бронирования</span>
              </a>

              <a
                href="/saved"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  onNavigate('/saved');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#D8CFBE] bg-[#F8F2E7] text-[#4F5328] font-semibold text-center text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#A64F2C]" />
                <span>Сохранённое ({favoritesCount})</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
