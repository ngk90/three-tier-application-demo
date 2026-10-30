'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { addTaxCents } = require('../tools/pr56-money.cjs');

test('addTaxCents adds 10% to 100 cents', () => {
  assert.strictEqual(addTaxCents(100, 10), 110);
});

test('addTaxCents rounds 99 cents plus 5% to 104', () => {
  assert.strictEqual(addTaxCents(99, 5), 104);
});
