const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

test('pr40-checkpoint.txt contains PR40_STAGE_TWO', () => {
  const content = fs.readFileSync('pr40-checkpoint.txt', 'utf8');
  assert(content.includes('PR40_STAGE_TWO'), 'pr40-checkpoint.txt should contain PR40_STAGE_TWO');
});
