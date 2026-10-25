import assert from 'node:assert/strict';
import test from 'node:test';
import { ENEMIES, STAGES, STARTERS } from '../src/config';

test('retained stages reference valid enemies and bosses', () => {
  assert.ok(Object.keys(STAGES).length >= 2);
  for (const stage of Object.values(STAGES)) {
    assert.ok(stage.waves.length > 0, `${stage.id} needs waves`);
    assert.ok(stage.bosses.length > 0, `${stage.id} needs bosses`);
    for (const wave of stage.waves) {
      assert.ok(wave.spawnRate > 0 && wave.maxEnemies > 0);
      assert.ok(wave.enemies.length > 0);
      for (const entry of wave.enemies) assert.ok(ENEMIES[entry.type], `${stage.id} missing ${entry.type}`);
    }
    let previousTime = -1;
    for (const boss of stage.bosses) {
      assert.ok(ENEMIES[boss.type], `${stage.id} missing boss ${boss.type}`);
      assert.ok(boss.timeSeconds >= previousTime, `${stage.id} boss schedule must be ordered`);
      previousTime = boss.timeSeconds;
    }
  }
});

test('retained starters with evolution paths have ordered playable forms', () => {
  assert.ok(STARTERS.length >= 3);
  let evolvingStarters = 0;
  for (const starter of STARTERS) {
    const forms = starter.forms ?? [];
    if (!forms.length) continue;
    evolvingStarters++;
    assert.ok(forms.length >= 3, `${starter.key} evolution path needs three forms`);
    assert.equal(forms[0].form, 'base');
    for (let index = 1; index < forms.length; index++) {
      assert.ok(forms[index].level > forms[index - 1].level, `${starter.key} forms must be level ordered`);
    }
  }
  assert.ok(evolvingStarters >= 3);
});
