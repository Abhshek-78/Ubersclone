import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SocketContext from './socketContext';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BASE_URL , {
      autoConnect: false,
    });

    socketRef.current = socket;

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

  const sendMessage = (eventName, data) => {
    socketRef.current?.emit(eventName, data);
  };

  const receiveMessage = (eventName, handler) => {
    const socket = socketRef.current;

    if (!socket) return () => {};

    socket.on(eventName, handler);
    return () => socket.off(eventName, handler);
  };

  return (
    <SocketContext.Provider value={{ isConnected, sendMessage, receiveMessage }}>
      {children}
    </SocketContext.Provider>
  );
}
