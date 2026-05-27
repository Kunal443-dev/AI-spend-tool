import mongoose from 'mongoose';

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://localhost:27017/ai-spend-audit';
  
  if (primaryUri && !primaryUri.includes('<db_password>')) {
    try {
      console.log(`Attempting connection to primary database...`);
      await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
      console.log(`MongoDB Connected (Primary): ${primaryUri}`);
      return;
    } catch (error: any) {
      console.warn(`Primary MongoDB connection failed (${error.message || error}). Falling back to local database...`);
    }
  } else {
    console.log(`Primary MONGODB_URI is empty, invalid, or contains placeholders. Connecting to local database...`);
  }
  
  try {
    await mongoose.connect(fallbackUri);
    console.log(`MongoDB Connected (Local Fallback): ${fallbackUri}`);
  } catch (fallbackError) {
    console.error('Fallback MongoDB connection error:', fallbackError);
    process.exit(1);
  }
};

