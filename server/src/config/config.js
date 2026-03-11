require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 8000,
  mongoUrl: process.env.MONGO_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  spacexApiUrl:
    process.env.SPACEX_API_URL || 'https://api.spacexdata.com/v4/launches/query',
};

function validateConfig() {
  const required = ['mongoUrl'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0 && !config.isTest) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Check your .env file.`
    );
  }
}

module.exports = {
  config,
  validateConfig,
};
