import mongoose from 'mongoose';

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to backend/.env (see .env.example).');
  }
  await mongoose.connect(uri);
}
