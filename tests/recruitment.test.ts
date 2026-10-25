import assert from 'node:assert/strict';
import test from 'node:test';
import { AudienceSession } from '../src/audience/AudienceSession';
import { MockAudienceProvider } from '../src/audience/MockAudienceProvider';

async function fixture() {
  const session = new AudienceSession();
  const provider = new MockAudienceProvider();
  let level = 1;
  let running = true;
  await session.setProvider(provider);
  const unbind = session.bindRuntime({ level: () => level, running: () => running,
    simulateLevel: () => { level++; session.recordLevel(level); } });
  return { session, provider, unbind, setLevel: (value: number) => { level = value; }, pause: () => { running = false; }, resume: () => { running = true; } };
}

test('solo default, mid-run enabling baseline, banked levels and FIFO consumption', async () => {
  const { session, provider, setLevel } = await fixture();
  provider.join('A'); provider.join('B');
  assert.equal(session.canRecruit(), false);
  setLevel(5); session.recordLevel(5); session.setEnabled(true);
  assert.equal(session.getRecruitmentCredits(), 0);
  session.recordLevel(7); session.recordLevel(7);
  assert.equal(session.getRecruitmentCredits(), 2);
  assert.equal(session.admit('mock:b'), false);
  assert.equal(session.admit('mock:a'), true);
  assert.equal(session.admit('mock:a'), false);
  assert.equal(session.admit('mock:b'), true);
  session.recordLevel(8);
  provider.join('C');
  assert.equal(session.admit('mock:c'), true);
  assert.equal(session.getRecruitmentCredits(), 0);
});

test('Join all preserves roster and prior credits, earns no new credits, reset clears rewards', async () => {
  const { session, provider } = await fixture();
  session.setEnabled(true); session.recordLevel(2);
  session.setRecruitmentMode('join-all');
  provider.join('A'); assert.equal(session.admit('mock:a'), true);
  session.recordLevel(4);
  assert.equal(session.getRecruitmentCredits(), 1);
  session.setRecruitmentMode('level');
  assert.equal(session.getActiveViewers().length, 1);
  provider.join('B'); assert.equal(session.admit('mock:b'), true);
  provider.join('C'); assert.equal(session.admit('mock:c'), false);
  session.reset();
  assert.equal(session.getRecruitmentCredits(), 0);
  assert.equal(session.getActiveViewers().length, 0);
});

test('pause and shutdown reject admission and simulation; resume spends banked credit', async () => {
  const { session, provider, pause, resume, unbind } = await fixture();
  session.setEnabled(true); provider.join('A');
  assert.equal(session.simulateLevel(), true);
  pause();
  assert.equal(session.admit('mock:a'), false);
  assert.equal(session.simulateLevel(), false);
  resume(); assert.equal(session.admit('mock:a'), true);
  unbind();
  assert.equal(session.simulateLevel(), false);
  assert.equal(session.canRecruit(), false);
});
