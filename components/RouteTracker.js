'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const prev = sessionStorage.getItem('_current_route');
    if (prev && prev !== pathname) {
      sessionStorage.setItem('_prev_route', prev);
    }
    sessionStorage.setItem('_current_route', pathname);
  }, [pathname]);

  return null;
}
