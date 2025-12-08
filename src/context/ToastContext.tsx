import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../components/ui/Toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
