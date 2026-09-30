import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SocketContext from './socketContext';
import { API_BASE_URL } from '../config';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(API_BASE_URL || window.location.origin, {
      autoConnect: false,
    });

    socketRef.current = socket;
    listenersRef.current.forEach(({ eventName, handler }) => socket.on(eventName, handler));

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((eventName, data) => {
    socketRef.current?.emit(eventName, data);
  }, []);

  const receiveMessage = useCallback((eventName, handler) => {
    const socket = socketRef.current;
    const listener = { eventName, handler };
    listenersRef.current.add(listener);

    socket?.on(eventName, handler);

    return () => {
      listenersRef.current.delete(listener);
      socketRef.current?.off(eventName, handler);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, sendMessage, receiveMessage }}>
      {children}
    </SocketContext.Provider>
  );
}
