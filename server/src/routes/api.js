const express = require('express');

const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');
const healthRouter = require('./health/health.router');

const api = express.Router();

api.use('/health', healthRouter);
api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;
