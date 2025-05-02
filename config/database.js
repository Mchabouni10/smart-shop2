//config/database.js
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connection options for newer versions of MongoDB
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,  // Timeout after 5s instead of 30s
      maxPoolSize: 10,  // Maintain up to 10 socket connections
    };

    // Debug mode for development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Port: ${conn.connection.port}`);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected from DB');
    });

    // Close connection on process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Connection URI:', process.env.MONGODB_URI);
    console.error('Error stack:', err.stack);
    
    // Exit process with failure if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;