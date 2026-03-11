const express = require('express');

const { httpGetHealth } = require('./health.controller');

const healthRouter = express.Router();

healthRouter.get('/', httpGetHealth);

module.exports = healthRouter;
