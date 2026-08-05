import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';

interface ActiveFilterChipsProps {
  filters: FilterState;
  onUpdateFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onUpdateFilters,
  onResetFilters,
}) => {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.query && filters.query.trim()) {
    chips.push({
      key: `query-${filters.query}`,
      label: `Поиск: «${filters.query}»`,
      onRemove: () => onUpdateFilters({ ...filters, query: '' }),
    });
  }

  if (filters.district) {
    chips.push({
      key: `district-${filters.district}`,
      label: `Район: ${filters.district}`,
      onRemove: () => onUpdateFilters({ ...filters, district: '' }),
    });
  }

  filters.types.forEach(type => {
    chips.push({
      key: `type-${type}`,
      label: type,
      onRemove: () => onUpdateFilters({
        ...filters,
        types: filters.types.filter(t => t !== type),
      }),
    });
  });

  filters.cuisines.forEach(cuisine => {
    chips.push({
      key: `cuisine-${cuisine}`,
      label: cuisine,
      onRemove: () => onUpdateFilters({
        ...filters,
        cuisines: filters.cuisines.filter(c => c !== cuisine),
      }),
    });
  });

  const CHECK_MAP: Record<string, string> = {
    'under-30': 'До 30 BYN',
    '30-50': '30 – 50 BYN',
    '50-80': '50 – 80 BYN',
    'above-80': 'От 80 BYN',
  };
  filters.checkRanges.forEach(range => {
    chips.push({
      key: `check-${range}`,
      label: CHECK_MAP[range] || range,
      onRemove: () => onUpdateFilters({
        ...filters,
        checkRanges: filters.checkRanges.filter(r => r !== range),
      }),
    });
  });

  filters.features.forEach(feature => {
    chips.push({
      key: `feature-${feature}`,
      label: feature,
      onRemove: () => onUpdateFilters({
        ...filters,
        features: filters.features.filter(f => f !== feature),
      }),
    });
  });

  if (filters.openNow) {
    chips.push({
      key: 'openNow',
      label: 'Открыто сейчас',
      onRemove: () => onUpdateFilters({ ...filters, openNow: false }),
    });
  }

  if (filters.lateWorking) {
    chips.push({
      key: 'lateWorking',
      label: 'Работает допоздна',
      onRemove: () => onUpdateFilters({ ...filters, lateWorking: false }),
    });
  }

  if (filters.reservable) {
    chips.push({
      key: 'reservable',
      label: 'Можно забронировать',
      onRemove: () => onUpdateFilters({ ...filters, reservable: false }),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 mt-3 flex flex-wrap items-center gap-2 select-none animate-in fade-in duration-200 font-['Geologica']">
      {chips.map(chip => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4B8] text-[#4E5328] text-xs font-semibold border border-[#707437]/30 transition-all hover:border-[#707437]"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="p-0.5 rounded-full hover:bg-[#707437]/20 transition-colors cursor-pointer"
            aria-label="Удалить фильтр"
          >
            <X className="w-3 h-3 text-[#4E5328]" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#6B645A] hover:text-[#211E19] transition-colors cursor-pointer ml-1"
      >
        <RotateCcw className="w-3 h-3 text-[#A64F2C]" />
        Сбросить всё
      </button>
    </div>
  );
};
