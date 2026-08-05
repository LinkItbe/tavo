import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Calendar, MapPin, DollarSign, Check, AlertCircle } from 'lucide-react';
import { Promotion, PromotionType, Restaurant } from '../types';
import { getAllNormalizedVenues } from '../utils/data';
import { getStoredPromotions, saveSinglePromotion, deletePromotion, resetPromotionsToDefault } from '../utils/promotionStore';

interface AdminPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromotionsUpdated: () => void;
  editingPromotion?: Promotion | null;
}

export const AdminPromotionModal: React.FC<AdminPromotionModalProps> = ({
  isOpen,
  onClose,
  onPromotionsUpdated,
  editingPromotion,
}) => {
  const venues: Restaurant[] = getAllNormalizedVenues();

  const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);

  // Form State
  const [venueId, setVenueId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<PromotionType>('special_menu');
  const [description, setDescription] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [cuisinesInput, setCuisinesInput] = useState<string>('');
  const [dishesInput, setDishesInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [price, setPrice] = useState<string>('35');
  const [reservable, setReservable] = useState<boolean>(true);
  const [active, setActive] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const reloadPromotions = () => {
    const list = getStoredPromotions();
    setPromotionsList(list);
  };

  useEffect(() => {
    if (isOpen) {
      reloadPromotions();
      if (editingPromotion) {
        populateForm(editingPromotion);
      } else {
        resetForm(venues[0]?.id || '');
      }
    }
  }, [isOpen, editingPromotion]);

  const resetForm = (defaultVenueId: string) => {
    setSelectedPromoId(null);
    setVenueId(defaultVenueId || (venues[0]?.id || ''));
    setTitle('');
    setType('special_menu');
    setDescription('');
    setShortDescription('');
    setImage('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80');
    setTagsInput('Спецсет, Шеф-меню');
    setCuisinesInput('Европейская, Авторская');
    setDishesInput('Авторский сет, Десерт');
    setStartDate('2026-08-01');
    setEndDate('2026-09-30');
    setPrice('35');
    setReservable(true);
    setActive(true);
    setSortOrder(0);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const populateForm = (promo: Promotion) => {
    setSelectedPromoId(promo.id);
    setVenueId(promo.venueId || (venues[0]?.id || ''));
    setTitle(promo.title || '');
    setType(promo.type || 'festival');
    setDescription(promo.description || '');
    setShortDescription(promo.shortDescription || '');
    setImage(promo.image || '');
    setTagsInput((promo.tags || []).join(', '));
    setCuisinesInput((promo.cuisines || []).join(', '));
    setDishesInput((promo.dishes || []).join(', '));
    setStartDate(promo.startDate || '2026-08-01');
    setEndDate(promo.endDate || '2026-09-30');
    setPrice(typeof promo.price === 'number' ? String(promo.price) : '');
    setReservable(promo.reservable ?? true);
    setActive(promo.active ?? true);
    setSortOrder(promo.sortOrder || 0);
    setErrorMsg('');
    setSuccessMsg('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!venueId) {
      setErrorMsg('Пожалуйста, выберите заведение из списка');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Укажите название акции');
      return;
    }

    const priceNum = price !== '' && !isNaN(Number(price)) ? Number(price) : undefined;
    const tags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);
    const cuisines = cuisinesInput.split(',').map(s => s.trim()).filter(Boolean);
    const dishes = dishesInput.split(',').map(s => s.trim()).filter(Boolean);

    try {
      saveSinglePromotion({
        id: selectedPromoId || undefined,
        venueId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'promo',
        type,
        description,
        shortDescription: shortDescription || description,
        image,
        tags,
        cuisines,
        dishes,
        startDate,
        endDate,
        price: priceNum,
        reservable,
        active,
        sortOrder: Number(sortOrder) || 0,
        badge: tags[0] || 'Акция',
        highlight: priceNum ? `Сет ${priceNum} BYN` : 'Спецпредложение',
      });

      setSuccessMsg('Акция успешно сохранена!');
      reloadPromotions();
      onPromotionsUpdated();

      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ошибка при сохранении акции');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту акцию?')) {
      deletePromotion(id);
      reloadPromotions();
      onPromotionsUpdated();
      if (selectedPromoId === id) {
        resetForm(venues[0]?.id || '');
      }
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Восстановить список акций по умолчанию?')) {
      resetPromotionsToDefault();
      reloadPromotions();
      onPromotionsUpdated();
      resetForm(venues[0]?.id || '');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-['Geologica']">
      <div className="relative w-full max-w-5xl bg-[#F8F2E7] rounded-3xl shadow-2xl overflow-hidden border border-[#BFB3A2] my-auto flex flex-col max-h-[92vh] text-[#211E19]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#211E19] text-white flex items-center justify-between border-b border-[#3D372F]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#A64F2C] rounded-2xl text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-normal font-['Tenor_Sans',serif] tracking-wide text-white">
                Управление акциями и фестивалями
              </h2>
              <p className="text-xs text-[#BFB3A2] mt-0.5">
                Панель администратора Tavoo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 no-scrollbar">
          
          {/* Left Column: List of Promotions */}
          <div className="lg:col-span-4 bg-[#F2EBDD] p-4 rounded-2xl border border-[#BFB3A2] space-y-3 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#BFB3A2]">
              <span className="text-xs font-bold text-[#211E19] uppercase tracking-wider">
                Все акции ({promotionsList.length})
              </span>
              <button
                type="button"
                onClick={() => resetForm(venues[0]?.id || '')}
                className="px-2.5 py-1 bg-[#707437] text-white rounded-lg text-xs font-semibold hover:bg-[#585c2b] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1 no-scrollbar">
              {promotionsList.map(p => {
                const isSelected = selectedPromoId === p.id;
                const venueName = venues.find(v => v.id === p.venueId)?.name || 'Заведение не найдено';
                return (
                  <div
                    key={p.id}
                    onClick={() => populateForm(p)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#FFF4B8] border-[#707437] shadow-xs'
                        : 'bg-[#F8F2E7] border-[#BFB3A2] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#211E19] line-clamp-1">
                        {p.title}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p.id);
                        }}
                        className="text-[#A64F2C] hover:text-red-700 p-1"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#707437] font-semibold mt-0.5 line-clamp-1">
                      {venueName}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#BFB3A2]/50 text-[10px] text-[#6B645A]">
                      <span>{p.startDate} — {p.endDate}</span>
                      {p.price && <span className="font-bold text-[#A64F2C]">{p.price} BYN</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full py-2 bg-[#E2D8C6] hover:bg-[#D5C8B2] text-[#211E19] text-xs font-semibold rounded-xl border border-[#BFB3A2] transition-colors cursor-pointer mt-auto"
            >
              Сбросить к демо-данным
            </button>
          </div>

          {/* Right Column: Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-[#F8F2E7] space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Mandatory Venue Selector */}
              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Связанное заведение <span className="text-[#A64F2C]">*</span>
                </label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#707437]"
                  required
                >
                  <option value="" disabled>-- Выберите заведение из каталога --</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type || v.primaryType}, {v.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Promotion Type */}
              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Тип акции <span className="text-[#A64F2C]">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PromotionType)}
                  className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-semibold text-[#211E19] focus:outline-none focus:border-[#707437]"
                >
                  <option value="special_menu">Специальное меню</option>
                  <option value="festival">Спецпредложение</option>
                  <option value="discount">Скидка</option>
                  <option value="brunch">Завтраки и бранчи</option>
                  <option value="tasting">Дегустации</option>
                  <option value="seasonal">Сезонные предложения</option>
                  <option value="event">События</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#211E19] mb-1">
                Название акции <span className="text-[#A64F2C]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="например, Авторский сет от шеф-повара"
                className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                required
              />
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Короткое описание
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Для карточки в каталоге"
                  className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Изображение (URL)
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#211E19] mb-1">
                Полное описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Подробные условия предложения, блюда сета..."
                className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
              />
            </div>

            {/* Tags, Cuisines, Dishes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Спешелти, Утренний сет"
                  className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Кухни (через запятую)
                </label>
                <input
                  type="text"
                  value={cuisinesInput}
                  onChange={(e) => setCuisinesInput(e.target.value)}
                  placeholder="Итальянская, Европейская"
                  className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Блюда (через запятую)
                </label>
                <input
                  type="text"
                  value={dishesInput}
                  onChange={(e) => setDishesInput(e.target.value)}
                  placeholder="Бургер, Рибай, Паста"
                  className="w-full px-3 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>
            </div>

            {/* Dates, Price, SortOrder */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Дата начала
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Дата окончания
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Цена (BYN)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="напр. 45"
                  className="w-full px-2.5 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#211E19] mb-1">
                  Сортировка
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-white border border-[#BFB3A2] rounded-xl text-xs font-medium text-[#211E19] focus:outline-none focus:border-[#707437]"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-[#211E19] cursor-pointer">
                <input
                  type="checkbox"
                  checked={reservable}
                  onChange={(e) => setReservable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#707437] focus:ring-[#707437]"
                />
                <span>Доступно бронирование столов</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-[#211E19] cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#707437] focus:ring-[#707437]"
                />
                <span>Опубликовано (Active)</span>
              </label>
            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-[#BFB3A2] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#E2D8C6] hover:bg-[#D5C8B2] text-[#211E19] rounded-full text-xs font-bold transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#A64F2C] hover:bg-[#854023] text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FFF4B8]" />
                <span>{selectedPromoId ? 'Сохранить изменения' : 'Опубликовать акцию'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
