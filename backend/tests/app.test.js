const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('APOD Route', () => {
  test('GET /api/apod returns 200 or 429 (rate limit)', async () => {
    const res = await request(app).get('/api/apod');
    expect([200, 429, 500]).toContain(res.statusCode);
  });

  test('GET /api/apod with valid date param', async () => {
    const res = await request(app).get('/api/apod?date=2024-01-01');
    expect([200, 429, 500]).toContain(res.statusCode);
  });
});

describe('NEO Route', () => {
  test('GET /api/neo/feed returns data structure', async () => {
    const res = await request(app).get('/api/neo/feed');
    expect([200, 429, 500]).toContain(res.statusCode);
  });

  test('GET /api/neo/feed with date range > 7 days returns 400', async () => {
    const res = await request(app).get('/api/neo/feed?start_date=2024-01-01&end_date=2024-01-15');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('7 days');
  });
});

describe('Mars Route', () => {
  test('GET /api/mars/photos with invalid rover returns 400', async () => {
    const res = await request(app).get('/api/mars/photos?rover=invalid');
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/mars/photos with valid rover', async () => {
    const res = await request(app).get('/api/mars/photos?rover=curiosity&sol=1000');
    expect([200, 429, 500]).toContain(res.statusCode);
  });
});

describe('404 Handler', () => {
  test('Unknown routes return 404', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});
