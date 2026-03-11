const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetData } = require('../../models/planets.model');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Planets API', () => {
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

  describe('Test GET /v1/planets', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/planets')
        .expect('Content-Type', /application\/json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('It should return habitable planets', async () => {
      const response = await request(app).get('/v1/planets').expect(200);

      expect(response.body.length).toBeGreaterThan(0);

      response.body.forEach((planet) => {
        expect(planet).toHaveProperty('keplerName');
        expect(planet).not.toHaveProperty('_id');
        expect(planet).not.toHaveProperty('__v');
      });
    });
  });
});
