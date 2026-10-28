'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

test('URL parsing extracts the hostname', () => {
  const url = new URL('https://example.com:8080/tasks/42?done=true#top');
  assert.equal(url.hostname, 'example.com');
});

test('URL parsing extracts the pathname', () => {
  const url = new URL('https://example.com:8080/tasks/42?done=true#top');
  assert.equal(url.pathname, '/tasks/42');
});
