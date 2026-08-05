import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, Users, Utensils, User, Phone, Mail, FileText } from 'lucide-react';
import { PartnerRestaurantConfig, PartnerBooking } from './types';
import { getTodayDateString, getTomorrowDateString } from './mockData';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: PartnerRestaurantConfig;
  onCreateBooking: (booking: PartnerBooking, toastMessage: string) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onCreateBooking,
}) => {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+375 29 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [visitDate, setVisitDate] = useState(today);
  const [visitTime, setVisitTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState(restaurant.tables[0]?.id || '');
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setCustomerPhone('+375 29 ');
      setCustomerEmail('');
      setVisitDate(today);
      setVisitTime('19:00');
      setPartySize(2);
      if (restaurant?.tables && restaurant.tables.length > 0) {
        setSelectedTableId(restaurant.tables[0].id);
      }
      setCustomerNote('');
    }
  }, [isOpen, restaurant, today]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const selectedTable = restaurant.tables.find((t) => t.id === selectedTableId) || restaurant.tables[0];
    const tableName = selectedTable ? `${selectedTable.name} · ${selectedTable.zone}` : 'Стол';

    const isInstant = restaurant.bookingMode === 'instant';
    const status = isInstant ? 'confirmed' : 'pending';
    const toastMsg = isInstant
      ? 'Новая бронь автоматически подтверждена'
      : 'Новая бронь ожидает подтверждения';

    const newBooking: PartnerBooking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: restaurant.restaurantId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '+375 29 000-00-00',
      customerEmail: customerEmail.trim() || 'guest@example.com',
      visitDate,
      visitTime,
      partySize: Number(partySize),
      tableId: selectedTable?.id || 'table-1',
      tableName,
      status,
      customerNote: customerNote.trim() || 'Тестовое бронирование из кабинета',
      createdAt: 'Тестовая бронь',
      isDemo: true,
    };

    onCreateBooking(newBooking, toastMsg);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-booking-title"
    >
      <div
        className="relative w-full max-w-lg bg-[#FFFDF7] border border-[#BFB3A2] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B645A] hover:bg-[#F2EBDD] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F5328]/10 text-[#4F5328] text-xs font-bold mb-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Демо-генератор</span>
          </div>
          <h2 id="new-booking-title" className="text-xl sm:text-2xl font-bold text-[#211E19]">
            Добавить тестовую бронь
          </h2>
          <p className="text-xs text-[#6B645A]">
            Бронь будет создана только для ресторана <span className="font-semibold text-[#211E19]">{restaurant.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
              Имя гостя *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707437]" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="например, Алексей"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-sm text-[#211E19] focus:outline-none focus:border-[#4F5328] focus:bg-[#FFFDF7] transition-all"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
                Телефон
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707437]" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-xs text-[#211E19] focus:outline-none focus:border-[#4F5328] focus:bg-[#FFFDF7] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707437]" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-xs text-[#211E19] focus:outline-none focus:border-[#4F5328] focus:bg-[#FFFDF7] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
                Дата *
              </label>
              <div className="space-y-1.5">
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707437]" />
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-xs text-[#211E19] focus:outline-none focus:border-[#4F5328] focus:bg-[#FFFDF7]"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVisitDate(today)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      visitDate === today
                        ? 'bg-[#4F5328] text-[#FFF4B8]'
                        : 'bg-[#F2EBDD] border border-[#BFB3A2] text-[#211E19]'
                    }`}
                  >
                    Сегодня
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitDate(tomorrow)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      visitDate === tomorrow
                        ? 'bg-[#4F5328] text-[#FFF4B8]'
                        : 'bg-[#F2EBDD] border border-[#BFB3A2] text-[#211E19]'
                    }`}
                  >
                    Завтра
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
                Время *
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707437]" />
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#4F5328] focus:bg-[#FFFDF7]"
                >
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Party size & Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
                Количество гостей
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707437]" />
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#4F5328]"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
                Столик
              </label>
              <div className="relative">
                <Utensils className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707437]" />
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#4F5328]"
                >
                  {restaurant.tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.zone}, до {t.capacity} чел)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-[#211E19] uppercase tracking-wider mb-1">
              Пожелание гостя
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-[#707437]" />
              <textarea
                rows={2}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="например: День рождения, тихий стол"
                className="w-full pl-10 pr-3 py-2 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-xs text-[#211E19] focus:outline-none focus:border-[#4F5328] focus:bg-[#FFFDF7]"
              />
            </div>
          </div>

          {/* Mode Info Notice */}
          <div className="p-3 rounded-2xl bg-[#FFF4B8]/60 border border-[#BFB3A2]/60 text-xs text-[#4F5328] font-medium flex items-center justify-between">
            <span>Режим заведения: <strong className="font-bold">{restaurant.bookingModeLabel}</strong></span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#4F5328] text-[#FFF4B8] font-bold">
              {restaurant.bookingMode === 'instant' ? 'Авто-подтверждение' : 'Ожидает решения'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-[#BFB3A2] text-[#211E19] text-xs font-semibold hover:bg-[#F2EBDD] transition-all cursor-pointer min-h-[44px]"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-full bg-[#4F5328] hover:bg-[#3D401F] text-[#FFF4B8] text-xs font-bold transition-all shadow-md cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Создать бронь</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
