describe('db pool', () => {
  const originalUrl = process.env.DATABASE_URL;

  afterEach(() => {
    jest.resetModules();
    jest.dontMock('pg');
    if (originalUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalUrl;
  });

  it('creates a pg Pool configured from DATABASE_URL and exports it', () => {
    process.env.DATABASE_URL = 'postgres://user:pw@host:5432/dbname';
    const instance = { query: jest.fn() };
    const Pool = jest.fn(() => instance);
    jest.doMock('pg', () => ({ Pool }));

    const pool = require('./db');

    expect(Pool).toHaveBeenCalledTimes(1);
    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgres://user:pw@host:5432/dbname',
    });
    expect(pool).toBe(instance);
  });

  it('passes an undefined connection string when DATABASE_URL is unset', () => {
    delete process.env.DATABASE_URL;
    const Pool = jest.fn(() => ({}));
    jest.doMock('pg', () => ({ Pool }));

    require('./db');

    expect(Pool).toHaveBeenCalledWith({ connectionString: undefined });
  });
});
