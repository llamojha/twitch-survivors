import assert from 'node:assert/strict';
import test from 'node:test';
import { AudienceSession } from '../src/audience/AudienceSession';
import { MockAudienceProvider } from '../src/audience/MockAudienceProvider';
import { ViewerRegistry } from '../src/systems/ViewerRegistry';
import type { AudienceEvent, AudienceStatus } from '../src/audience/AudienceProvider';

test('registry deduplicates ids, preserves FIFO and protects snapshots', () => {
  const registry = new ViewerRegistry();
  assert.equal(registry.add({ id: 'one', displayName: 'Same' }), true);
  assert.equal(registry.add({ id: 'one', displayName: 'Renamed' }), false);
  registry.add({ id: 'two', displayName: 'Same' });
  const snapshot = registry.getViewers();
  snapshot[0].id = 'changed';
  assert.deepEqual(registry.getViewers().map(viewer => viewer.id), ['one', 'two']);
  registry.reset();
  assert.deepEqual(registry.getViewers(), []);
});

test('mock emits normalized duplicates; session deduplicates and resets each run', async () => {
  const session = new AudienceSession();
  const mock = new MockAudienceProvider();
  let emitted = 0;
  mock.onEvent(() => emitted++);
  assert.equal(mock.join('Ada'), false);
  await session.setProvider(mock);
  mock.join(' Ada ');
  mock.join('ADA');
  assert.equal(emitted, 2);
  assert.deepEqual(session.getViewers(), [{ id: 'mock:ada', displayName: 'Ada' }]);
  assert.equal(mock.join('  '), false);
  session.reset();
  mock.join('Ada');
  assert.equal(session.getViewers().length, 1);
  await session.disconnect();
  assert.deepEqual(session.getViewers(), []);
  assert.equal(session.getStatus().state, 'disconnected');
});

class DelayedProvider extends MockAudienceProvider {
  eventHandler?: (event: AudienceEvent) => void;
  statusHandler?: (status: AudienceStatus) => void;
  rejectConnect?: (reason: Error) => void;
  override connect(): Promise<void> {
    return new Promise((_resolve, reject) => { this.rejectConnect = reject; });
  }
  override onEvent(handler: (event: AudienceEvent) => void): () => void {
    this.eventHandler = handler;
    return super.onEvent(handler);
  }
  override onStatus(handler: (status: AudienceStatus) => void): () => void {
    this.statusHandler = handler;
    return super.onStatus(handler);
  }
}

test('provider switches ignore late events, status and connect rejection', async () => {
  const session = new AudienceSession();
  const oldProvider = new DelayedProvider();
  const connecting = session.setProvider(oldProvider);
  const current = new MockAudienceProvider();
  await session.setProvider(current);
  current.join('Current');
  oldProvider.eventHandler?.({ type: 'viewer_join', viewer: { id: 'stale', displayName: 'Stale' } });
  oldProvider.statusHandler?.({ state: 'error', message: 'stale' });
  oldProvider.rejectConnect?.(new Error('stale failure'));
  await connecting;
  assert.deepEqual(session.getViewers().map(viewer => viewer.id), ['mock:current']);
  assert.equal(session.getStatus().state, 'connected');
});

test('current connection failures surface in status subscriptions', async () => {
  const session = new AudienceSession();
  const provider = new DelayedProvider();
  const statuses: string[] = [];
  const unsubscribe = session.onStatus(status => statuses.push(status.state));
  const connecting = session.setProvider(provider);
  provider.rejectConnect?.(new Error('Unable to connect'));
  await connecting;
  assert.deepEqual(statuses, ['disconnected', 'connecting', 'error']);
  assert.equal(session.getStatus().message, 'Unable to connect');
  unsubscribe();
  await session.disconnect();
  assert.equal(statuses.length, 3);
});
