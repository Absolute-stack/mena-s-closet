import mongoose from 'mongoose';

let isConnecting = false;
let isConnected = false;
let eventsInitiated = false;
let connectionAttempts = 0;

async function connectDB() {
  const { DB } = process.env;
  if (!DB) throw new Error('MongoDB connection string DB is missing from .env');

  if (isConnected) {
    console.log('🔐 MongoDB is already connected');
    return;
  }

  if (isConnecting) {
    console.log('⏳ MongoDB is already connecting...');
    return;
  }

  isConnecting = true;
  console.log('⏳ MongoDB is connecting...');

  const options = {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 60000,
    waitQueueTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    retryReads: true,
    retryWrites: true,
    maxConnecting: 2,
    serverMonitoringMode: 'auto',
    w: 'majority',
    journal: true,
    readPreference: 'primary',
    compressors: ['zstd', 'snappy', 'zlib'],
    zlibCompressionLevel: 6,
  };

  try {
    if (!eventsInitiated) {
      setupConnectionEventListeners();
      eventsInitiated = true;
    }

    await mongoose.connect(DB, options);

    isConnecting = false;
    isConnected = true;
    connectionAttempts = 0;
  } catch (error) {
    isConnecting = false;
    isConnected = false;
    console.error('❌ MongoDB connection error:', error.message);
  }
}

function setupConnectionEventListeners() {
  mongoose.connection.removeAllListeners();

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB successfully connected');
    console.log(`🏢 Host: ${mongoose.connection.host}`);
    console.log(`🗄️ Name: ${mongoose.connection.name}`);

    mongoose.connection.on('open', async () => {
      console.log('🔓 MongoDB connection open');
    });
  });

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB error: ${error.message}`);

    if (isConnected || isConnecting) return;

    connectionAttempts++;

    if (error.name === 'MongoNetworkError') {
      console.log('🌐 Network error — check internet/firewall/DNS settings');
    }

    if (error.name === 'MongoServerError') {
      console.log('💾 Server error — check MongoDB server or IP allowlist');
    }

    if (connectionAttempts <= 5) {
      console.error(`🔁 Reconnection attempt: ${connectionAttempts}`);
      setTimeout(() => {
        connectDB().catch((err) =>
          console.log(
            `Reconnection attempt ${connectionAttempts} failed: ${err.message}`
          )
        );
      }, 2000 * connectionAttempts);
    }
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('⛓️‍💥 MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('🔁 MongoDB reconnected');
  });
}

export default connectDB;
