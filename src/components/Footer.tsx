import React from 'react';
import { Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-16 bg-[#3B3E1E] text-[#FFF4B8] font-['Geologica'] select-none">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#FFF4B8]/20">
          
          {/* Brand */}
          <div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="footer-logo-link"
              aria-label="Tavoo — на главную"
            >
              <img
                src="/tavoo-logo-footer-butter.png"
                alt="Tavoo"
                className="footer-logo-image"
              />
            </a>
            <p className="font-['Geologica',sans-serif] text-[16px] leading-[1.55] text-[#FFF4B8]/80">
              Сервис бронирования столиков и гастрономический гид по ресторанам и барам.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-['Geologica',sans-serif] text-[15px] font-semibold text-[#FFF4B8] mb-4">Навигация</h4>
            <ul className="space-y-2.5 font-['Geologica',sans-serif] text-[16px] leading-[1.55] text-[#FFF4B8]/80">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">Главная</button></li>
              <li><button onClick={() => onNavigate('restaurants')} className="hover:text-white transition-colors cursor-pointer">Рестораны</button></li>
              <li><button onClick={() => onNavigate('festivals')} className="hover:text-white transition-colors cursor-pointer">Акции</button></li>
              <li><button onClick={() => onNavigate('collections')} className="hover:text-white transition-colors cursor-pointer">Подборки</button></li>
              <li><button onClick={() => onNavigate('map')} className="hover:text-white transition-colors cursor-pointer">Карта</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">О проекте</button></li>
            </ul>
          </div>

          {/* Popular */}
          <div>
            <h4 className="font-['Geologica',sans-serif] text-[15px] font-semibold text-[#FFF4B8] mb-4">Популярное</h4>
            <ul className="space-y-2.5 font-['Geologica',sans-serif] text-[16px] leading-[1.55] text-[#FFF4B8]/80">
              <li><span className="cursor-pointer hover:text-white transition-colors">Итальянская кухня</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Завтраки весь день</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Стейки на гриле</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Винные бары</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Панорамные рестораны</span></li>
            </ul>
          </div>

          {/* Partner & Contact */}
          <div>
            <h4 className="font-['Geologica',sans-serif] text-[15px] font-semibold text-[#FFF4B8] mb-4">Рестораторам</h4>
            <p className="font-['Geologica',sans-serif] text-[16px] leading-[1.55] text-[#FFF4B8]/80 mb-4">
              Разместите ваше заведение или подключите модуль мгновенного бронирования.
            </p>
            <button 
              onClick={() => alert('Заявка на подключение отправлена')}
              className="px-5 py-2.5 bg-[#A64F2C] hover:bg-[#854023] text-[#FFF4B8] text-sm font-semibold rounded-full transition-all duration-200 hover:-translate-y-[1px] shadow-xs hover:shadow-md cursor-pointer border border-[#FFF4B8]/30"
            >
              Подключить ресторан
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF4B8]/70">
          <div>
            © 2026 TAVOO. Все права защищены.
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-[#FFF4B8]">
              <Globe className="w-3.5 h-3.5 text-[#FFF4B8]" /> Русский (RU)
            </span>
            <span className="font-semibold text-[#FFF4B8]">BYN (Br)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
