import assert from 'node:assert/strict';
import test from 'node:test';
import { SOLO_ATTACK, VIEWER_ROLES, pickCompanionRole, createCompanionShotHits, registerCompanionHit,
  getViewerAttackPhase } from '../src/audience/CompanionRoles';

test('injected random selects every immutable viewer role without modifying solo behavior', () => {
  assert.deepEqual([0, 0.34, 0.99].map(value => pickCompanionRole(() => value).id), ['scout', 'volley', 'piercer']);
  assert.equal(pickCompanionRole(() => 1), VIEWER_ROLES[2]);
  assert.deepEqual([SOLO_ATTACK.cooldownMs, SOLO_ATTACK.damageMultiplier, SOLO_ATTACK.speed, SOLO_ATTACK.maxHits], [2000, 1, 300, 1]);
  assert.ok(Object.isFrozen(VIEWER_ROLES));
  assert.ok(VIEWER_ROLES.every(role => Object.isFrozen(role) && Object.isFrozen(role.angles)));
});

test('viewer attack phases are stable and stay within the role cooldown', () => {
  const values = ['alice', 'bob', 'charlie'].map(id => getViewerAttackPhase(id, 1000));
  assert.deepEqual(values, ['alice', 'bob', 'charlie'].map(id => getViewerAttackPhase(id, 1000)));
  assert.ok(values.every(value => value >= 0 && value < 1000));
  assert.ok(new Set(values).size > 1);
});

test('roles produce quick single fire, a symmetric spread and a piercing shot', () => {
  const [scout, volley, piercer] = VIEWER_ROLES;
  assert.ok(scout.cooldownMs < SOLO_ATTACK.cooldownMs);
  assert.deepEqual(scout.angles, [0]);
  assert.equal(volley.angles.length, 3);
  assert.equal(volley.angles[0], -volley.angles[2]);
  assert.equal(volley.angles[1], 0);
  assert.ok(volley.angles[0] < 0);
  assert.equal(piercer.maxHits, 3);
  assert.deepEqual(piercer.angles, [0]);
});

test('piercing damages three distinct targets once and pooled shots start clean', () => {
  const shot = createCompanionShotHits(VIEWER_ROLES[2]);
  const first = {};
  assert.equal(registerCompanionHit(shot, first), true);
  assert.equal(registerCompanionHit(shot, first), false);
  assert.equal(shot.remaining, 2);
  assert.equal(registerCompanionHit(shot, {}), true);
  assert.equal(registerCompanionHit(shot, {}), true);
  assert.equal(registerCompanionHit(shot, {}), false);
  const reusedSolo = createCompanionShotHits(SOLO_ATTACK);
  assert.equal(registerCompanionHit(reusedSolo, first), true);
  assert.equal(registerCompanionHit(reusedSolo, {}), false);
  assert.equal(reusedSolo.remaining, 0);
});
