const http = require('http');

const { config, validateConfig } = require('./config/config');
const app = require('./app');
const { mongoConnect, mongoDisconnect } = require('./services/mongo');
const { loadPlanetData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const server = http.createServer(app);

async function startServer() {
  validateConfig();

  await mongoConnect();
  await loadPlanetData();
  await loadLaunchesData();

  server.listen(config.port, () => {
    console.log(`Server listening on port ${config.port} [${config.nodeEnv}]`);
  });
}

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed');
    await mongoDisconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

startServer();
