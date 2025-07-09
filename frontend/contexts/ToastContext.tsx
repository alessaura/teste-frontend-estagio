"use client";
import { createContext, useContext, useState, ReactNode } from 'react';
import { ToastType } from '@/components/Toast';

interface ToastState {
  isVisible: boolean;
  message: string;
  type: ToastType;
  autoClose: boolean;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, options?: ToastOptions) => void;
  hideToast: () => void;
  toast: ToastState;
}

interface ToastOptions {
  autoClose?: boolean;
  duration?: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    type: 'info',
    autoClose: true,
    duration: 5000
  });

  const showToast = (message: string, type: ToastType, options?: ToastOptions) => {
    setToast({
      isVisible: true,
      message,
      type,
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? 5000
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};