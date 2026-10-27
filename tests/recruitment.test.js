'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { AudienceSession } = require('../js/audience/session.js');
const { RecruitmentController } = require('../js/audience/recruitment.js');
const { MockAudienceProvider } = require('../js/audience/mock-provider.js');

test('controller banks each unique level and earns nothing during Join all', () => {
  const recruitment = new RecruitmentController();
  recruitment.setEnabled(true, 3);
  assert.equal(recruitment.recordLevel(5), 2);
  assert.equal(recruitment.recordLevel(5), 0);
  recruitment.setMode('join-all');
  assert.equal(recruitment.recordLevel(8), 0);
  assert.equal(recruitment.credits, 2);
  recruitment.setMode('level');
  assert.equal(recruitment.consume(), true);
  assert.equal(recruitment.credits, 1);
});

test('session enforces FIFO credits, Join all, pause, mode changes, and reset', async () => {
  const session = new AudienceSession();
  const provider = new MockAudienceProvider();
  let level = 1;
  let running = true;
  await session.setProvider(provider);
  session.bindRuntime({ level: () => level, running: () => running,
    simulateLevel: () => { level += 1; session.recordLevel(level); } });
  session.setEnabled(true);
  provider.join('A'); provider.join('B');
  assert.equal(session.admit('mock:a'), false);
  assert.equal(session.simulateLevel(), true);
  assert.equal(session.admit('mock:b'), false);
  assert.equal(session.admit('mock:a'), true);
  level = 3; session.recordLevel(level);
  assert.equal(session.admit('mock:b'), true);
  session.setRecruitmentMode('join-all');
  provider.join('C');
  assert.equal(session.admit('mock:c'), true);
  level = 8; session.recordLevel(level);
  session.setRecruitmentMode('level');
  assert.equal(session.getRecruitmentCredits(), 0);
  provider.join('D');
  running = false;
  assert.equal(session.admit('mock:d'), false);
  running = true;
  level = 9; session.recordLevel(level);
  assert.equal(session.admit('mock:d'), true);
  session.setEnabled(false);
  assert.equal(session.getActiveViewers().length, 4);
  session.reset();
  assert.deepEqual(session.getActiveViewers(), []);
  assert.equal(session.getRecruitmentCredits(), 0);
});
