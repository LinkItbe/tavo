import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Calendar as CalendarIcon, Clock, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { getTodayStr, getTomorrowStr, formatDateRu, generateAllTimeSlots } from '../utils/bookingUtils';

interface DateTimePickerPopoverProps {
  selectedDate: string;
  selectedTime: string;
  onChange: (date: string, time: string) => void;
  onClose: () => void;
  anchorEl?: HTMLElement | null;
}

export const DateTimePickerPopover: React.FC<DateTimePickerPopoverProps> = ({
  selectedDate,
  selectedTime,
  onChange,
  onClose,
  anchorEl,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [tempDate, setTempDate] = useState<string>(selectedDate || getTodayStr());
  const [tempTime, setTempTime] = useState<string>(selectedTime || '19:00');
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Month navigation for mini calendar
  const initialDateObj = tempDate ? new Date(tempDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDateObj.getMonth()); // 0-11

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  // Position calculation with viewport boundaries and collision detection
  useEffect(() => {
    const updatePosition = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile || !anchorEl) return;

      const rect = anchorEl.getBoundingClientRect();
      const popoverWidth = 400;
      const popoverHeight = 520;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.left;
      if (left + popoverWidth > viewportWidth - 16) {
        left = Math.max(16, viewportWidth - popoverWidth - 16);
      }

      let top = rect.bottom + 8;
      if (top + popoverHeight > viewportHeight - 16) {
        // Position above anchor if space below is limited
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

  // Close on click outside or Escape key
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

  // Generate days in month
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (dayNumber: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(dayNumber).padStart(2, '0');
    const fullDate = `${viewYear}-${monthStr}-${dayStr}`;
    
    if (fullDate < todayStr) return;
    setTempDate(fullDate);
  };

  const handleQuickDate = (dateVal: string) => {
    setTempDate(dateVal);
    const d = new Date(dateVal);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const timeSlots = generateAllTimeSlots();

  const handleApply = () => {
    onChange(tempDate, tempTime);
    onClose();
  };

  const handleClear = () => {
    onChange('', '');
    onClose();
  };

  const popoverContent = (
    <div
      className={`fixed z-[2000] font-['Geologica'] ${
        isMobile
          ? 'inset-x-0 bottom-0 top-auto rounded-t-3xl max-h-[85vh] p-5 animate-in slide-in-from-bottom duration-200'
          : 'w-[400px] max-w-[calc(100vw-24px)] max-h-[min(620px,calc(100dvh-32px))] rounded-[20px] p-5 shadow-[0_22px_56px_rgba(52,39,24,0.18)] animate-in fade-in duration-150'
      } bg-[#F2EBDD] border border-[#BFB3A2] text-[#211E19] overflow-y-auto`}
      style={!isMobile && coords.top !== undefined ? { top: coords.top, left: coords.left } : {}}
      ref={popoverRef}
      id="datetime-picker-popover"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#BFB3A2]">
        <div className="flex items-center gap-2 font-semibold text-[#211E19] text-sm">
          <CalendarIcon className="w-4 h-4 text-[#A64F2C]" />
          <span>Дата и время бронирования</span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1 text-[#6B645A] hover:text-[#211E19] hover:bg-[#F8F2E7] rounded-full transition-colors cursor-pointer"
          id="close-datetime-popover"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Date Chips */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleQuickDate(todayStr)}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            tempDate === todayStr
              ? 'bg-[#FFF4B8] border-[#707437] text-[#4E5328] shadow-xs'
              : 'border-[#BFB3A2] bg-[#F8F2E7] text-[#211E19] hover:bg-[#FFF4B8]'
          }`}
          id="btn-quick-today"
        >
          Сегодня
        </button>
        <button
          type="button"
          onClick={() => handleQuickDate(tomorrowStr)}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            tempDate === tomorrowStr
              ? 'bg-[#FFF4B8] border-[#707437] text-[#4E5328] shadow-xs'
              : 'border-[#BFB3A2] bg-[#F8F2E7] text-[#211E19] hover:bg-[#FFF4B8]'
          }`}
          id="btn-quick-tomorrow"
        >
          Завтра
        </button>
      </div>

      {/* Calendar Month Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold text-[#211E19] tracking-wide font-['Geologica']">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-[#F8F2E7] rounded-lg text-[#211E19] transition-colors cursor-pointer"
            id="btn-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-[#F8F2E7] rounded-lg text-[#211E19] transition-colors cursor-pointer"
            id="btn-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
          <span key={day} className={`text-[11px] font-semibold ${idx >= 5 ? 'text-[#A64F2C]' : 'text-[#6B645A]'}`}>
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const monthStr = String(viewMonth + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const fullDateStr = `${viewYear}-${monthStr}-${dayStr}`;

          const isPast = fullDateStr < todayStr;
          const isSelected = tempDate === fullDateStr;
          const isCurrentToday = fullDateStr === todayStr;

          return (
            <button
              key={dayNum}
              type="button"
              disabled={isPast}
              onClick={() => handleSelectDay(dayNum)}
              className={`h-8 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#707437] text-white shadow-md scale-105'
                  : isPast
                  ? 'text-[#BFB3A2] cursor-not-allowed'
                  : isCurrentToday
                  ? 'text-[#854023] font-bold border border-[#A64F2C] bg-[#FFF4B8] hover:bg-[#FFF4B8]'
                  : 'text-[#211E19] hover:bg-[#F8F2E7]'
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Time Picker Section */}
      <div className="pt-3 border-t border-[#BFB3A2]">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-[#211E19]">
          <Clock className="w-3.5 h-3.5 text-[#A64F2C]" />
          <span>Время прибытия</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {timeSlots.map(time => {
            const isSelectedTime = tempTime === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => setTempTime(time)}
                className={`px-3 py-1.5 text-xs rounded-xl font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelectedTime
                    ? 'bg-[#707437] text-white shadow-xs'
                    : 'bg-[#F8F2E7] text-[#211E19] border border-[#BFB3A2] hover:bg-[#FFF4B8]'
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#BFB3A2]">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-semibold text-[#6B645A] hover:text-[#211E19] transition-colors cursor-pointer"
          id="btn-clear-datetime"
        >
          Сбросить
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#A64F2C] hover:bg-[#854023] text-white text-xs font-semibold rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          id="btn-apply-datetime"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Применить ({formatDateRu(tempDate)}, {tempTime})</span>
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(popoverContent, document.body);
};
