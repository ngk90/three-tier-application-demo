'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { add } = require('./pr45-sum.cjs');

test('add returns the other operand when one is zero', () => {
  assert.equal(add(0, 0), 0);
  assert.equal(add(0, 5), 5);
});

test('add sums positive numbers', () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(10, 25), 35);
});
