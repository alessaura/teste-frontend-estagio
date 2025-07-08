"use client";
import { useToast } from '@/contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toast, hideToast } = useToast();
  
  return (
    <Toast
      type={toast.type}
      message={toast.message}
      isVisible={toast.isVisible}
      onClose={hideToast}
      autoClose={toast.autoClose}
      duration={toast.duration}
    />
  );
};

export default ToastContainer;