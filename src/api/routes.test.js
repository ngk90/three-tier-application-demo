const request = require('supertest');
const express = require('express');

jest.mock('./db', () => ({ query: jest.fn() }));

const db = require('./db');

// index.js builds its app internally and calls app.listen() on load without
// exporting it. Intercept listen() so no port is bound and capture the app.
let app;
let listenSpy;
let logSpy;

beforeAll(() => {
  listenSpy = jest
    .spyOn(express.application, 'listen')
    .mockImplementation(function listen(port, cb) {
      app = this;
      if (cb) cb();
      return { close: jest.fn() };
    });
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  require('./index');
});

afterAll(() => {
  listenSpy.mockRestore();
  logSpy.mockRestore();
});

beforeEach(() => {
  db.query.mockReset();
});

describe('server startup', () => {
  it('listens on the default port and logs it', () => {
    expect(listenSpy).toHaveBeenCalledWith(
      process.env.PORT || 3001,
      expect.any(Function)
    );
    expect(logSpy).toHaveBeenCalledWith(
      `API listening on port ${process.env.PORT || 3001}`
    );
  });
});

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('GET /tasks', () => {
  it('returns all tasks ordered by creation time', async () => {
    const tasks = [
      { id: 1, title: 'a', completed: false },
      { id: 2, title: 'b', completed: true },
    ];
    db.query.mockResolvedValueOnce({ rows: tasks });

    const res = await request(app).get('/tasks').expect(200);

    expect(res.body).toEqual(tasks);
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toMatch(/ORDER BY created_at ASC/);
  });

  it('returns an empty array when there are no tasks', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/tasks').expect(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 when the database fails', async () => {
    db.query.mockRejectedValueOnce(new Error('db down'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await request(app).get('/tasks').expect(500);
    errSpy.mockRestore();
  });
});

describe('POST /tasks', () => {
  it('creates a task and returns 201 with the row', async () => {
    const row = { id: 1, title: 'write tests', completed: false };
    db.query.mockResolvedValueOnce({ rows: [row] });

    const res = await request(app)
      .post('/tasks')
      .send({ title: 'write tests' })
      .expect(201);

    expect(res.body).toEqual(row);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringMatching(/INSERT INTO tasks/),
      ['write tests']
    );
  });

  it('trims whitespace from the title before inserting', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'x' }] });

    await request(app).post('/tasks').send({ title: '   padded  ' }).expect(201);

    expect(db.query.mock.calls[0][1]).toEqual(['padded']);
  });

  it.each([
    ['missing title', {}],
    ['empty title', { title: '' }],
    ['whitespace-only title', { title: '   ' }],
    ['null title', { title: null }],
    ['numeric title', { title: 42 }],
    ['array title', { title: ['a'] }],
  ])('rejects %s with 400', async (_name, body) => {
    const res = await request(app).post('/tasks').send(body).expect(400);
    expect(res.body).toEqual({ error: 'title is required' });
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns 500 when the insert fails', async () => {
    db.query.mockRejectedValueOnce(new Error('insert failed'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await request(app).post('/tasks').send({ title: 'ok' }).expect(500);
    errSpy.mockRestore();
  });
});

describe('PATCH /tasks/:id', () => {
  const existing = { id: 5, title: 'old', completed: false };

  it('returns 404 when the task does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch('/tasks/99')
      .send({ completed: true })
      .expect(404);

    expect(res.body).toEqual({ error: 'Not found' });
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [99]);
  });

  it('marks a task completed and keeps its title', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [existing] })
      .mockResolvedValueOnce({ rows: [{ ...existing, completed: true }] });

    const res = await request(app)
      .patch('/tasks/5')
      .send({ completed: true })
      .expect(200);

    expect(res.body).toEqual({ ...existing, completed: true });
    expect(db.query.mock.calls[1][1]).toEqual([true, 'old', 5]);
  });

  it('renames a task (trimmed) and keeps its completed flag', async () => {
    const done = { ...existing, completed: true };
    db.query
      .mockResolvedValueOnce({ rows: [done] })
      .mockResolvedValueOnce({ rows: [{ ...done, title: 'new' }] });

    const res = await request(app)
      .patch('/tasks/5')
      .send({ title: '  new  ' })
      .expect(200);

    expect(res.body.title).toBe('new');
    expect(db.query.mock.calls[1][1]).toEqual([true, 'new', 5]);
  });

  it('can uncomplete a task with completed: false', async () => {
    const done = { ...existing, completed: true };
    db.query
      .mockResolvedValueOnce({ rows: [done] })
      .mockResolvedValueOnce({ rows: [existing] });

    await request(app).patch('/tasks/5').send({ completed: false }).expect(200);

    expect(db.query.mock.calls[1][1]).toEqual([false, 'old', 5]);
  });

  it('coerces truthy/falsy completed values to booleans', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [existing] })
      .mockResolvedValueOnce({ rows: [existing] });

    await request(app).patch('/tasks/5').send({ completed: 1 }).expect(200);

    expect(db.query.mock.calls[1][1][0]).toBe(true);
  });

  it('leaves the task unchanged when the body has no fields', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [existing] })
      .mockResolvedValueOnce({ rows: [existing] });

    const res = await request(app).patch('/tasks/5').send({}).expect(200);

    expect(res.body).toEqual(existing);
    expect(db.query.mock.calls[1][1]).toEqual([false, 'old', 5]);
  });

  it('parses a non-numeric id as NaN and returns 404 when nothing matches', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await request(app).patch('/tasks/abc').send({ completed: true }).expect(404);

    expect(db.query.mock.calls[0][1]).toEqual([NaN]);
  });

  it('returns 500 when the lookup fails', async () => {
    db.query.mockRejectedValueOnce(new Error('boom'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await request(app).patch('/tasks/5').send({ completed: true }).expect(500);
    errSpy.mockRestore();
  });

  it('returns 500 when the update fails', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [existing] })
      .mockRejectedValueOnce(new Error('update failed'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await request(app).patch('/tasks/5').send({ completed: true }).expect(500);
    errSpy.mockRestore();
  });
});

describe('malformed requests', () => {
  it('returns 400 for invalid JSON bodies', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await request(app)
      .post('/tasks')
      .set('Content-Type', 'application/json')
      .send('{not json')
      .expect(400);
    errSpy.mockRestore();
  });

  it('returns 404 for unknown routes', async () => {
    await request(app).get('/nope').expect(404);
  });
});
