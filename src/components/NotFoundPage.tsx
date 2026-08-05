import React from 'react';
import { Compass, Home, Utensils, GlassWater, Sparkles, Map, ArrowLeft } from 'lucide-react';
import { BRAND_NAME } from '../constants/brand';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* 404 Badge & Visual */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF5EB] border border-[#D8CFBE] text-xs font-semibold text-[#707437]">
          <Compass className="w-4 h-4 text-[#A64F2C]" />
          <span>Ошибка 404 • {BRAND_NAME}</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-['Tenor_Sans',serif] text-5xl sm:text-6xl font-normal text-[#211E19]">
            404
          </h1>
          <h2 className="font-['Sora',sans-serif] text-xl sm:text-2xl font-semibold text-[#4F5328]">
            Страница не найдена
          </h2>
          <p className="font-['Geologica',sans-serif] text-sm text-[#756D5E] leading-relaxed">
            Похоже, запрашиваемый адрес не существует или был перемещён.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#707437] hover:bg-[#585c2b] text-white font-['Geologica',sans-serif] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>На главную</span>
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF5EB] hover:bg-[#EFEAD8] border border-[#D8CFBE] text-[#211E19] font-['Geologica',sans-serif] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 text-[#707437]" />
            <span>Назад</span>
          </button>
        </div>

        {/* Quick Links Suggestions */}
        <div className="pt-8 border-t border-[#D8CFBE] space-y-3">
          <p className="text-xs font-semibold text-[#756D5E] uppercase tracking-wider">
            Популярные разделы
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/restaurants')}
              className="px-3.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#D8CFBE] text-xs font-medium text-[#4F5328] hover:bg-[#FFF4B8] hover:border-[#707437] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5 text-[#A64F2C]" />
              <span>Рестораны</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/bars')}
              className="px-3.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#D8CFBE] text-xs font-medium text-[#4F5328] hover:bg-[#FFF4B8] hover:border-[#707437] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <GlassWater className="w-3.5 h-3.5 text-[#A64F2C]" />
              <span>Бары</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/collections')}
              className="px-3.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#D8CFBE] text-xs font-medium text-[#4F5328] hover:bg-[#FFF4B8] hover:border-[#707437] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A64F2C]" />
              <span>Подборки</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/map')}
              className="px-3.5 py-2 rounded-xl bg-[#FAF5EB] border border-[#D8CFBE] text-xs font-medium text-[#4F5328] hover:bg-[#FFF4B8] hover:border-[#707437] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Map className="w-3.5 h-3.5 text-[#A64F2C]" />
              <span>Карта</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
