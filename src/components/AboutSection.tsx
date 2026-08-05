import React from 'react';
import { Compass, Sparkles, ShieldCheck, Award, ArrowRight, Utensils, Globe } from 'lucide-react';
import { BRAND_NAME } from '../constants/brand';

export const AboutSection: React.FC = () => {
  return (
    <div className="py-12 max-w-5xl mx-auto space-y-16">
      
      {/* Hero Mission */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7F7F7] border border-[#ECECEC] text-xs font-semibold text-[#1B1B1B]">
          <Compass className="w-4 h-4 text-[#2C77A8]" />
          <span>О проекте {BRAND_NAME}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1B1B1B] max-w-3xl mx-auto leading-tight">
          Платформа гастрономических открытий вашей мечты
        </h1>

        <p className="text-sm sm:text-base text-[#6E6E73] max-w-2xl mx-auto leading-relaxed">
          {BRAND_NAME} вдохновлен любовью к кулинарным впечатлениям, эстетике и высоким стандартам гостеприимства. Мы создали пространство, где каждое посещение ресторана превращается в праздник.
        </p>
      </div>

      {/* Manifesto 3 Cards (NOT delivery, NOT booking) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[22px] bg-[#F7F7F7] border border-[#ECECEC] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#ECECEC] text-[#1B1B1B] flex items-center justify-center shadow-sm">
            <Utensils className="w-5 h-5 text-[#2C77A8]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B1B1B]">Не служба доставки</h3>
          <p className="text-xs text-[#6E6E73] leading-relaxed">
            Мы верим, что настоящая магия блюд раскладывается в живой атмосфере ресторана: под шелест пластинок, аромат свежей выпечки и звон бокалов.
          </p>
        </div>

        <div className="p-8 rounded-[22px] bg-[#F7F7F7] border border-[#ECECEC] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#ECECEC] text-[#1B1B1B] flex items-center justify-center shadow-sm">
            <Globe className="w-5 h-5 text-[#2C77A8]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B1B1B]">Не сухой агрегатор</h3>
          <p className="text-xs text-[#6E6E73] leading-relaxed">
            Никаких перегруженных рейтингов и кликабельного хаоса. Мы отбираем места с душой, авторской концепцией и высоким качеством сервиса.
          </p>
        </div>

        <div className="p-8 rounded-[22px] bg-[#F7F7F7] border border-[#ECECEC] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#ECECEC] text-[#1B1B1B] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-[#2C77A8]" />
          </div>
          <h3 className="text-lg font-bold text-[#1B1B1B]">Мир кулинарных эмоций</h3>
          <p className="text-xs text-[#6E6E73] leading-relaxed">
            Как Airbnb открывает новые города для путешественников, так {BRAND_NAME} открывает гастрономическую карту твоего родного города.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="p-10 rounded-[22px] bg-[#0E3554] text-white space-y-8 shadow-xl">
        <div className="max-w-xl">
          <span className="text-xs font-semibold text-[#E7DFC5] uppercase tracking-wider">Наши принципы</span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1">Почему жители выбирают {BRAND_NAME}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-200">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2C77A8] flex-shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Честные отклики</h4>
              <p className="mt-1 leading-relaxed">Все отзывы и фотографии проверяются модераторами на достоверность.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Award className="w-5 h-5 text-[#2C77A8] flex-shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Эксклюзивные сеты</h4>
              <p className="mt-1 leading-relaxed">Уникальные меню гастрофестивалей по фиксированной спешл-цене.</p>
            </div>
          </div>
        </div>
      </div>

      {/* For Restaurant Owners */}
      <div className="p-8 rounded-[22px] border border-[#ECECEC] bg-[#F7F7F7] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-[#1B1B1B]">Вы владелец ресторана или шеф-повар?</h3>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-lg">
            Присоединяйтесь к платформе {BRAND_NAME} и расскажите тысячям истинных ценителей еды о вашем заведении и фестивальных сетах.
          </p>
        </div>

        <button 
          onClick={() => alert('Заявка на подключение ресторана отправлена! Наш менеджер свяжется с вами.')}
          className="px-6 py-3.5 bg-[#2C77A8] hover:bg-[#235f87] text-white font-bold text-xs rounded-full shadow-md flex items-center gap-2 transition-transform hover:scale-105 whitespace-nowrap"
        >
          <span>Стать партнером</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

    </div>
  );
};
