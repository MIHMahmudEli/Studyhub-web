'use client';

import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';

export function usePointsSync(onPointsUpdated) {
  const { on } = useSocket();

  useEffect(() => {
    if (!on) return;
    const unsub = on('points:updated', (data) => {
      if (onPointsUpdated && data?.points !== undefined) {
        onPointsUpdated(data.points);
      }
    });
    return unsub;
  }, [on, onPointsUpdated]);
}
