import 'dotenv/config';

import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { Queue } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:3000';
const mongoUri = process.env.MONGODB_URI;
const redisUrl = process.env.REDIS_URL;
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

let redisClient: Redis | null = null;
let taskQueue: Queue | null = null;
let redisConnection: { host: string; port: number } | null = null;

if (mongoUri) {
  void mongoose.connect(mongoUri).catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });
}

if (redisUrl) {
  redisClient = new Redis(redisUrl);
  const parsedRedisUrl = new URL(redisUrl);
  redisConnection = {
    host: parsedRedisUrl.hostname,
    port: Number(parsedRedisUrl.port || 6379)
  };
  taskQueue = new Queue('vedaai-tasks', {
    connection: redisConnection
  });
}

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

server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await io.close();
  await mongoose.disconnect();
  await taskQueue?.close();
  redisClient?.disconnect();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});