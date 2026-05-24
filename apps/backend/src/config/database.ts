import mongoose from 'mongoose';

const defaultRetryDelayMs = 3000;

export async function connectDatabase(retries = 5): Promise<typeof mongoose> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }

  try {
    await mongoose.connect(mongoUri);
    return mongoose;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, defaultRetryDelayMs));
    return connectDatabase(retries - 1);
  }
}
