const axios = require('axios');

const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const { config } = require('../config/config');

const DEFAULT_FLIGHT_NUMBER = 100;

async function populateLaunches() {
  console.log('Downloading launch data...');
  const response = await axios.post(config.spacexApiUrl, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };

    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data already loaded');
  } else {
    await populateLaunches();
  }
}

function findLaunch(filter) {
  return launches.findOne(filter);
}

function existsLaunchWithId(launchId) {
  return findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

function getAllLaunches(skip, limit) {
  return launches
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function getLaunchStats() {
  const totalLaunches = await launches.countDocuments();
  const upcomingLaunches = await launches.countDocuments({ upcoming: true });
  const pastLaunches = await launches.countDocuments({ upcoming: false });
  const successfulLaunches = await launches.countDocuments({
    success: true,
    upcoming: false,
  });
  const failedLaunches = await launches.countDocuments({
    success: false,
    upcoming: false,
  });

  const latestLaunch = await launches
    .findOne({ upcoming: false })
    .sort('-launchDate')
    .select('mission launchDate rocket flightNumber -_id');

  const nextLaunch = await launches
    .findOne({ upcoming: true })
    .sort('launchDate')
    .select('mission launchDate rocket flightNumber target -_id');

  const uniqueCustomers = await launches.distinct('customers');

  return {
    total: totalLaunches,
    upcoming: upcomingLaunches,
    past: pastLaunches,
    successful: successfulLaunches,
    failed: failedLaunches,
    successRate:
      pastLaunches > 0
        ? `${((successfulLaunches / pastLaunches) * 100).toFixed(1)}%`
        : 'N/A',
    totalCustomers: uniqueCustomers.length,
    latestLaunch: latestLaunch || null,
    nextLaunch: nextLaunch || null,
  };
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Zero To Mastery', 'NASA', 'SpaceX'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launches.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  getLaunchStats,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
};
