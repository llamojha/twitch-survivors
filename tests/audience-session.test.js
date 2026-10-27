'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { AudienceSession, ViewerRegistry } = require('../js/audience/session.js');
const { MockAudienceProvider } = require('../js/audience/mock-provider.js');

test('registry uses stable ids, preserves FIFO, and returns defensive snapshots', () => {
  const registry = new ViewerRegistry();
  assert.equal(registry.add({ id: 'Viewer-1', displayName: 'Same' }), true);
  assert.equal(registry.add({ id: 'viewer-1', displayName: 'Renamed' }), false);
  assert.equal(registry.add({ id: 'viewer-2', displayName: 'Same' }), true);
  const snapshot = registry.waiting();
  snapshot[0].id = 'corrupt';
  assert.deepEqual(registry.waiting().map(viewer => viewer.id), ['Viewer-1', 'viewer-2']);
  assert.equal(registry.admit('viewer-2'), false);
  assert.equal(registry.admit('Viewer-1'), true);
  assert.deepEqual(registry.active(), [{ id: 'Viewer-1', displayName: 'Same' }]);
});

test('mock and session share normalized queue, duplicate protection, and run reset', async () => {
  const session = new AudienceSession();
  const mock = new MockAudienceProvider();
  await session.setProvider(mock);
  mock.join(' Ada ');
  mock.join('ADA');
  mock.joinBatch(3);
  assert.deepEqual(session.getViewers().map(viewer => viewer.id), [
    'mock:ada', 'mock:viewer 1', 'mock:viewer 2', 'mock:viewer 3'
  ]);
  session.reset();
  assert.equal(session.getStatus().state, 'connected');
  assert.deepEqual(session.getViewers(), []);
  assert.equal(mock.join('Ada'), true);
  assert.deepEqual(session.getViewers(), [{ id: 'mock:ada', displayName: 'Ada' }]);
});

test('provider generations ignore stale events, statuses, and rejected promises', async () => {
  class DelayedProvider extends MockAudienceProvider {
    connect() { return new Promise((_resolve, reject) => { this.rejectConnect = reject; }); }
    onEvent(handler) { this.staleEvent = handler; return super.onEvent(handler); }
    onStatus(handler) { this.staleStatus = handler; return super.onStatus(handler); }
  }
  const session = new AudienceSession();
  const oldProvider = new DelayedProvider();
  const pending = session.setProvider(oldProvider);
  const current = new MockAudienceProvider();
  await session.setProvider(current);
  current.join('Current');
  oldProvider.staleEvent({ type: 'viewer_join', viewer: { id: 'stale', displayName: 'Stale' } });
  oldProvider.staleStatus({ state: 'error', message: 'secret stale detail' });
  oldProvider.rejectConnect(new Error('secret rejection'));
  await pending;
  assert.deepEqual(session.getViewers().map(viewer => viewer.id), ['mock:current']);
  assert.deepEqual(session.getStatus(), { state: 'connected', message: 'Mock audience connected.' });
});

test('current provider rejection is sanitized', async () => {
  const provider = new MockAudienceProvider();
  provider.connect = async () => { throw new Error('oauth:do-not-display'); };
  const session = new AudienceSession();
  await session.setProvider(provider);
  assert.deepEqual(session.getStatus(), { state: 'error', message: 'Audience connection failed.' });
});
