import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  ChevronRight, 
  Phone, 
  User, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Send,
  ArrowLeft,
  Download,
  SendHorizontal
} from 'lucide-react';
import { Restaurant, Reservation } from '../types';
import { getTodayStr, formatDateRu, downloadCalendarICS } from '../utils/bookingUtils';
import { bookingsStore } from '../utils/bookingStore';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  initialDate?: string;
  initialTime?: string;
  initialGuests?: number;
  onBookingSuccess?: (reservation: Reservation) => void;
  onOpenMyBookings?: () => void;
  onShowToast?: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  initialDate,
  initialTime,
  initialGuests,
  onBookingSuccess,
  onOpenMyBookings,
  onShowToast,
}) => {
  // Step 1 state
  const [date, setDate] = useState<string>(initialDate || getTodayStr());
  const [time, setTime] = useState<string>(initialTime || '19:00');
  const [guests, setGuests] = useState<number>(initialGuests || 2);
  const [seatingPreference, setSeatingPreference] = useState<string>('Обычный стол');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Step 2 state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+375 ');
  const [guestEmail, setGuestEmail] = useState('');
  const [comment, setComment] = useState('');
  const [telegramOptIn, setTelegramOptIn] = useState(false);
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [telegramLinkUrl, setTelegramLinkUrl] = useState<string | null>(null);

  // Flow & UI state
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nearestAvailableSlots, setNearestAvailableSlots] = useState<string[]>([]);
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  // Availability from server
  const [occupiedTableIds, setOccupiedTableIds] = useState<string[]>([]);
  const [serverSlots, setServerSlots] = useState<{ time: string; available: boolean; remaining: number }[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto pre-fill saved user info & sync state when opened
  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || getTodayStr());
      setTime(initialTime || '19:00');
      setGuests(initialGuests || 2);
      setSelectedTableId(null);
      setSeatingPreference('Обычный стол');
      setStep(1);
      setErrorMessage(null);
      setNearestAvailableSlots([]);
      setShowUnsavedPrompt(false);

      const savedUser = localStorage.getItem('tavoo_user_info') || localStorage.getItem('restaweek_user_info');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.name) setGuestName(parsed.name);
          if (parsed.phone) setGuestPhone(parsed.phone);
          if (parsed.email) setGuestEmail(parsed.email);
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen, initialDate, initialTime, initialGuests]);

  // Check server availability when date, time, or guests change
  useEffect(() => {
    if (!isOpen || !restaurant) return;

    let isMounted = true;
    setIsLoadingAvailability(true);

    bookingsStore.checkAvailability(restaurant.id, date, guests).then((res) => {
      if (!isMounted) return;
      setIsLoadingAvailability(false);
      setOccupiedTableIds(res.occupiedTableIds || []);
      setServerSlots(res.slots || []);

      // If chosen time is unavailable in server response, clear it or pick first available
      if (res.slots.length > 0) {
        const slot = res.slots.find(s => s.time === time);
        if (slot && !slot.available) {
          const firstAvailable = res.slots.find(s => s.available);
          if (firstAvailable) setTime(firstAvailable.time);
        }
      }
    }).catch(() => {
      if (isMounted) setIsLoadingAvailability(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, restaurant, date, guests]);

  // Track if form has unsaved edits
  const hasUnsavedChanges = (): boolean => {
    if (step === 'success') return false;
    if (guestName.trim().length > 0) return true;
    if (comment.trim().length > 0) return true;
    if (guestEmail.trim().length > 0) return true;
    if (guestPhone.trim().length > 5 && guestPhone.trim() !== '+375') return true;
    return false;
  };

  const handleAttemptClose = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  // Keyboard navigation & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleAttemptClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, guestName, comment, guestEmail, guestPhone, step]);

  if (!isOpen) return null;

  const isReservable = restaurant.isReservable ?? true;
  const reservationMode = restaurant.reservationMode || (isReservable ? 'instant' : 'unavailable');

  // Date presets (7 days ahead)
  const today = new Date();
  const datePresets = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const iso = d.toISOString().split('T')[0];
    let label = '';
    if (offset === 0) label = 'Сегодня';
    else if (offset === 1) label = 'Завтра';
    else {
      label = d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
    }
    return { iso, label };
  });

  // Time slots list
  const defaultTimeSlots = [
    '10:00', '11:00', '12:00', '12:30', '13:00', '13:30', '14:00',
    '15:00', '16:00', '17:00', '17:30', '18:00', '18:30', '19:00',
    '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const timeSlots = serverSlots.length > 0 ? serverSlots.map(s => s.time) : defaultTimeSlots;

  const handleNextStep = () => {
    setErrorMessage(null);
    if (!date) {
      setErrorMessage('Пожалуйста, выберите дату визита.');
      return;
    }
    if (!time) {
      setErrorMessage('Пожалуйста, выберите время визита.');
      return;
    }
    setStep(2);
  };

  const handleConnectTelegram = async () => {
    try {
      const res = await fetch('/api/telegram/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, phone: guestPhone }),
      });
      const data = await res.json();
      if (data.success && data.telegramUrl) {
        setTelegramLinkUrl(data.telegramUrl);
        window.open(data.telegramUrl, '_blank');
        setIsTelegramConnected(true);
        if (onShowToast) {
          onShowToast('Переход в Telegram', 'Нажмите «Запустить» в боте Tavoo', 'info');
        }
      }
    } catch {
      setIsTelegramConnected(true);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNearestAvailableSlots([]);

    if (!guestName.trim()) {
      setErrorMessage('Пожалуйста, укажите ваше имя.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 9) {
      setErrorMessage('Пожалуйста, укажите корректный номер телефона.');
      return;
    }

    setIsSubmitting(true);

    // Save contact info locally for convenience
    const userInfoStr = JSON.stringify({ name: guestName, phone: guestPhone, email: guestEmail });
    localStorage.setItem('tavoo_user_info', userInfoStr);

    try {
      const newBooking = await bookingsStore.createBooking({
        venueId: restaurant.id,
        date,
        time,
        partySize: guests,
        tableId: selectedTableId || undefined,
        tableLabel: selectedTableId ? seatingPreference : undefined,
        seatingPreference: [seatingPreference],
        guestName,
        guestPhone,
        guestEmail,
        telegramOptIn,
        comment,
      });

      setIsSubmitting(false);
      setCompletedReservation(newBooking);
      setStep('success');

      if (onBookingSuccess) {
        onBookingSuccess(newBooking);
      }

      if (onShowToast) {
        onShowToast('Бронирование создано', 'Добавлено в раздел «Бронирования»', 'success');
        if (guestEmail) {
          onShowToast('Подтверждение отправлено', `Письмо выслано на ${guestEmail}`, 'info');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      const errMsg = err.message || 'Ошибка создания бронирования.';
      setErrorMessage(errMsg);

      if (errMsg.includes('недоступно')) {
        setNearestAvailableSlots(['18:30', '19:30', '20:00'].filter(t => t !== time));
      }
    }
  };

  const modalMarkup = (
    <div 
      className="fixed inset-0 z-[4000] flex items-center justify-center p-0 sm:p-5 bg-[#211E19]/62 backdrop-blur-[5px] animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(33, 30, 25, 0.62)' }}
      onClick={handleAttemptClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Форма бронирования"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:w-[min(760px,100%)] h-full sm:h-auto sm:max-h-[calc(100dvh-40px)] bg-[#FAF5EB] border-0 sm:border border-[#D8CFBE] rounded-none sm:rounded-[22px] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(28,22,15,0.28)] z-[4010] outline-none font-['Geologica'] text-[#211E19]"
      >
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-[#D8CFBE] flex items-center justify-between bg-[#F4EFE6] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-2 rounded-xl bg-[#FAF5EB] border border-[#D8CFBE] text-[#4F5328] hover:bg-[#707437] hover:text-white transition-colors cursor-pointer"
                title="Назад"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#D8CFBE] flex-shrink-0 shadow-2xs">
              <img
                src={restaurant.photos && restaurant.photos[0] ? restaurant.photos[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-[#211E19] leading-tight truncate">
                {restaurant.name}
              </h2>
              <p className="text-xs text-[#5C5446] flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-[#707437] flex-shrink-0" />
                <span>{restaurant.address || restaurant.district} • {restaurant.primaryCuisine}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Compact Progress Indicator */}
            {step !== 'success' && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#FAF5EB] border border-[#D8CFBE] px-3 py-1 rounded-full text-xs font-bold text-[#4F5328]">
                <span className={step === 1 ? 'text-[#707437] underline decoration-[#707437]' : 'opacity-60'}>
                  1. Столик
                </span>
                <span className="opacity-40">•</span>
                <span className={step === 2 ? 'text-[#707437] underline decoration-[#707437]' : 'opacity-60'}>
                  2. Контакты
                </span>
              </div>
            )}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleAttemptClose}
              className="w-9 h-9 rounded-full bg-[#FAF5EB] border border-[#D8CFBE] text-[#5C5446] hover:text-[#211E19] hover:border-[#A64F2C] hover:bg-[#A64F2C] hover:text-white transition-all cursor-pointer flex items-center justify-center"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">

          {/* Instant / Request Mode Info Banner */}
          {step !== 'success' && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
              reservationMode === 'instant'
                ? 'bg-[#EFEAD8] border-[#C8C0A8] text-[#4F5328]'
                : 'bg-[#FDF6E2] border-[#E8DAB2] text-[#8C6D1F]'
            }`}>
              {reservationMode === 'instant' ? (
                <Zap className="w-5 h-5 text-[#707437] flex-shrink-0" />
              ) : (
                <Send className="w-5 h-5 text-[#8C6D1F] flex-shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {reservationMode === 'instant' ? 'Мгновенное бронирование' : 'Бронирование по запросу'}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {reservationMode === 'instant'
                    ? 'Ваш столик бронируется автоматически без ожидания подтверждения.'
                    : 'Ресторан подтвердит вашу заявку в течение 10–15 минут.'}
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FFF2F0] border border-[#A64F2C]/30 text-[#A64F2C] text-xs flex flex-col gap-2 animate-shake">
              <div className="flex items-center gap-2.5 font-bold">
                <AlertCircle className="w-4 h-4 text-[#A64F2C] flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
              {nearestAvailableSlots.length > 0 && (
                <div className="pt-1 border-t border-[#A64F2C]/20">
                  <span className="text-[11px] font-semibold block mb-1">Ближайшие доступные слоты:</span>
                  <div className="flex gap-2">
                    {nearestAvailableSlots.map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => { setTime(st); setErrorMessage(null); }}
                        className="px-2.5 py-1 bg-[#A64F2C] text-white rounded-lg text-xs font-bold hover:bg-[#8C3E20]"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: TABLE & DATE & TIME */}
          {step === 1 && (
            <div className="space-y-5">
              
              {/* Guests Count */}
              <div className="flex items-center justify-between p-3.5 bg-[#FFFDF7] rounded-2xl border border-[#D8CFBE]">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#707437]" />
                  <span className="text-xs font-bold text-[#211E19]">Количество гостей</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    className="w-8 h-8 rounded-full bg-[#FAF5EB] border border-[#D8CFBE] font-bold text-[#211E19] disabled:opacity-40 hover:bg-[#EFEAD8] cursor-pointer flex items-center justify-center transition-all"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-[#211E19] w-6 text-center">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    disabled={guests >= 20}
                    className="w-8 h-8 rounded-full bg-[#FAF5EB] border border-[#D8CFBE] font-bold text-[#211E19] disabled:opacity-40 hover:bg-[#EFEAD8] cursor-pointer flex items-center justify-center transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Date Presets & Custom Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#4F5328] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#707437]" />
                  Дата визита
                </label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {datePresets.map((p) => {
                    const isSelected = date === p.iso;
                    return (
                      <button
                        key={p.iso}
                        type="button"
                        onClick={() => setDate(p.iso)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border whitespace-nowrap cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#707437] text-[#FFFDF7] border-[#707437] shadow-xs'
                            : 'bg-[#FFFDF7] text-[#211E19] border-[#D8CFBE] hover:border-[#707437]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-2 py-1.5 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs font-bold text-[#211E19] focus:outline-none focus:border-[#A64F2C]"
                  />
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#4F5328] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#707437]" />
                    Время ({formatDateRu(date)})
                  </label>
                  {isLoadingAvailability && (
                    <span className="text-[10px] text-[#7C725F] animate-pulse">
                      Проверка мест...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {timeSlots.map((t) => {
                    const slotInfo = serverSlots.find(s => s.time === t);
                    const isOccupied = slotInfo ? !slotInfo.available : false;
                    const isSelected = time === t;

                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => { setTime(t); setErrorMessage(null); }}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          isOccupied
                            ? 'bg-[#EAE5D9] text-[#A29A8B] border-[#D8CFBE] line-through opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#707437] text-[#FFFDF7] border-[#707437] shadow-xs scale-[1.02]'
                            : 'bg-[#FFFDF7] text-[#211E19] border-[#D8CFBE] hover:border-[#707437] hover:bg-[#FAF5EB]'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seating / Table Selection */}
              <div className="space-y-2 pt-2 border-t border-[#D8CFBE]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#4F5328] uppercase tracking-wider">
                    {restaurant.hasSeatMap ? 'Выбор конкретного стола' : 'Предпочтение по посадке'}
                  </label>
                  {restaurant.hasSeatMap && (
                    <span className="text-[10px] font-bold text-[#707437] bg-[#EFEAD8] border border-[#C8C0A8] px-2 py-0.5 rounded-md">
                      Схема заведения
                    </span>
                  )}
                </div>

                {restaurant.hasSeatMap && restaurant.tables && restaurant.tables.length > 0 ? (
                  <div className="space-y-3 bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#D8CFBE]">
                    <p className="text-[11px] text-[#5C5446]">
                      Выберите доступный стол на схеме. Занятые столы заблокированы:
                    </p>

                    <div className="space-y-3">
                      {(restaurant.zones || [{ id: 'z1', name: 'Главный зал' }]).map((zone) => {
                        const zoneTables = restaurant.tables!.filter(t => (!t.zoneId || t.zoneId === zone.id) && t.capacity >= guests);
                        if (zoneTables.length === 0) return null;

                        return (
                          <div key={zone.id} className="space-y-2">
                            <span className="text-[11px] font-bold text-[#4F5328] uppercase tracking-wider block border-b border-[#E2D9C8] pb-1">
                              {zone.name}
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {zoneTables.map((tbl) => {
                                const isSelected = selectedTableId === tbl.id;
                                const isOccupied = occupiedTableIds.includes(tbl.id) || !tbl.active;

                                return (
                                  <button
                                    key={tbl.id}
                                    type="button"
                                    disabled={isOccupied}
                                    onClick={() => {
                                      setSelectedTableId(tbl.id);
                                      setSeatingPreference(`${tbl.label} (${zone.name})`);
                                    }}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                      isOccupied
                                        ? 'bg-[#EAE5D9] border-[#D8CFBE] text-[#A29A8B] cursor-not-allowed opacity-60'
                                        : isSelected
                                        ? 'bg-[#707437] text-white border-[#707437] shadow-xs'
                                        : 'bg-[#FFFDF7] text-[#211E19] border-[#D8CFBE] hover:border-[#707437]'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-bold text-xs">{tbl.label}</span>
                                      <span className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-[#A29A8B]' : isSelected ? 'bg-[#FFF4B8]' : 'bg-[#707437]'}`} />
                                    </div>
                                    <span className="text-[10px] opacity-80 mt-1">
                                      {isOccupied ? 'Занят' : `до ${tbl.capacity} чел.`}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Standard seating preferences */
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(
                        restaurant.primaryType === 'sports_bar'
                          ? ['У экрана', 'За барной стойкой', 'Большой стол', 'Обычный стол']
                          : restaurant.primaryType === 'hookah_lounge'
                          ? ['Кальянная зона', 'Диван или кабинка', 'VIP-комната', 'Некурящая зона']
                          : ['У окна', 'На террасе', 'Обычный стол', 'VIP-комната', 'За барной стойкой']
                      ).map((pref) => {
                        const isSel = seatingPreference === pref;
                        return (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => { setSeatingPreference(pref); setSelectedTableId(null); }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                              isSel
                                ? 'bg-[#707437] text-white border-[#707437] shadow-xs'
                                : 'bg-[#FFFDF7] text-[#211E19] border-[#D8CFBE] hover:border-[#707437]'
                            }`}
                          >
                            {pref}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-[#5C5446] italic bg-[#EFEAD8] p-2.5 rounded-xl border border-[#C8C0A8]">
                      Пожелание по посадке будет передано ресторану.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 2: CONTACTS & CONFIRMATION */}
          {step === 2 && (
            <form onSubmit={handleSubmitBooking} className="space-y-5">
              
              {/* Summary Card */}
              <div className="p-3.5 bg-[#FFFDF7] rounded-2xl border border-[#D8CFBE] text-xs space-y-1.5">
                <h4 className="font-bold text-[#4F5328] uppercase tracking-wider text-[11px] mb-1">
                  Сводка бронирования
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#211E19]">
                  <div><span className="text-[#7C725F] block text-[10px]">Дата:</span> <strong>{formatDateRu(date)}</strong></div>
                  <div><span className="text-[#7C725F] block text-[10px]">Время:</span> <strong>{time}</strong></div>
                  <div><span className="text-[#7C725F] block text-[10px]">Гости:</span> <strong>{guests} чел.</strong></div>
                </div>
                {seatingPreference && (
                  <p className="text-[11px] text-[#5C5446] pt-1 border-t border-[#E2D9C8]">
                    Посадка: <strong>{seatingPreference}</strong>
                  </p>
                )}
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4F5328] mb-1">
                    Ваше имя *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#7C725F] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#A64F2C] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4F5328] mb-1">
                    Телефон *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#7C725F] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+375 29 123-45-67"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#A64F2C] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#4F5328] mb-1">
                  Email для подтверждения (необязательно)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7C725F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#A64F2C] transition-all"
                  />
                </div>
              </div>

              {/* Comment / Special wishes */}
              <div>
                <label className="block text-[11px] font-bold text-[#4F5328] mb-1">
                  Пожелания к брони (необязательно)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-[#7C725F] absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="День рождения, детский стульчик..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FFFDF7] border border-[#D8CFBE] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#A64F2C] transition-all resize-none"
                  />
                </div>
              </div>

              {/* Telegram Opt-In Option */}
              <div className="p-3.5 bg-[#EFEAD8] rounded-2xl border border-[#C8C0A8] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#4F5328]">
                    <input
                      type="checkbox"
                      checked={telegramOptIn}
                      onChange={(e) => setTelegramOptIn(e.target.checked)}
                      className="w-4 h-4 accent-[#707437] rounded"
                    />
                    <span>Получать обновления в Telegram</span>
                  </label>

                  {telegramOptIn && (
                    <button
                      type="button"
                      onClick={handleConnectTelegram}
                      className="px-3 py-1 bg-[#707437] text-white rounded-xl text-[11px] font-bold hover:bg-[#565A27] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                      {isTelegramConnected ? 'Бот подключен' : 'Подключить Telegram'}
                    </button>
                  )}
                </div>
                {telegramOptIn && (
                  <p className="text-[10px] text-[#5C5446]">
                    После нажатия кнопки вы будете перенаправлены в бот Tavoo для подтверждения связи.
                  </p>
                )}
              </div>

            </form>
          )}

          {/* SUCCESS SCREEN */}
          {step === 'success' && (
            <div className="p-4 sm:p-6 text-center space-y-5">
              <div className="w-14 h-14 bg-[#EFEAD8] rounded-full flex items-center justify-center mx-auto text-[#707437] animate-bounce">
                <CheckCircle2 className="w-9 h-9 text-[#707437]" />
              </div>

              <div>
                <span className="px-3 py-1 bg-[#EFEAD8] text-[#4F5328] text-xs font-bold rounded-full uppercase tracking-wider">
                  {completedReservation?.reservationMode === 'instant' ? 'Столик забронирован!' : 'Заявка отправлена!'}
                </span>
                <h2 className="text-xl font-bold text-[#211E19] mt-2">
                  {completedReservation?.venueNameSnapshot || completedReservation?.restaurantName}
                </h2>
                <p className="text-xs text-[#5C5446] mt-1">
                  Номер брони: <strong className="text-[#A64F2C] font-mono text-sm">{completedReservation?.confirmationCode || completedReservation?.reservationNumber}</strong>
                </p>
              </div>

              {/* Confirmation Details Box */}
              <div className="p-4 bg-[#FFFDF7] rounded-2xl border border-[#D8CFBE] text-left text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-[#E2D9C8]">
                  <span className="text-[#7C725F]">Дата и время:</span>
                  <span className="font-bold text-[#211E19]">
                    {formatDateRu(completedReservation?.date || '')}, {completedReservation?.time}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2D9C8]">
                  <span className="text-[#7C725F]">Гости:</span>
                  <span className="font-bold text-[#211E19]">{completedReservation?.partySize} чел.</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2D9C8]">
                  <span className="text-[#7C725F]">Гость:</span>
                  <span className="font-bold text-[#211E19]">{completedReservation?.guestName} ({completedReservation?.guestPhone})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#7C725F]">Телефон заведения:</span>
                  <span className="font-bold text-[#211E19]">{completedReservation?.restaurantPhone}</span>
                </div>
              </div>

              {/* Notification Badges */}
              <div className="space-y-1 text-xs text-[#5C5446]">
                {completedReservation?.guestEmail && (
                  <p className="flex items-center justify-center gap-1 text-[#707437]">
                    <Mail className="w-3.5 h-3.5" />
                    Подтверждение отправлено на <strong>{completedReservation.guestEmail}</strong>
                  </p>
                )}
                {isTelegramConnected && (
                  <p className="flex items-center justify-center gap-1 text-[#707437]">
                    <SendHorizontal className="w-3.5 h-3.5" />
                    Обновления будут приходить в Telegram
                  </p>
                )}
              </div>

              {/* Final Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => completedReservation && downloadCalendarICS(completedReservation)}
                  className="flex-1 py-3 bg-[#FFFDF7] hover:bg-[#EFEAD8] text-[#211E19] text-xs font-bold border border-[#D8CFBE] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#707437]" />
                  В календарь (.ics)
                </button>

                {onOpenMyBookings && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenMyBookings(); }}
                    className="flex-1 py-3 bg-[#707437] hover:bg-[#565A27] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Мои бронирования
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#A64F2C] hover:bg-[#8C3E20] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Вернуться к ресторану
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Sticky Action Footer */}
        {step !== 'success' && (
          <div className="p-4 border-t border-[#D8CFBE] bg-[#F4EFE6] flex items-center justify-between gap-3 flex-shrink-0">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  className="px-4 py-3 bg-[#FAF5EB] hover:bg-[#EAE5D9] text-[#211E19] text-xs font-bold rounded-xl border border-[#D8CFBE] transition-all cursor-pointer"
                >
                  Отмена
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-3 bg-[#A64F2C] hover:bg-[#8C3E20] active:scale-[0.99] text-[#FFFDF7] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Продолжить</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-[#FAF5EB] hover:bg-[#EAE5D9] text-[#211E19] text-xs font-bold rounded-xl border border-[#D8CFBE] transition-all cursor-pointer"
                >
                  Назад
                </button>

                <button
                  type="button"
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#A64F2C] hover:bg-[#8C3E20] active:scale-[0.99] text-[#FFFDF7] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Бронируем...
                    </span>
                  ) : (
                    <span>Подтвердить бронирование</span>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Unsaved Changes Prompt Overlay */}
        {showUnsavedPrompt && (
          <div className="absolute inset-0 z-[4020] bg-[#211E19]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF5EB] p-5 rounded-2xl border border-[#D8CFBE] max-w-sm w-full text-center space-y-4 shadow-2xl">
              <h3 className="font-bold text-sm text-[#211E19]">Закрыть бронирование?</h3>
              <p className="text-xs text-[#5C5446]">
                Введённые данные не сохранятся.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUnsavedPrompt(false)}
                  className="flex-1 py-2.5 bg-[#FAF5EB] border border-[#D8CFBE] text-[#211E19] text-xs font-bold rounded-xl hover:bg-[#EFEAD8]"
                >
                  Продолжить заполнение
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUnsavedPrompt(false); onClose(); }}
                  className="flex-1 py-2.5 bg-[#A64F2C] text-white text-xs font-bold rounded-xl hover:bg-[#8C3E20]"
                >
                  Да, закрыть
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
};
