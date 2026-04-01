// src/context/SocketContext.js — Socket.IO connection, JWT-authenticated
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://bakaiti-backend.onrender.com';

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  // State (not ref) so that consumers re-render when socket becomes ready
  const [socket,    setSocket]    = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      // Logged out — tear down the connection
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      setConnected(false);
      return;
    }

    const s = io(SOCKET_URL, {
      auth:                { token },
      transports:          ['websocket'],
      reconnection:        true,
      reconnectionAttempts: 10,
      reconnectionDelay:   1500,
    });

    s.on('connect',       () => { setConnected(true);  console.log('[Socket] connected', s.id); });
    s.on('disconnect',    () => { setConnected(false); console.log('[Socket] disconnected'); });
    s.on('connect_error', (e) => console.warn('[Socket] error:', e.message));

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
