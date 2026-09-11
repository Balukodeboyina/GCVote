import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../lib/socket.js';
import { WS_EVENTS } from '@pulsevote/shared';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>(undefined);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const pingSentTimeRef = useRef<number | null>(null);

  const socket = getSocket();

  const sendPing = useCallback(() => {
    if (socket && socket.connected) {
      pingSentTimeRef.current = Date.now();
      socket.emit(WS_EVENTS.PING);
    }
  }, [socket]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setSocketId(socket.id);
      sendPing();
    }

    function onDisconnect() {
      setIsConnected(false);
      setSocketId(undefined);
      setLatencyMs(null);
    }

    function onPong() {
      if (pingSentTimeRef.current) {
        const roundTrip = Date.now() - pingSentTimeRef.current;
        setLatencyMs(roundTrip);
        pingSentTimeRef.current = null;
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(WS_EVENTS.PONG, onPong);

    if (socket.connected) {
      setIsConnected(true);
      setSocketId(socket.id);
      sendPing();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(WS_EVENTS.PONG, onPong);
    };
  }, [socket, sendPing]);

  return {
    socket,
    isConnected,
    socketId,
    latencyMs,
    sendPing,
  };
}
