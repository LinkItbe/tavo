import React from 'react';
import { Restaurant } from '../types';
import { X, Heart, MapPin, User, Settings, Award, LogOut, ChevronRight, Star } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
  favorites: Restaurant[];
  currentCity: string;
  setCurrentCity: (city: string) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  onClose,
  favorites,
  currentCity,
  setCurrentCity,
  onSelectRestaurant
}) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#E9E9E9] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E9E9E9] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Профиль пользователя</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#FAFAFA] text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-[#E9E9E9]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              alt="Анастасия В."
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A]">Анастасия В.</h3>
              <p className="text-xs text-[#6E6E73]">Гастроисследователь • г. {currentCity}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#D96C4A]/10 text-[#D96C4A] text-[10px] font-bold rounded-full">
                Gourmet Club Member
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E9E9E9] text-center">
              <span className="text-2xl font-bold text-[#1A1A1A] block">{favorites.length}</span>
              <span className="text-[11px] text-[#6E6E73] font-medium">В избранном</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E9E9E9] text-center">
              <span className="text-2xl font-bold text-[#1A1A1A] block">12</span>
              <span className="text-[11px] text-[#6E6E73] font-medium">Посещенных мест</span>
            </div>
          </div>

          {/* Favorite Places Quick Access */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#D96C4A]" />
                Избранные заведения ({favorites.length})
              </h4>
            </div>

            {favorites.length === 0 ? (
              <div className="p-6 text-center bg-[#FAFAFA] rounded-2xl border border-[#E9E9E9] text-xs text-[#6E6E73]">
                Вы пока не добавили ни одного ресторана в избранное. Нажмите на сердечко на карточке заведения!
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((rest) => (
                  <div
                    key={rest.id}
                    onClick={() => {
                      onClose();
                      onSelectRestaurant(rest);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#FAFAFA] border border-[#E9E9E9] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={rest.photos[0]}
                        alt={rest.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1A1A1A] block truncate">{rest.name}</span>
                        <span className="text-[10px] text-[#6E6E73]">{rest.primaryCuisine} • {rest.averageCheck} BYN</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6E6E73]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-1 border-t border-[#E9E9E9] pt-4">
            <button className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#1A1A1A] hover:bg-[#FAFAFA] rounded-xl transition-colors">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6E6E73]" />
                Текущий город ({currentCity})
              </span>
              <ChevronRight className="w-4 h-4 text-[#6E6E73]" />
            </button>

            <button className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#1A1A1A] hover:bg-[#FAFAFA] rounded-xl transition-colors">
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#6E6E73]" />
                Мои фестивальные билеты
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">2 активных</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#1A1A1A] hover:bg-[#FAFAFA] rounded-xl transition-colors">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#6E6E73]" />
                Настройки профиля
              </span>
              <ChevronRight className="w-4 h-4 text-[#6E6E73]" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E9E9E9] bg-[#FAFAFA]">
          <button 
            onClick={() => alert('Выход из аккаунта')}
            className="w-full py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти из профиля</span>
          </button>
        </div>
      </div>
    </div>
  );
};
