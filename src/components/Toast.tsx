import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-5 right-5 z-[5000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#FAF5EB] border-[#707437]/40 text-[#211E19]'
              : toast.type === 'error'
              ? 'bg-[#FFF8F6] border-[#A64F2C]/40 text-[#211E19]'
              : 'bg-[#FAF5EB] border-[#D8CFBE] text-[#211E19]'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#707437]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#A64F2C]" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#4F5328]" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#211E19] leading-tight">{toast.title}</h4>
            {toast.description && (
              <p className="text-[11px] text-[#5C5446] mt-0.5 leading-normal">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg text-[#7C725F] hover:text-[#211E19] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};
