import 'dotenv/config';

import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';
import Anthropic from '@anthropic-ai/sdk';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { connectDatabase } from './config/database';
import { closeAssignmentGenerationQueue, getAssignmentGenerationQueue } from './config/bullmq';
import { closeRedisClient, getRedisClient } from './config/redis';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const serverId = uuidv4();

app.use(
  cors({
    origin: clientUrl,
    credentials: true
  })
);
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST']
  }
});

if (anthropicApiKey) {
  new Anthropic({ apiKey: anthropicApiKey });
}

app.get('/api/health', (_request: Request, response: Response) => {
  response.json({
    status: 'ok',
    message: `Backend is live (${serverId})`
  });
});

app.post('/api/contact', (request: Request, response: Response) => {
  const { name, email, message } = request.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name || !email || !message) {
    response.status(400).json({ message: 'name, email, and message are required.' });
    return;
  }

  io.emit('server:ready', {
    message: `Received a message from ${name} <${email}>.`
  });

  response.status(201).json({
    message: 'Message received successfully.'
  });
});

io.on('connection', (socket) => {
  socket.emit('server:ready', {
    message: `Connected to vedaai backend ${serverId}`
  });
});

const shutdown = async () => {
  await io.close();
  await closeAssignmentGenerationQueue();
  await closeRedisClient();
  const mongoose = await import('mongoose');
  await mongoose.default.disconnect();
  server.close(() => {
    process.exit(0);
  });
};

const start = async () => {
  try {
    await connectDatabase();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('MongoDB connection error:', message);
  }

  if (process.env.REDIS_URL) {
    getRedisClient();
    getAssignmentGenerationQueue();
  }

  server.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
};

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});

void start();