const request = require('supertest');
const express = require('express');

// Create a minimal app for testing
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

describe('Health Endpoint', () => {
  it('should return status ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return JSON content type', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/);

    expect(response.status).toBe(200);
  });
});
