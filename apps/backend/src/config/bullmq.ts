import { Queue } from 'bullmq';

import { getRedisClient } from './redis';

let assignmentGenerationQueue: Queue | null = null;

export function getAssignmentGenerationQueue(): Queue {
  if (assignmentGenerationQueue) {
    return assignmentGenerationQueue;
  }

  assignmentGenerationQueue = new Queue('assignment-generation', {
    connection: getRedisClient()
  });

  return assignmentGenerationQueue;
}

export async function closeAssignmentGenerationQueue(): Promise<void> {
  if (!assignmentGenerationQueue) {
    return;
  }

  await assignmentGenerationQueue.close();
  assignmentGenerationQueue = null;
}
