import mongoose from 'mongoose';

export async function connectMongoDB() {
  // mongoose.set('debug', true);
  await mongoose.connect(process.env.MONGO_URI!);

  console.log('MongoDB connected');
}
