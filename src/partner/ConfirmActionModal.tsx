import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  onClose,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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

  const btnBg =
    confirmVariant === 'danger'
      ? 'bg-[#A64F2C] hover:bg-[#8A3F22] text-white'
      : confirmVariant === 'warning'
      ? 'bg-[#D97706] hover:bg-[#B45309] text-white'
      : 'bg-[#4F5328] hover:bg-[#3D401F] text-[#FFF4B8]';

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-[#FFFDF7] border border-[#BFB3A2] rounded-3xl p-6 shadow-2xl space-y-5"
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

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#A64F2C]/10 border border-[#A64F2C]/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-[#A64F2C]" />
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-lg font-bold text-[#211E19]">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-[#4A453E] leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-[#BFB3A2] text-[#211E19] text-xs font-semibold hover:bg-[#F2EBDD] transition-all cursor-pointer min-h-[44px]"
          >
            Отмена
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer min-h-[44px] ${btnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
