import React, { useRef, useState, useEffect } from 'react';
import { COLLECTIONS } from '../data/mockData';
import { Collection } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CollectionsSectionProps {
  selectedCollection: string | null;
  onSelectCollection: (collectionId: string | null) => void;
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
  selectedCollection,
  onSelectCollection
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.3;
    if (Math.abs(x - startX) > 5) {
      setHasDragged(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      const container = scrollRef.current;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      if (
        (e.deltaY > 0 && container.scrollLeft < maxScrollLeft) ||
        (e.deltaY < 0 && container.scrollLeft > 0)
      ) {
        container.scrollLeft += e.deltaY * 0.8;
      }
    }
  };

  useEffect(() => {
    if (!isDragging) {
      const timer = setTimeout(() => setHasDragged(false), 50);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent, colId: string) => {
    if (hasDragged) return;
    onSelectCollection(selectedCollection === colId ? null : colId);
    (e.currentTarget as HTMLElement).blur();
  };

  return (
    <section className="w-full bg-[#707437] py-16 sm:py-20 my-8 rounded-3xl overflow-hidden font-['Geologica'] text-white shadow-sm">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="flex flex-col mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#FFF4B8]" />
            <h2 className="font-['Sora',sans-serif] font-semibold text-[32px] sm:text-[40px] lg:text-[46px] leading-[1.08] tracking-[-0.035em] text-[#FFF4B8]">
              Авторские подборки
            </h2>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2 sm:mt-2.5">
            <p className="font-['Geologica',sans-serif] font-normal text-[17px] sm:text-[19px] leading-[1.45] text-[#FFF4B8]/85 max-w-[620px]">
              Подборки ресторанов для разных планов и настроений
            </p>
            {selectedCollection && (
              <button
                onClick={() => onSelectCollection(null)}
                className="text-xs font-semibold text-[#FFF4B8] hover:underline cursor-pointer whitespace-nowrap bg-[#4F5328]/40 px-3 py-1.5 rounded-full border border-[#FFF4B8]/30"
              >
                Сбросить выбор
              </button>
            )}
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar py-2 -mx-2 px-2 sm:mx-0 sm:px-0 select-none scroll-smooth ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {COLLECTIONS.map((col: Collection) => {
            const isSelected = selectedCollection === col.id;

            return (
              <div
                key={col.id}
                role="button"
                tabIndex={0}
                aria-label={`Подборка ${col.name}`}
                onClick={(e) => handleCardClick(e, col.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(e, col.id);
                  }
                }}
                className={`stagger-card snap-start flex-shrink-0 w-[280px] sm:w-[330px] group relative rounded-[18px] overflow-hidden cursor-pointer border transition-all duration-200 ease-out bg-[#FFFDF7] text-[#4F5328] flex flex-col ${
                  isSelected
                    ? 'border-[#FFF4B8] ring-4 ring-[#FFF4B8]/40 shadow-xl scale-[1.01]'
                    : 'border-[#FFF4B8]/30 hover:border-[#FFF4B8] hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                {/* Image */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#FAF5E8]">
                  <img
                    src={col.photo}
                    alt={col.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-[#FFF4B8] text-[#4F5328] text-xs font-bold rounded-full shadow-xs z-10 select-none border border-[#707437]/20">
                    {col.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col justify-between flex-1 bg-[#FFFDF7]">
                  <div>
                    <h3 className="text-base font-semibold text-[#4F5328] group-hover:text-[#707437] transition-colors flex items-center justify-between gap-2 font-['Geologica']">
                      <span className="truncate">{col.name}</span>
                      <ArrowRight className="w-4 h-4 text-[#707437] group-hover:translate-x-[3px] transition-transform duration-200 flex-shrink-0" />
                    </h3>
                    <p className="text-xs text-[#7C725F] mt-1.5 line-clamp-2 leading-relaxed font-normal">
                      {col.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
