import mongoose from 'mongoose';
import { config } from '../config/env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45_000,
    });
    // Never log the URI itself -- it carries credentials.
    console.log(`MongoDB connected (${mongoose.connection.name})`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    throw err;
  }

  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
