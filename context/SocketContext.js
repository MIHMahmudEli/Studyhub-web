'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { getAccessToken } from '@/lib/api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user, tokenReady } = useAuth();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!tokenReady || !user) {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [user, tokenReady, getAccessToken]);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ connected, socket: socketRef.current, on, off, notifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
