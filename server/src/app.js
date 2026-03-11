const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const { config } = require('./config/config');
const api = require('./routes/api');
const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: config.cors.origin,
  })
);

// Request logging
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/v1', api);

// SPA fallback
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
