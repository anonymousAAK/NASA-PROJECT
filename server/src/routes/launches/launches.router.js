const express = require('express');

const {
  httpGetAllLaunches,
  httpGetLaunchStats,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/stats', httpGetLaunchStats);
launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;
