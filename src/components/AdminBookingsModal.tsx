import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Shield, CheckCircle2, Clock3, AlertTriangle, Search, Filter, Phone, User, Trash2 } from 'lucide-react';
import { Reservation } from '../types';
import { getAllStoredReservations, updateReservationStatus } from '../utils/bookingUtils';
import { BRAND_NAME } from '../constants/brand';

interface AdminBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminBookingsModal: React.FC<AdminBookingsModalProps> = ({ isOpen, onClose }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  const reloadData = () => {
    setReservations(getAllStoredReservations());
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, newStatus: 'confirmed' | 'cancelled') => {
    updateReservationStatus(id, newStatus);
    reloadData();
  };

  const filtered = reservations.filter(res => {
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const matchesSearch =
      res.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.guestPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Панель управления бронированиями</h2>
              <p className="text-xs text-slate-300">
                Мониторинг броней ресторанов {BRAND_NAME}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по имени, ресторану, коду..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Статус:
            </span>
            {[
              { id: 'all', label: 'Все' },
              { id: 'pending', label: 'Запросы' },
              { id: 'confirmed', label: 'Подтвержденные' },
              { id: 'cancelled', label: 'Отмененные' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/50 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Бронирования не найдены
            </div>
          ) : (
            filtered.map(res => (
              <div
                key={res.id}
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      #{res.reservationNumber}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{res.restaurantName}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      res.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : res.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {res.status === 'confirmed' ? 'Подтверждено' : res.status === 'pending' ? 'Ожидает' : 'Отменено'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-3">
                    <span>📅 <strong>{res.date}</strong> в <strong>{res.time}</strong></span>
                    <span>👥 <strong>{res.partySize}</strong> гостей</span>
                  </p>

                  <p className="text-xs text-slate-500">
                    👤 <strong>{res.customerName}</strong> ({res.customerPhone}) {res.customerEmail ? `• ${res.customerEmail}` : ''}
                  </p>
                  {res.comment && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      «{res.comment}»
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {res.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'confirmed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Подтвердить
                    </button>
                  )}
                  {res.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(res.id, 'cancelled')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Отклонить
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
