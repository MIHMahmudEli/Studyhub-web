'use client';

import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    isClosing: false,
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type, isClosing: false });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isClosing: true }));
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success', isClosing: false });
      }, 300);
    }, 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isClosing: true }));
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success', isClosing: false });
    }, 300);
  }, []);

  return { toast, showToast, closeToast };
}
