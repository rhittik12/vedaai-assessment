"use client";

import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { useAppStore } from '@/store/useAppStore';

type JobEventPayload = {
  assignmentId: string;
  error?: string;
};

let sharedSocket: Socket | null = null;

function getSocketUrl() {
  return process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';
}

function getSocketInstance() {
  if (sharedSocket) {
    return sharedSocket;
  }

  sharedSocket = io(getSocketUrl(), {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true
  });

  return sharedSocket;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socket = useMemo(() => getSocketInstance(), []);
  const setSocketConnected = useAppStore((state) => state.setSocketConnected);
  const updateJobStatus = useAppStore((state) => state.updateJobStatus);

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setConnected(false);
      setSocketConnected(false);
    };

    const handleProcessing = (payload: JobEventPayload) => {
      updateJobStatus(payload.assignmentId, 'processing');
    };

    const handleCompleted = (payload: JobEventPayload) => {
      updateJobStatus(payload.assignmentId, 'completed');
    };

    const handleFailed = (payload: JobEventPayload) => {
      updateJobStatus(payload.assignmentId, 'failed');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('job:processing', handleProcessing);
    socket.on('job:completed', handleCompleted);
    socket.on('job:failed', handleFailed);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('job:processing', handleProcessing);
      socket.off('job:completed', handleCompleted);
      socket.off('job:failed', handleFailed);
    };
  }, [setSocketConnected, socket, updateJobStatus]);

  return { socket, connected };
}
