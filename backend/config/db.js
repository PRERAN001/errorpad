import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const mongoUrl = process.env.mongodburl || process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error('Missing MongoDB connection string. Set mongodburl in your environment.');
  }

  await mongoose.connect(mongoUrl);
};
