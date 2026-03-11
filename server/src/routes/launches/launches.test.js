const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetData } = require('../../models/planets.model');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Launches API', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongoServer.getUri();
    await mongoConnect();
    await loadPlanetData();
  });

  afterAll(async () => {
    await mongoDisconnect();
    await mongoServer.stop();
  });

  describe('Test GET /v1/launches', () => {
    test('It should respond with 200 success', async () => {
      await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /application\/json/)
        .expect(200);
    });

    test('It should support pagination', async () => {
      const response = await request(app)
        .get('/v1/launches?page=1&limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Test GET /v1/launches/stats', () => {
    test('It should return launch statistics', async () => {
      const response = await request(app)
        .get('/v1/launches/stats')
        .expect('Content-Type', /application\/json/)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('upcoming');
      expect(response.body).toHaveProperty('past');
      expect(response.body).toHaveProperty('successful');
      expect(response.body).toHaveProperty('failed');
      expect(response.body).toHaveProperty('successRate');
      expect(response.body).toHaveProperty('totalCustomers');
    });
  });

  describe('Test POST /v1/launches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'January 4, 2028',
    };

    const launchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
    };

    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'zoot',
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /application\/json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /application\/json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /application\/json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });

  describe('Test DELETE /v1/launches/:id', () => {
    test('It should return 400 for invalid launch ID', async () => {
      await request(app)
        .delete('/v1/launches/abc')
        .expect(400);
    });

    test('It should return 404 for non-existent launch', async () => {
      await request(app)
        .delete('/v1/launches/999999')
        .expect(404);
    });
  });
});
