import mongoose from 'mongoose';

// Prevent Mongoose from buffering operations when disconnected
mongoose.set('bufferCommands', false);

let connectionAttempted = false;

const connectDB = async () => {
  if (connectionAttempted) return;
  connectionAttempted = true;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview_coach';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS:         5000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);

    // Graceful reconnect on disconnect
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

  } catch (error) {
    console.warn(
      `ℹ️  MongoDB offline (${error.message}).\n` +
      '   The server will continue with in-memory fallback mode.\n' +
      '   Data will NOT be persisted until MongoDB is available.'
    );
    // Do not process.exit() — server should still serve requests
  }
};

export default connectDB;
