import React from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  let bgClass = 'bg-slate-800';
  let title = 'معلومة';

  if (type === 'success') {
    bgClass = 'bg-emerald-600';
    title = 'تم بنجاح';
  } else if (type === 'error') {
    bgClass = 'bg-red-600';
    title = 'خطأ';
  } else if (type === 'warning') {
    bgClass = 'bg-amber-500';
    title = 'تنبيه';
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4">
      <div
        className={`${bgClass} text-white rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3 min-w-[260px] max-w-sm`}
      >
        <div className="mt-0.5">
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs mt-1 leading-relaxed">{message}</div>
        </div>

        <button
          onClick={onClose}
          className="ml-auto text-white/70 hover:text-white text-xs px-2 py-1 rounded-full hover:bg-black/20 transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default Toast;
