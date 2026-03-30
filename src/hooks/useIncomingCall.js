// src/hooks/useIncomingCall.js
// Mount at root level to intercept incoming calls globally and navigate
import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useIncomingCall = (navigationRef) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !navigationRef) return;

    const handler = (data) => {
      // data: { from, fromName, fromAvatar, callType, offer }
      navigationRef.navigate('IncomingCall', {
        fromId:     data.from,
        fromName:   data.fromName,
        fromAvatar: data.fromAvatar,
        callType:   data.callType,
        offer:      data.offer,
      });
    };

    socket.on('call:incoming', handler);
    return () => socket.off('call:incoming', handler);
  }, [socket, navigationRef]);
};
