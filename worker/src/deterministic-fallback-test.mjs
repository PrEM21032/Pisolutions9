import assert from 'node:assert/strict';
import { deterministicFallback } from './deterministic-fallback.mjs';

assert.equal(deterministicFallback('What is 2 plus 2?'), 'The answer is 4.');
assert.match(deterministicFallback('Why is the sky blue?'), /scatters shorter blue wavelengths/);
assert.match(deterministicFallback('Say hello in one short sentence.'), /^Hello/);
assert.match(deterministicFallback('Hello'), /^Hello/);
assert.equal(deterministicFallback('What is 12 divided by 3?'), 'The answer is 4.');
assert.match(deterministicFallback('Tell me the stock price of Apple right now.'), /live model provider is currently unavailable/);
assert.match(deterministicFallback('Tell me something cool'), /Venus/);
assert.match(deterministicFallback('What is the difference between RAM and storage?'), /RAM is fast, temporary working memory/);
assert.match(deterministicFallback('What is opportunity cost?'), /Opportunity cost is what you give up/);
assert.match(deterministicFallback('Build me a website for launching my own products like Amazon.'), /product-launch marketplace/);
assert.match(deterministicFallback('Create a website for my business.'), /software build/);

console.log('Deterministic chat recovery tests passed.');
