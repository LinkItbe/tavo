import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  Clock3, 
  AlertTriangle, 
  Phone, 
  ExternalLink, 
  Download,
  Utensils
} from 'lucide-react';
import { Reservation } from '../types';
import { formatDateRu, downloadCalendarICS } from '../utils/bookingUtils';
import { bookingsStore } from '../utils/bookingStore';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRestaurant?: (restaurantId: string) => void;
  onShowToast?: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  onSelectRestaurant,
  onShowToast,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past' | 'cancelled'>('upcoming');
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const reloadData = async () => {
    const list = await bookingsStore.syncWithServer();
    setReservations(list);
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
      const unsubscribe = bookingsStore.subscribe(() => {
        setReservations(bookingsStore.getCachedBookings());
      });
      return unsubscribe;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReservations = reservations.filter((r) => {
    if (activeTab === 'cancelled') return r.status === 'cancelled' || r.status === 'rejected';
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'upcoming') {
      return (r.status === 'confirmed' || r.status === 'pending') && r.date >= todayStr;
    }
    // past
    return r.date < todayStr && r.status !== 'cancelled' && r.status !== 'rejected';
  });

  const handleConfirmCancel = async (id: string) => {
    setIsCancelling(true);
    try {
      await bookingsStore.cancelBooking(id);
      setIsCancelling(false);
      setCancelPromptId(null);
      if (onShowToast) {
        onShowToast('Бронирование отменено', 'Статус обновлен', 'info');
      }
      reloadData();
    } catch {
      setIsCancelling(false);
      setCancelPromptId(null);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[4000] flex items-center justify-center p-2 sm:p-4 bg-[#211E19]/62 backdrop-blur-[5px] animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(33, 30, 25, 0.62)' }}
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Мои бронирования"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF5EB] border-0 sm:border border-[#D8CFBE] rounded-none sm:rounded-[22px] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_30px_80px_rgba(28,22,15,0.28)] z-[4010] outline-none font-['Geologica'] text-[#211E19]"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#D8CFBE] flex items-center justify-between bg-[#F4EFE6]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#211E19]">
              Мои бронирования
            </h2>
            <p className="text-xs text-[#5C5446] mt-0.5">
              Управляйте вашими столиками и смотрите историю визитов
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF5EB] border border-[#D8CFBE] text-[#5C5446] hover:text-[#211E19] hover:border-[#A64F2C] hover:bg-[#A64F2C] hover:text-white transition-all cursor-pointer flex items-center justify-center"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 bg-[#FAF5EB] border-b border-[#D8CFBE] flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'upcoming', label: 'Предстоящие' },
            { id: 'pending', label: 'Запросы' },
            { id: 'past', label: 'Завершённые' },
            { id: 'cancelled', label: 'Отменённые' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            const count = reservations.filter((r) => {
              if (tab.id === 'cancelled') return r.status === 'cancelled' || r.status === 'rejected';
              if (tab.id === 'pending') return r.status === 'pending';
              if (tab.id === 'upcoming') return (r.status === 'confirmed' || r.status === 'pending') && r.date >= todayStr;
              return r.date < todayStr && r.status !== 'cancelled' && r.status !== 'rejected';
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-3.5 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'border-[#707437] text-[#707437]'
                    : 'border-transparent text-[#5C5446] hover:text-[#211E19]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono ${
                  isSelected ? 'bg-[#EFEAD8] text-[#4F5328]' : 'bg-[#EAE5D9] text-[#5C5446]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of Bookings */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 no-scrollbar bg-[#F4EFE6]/50">
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-12 h-12 text-[#C8C0A8] mx-auto" />
              <p className="text-sm font-semibold text-[#211E19]">У вас нет бронирований в этом разделе</p>
              <p className="text-xs text-[#5C5446] max-w-sm mx-auto">
                Вы можете забронировать столик на любой удобный день прямо из карточки ресторана.
              </p>
            </div>
          ) : (
            filteredReservations.map((res) => (
              <div
                key={res.id}
                className="bg-[#FFFDF7] rounded-2xl p-4 sm:p-5 border border-[#D8CFBE] shadow-2xs hover:shadow-md transition-all space-y-3"
              >
                {/* Top Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {res.restaurantPhoto && (
                      <img
                        src={res.restaurantPhoto}
                        alt={res.venueNameSnapshot || res.restaurantName}
                        className="w-12 h-12 rounded-xl object-cover border border-[#D8CFBE]"
                      />
                    )}
                    <div>
                      <h3
                        onClick={() => {
                          if (onSelectRestaurant) {
                            onSelectRestaurant(res.venueId || res.restaurantId);
                            onClose();
                          }
                        }}
                        className="font-bold text-[#211E19] hover:text-[#707437] transition-colors cursor-pointer flex items-center gap-1.5 text-sm sm:text-base"
                      >
                        {res.venueNameSnapshot || res.restaurantName}
                        <ExternalLink className="w-3.5 h-3.5 text-[#7C725F]" />
                      </h3>
                      <p className="text-xs text-[#5C5446] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#707437]" />
                        {res.venueAddressSnapshot || res.restaurantAddress}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {res.status === 'confirmed' && (
                      <span className="px-2.5 py-1 bg-[#EFEAD8] text-[#4F5328] text-[10px] font-bold rounded-full flex items-center gap-1 border border-[#C8C0A8]">
                        <CheckCircle2 className="w-3 h-3 text-[#707437]" />
                        Подтверждено
                      </span>
                    )}
                    {res.status === 'pending' && (
                      <span className="px-2.5 py-1 bg-[#FDF6E2] text-[#8C6D1F] text-[10px] font-bold rounded-full flex items-center gap-1 border border-[#E8DAB2]">
                        <Clock3 className="w-3 h-3 text-[#8C6D1F]" />
                        Ожидает ответа
                      </span>
                    )}
                    {(res.status === 'cancelled' || res.status === 'rejected') && (
                      <span className="px-2.5 py-1 bg-[#FFF2F0] text-[#A64F2C] text-[10px] font-bold rounded-full flex items-center gap-1 border border-[#A64F2C]/30">
                        <AlertTriangle className="w-3 h-3 text-[#A64F2C]" />
                        Отменено
                      </span>
                    )}
                  </div>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#FAF5EB] rounded-xl text-xs border border-[#E2D9C8]">
                  <div>
                    <span className="text-[10px] text-[#7C725F] block">Дата</span>
                    <strong className="text-[#211E19] font-bold">{formatDateRu(res.date)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7C725F] block">Время</span>
                    <strong className="text-[#211E19] font-bold">{res.time}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7C725F] block">Гости</span>
                    <strong className="text-[#211E19] font-bold">{res.partySize} чел.</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7C725F] block">Код брони</span>
                    <strong className="text-[#A64F2C] font-mono font-bold">{res.confirmationCode || res.reservationNumber}</strong>
                  </div>
                </div>

                {/* Seating & Guest Details */}
                <div className="text-xs text-[#5C5446] space-y-1">
                  {(res.tableLabel || (res.seatingPreference && res.seatingPreference.length > 0)) && (
                    <p>
                      <span className="text-[#7C725F]">Посадка:</span> <strong>{res.tableLabel || res.seatingPreference?.join(', ')}</strong>
                    </p>
                  )}
                  <p>
                    <span className="text-[#7C725F]">Гость:</span> <strong>{res.guestName || res.customerName}</strong> ({res.guestPhone || res.customerPhone})
                  </p>
                  {res.comment && (
                    <p className="italic text-[#5C5446] bg-[#EFEAD8]/60 p-2 rounded-lg border border-[#C8C0A8]/50">
                      «{res.comment}»
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                {res.status !== 'cancelled' && res.status !== 'rejected' && activeTab === 'upcoming' && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2D9C8]">
                    <button
                      onClick={() => downloadCalendarICS(res)}
                      className="text-xs font-bold text-[#707437] hover:text-[#565A27] flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      В календарь (.ics)
                    </button>

                    <button
                      onClick={() => setCancelPromptId(res.id)}
                      className="text-xs font-bold text-[#A64F2C] hover:text-[#8C3E20] flex items-center gap-1 cursor-pointer py-1 px-2.5 hover:bg-[#FFF2F0] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Отменить бронь
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Cancellation Prompt Modal */}
        {cancelPromptId && (
          <div className="absolute inset-0 z-[4020] bg-[#211E19]/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF5EB] p-5 rounded-2xl border border-[#D8CFBE] max-w-sm w-full text-center space-y-4 shadow-2xl">
              <h3 className="font-bold text-sm text-[#211E19]">Отменить бронирование?</h3>
              <p className="text-xs text-[#5C5446]">
                Ваш стол будет высвобожден и станет доступен другим гостям.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCancelPromptId(null)}
                  className="flex-1 py-2.5 bg-[#FAF5EB] border border-[#D8CFBE] text-[#211E19] text-xs font-bold rounded-xl hover:bg-[#EFEAD8]"
                >
                  Оставить бронь
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => handleConfirmCancel(cancelPromptId)}
                  className="flex-1 py-2.5 bg-[#A64F2C] text-white text-xs font-bold rounded-xl hover:bg-[#8C3E20]"
                >
                  {isCancelling ? 'Отменяем...' : 'Да, отменить'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
