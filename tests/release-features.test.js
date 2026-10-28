'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { resolveReleaseFeatures } = require('../tools/release-features.js');

const root = path.join(__dirname, '..');

test('mock audience defaults off and turns on for Vercel previews', () => {
  assert.deepEqual(resolveReleaseFeatures({ env: {}, argv: [] }), { mockAudience: false });
  assert.deepEqual(resolveReleaseFeatures({ env: { VERCEL_ENV: 'production' }, argv: [] }), { mockAudience: false });
  assert.deepEqual(resolveReleaseFeatures({ env: { VERCEL_ENV: 'preview' }, argv: [] }), { mockAudience: true });
  assert.deepEqual(resolveReleaseFeatures({ env: {}, argv: ['--mock-audience'] }), { mockAudience: true });
});

test('explicit mock audience setting overrides the deployment default and rejects typos', () => {
  assert.deepEqual(resolveReleaseFeatures({ env: { VERCEL_ENV: 'preview', TS_ENABLE_MOCK_AUDIENCE: 'off' } }), { mockAudience: false });
  assert.deepEqual(resolveReleaseFeatures({ env: { VERCEL_ENV: 'production', TS_ENABLE_MOCK_AUDIENCE: '1' } }), { mockAudience: true });
  assert.throws(() => resolveReleaseFeatures({ env: { TS_ENABLE_MOCK_AUDIENCE: 'enabled' } }), /must be one of/);
});

test('browser feature state follows only the generated HTML marker', () => {
  const source = fs.readFileSync(path.join(root, 'js/core/features.js'), 'utf8');
  for (const [value, expected] of [['off', false], ['on', true], ['preview', false]]) {
    const context = { G: {}, document: { documentElement: { dataset: { mockAudience: value } } } };
    vm.runInNewContext(source, context, { filename: 'js/core/features.js' });
    assert.equal(context.G.Features.mockAudience, expected);
  }
});
