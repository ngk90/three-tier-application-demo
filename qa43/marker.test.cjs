'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const marker = require('./marker.cjs');

test('marker returns the PR43 alpha literal', () => {
  assert.equal(marker(), 'PR43 alpha');
});
