const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Health API', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongoServer.getUri();
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
    await mongoServer.stop();
  });

  describe('Test GET /v1/health', () => {
    test('It should respond with 200 when healthy', async () => {
      const response = await request(app)
        .get('/v1/health')
        .expect('Content-Type', /application\/json/)
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('memory');
      expect(response.body.database).toBe('connected');
    });
  });
});
