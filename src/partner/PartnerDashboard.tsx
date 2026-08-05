import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { firestoreDb, firebaseAuth } from '../lib/firebaseClient';
import { PARTNER_RESTAURANTS, getPartnerBookingsStore, getTodayDateString, getTomorrowDateString } from './mockData';
import { PartnerBooking, PartnerRestaurantConfig, BookingStatus } from './types';
import { BookingDetailDrawer } from './BookingDetailDrawer';
import { NewBookingModal } from './NewBookingModal';
import { ConfirmActionModal } from './ConfirmActionModal';
import { PartnerMemberData } from './PartnerAuthGuard';
import { 
  Utensils, 
  Plus, 
  LogOut, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  XCircle, 
  UserX, 
  Phone, 
  Mail, 
  ChevronRight,
  Filter,
  Sparkles,
  Zap,
  Building2,
  RefreshCw,
  WifiOff,
  Database
} from 'lucide-react';

interface PartnerDashboardProps {
  member: PartnerMemberData;
  onNavigate: (path: string) => void;
}

type TabType = 'today' | 'upcoming' | 'history';
type StatusFilterType = 'all' | BookingStatus;

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Ожидает решения',
    bg: 'bg-[#FFF4B8]',
    text: 'text-[#8A5A00]',
    border: 'border-[#E6C35C]',
    icon: <AlertCircle className="w-3.5 h-3.5 text-[#8A5A00]" />,
  },
  confirmed: {
    label: 'Подтверждено',
    bg: 'bg-[#4F5328]/15',
    text: 'text-[#4F5328]',
    border: 'border-[#4F5328]/30',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#4F5328]" />,
  },
  seated: {
    label: 'Гости в ресторане',
    bg: 'bg-[#2563EB]/15',
    text: 'text-[#1D4ED8]',
    border: 'border-[#2563EB]/30',
    icon: <UserCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />,
  },
  completed: {
    label: 'Завершено',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
  },
  declined: {
    label: 'Отклонено',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-700" />,
  },
  cancelled: {
    label: 'Отменено',
    bg: 'bg-gray-200',
    text: 'text-gray-700',
    border: 'border-gray-300',
    icon: <XCircle className="w-3.5 h-3.5 text-gray-600" />,
  },
  no_show: {
    label: 'Не пришли',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    icon: <UserX className="w-3.5 h-3.5 text-amber-800" />,
  },
};

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ member, onNavigate }) => {
  const restaurantConfig = useMemo<PartnerRestaurantConfig | null>(() => {
    return PARTNER_RESTAURANTS[member.restaurantId] || null;
  }, [member.restaurantId]);

  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importingDemo, setImportingDemo] = useState<boolean>(false);

  const isInitialSnapshot = useRef<boolean>(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Realtime Firestore Subscription
  useEffect(() => {
    if (!member.restaurantId) return;

    setLoading(true);
    isInitialSnapshot.current = true;

    const q = query(
      collection(firestoreDb, 'bookings'),
      where('restaurantId', '==', member.restaurantId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PartnerBooking[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            bookingCode: data.bookingCode || '',
            restaurantId: data.restaurantId,
            restaurantName: data.restaurantName || '',
            customerName: data.customerName || '',
            customerPhone: data.customerPhone || '',
            customerEmail: data.customerEmail || '',
            visitDate: data.visitDate || '',
            visitTime: data.visitTime || '',
            partySize: Number(data.partySize) || 2,
            tableId: data.tableId || null,
            tableName: data.tableName || 'Стол назначит ресторан',
            status: data.status || 'pending',
            bookingMode: data.bookingMode || 'instant',
            customerNote: data.customerNote || '',
            restaurantNote: data.restaurantNote || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          };
        });

        // Sort by visit date/time ascending
        list.sort((a, b) => `${a.visitDate} ${a.visitTime}`.localeCompare(`${b.visitDate} ${b.visitTime}`));

        // Notify on new incoming bookings after initial load
        if (!isInitialSnapshot.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const b = change.doc.data();
              showToast(`🔔 Новое бронирование! ${b.customerName || 'Гость'} (${b.visitDate} ${b.visitTime})`);
            }
          });
        }
        isInitialSnapshot.current = false;

        setBookings(list);
        setLoading(false);
        setIsOffline(false);
      },
      (err) => {
        console.error('[Firestore Realtime Error]', err);
        setIsOffline(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [member.restaurantId]);

  // Tab & Status Filters
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

  // Modals & Drawers
  const [selectedBooking, setSelectedBooking] = useState<PartnerBooking | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState<boolean>(false);

  // Confirmation Modal
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    bookingId: string;
    targetStatus: 'declined' | 'cancelled' | 'no_show';
    title: string;
    description: string;
  }>({
    isOpen: false,
    bookingId: '',
    targetStatus: 'declined',
    title: '',
    description: '',
  });

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  // Filter Bookings by Tab
  const tabFilteredBookings = useMemo(() => {
    if (activeTab === 'today') {
      return bookings.filter((b) => b.visitDate === todayStr);
    }
    if (activeTab === 'upcoming') {
      return bookings.filter((b) => b.visitDate > todayStr);
    }
    // history tab includes past dates or completed/cancelled/declined/no_show
    return bookings.filter((b) => b.visitDate < todayStr || ['completed', 'cancelled', 'declined', 'no_show'].includes(b.status));
  }, [bookings, activeTab, todayStr]);

  // Filter Bookings by Status
  const finalFilteredBookings = useMemo(() => {
    if (statusFilter === 'all') return tabFilteredBookings;
    return tabFilteredBookings.filter((b) => b.status === statusFilter);
  }, [tabFilteredBookings, statusFilter]);

  // Status Counts
  const counts = useMemo(() => {
    const todayBookings = bookings.filter((b) => b.visitDate === todayStr);
    return {
      total: todayBookings.length,
      pending: todayBookings.filter((b) => b.status === 'pending').length,
      confirmed: todayBookings.filter((b) => b.status === 'confirmed').length,
      seated: todayBookings.filter((b) => b.status === 'seated').length,
      completed: todayBookings.filter((b) => b.status === 'completed').length,
      cancelled: todayBookings.filter((b) => ['cancelled', 'declined', 'no_show'].includes(b.status)).length,
    };
  }, [bookings, todayStr]);

  // Status Change API Call
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: BookingStatus, restaurantNote?: string, tableId?: string, tableName?: string) => {
    if (isOffline) {
      showToast('⚠️ Ошибка: отсутствует подключение к сети.');
      return;
    }

    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Не авторизован');

      const res = await fetch('/api/partner/bookings/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          bookingId,
          newStatus,
          restaurantNote,
          tableId,
          tableName,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        showToast('❌ Сервер вернул некорректный ответ');
        return;
      }

      const data = await res.json();
      if (res.ok && (data.success || data.ok)) {
        showToast(`Статус бронирования успешно обновлен.`);
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        showToast(`❌ Ошибка: ${data.message || data.error || 'Не удалось обновить статус'}`);
      }
    } catch (err: any) {
      console.error('[Update Status Error]', err);
      showToast('❌ Ошибка связи с сервером.');
    }
  };

  // Open Confirm Modal
  const handleRequestConfirmAction = (
    bookingId: string,
    action: 'declined' | 'cancelled' | 'no_show',
    title: string,
    description: string
  ) => {
    setConfirmModalData({
      isOpen: true,
      bookingId,
      targetStatus: action,
      title,
      description,
    });
  };

  // Create Manual Booking via API
  const handleCreateNewBooking = async (newB: PartnerBooking, msg: string) => {
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: member.restaurantId,
          customerName: newB.customerName,
          customerPhone: newB.customerPhone,
          customerEmail: newB.customerEmail,
          visitDate: newB.visitDate,
          visitTime: newB.visitTime,
          partySize: newB.partySize,
          tableId: newB.tableId,
          customerNote: newB.customerNote,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        showToast('❌ Сервер вернул некорректный ответ');
        return;
      }

      const data = await res.json();
      if (res.ok && (data.success || data.ok)) {
        showToast(msg);
        setIsNewBookingModalOpen(false);
      } else {
        showToast(`❌ Ошибка: ${data.message || data.error || 'Не удалось создать бронирование'}`);
      }
    } catch (err) {
      console.error('[Create Booking Error]', err);
      showToast('❌ Ошибка сети.');
    }
  };

  // Import Legacy Local Demo Bookings
  const handleImportDemoBookings = async () => {
    if (member.role !== 'owner') return;
    setImportingDemo(true);
    try {
      const idToken = await firebaseAuth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Не авторизован');

      const allDemoStore = getPartnerBookingsStore();
      const demoList = allDemoStore[member.restaurantId] || [];

      if (demoList.length === 0) {
        showToast('Локальные демо-бронирования не найдены.');
        setImportingDemo(false);
        return;
      }

      const res = await fetch('/api/partner/import-demo-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ bookings: demoList }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        showToast('❌ Сервер вернул некорректный ответ');
        setImportingDemo(false);
        return;
      }

      const data = await res.json();
      if (res.ok && (data.success || data.ok)) {
        showToast(`Импорт завершён: добавлено ${data.importedCount}, пропущено ${data.skippedCount}`);
      } else {
        showToast(`❌ Ошибка импорта: ${data.message || data.error || 'Ошибка сервера'}`);
      }
    } catch (err) {
      console.error('[Import Demo Error]', err);
      showToast('❌ Не удалось выполнить импорт.');
    } finally {
      setImportingDemo(false);
    }
  };

  const handleLogout = async () => {
    await signOut(firebaseAuth);
    onNavigate('/partner/login');
  };

  if (!restaurantConfig) {
    return (
      <div className="min-h-screen bg-[#D9D0C2] flex items-center justify-center p-6 text-[#211E19]">
        <div className="bg-[#FFFDF7] p-8 rounded-3xl border border-[#BFB3A2] text-center space-y-4">
          <p className="font-bold">Ресторан не найден</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-2xl bg-[#4F5328] text-[#FFF4B8] font-bold text-xs"
          >
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D9D0C2] text-[#211E19] font-['Geologica',sans-serif] flex flex-col justify-between">
      
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-[#A64F2C] text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Нет подключения к сети. Данные синхронизируются при появлении связи.</span>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2500] bg-[#211E19] text-[#FFF4B8] px-5 py-3 rounded-2xl shadow-2xl border border-[#BFB3A2]/40 flex items-center gap-3 animate-fade-in font-medium text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-[#FFF4B8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-[#FFFDF7] border-b-2 border-[#BFB3A2] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#4F5328] flex items-center justify-center text-[#FFF4B8] font-bold shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#211E19] leading-tight">
                  {restaurantConfig.name}
                </h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  restaurantConfig.bookingMode === 'instant' 
                    ? 'bg-[#4F5328] text-[#FFF4B8]' 
                    : 'bg-[#A64F2C] text-white'
                }`}>
                  {restaurantConfig.bookingModeLabel}
                </span>
              </div>
              <p className="text-xs text-[#6B645A] font-medium">
                {restaurantConfig.district} · {restaurantConfig.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {member.role === 'owner' && (
              <button
                type="button"
                onClick={handleImportDemoBookings}
                disabled={importingDemo || isOffline}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#F2EBDD] border border-[#BFB3A2] text-[#4F5328] hover:bg-[#FFF4B8] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                title="Импортировать демонстрационные локальные бронирования"
              >
                <Database className="w-3.5 h-3.5 text-[#4F5328]" />
                <span>{importingDemo ? 'Импорт...' : 'Импорт демо-броней'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsNewBookingModalOpen(true)}
              disabled={isOffline}
              className="py-2.5 px-4 rounded-2xl bg-[#4F5328] hover:bg-[#3D401F] text-[#FFF4B8] text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Новая бронь</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-3 rounded-2xl border border-[#BFB3A2] hover:bg-[#F2EBDD] text-[#6B645A] hover:text-[#211E19] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              title="Выйти из кабинета"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Выйти</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Today's Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#BFB3A2] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#6B645A] uppercase tracking-wider block">Всего на сегодня</span>
            <span className="text-2xl font-black text-[#211E19]">{counts.total}</span>
          </div>

          <div className="bg-[#FFF4B8] p-3.5 rounded-2xl border border-[#E6C35C] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#8A5A00] uppercase tracking-wider block">Ожидают решения</span>
            <span className="text-2xl font-black text-[#8A5A00]">{counts.pending}</span>
          </div>

          <div className="bg-[#F2EBDD] p-3.5 rounded-2xl border border-[#BFB3A2] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#4F5328] uppercase tracking-wider block">Подтверждено</span>
            <span className="text-2xl font-black text-[#4F5328]">{counts.confirmed}</span>
          </div>

          <div className="bg-[#EFF6FF] p-3.5 rounded-2xl border border-[#BFDBFE] shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider block">В ресторане</span>
            <span className="text-2xl font-black text-[#1D4ED8]">{counts.seated}</span>
          </div>

          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Завершено</span>
            <span className="text-2xl font-black text-emerald-800">{counts.completed}</span>
          </div>

          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Отменено/Отклонено</span>
            <span className="text-2xl font-black text-rose-800">{counts.cancelled}</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="bg-[#FFFDF7] rounded-3xl border border-[#BFB3A2] p-4 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#BFB3A2]/60 pb-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'today', label: `Сегодня (${todayStr})` },
                { id: 'upcoming', label: 'Предстоящие' },
                { id: 'history', label: 'Архив / История' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#4F5328] text-[#FFF4B8] shadow-xs'
                      : 'bg-[#F2EBDD] text-[#6B645A] hover:text-[#211E19] hover:bg-[#E8DFC8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#6B645A]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                className="bg-[#F2EBDD] border border-[#BFB3A2] text-xs font-bold text-[#211E19] rounded-2xl px-3 py-1.5 focus:outline-none focus:border-[#4F5328]"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает решения</option>
                <option value="confirmed">Подтверждено</option>
                <option value="seated">Гости в ресторане</option>
                <option value="completed">Завершено</option>
                <option value="declined">Отклонено</option>
                <option value="cancelled">Отменено</option>
                <option value="no_show">Не пришли</option>
              </select>
            </div>

          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#4F5328] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-[#6B645A]">Загрузка бронирований из Firestore...</p>
            </div>
          ) : finalFilteredBookings.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-bold text-[#6B645A]">Бронирования не найдены</p>
              <p className="text-xs text-[#9C9488]">Попробуйте изменить вкладку или сбросить фильтр статусов.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalFilteredBookings.map((b) => {
                const statusInfo = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBooking(b);
                      setIsDrawerOpen(true);
                    }}
                    className="bg-white border-2 border-[#BFB3A2]/70 hover:border-[#4F5328] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#A64F2C]">
                          {b.bookingCode}
                        </span>
                        <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          {statusInfo.icon}
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <h3 className="text-base font-bold text-[#211E19] group-hover:text-[#4F5328] transition-colors">
                          {b.customerName}
                        </h3>
                        <p className="text-xs text-[#6B645A] font-medium">
                          {b.customerPhone}
                        </p>
                      </div>

                      {/* Visit Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#F2EBDD]/60 p-2.5 rounded-xl border border-[#BFB3A2]/40">
                        <div className="flex items-center gap-1.5 text-[#4F5328] font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{b.visitDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#4F5328] font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{b.visitTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#6B645A]">
                          <Users className="w-3.5 h-3.5 text-[#A64F2C]" />
                          <span>{b.partySize} {b.partySize === 1 ? 'гость' : b.partySize < 5 ? 'гостя' : 'гостей'}</span>
                        </div>
                        <div className="truncate text-[#6B645A]" title={b.tableName}>
                          <span>{b.tableName || 'Стол не назначен'}</span>
                        </div>
                      </div>

                      {b.customerNote && (
                        <p className="text-[11px] text-[#6B645A] bg-[#FFF4B8]/50 p-2 rounded-lg italic line-clamp-2">
                          &ldquo;{b.customerNote}&rdquo;
                        </p>
                      )}

                    </div>

                    {/* Action Footer */}
                    <div className="pt-2 border-t border-[#BFB3A2]/40 flex items-center justify-between text-xs font-bold text-[#4F5328]">
                      <span>Детали и управление</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* Drawer & Modals */}
      <BookingDetailDrawer
        booking={selectedBooking}
        restaurant={restaurantConfig}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={(id, st) => handleUpdateBookingStatus(id, st)}
        onRequestActionConfirm={handleRequestConfirmAction}
      />

      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        restaurant={restaurantConfig}
        onCreateBooking={handleCreateNewBooking}
      />

      <ConfirmActionModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        description={confirmModalData.description}
        onClose={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={(note) => {
          handleUpdateBookingStatus(confirmModalData.bookingId, confirmModalData.targetStatus, note);
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
        }}
      />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-[#BFB3A2] text-center text-xs text-[#6B645A]">
        Tavoo Partner Realtime Dashboard &copy; 2026. Синхронизировано с Cloud Firestore.
      </footer>

    </div>
  );
};
