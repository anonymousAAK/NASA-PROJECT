const mongoose = require('mongoose');
const { config } = require('../config/config');

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

async function mongoConnect() {
  const mongoUrl = config.mongoUrl || process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL environment variable is not set');
  }

  await mongoose.connect(mongoUrl);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
