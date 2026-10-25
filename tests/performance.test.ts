import assert from 'node:assert/strict';
import test from 'node:test';
import { PerformanceMonitor } from '../src/audience/PerformanceMonitor';

test('bounded timing window evicts old frames and calculates nearest-rank p95', () => {
  const monitor = new PerformanceMonitor(20);
  for (let frame = 1; frame <= 21; frame++) monitor.record(frame, 20, 100, 30, 2, 6);
  assert.deepEqual(monitor.snapshot(), { samples: 20, meanFrameMs: 11.5, p95FrameMs: 20,
    maxFrameMs: 21, activeViewers: 20, activeEnemies: 100, activeProjectiles: 30, droppedShots: 2, visibleLabels: 6 });
  monitor.record(Number.NaN, 999, 999);
  monitor.record(0, 999, 999);
  assert.equal(monitor.snapshot().activeViewers, 20);
  monitor.reset();
  assert.deepEqual(monitor.snapshot(), { samples: 0, meanFrameMs: 0, p95FrameMs: 0,
    maxFrameMs: 0, activeViewers: 0, activeEnemies: 0, activeProjectiles: 0, droppedShots: 0, visibleLabels: 0 });
});
