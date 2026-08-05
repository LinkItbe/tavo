import React, { useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Users, 
  Utensils, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { PartnerBooking, PartnerRestaurantConfig, BookingStatus } from './types';

interface BookingDetailDrawerProps {
  booking: PartnerBooking | null;
  restaurant: PartnerRestaurantConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onRequestActionConfirm: (
    bookingId: string, 
    action: 'declined' | 'cancelled' | 'no_show', 
    title: string, 
    description: string
  ) => void;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Ожидает решения',
    bg: 'bg-[#FFF4B8]',
    text: 'text-[#8A5A00]',
    border: 'border-[#E6C35C]',
    icon: <AlertCircle className="w-4 h-4 text-[#8A5A00]" />,
  },
  confirmed: {
    label: 'Подтверждено',
    bg: 'bg-[#4F5328]/15',
    text: 'text-[#4F5328]',
    border: 'border-[#4F5328]/30',
    icon: <CheckCircle2 className="w-4 h-4 text-[#4F5328]" />,
  },
  seated: {
    label: 'Гости в ресторане',
    bg: 'bg-[#2563EB]/15',
    text: 'text-[#1D4ED8]',
    border: 'border-[#2563EB]/30',
    icon: <UserCheck className="w-4 h-4 text-[#1D4ED8]" />,
  },
  completed: {
    label: 'Завершено',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
  },
  declined: {
    label: 'Отклонено',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    icon: <XCircle className="w-4 h-4 text-rose-700" />,
  },
  cancelled: {
    label: 'Отменено',
    bg: 'bg-gray-200',
    text: 'text-gray-700',
    border: 'border-gray-300',
    icon: <XCircle className="w-4 h-4 text-gray-600" />,
  },
  no_show: {
    label: 'Не пришли',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    icon: <UserX className="w-4 h-4 text-amber-800" />,
  },
};

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  booking,
  restaurant,
  isOpen,
  onClose,
  onUpdateStatus,
  onRequestActionConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

  return (
    <div
      className="fixed inset-0 z-[2500] bg-black/60 backdrop-blur-xs animate-fade-in flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-drawer-title"
    >
      <div
        className="relative w-full max-w-lg h-full bg-[#FFFDF7] border-l border-[#BFB3A2] shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#BFB3A2]/60 flex items-center justify-between bg-[#F2EBDD]/60 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <span className="text-xs font-bold text-[#707437] uppercase tracking-wider block">
              Детали бронирования
            </span>
            <h2 id="booking-drawer-title" className="text-2xl font-extrabold text-[#211E19]">
              {booking.customerName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#6B645A] hover:bg-[#F2EBDD] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Status Badge */}
          <div className="p-4 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-[#6B645A] uppercase tracking-wider block mb-1">
                Текущий статус
              </span>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
              >
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-[#6B645A] uppercase tracking-wider block mb-1">
                Режим
              </span>
              <span className="text-xs font-semibold text-[#211E19]">
                {restaurant.bookingMode === 'instant' ? 'Мгновенное подтверждение' : 'Подтверждение вручную'}
              </span>
            </div>
          </div>

          {/* Time & Party Size & Table */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#FFF4B8]/40 border border-[#BFB3A2]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#707437]">
                <Clock className="w-4 h-4" />
                <span>Время и дата</span>
              </div>
              <p className="text-2xl font-black text-[#211E19]">
                {booking.visitTime}
              </p>
              <p className="text-xs text-[#6B645A]">
                {booking.visitDate}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF4B8]/40 border border-[#BFB3A2]/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#707437]">
                <Users className="w-4 h-4" />
                <span>Гости и стол</span>
              </div>
              <p className="text-2xl font-black text-[#211E19]">
                {booking.partySize} {booking.partySize === 1 ? 'гость' : booking.partySize < 5 ? 'гостя' : 'гостей'}
              </p>
              <p className="text-xs text-[#6B645A] truncate">
                {booking.tableName}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] space-y-3">
            <h3 className="text-xs font-bold text-[#211E19] uppercase tracking-wider">
              Контакты гостя
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-[#BFB3A2]/40">
                <span className="text-xs text-[#6B645A] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#707437]" />
                  Имя:
                </span>
                <span className="font-bold text-[#211E19]">{booking.customerName}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[#BFB3A2]/40">
                <span className="text-xs text-[#6B645A] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#707437]" />
                  Телефон:
                </span>
                <a
                  href={`tel:${booking.customerPhone}`}
                  className="font-bold text-[#4F5328] hover:underline cursor-pointer"
                >
                  {booking.customerPhone}
                </a>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-[#6B645A] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#707437]" />
                  Email:
                </span>
                <a
                  href={`mailto:${booking.customerEmail}`}
                  className="font-medium text-[#4F5328] hover:underline cursor-pointer text-xs truncate max-w-[200px]"
                >
                  {booking.customerEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          <div className="p-4 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] space-y-1.5">
            <h3 className="text-xs font-bold text-[#211E19] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#707437]" />
              Пожелание гостя
            </h3>
            <p className="text-sm text-[#211E19] italic bg-[#FFFDF7] p-3 rounded-xl border border-[#BFB3A2]/40">
              «{booking.customerNote || 'Без особых пожеланий'}»
            </p>
          </div>

          {/* Creation Tag */}
          <div className="text-xs text-[#6B645A] flex items-center justify-between px-1">
            <span>Источник:</span>
            <span className="font-semibold text-[#211E19]">
              {booking.createdAt || 'Демо-бронь'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#BFB3A2]/60 bg-[#F2EBDD]/80 sticky bottom-0 z-10 backdrop-blur-md space-y-3">
          {booking.status === 'pending' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(booking.id, 'confirmed');
                  onClose();
                }}
                className="py-3 px-4 rounded-full bg-[#4F5328] hover:bg-[#3D401F] text-[#FFF4B8] text-xs font-bold shadow-md transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Подтвердить</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onRequestActionConfirm(
                    booking.id,
                    'declined',
                    'Отклонить бронирование?',
                    `Вы уверены, что хотите отклонить бронь гостя ${booking.customerName}?`
                  );
                }}
                className="py-3 px-4 rounded-full bg-[#A64F2C] hover:bg-[#8A3F22] text-white text-xs font-bold shadow-md transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Отклонить</span>
              </button>
            </div>
          )}

          {booking.status === 'confirmed' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(booking.id, 'seated');
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-full bg-[#4F5328] hover:bg-[#3D401F] text-[#FFF4B8] text-xs font-bold shadow-md transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Гости пришли (посадить)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onRequestActionConfirm(
                      booking.id,
                      'cancelled',
                      'Отменить бронирование?',
                      `Вы уверены, что хотите отменить бронь для ${booking.customerName}?`
                    );
                  }}
                  className="py-2.5 px-3 rounded-full border border-[#A64F2C] text-[#A64F2C] hover:bg-[#A64F2C]/10 text-xs font-bold transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Отменить бронь</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRequestActionConfirm(
                      booking.id,
                      'no_show',
                      'Отметить как "Не пришли"?',
                      `Отметить, что ${booking.customerName} не явился(-лась) в ресторан?`
                    );
                  }}
                  className="py-2.5 px-3 rounded-full border border-[#D97706] text-[#D97706] hover:bg-[#D97706]/10 text-xs font-bold transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Не пришли</span>
                </button>
              </div>
            </div>
          )}

          {booking.status === 'seated' && (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(booking.id, 'completed');
                onClose();
              }}
              className="w-full py-3 px-4 rounded-full bg-[#707437] hover:bg-[#585C2B] text-white text-xs font-bold shadow-md transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Завершить посещение</span>
            </button>
          )}

          {['completed', 'declined', 'cancelled', 'no_show'].includes(booking.status) && (
            <div className="p-3 rounded-xl bg-[#F2EBDD] text-center text-xs text-[#6B645A] font-semibold border border-[#BFB3A2]">
              Бронирование находится в архивном статусе ({statusInfo.label}). Действия недоступны.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
