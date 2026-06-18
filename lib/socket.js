import { io } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket = null;

export function getSocket(token, platform = 'web') {
  if (socket?.connected) return socket;

  socket = io(API_BASE_URL, {
    auth: { token, platform },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect_error', () => {});
  socket.on('disconnect', () => {});

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
