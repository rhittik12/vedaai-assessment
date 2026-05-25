import type { Worker } from 'bullmq';
import type { Server as SocketIOServer } from 'socket.io';

import { createGenerationWorker } from './generationWorker';

let generationWorker: Worker | null = null;

export function startGenerationWorker(io: SocketIOServer): Worker {
  if (generationWorker) {
    return generationWorker;
  }

  generationWorker = createGenerationWorker(io);

  generationWorker.on('ready', () => {
    console.log('Assignment generation worker ready');
  });

  generationWorker.on('active', (job) => {
    console.log(`Assignment generation job active: ${job.id}`);
  });

  generationWorker.on('completed', (job) => {
    console.log(`Assignment generation job completed: ${job.id}`);
  });

  generationWorker.on('failed', (job, error) => {
    console.error(`Assignment generation job failed: ${job?.id ?? 'unknown'}`, error);
  });

  generationWorker.on('error', (error) => {
    console.error('Assignment generation worker error:', error);
  });

  return generationWorker;
}

export async function closeGenerationWorker(): Promise<void> {
  if (!generationWorker) {
    return;
  }

  await generationWorker.close();
  generationWorker = null;
}
