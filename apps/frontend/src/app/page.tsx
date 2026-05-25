"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/store/useAppStore';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormValues = z.infer<typeof contactSchema>;

type HealthState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  message: string;
};

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';
  const [health, setHealth] = useState<HealthState>({ status: 'idle', message: 'Backend not checked yet.' });
  const [socketStatus, setSocketStatus] = useState('Connecting...');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'done'>('idle');
  const socketConnected = useAppStore((state) => state.socketConnected);
  const lastMessage = useAppStore((state) => state.lastMessage);
  const setSocketConnected = useAppStore((state) => state.setSocketConnected);
  const setLastMessage = useAppStore((state) => state.setLastMessage);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });

  useEffect(() => {
    let socket: Socket | undefined;

    const connectSocket = async () => {
      socket = io(wsUrl, {
        transports: ['websocket']
      });

      socket.on('connect', () => {
        setSocketConnected(true);
        setSocketStatus('Connected');
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
        setSocketStatus('Disconnected');
      });

      socket.on('server:ready', (payload: { message: string }) => {
        setLastMessage(payload.message);
      });
    };

    void connectSocket();

    return () => {
      socket?.disconnect();
    };
  }, [setLastMessage, setSocketConnected, wsUrl]);

  const checkHealth = async () => {
    setHealth({ status: 'loading', message: 'Checking backend health...' });

    try {
      const response = await axios.get<{ message: string }>(`${apiUrl}/api/health`);
      setHealth({ status: 'ready', message: response.data.message });
    } catch {
      setHealth({ status: 'error', message: 'Unable to reach the backend.' });
    }
  };

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitState('submitting');

    try {
      const response = await axios.post<{ message: string }>(`${apiUrl}/api/contact`, values);
      setLastMessage(response.data.message);
      setSubmitState('done');
      reset();
    } catch {
      setSubmitState('idle');
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10">
      <h1>hello world</h1>
    </main>
  );
}