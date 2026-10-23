# Running API Tests

This document describes how to run the API test suite for this three-tier application.

## Quick Start

The API includes unit tests using Jest and Supertest. To run them:

```bash
cd src/api
npm test
```

## Dependency Installation

The API tests require development dependencies (`jest` and `supertest`) which are not installed by default in production mode.

### Automatic Dependency Install Result

When running `npm install` in `src/api/`, only production dependencies are installed by default:

```
added 81 packages, audited 82 packages
```

To install development dependencies, use:

```bash
cd src/api
NODE_ENV=development npm install
```

This installs the full dependency tree including test tools:

```
added 298 packages, audited 380 packages
```

### Test Execution Outcomes

After installing development dependencies, `npm test` runs successfully:

```bash
$ cd src/api && npm test

PASS ./index.test.js
  Health Endpoint
    ✓ should return status ok (45 ms)
    ✓ should return JSON content type (8 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.753 s
Ran all test suites.
```

## Test Files

- **Test file:** `src/api/index.test.js`
- **Test framework:** Jest
- **HTTP testing library:** Supertest
- **Current coverage:** Health endpoint tests (2 tests)

## Notes

- The root directory has no `package.json`, so `npm test` at the repository root will fail with `ENOENT: no such file or directory`.
- The web tier (`src/web/`) has no test script defined in its `package.json`.
- Tests are API-only at this time.
