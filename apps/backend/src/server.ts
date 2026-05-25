import 'dotenv/config';

import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

import app from './app';
import { connectDatabase } from './config/database';
import { closeAssignmentGenerationQueue, getAssignmentGenerationQueue } from './config/bullmq';
import { closeRedisClient, getRedisClient } from './config/redis';

const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});
let isShuttingDown = false;

const shutdown = async (exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    const cleanupResults = await Promise.allSettled([
      io.close(),
      closeAssignmentGenerationQueue(),
      closeRedisClient(),
      mongoose.disconnect()
    ]);

    for (const result of cleanupResults) {
      if (result.status === 'rejected') {
        console.error('Shutdown cleanup failed:', result.reason);
      }
    }
  } finally {
    server.close(() => process.exit(exitCode));
  }
};

const start = async () => {
  try {
    await connectDatabase();
    getRedisClient();
    getAssignmentGenerationQueue();

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    console.error('Backend startup failed:', message);
    await shutdown(1);
  }
};

process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});

void start();