import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Users, Minus, Plus, X, Check } from 'lucide-react';
import { formatPartySizeRu } from '../utils/bookingUtils';

interface GuestsPickerPopoverProps {
  value: number;
  onChange: (guests: number) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export const GuestsPickerPopover: React.FC<GuestsPickerPopoverProps> = ({
  value,
  onChange,
  onClose,
  anchorEl,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [tempGuests, setTempGuests] = useState<number>(value || 2);
  const [coords, setCoords] = useState<{ top?: number; left?: number }>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const updatePosition = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile || !anchorEl) return;

      const rect = anchorEl.getBoundingClientRect();
      const popoverWidth = 330;
      const popoverHeight = 320;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.left;
      if (left + popoverWidth > viewportWidth - 16) {
        left = Math.max(16, viewportWidth - popoverWidth - 16);
      }

      let top = rect.bottom + 8;
      if (top + popoverHeight > viewportHeight - 16) {
        top = Math.max(16, rect.top - popoverHeight - 8);
      }

      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorEl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        (!anchorEl || !anchorEl.contains(e.target as Node))
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, anchorEl]);

  const presets = [1, 2, 3, 4, 6, 8, 10];

  const handleApply = () => {
    onChange(tempGuests);
    onClose();
  };

  const popoverContent = (
    <div
      ref={popoverRef}
      className={`fixed z-[2000] font-['Geologica'] ${
        isMobile
          ? 'inset-x-0 bottom-0 top-auto rounded-t-3xl p-5 animate-in slide-in-from-bottom duration-200'
          : 'w-[330px] max-w-[calc(100vw-24px)] rounded-[20px] p-5 shadow-[0_22px_56px_rgba(52,39,24,0.18)] animate-in fade-in duration-150'
      } bg-[#F2EBDD] border border-[#BFB3A2] text-[#211E19]`}
      style={!isMobile && coords.top !== undefined ? { top: coords.top, left: coords.left } : {}}
      id="guests-picker-popover"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#BFB3A2]">
        <div className="flex items-center gap-2 font-semibold text-[#211E19] text-sm">
          <Users className="w-4 h-4 text-[#A64F2C]" />
          <span>Количество гостей</span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1 text-[#6B645A] hover:text-[#211E19] hover:bg-[#F8F2E7] rounded-full transition-colors cursor-pointer"
          id="close-guests-popover"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stepper Control */}
      <div className="flex items-center justify-between bg-[#F8F2E7] p-3.5 rounded-2xl mb-4 border border-[#BFB3A2]">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#211E19]">
            {formatPartySizeRu(tempGuests)}
          </span>
          <span className="text-[11px] text-[#6B645A]">
            {tempGuests > 8 ? 'Банкет или большая компания' : 'Стандартный столик'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={tempGuests <= 1}
            onClick={() => setTempGuests(Math.max(1, tempGuests - 1))}
            className="w-9 h-9 rounded-xl border border-[#BFB3A2] bg-[#F2EBDD] flex items-center justify-center text-[#211E19] hover:bg-[#FFF4B8] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
            id="btn-decrement-guests"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="w-6 text-center text-sm font-bold text-[#211E19]">
            {tempGuests}
          </span>

          <button
            type="button"
            disabled={tempGuests >= 20}
            onClick={() => setTempGuests(Math.min(20, tempGuests + 1))}
            className="w-9 h-9 rounded-xl border border-[#BFB3A2] bg-[#F2EBDD] flex items-center justify-center text-[#211E19] hover:bg-[#FFF4B8] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
            id="btn-increment-guests"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="mb-4">
        <span className="block text-[11px] font-semibold text-[#6B645A] uppercase tracking-wider mb-2">
          Быстрый выбор
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setTempGuests(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                tempGuests === p
                  ? 'bg-[#707437] text-white border-[#707437] shadow-xs'
                  : 'bg-[#F8F2E7] text-[#211E19] border-[#BFB3A2] hover:bg-[#FFF4B8]'
              }`}
            >
              {p} {p === 1 ? 'гость' : p < 5 ? 'гостя' : 'гостей'}
            </button>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="pt-3 border-t border-[#BFB3A2] flex justify-end">
        <button
          type="button"
          onClick={handleApply}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#A64F2C] hover:bg-[#854023] text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          id="btn-apply-guests"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Готово ({formatPartySizeRu(tempGuests)})</span>
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(popoverContent, document.body);
};
