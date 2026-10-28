import { test } from "node:test";
import assert from "node:assert/strict";
import { double } from "../src/web/lib/pr45-delta.ts";

test("double returns twice a positive input", () => {
  assert.equal(double(21), 42);
});

test("double returns twice a negative input", () => {
  assert.equal(double(-4), -8);
});
