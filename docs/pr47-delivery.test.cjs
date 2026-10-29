'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('docs/pr47-delivery.md contains PR47_DELIVERY_VERIFIED marker', () => {
  const docPath = path.join(__dirname, 'pr47-delivery.md');
  const content = fs.readFileSync(docPath, 'utf8');
  assert.ok(
    content.includes('PR47_DELIVERY_VERIFIED'),
    'Expected marker PR47_DELIVERY_VERIFIED not found in docs/pr47-delivery.md'
  );
});
