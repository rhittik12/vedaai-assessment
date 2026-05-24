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
      <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-200">
            vedaai assessment
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              A clean monorepo starter for product work.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Next.js, Zustand, Socket.IO, and a typed form flow sit on top of a backend that is ready for
              MongoDB, Redis, BullMQ, and AI integrations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            <button
              type="button"
              onClick={checkHealth}
              className="rounded-full bg-sky-400 px-5 py-2.5 font-medium text-slate-950 transition hover:bg-sky-300"
            >
              Check backend health
            </button>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Socket: {socketStatus}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Store: {socketConnected ? 'connected' : 'offline'}
            </span>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-ink-900/70 p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-200/80">Backend status</p>
            <p className="mt-2 text-2xl font-semibold text-white">{health.status}</p>
            <p className="mt-1 text-sm text-slate-300">{health.message}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-200/80">Latest socket message</p>
            <p className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              {lastMessage}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-200/80">Frontend stack</p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
            <li>Type-safe form validation with react-hook-form, zod, and @hookform/resolvers.</li>
            <li>HTTP requests with axios against the backend API.</li>
            <li>Live socket connection status stored in Zustand.</li>
            <li>Tailwind utility styling with a clean dark interface.</li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-[2rem] border border-white/10 bg-white/5 p-8"
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Name</label>
              <input
                {...register('name')}
                className="w-full rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60"
                placeholder="Ada Lovelace"
              />
              {errors.name ? <p className="mt-2 text-sm text-rose-300">{errors.name.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                {...register('email')}
                className="w-full rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60"
                placeholder="ada@vedaai.dev"
              />
              {errors.email ? <p className="mt-2 text-sm text-rose-300">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Message</label>
              <textarea
                {...register('message')}
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60"
                placeholder="Describe the kind of experience you want to build."
              />
              {errors.message ? <p className="mt-2 text-sm text-rose-300">{errors.message.message}</p> : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || submitState === 'submitting'}
              className="rounded-full bg-white px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState === 'done' ? 'Sent' : isSubmitting ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}