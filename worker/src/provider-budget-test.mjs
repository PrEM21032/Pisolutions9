import assert from 'node:assert/strict';
import { edgeDeadlineForRequest } from './index.js';

const start = 1_000_000;
assert.equal(edgeDeadlineForRequest(start, false), start + 20_000);
assert.equal(edgeDeadlineForRequest(start, true), start + 11_000);
assert.equal((start + 20_000) - edgeDeadlineForRequest(start, true), 9_000);
console.log('PI external fallback budget reservation test passed');
