import assert from 'node:assert/strict';
import { deterministicFallback } from './deterministic-fallback.mjs';

assert.equal(deterministicFallback('What is 2 plus 2?'), 'The answer is 4.');
assert.match(deterministicFallback('Why is the sky blue?'), /scatters shorter blue wavelengths/);
assert.equal(deterministicFallback('Say hello in one short sentence.'), null);
assert.match(deterministicFallback('Hello'), /^Hello/);
assert.equal(deterministicFallback('What is 12 divided by 3?'), 'The answer is 4.');

console.log('Deterministic chat recovery tests passed.');
