import assert from 'node:assert/strict';
import test from 'node:test';
import { actualHealthLost, ContributionTracker } from '../src/audience/ContributionTracker';
import { VIEWER_ROLES } from '../src/audience/CompanionRoles';
import { AudienceSession } from '../src/audience/AudienceSession';
import { MockAudienceProvider } from '../src/audience/MockAudienceProvider';

const viewer = { id: 'mock:alice', displayName: 'Alice' };

test('actual damage caps overkill and excludes shields, dead targets and healing', () => {
  assert.equal(actualHealthLost(20, 13), 7);
  assert.equal(actualHealthLost(3, -15), 3);
  assert.equal(actualHealthLost(20, 20), 0);
  assert.equal(actualHealthLost(-15, -20), 0);
  assert.equal(actualHealthLost(10, 15), 0);
});

test('ledger retains roles and independent snapshots, ignores unregistered and invalid hits', () => {
  const ledger = new ContributionTracker();
  ledger.register(viewer, VIEWER_ROLES[0]);
  ledger.record(viewer.id, 3, true);
  ledger.register(viewer, VIEWER_ROLES[1]);
  ledger.record(viewer.id, 0, true);
  ledger.record(viewer.id, NaN, true);
  ledger.record('missing', 50, true);
  const snapshot = ledger.snapshot();
  assert.equal(snapshot[0].role.id, 'scout');
  assert.equal(snapshot[0].damage, 3);
  assert.equal(snapshot[0].kills, 1);
  snapshot[0].damage = 100;
  assert.equal(ledger.snapshot()[0].damage, 3);
});

test('session snapshots final hit once, stops contributions and admission, resets every run', async () => {
  const session = new AudienceSession();
  const provider = new MockAudienceProvider();
  await session.setProvider(provider);
  session.bindRuntime({ level: () => 1, running: () => true, simulateLevel: () => {} });
  session.setEnabled(true);
  session.setRecruitmentMode('join-all');
  provider.join('Alice');
  session.registerContribution(viewer, VIEWER_ROLES[0]);
  assert.equal(session.getContributions().length, 0);
  session.admit(viewer.id);
  session.registerContribution(viewer, VIEWER_ROLES[0]);
  let notifications = 0;
  session.onChange(() => notifications++);
  const beforeHit = notifications;
  session.recordContribution(viewer.id, 7, false);
  session.recordContribution(viewer.id, 3, true);
  assert.equal(notifications, beforeHit);
  const summary = session.finishRun('victory');
  assert.equal(summary.contributions[0].damage, 10);
  assert.equal(summary.contributions[0].kills, 1);
  summary.contributions[0].damage = 1000;
  session.recordContribution(viewer.id, 5, true);
  assert.equal(session.finishRun('defeat').outcome, 'victory');
  assert.equal(session.getRunSummary()?.contributions[0].damage, 10);
  assert.equal(session.canRecruit(), false);
  assert.equal(session.canSimulateLevel(), false);
  session.reset();
  assert.deepEqual(session.getContributions(), []);
  assert.equal(session.getRunSummary(), null);
  provider.join('Alice');
  assert.equal(session.getViewers().length, 1);
});
