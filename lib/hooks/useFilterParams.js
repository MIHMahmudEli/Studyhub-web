'use client';

import { useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function useFilterParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const debounceRef = useRef(null);

  const getParam = useCallback((key, defaultValue = '') => {
    return searchParams.get(key) || defaultValue;
  }, [searchParams]);

  const setParam = useCallback((key, value, { debounce = 0 } = {}) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const update = () => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`?${params.toString()}`, { scroll: false });
    };
    if (debounce > 0) {
      debounceRef.current = setTimeout(update, debounce);
    } else {
      update();
    }
  }, [searchParams, router]);

  return { getParam, setParam };
}
