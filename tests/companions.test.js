const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function setup(customEnemies) {
  let queries = 0;
  const enemies = customEnemies || [{ id: 1, x: 30, y: 0, r: 8 }];
  const directHits = [];
  const G = { Sprites: { Animator: class { loop() {} update() {} play() {} }, dirFromAngle: x => x },
    LIFT: 8, FX: { beam() {}, ring() {}, sp() {} },
    Combat: { audienceHit: (actor, enemy, damage) => { directHits.push({ actor, enemy, damage }); return damage; } },
    EnemyMgr: { queryCircle: (x, y, radius) => { queries++; return enemies.filter(e => (e.x - x) ** 2 + (e.y - y) ** 2 <= radius ** 2); } },
    VFX: { forType: type => ({ pal: type }) } };
  const ctx = vm.createContext({ G });
  for (const f of ['js/audience/roles.js', 'js/entities/projectile.js', 'js/entities/companion.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
  return { G, queries: () => queries, directHits };
}
test('recruitment-relative deadlines, due-only targeting, no catch-up volley', () => {
  const { G, queries } = setup(), pl = { x: 0, y: 0 };
  G.Companions.startRun('run');
  const a = G.Companions.spawn({ viewerId: 'one' }, pl, 100, 'volley');
  const b = G.Companions.spawn({ viewerId: 'two' }, pl, 100, 'volley');
  assert.ok(a.nextAttack > 100); assert.notEqual(a.nextAttack, b.nextAttack);
  G.Companions.update(0.016, pl, 100); assert.equal(queries(), 0);
  G.Companions.update(0.016, pl, 1000); assert.equal(queries(), 2); assert.equal(G.Projectiles.count, 10);
  G.Companions.update(0.016, pl, 1000); assert.equal(queries(), 2);
});
test('catalog exposes twelve inherited skills and rerolls deterministically per run', () => {
  const { G } = setup(), pl = { x: 0, y: 0 };
  assert.equal(G.Companions.roles.length, 12);
  assert.equal(new Set(G.Companions.roles.map(r => r.id)).size, 12);
  assert.equal(new Set(G.Companions.roles.map(r => r.moveId)).size, 12);
  G.Companions.startRun('run-1');
  const first = G.Companions.spawn({ viewerId: 'one' }, pl).role;
  assert.equal(G.Companions.spawn({ viewerId: 'one' }, pl).role, first);
  G.Companions.startRun('run-1');
  assert.equal(G.Companions.spawn({ viewerId: 'one' }, pl).role, first);
  G.Companions.startRun('run-2');
  assert.notEqual(G.Companions.spawn({ viewerId: 'one' }, pl).role, first);
  assert.equal(G.Companions.spawn({ viewerId: 'forced' }, pl, 0, 'scout').role, 'storm-needle');
});
test('projectile families preserve companion ownership and distinct behavior', () => {
  const cases = [
    ['storm-needle', 1, p => p.pierce === 2],
    ['seeker', 1, p => p.homing === 2],
    ['flame-fan', 5, p => p.life === 0.44],
    ['starburst', 8, () => true],
    ['runeblade', 2, p => p.boom > 0 && p.bsp > 0],
    ['flame-orbit', 3, p => p.orb && p.life === 2.4],
    ['rune-trapper', 2, p => p.vx === 0 && p.vy === 0 && p.slow === 0.55]
  ];
  for (const [role, count, check] of cases) {
    const { G } = setup(), pl = { x: 0, y: 0 };
    G.Companions.startRun('patterns');
    const actor = G.Companions.spawn({ viewerId: role }, pl, 0, role);
    G.Companions.update(0.016, pl, 99);
    const shots = G.Projectiles.all();
    assert.equal(shots.length, count, role);
    assert.ok(shots.every(p => p.owner === actor && p.audience.viewerId === role), role);
    assert.ok(check(shots[0]), role);
  }
});
test('direct chain, meteor, and beam families use the audience damage adapter', () => {
  const enemies = [
    { id: 1, x: 30, y: 0, r: 8 }, { id: 2, x: 70, y: 0, r: 8 },
    { id: 3, x: 110, y: 0, r: 8 }, { id: 4, x: 150, y: 0, r: 8 }
  ];
  for (const [role, hits] of [['chain-spark', 3], ['meteorist', 3], ['frost-channeler', 4]]) {
    const state = setup(enemies), pl = { x: 0, y: 0 };
    state.G.Companions.startRun('direct');
    state.G.Companions.spawn({ viewerId: role }, pl, 0, role);
    state.G.Companions.update(0.016, pl, 99);
    assert.equal(state.directHits.length, hits, role);
  }
});
test('audience damage upgrades scale projectile and direct-hit roles', () => {
  const projectile = setup(), boosted = { x: 0, y: 0, audienceDamageMul: 1.5 };
  projectile.G.Companions.startRun('projectile-boost');
  const shotRole = projectile.G.Companions.roles.find(role => role.id === 'storm-needle');
  projectile.G.Companions.spawn({ viewerId: 'shot' }, boosted, 0, shotRole.id);
  projectile.G.Companions.update(0.016, boosted, 99);
  assert.equal(projectile.G.Projectiles.all()[0].dmg, shotRole.damage * 1.5);

  const direct = setup(), chainRole = direct.G.Companions.roles.find(role => role.id === 'chain-spark');
  direct.G.Companions.startRun('direct-boost');
  direct.G.Companions.spawn({ viewerId: 'chain' }, boosted, 0, chainRole.id);
  direct.G.Companions.update(0.016, boosted, 99);
  assert.equal(direct.directHits[0].damage, chainRole.damage * 1.5);
});
test('snapshots report per-viewer damage per active second', () => {
  const { G } = setup(), player = { x: 0, y: 0 };
  G.Companions.startRun('dps');
  const actor = G.Companions.spawn({ viewerId: 'alice', displayName: 'Alice' }, player, 10, 'storm-needle');
  G.Companions.update(0.016, player, 20);
  G.Companions.recordHit(actor.ownership, 125, false);
  const [viewer] = G.Companions.snapshot();
  assert.equal(viewer.activeSeconds, 10);
  assert.equal(viewer.dps, 12.5);
});
test('attack work is bounded and short-range skills do not lock onto unreachable targets', () => {
  const state = setup([{ id: 1, x: 200, y: 0, r: 8 }]), pl = { x: 0, y: 0 };
  state.G.Companions.startRun('range');
  state.G.Companions.spawn({ viewerId: 'fan' }, pl, 0, 'flame-fan');
  state.G.Companions.update(0.016, pl, 99);
  assert.equal(state.G.Projectiles.count, 0);

  const crowded = setup(), player = { x: 0, y: 0 };
  crowded.G.Companions.startRun('budget');
  for (let i = 0; i < 40; i++) crowded.G.Companions.spawn({ viewerId: 'v' + i }, player, 0, 'storm-needle');
  crowded.G.Companions.update(0.016, player, 99);
  assert.equal(crowded.G.Projectiles.count, 32);
  assert.equal(crowded.G.Companions.metrics().deferredCasts, 8);
});
test('audience beams stop at the first wall', () => {
  const state = setup([{ id: 1, x: 120, y: 0, r: 8 }]), pl = { x: 0, y: 0 };
  state.G.World = { isWall: x => x >= 80 };
  state.G.Companions.startRun('walls');
  state.G.Companions.spawn({ viewerId: 'beam' }, pl, 0, 'frost-channeler');
  state.G.Companions.update(0.016, pl, 99);
  assert.equal(state.directHits.length, 0);
});
test('budget, immutable ownership, stale-run isolation and cleanup', () => {
  const { G } = setup(), pl = { x: 0, y: 0 };
  G.Companions.startRun('first'); const actor = G.Companions.spawn({ viewerId: 'one' }, pl);
  const p = G.Projectiles.spawn({ owner: actor, audience: actor.ownership });
  assert.equal(p.owner, actor); assert.ok(Object.isFrozen(p.audience));
  for (let i = 0; i < 200; i++) G.Projectiles.spawn({ audience: actor.ownership });
  assert.equal(G.Companions.metrics().activeShots, 160); assert.equal(G.Companions.metrics().droppedShots, 41);
  G.Companions.recordHit(actor.ownership, 12, true); assert.equal(G.Companions.snapshot()[0].damage, 12);
  G.Companions.startRun('second'); G.Companions.spawn({ viewerId: 'one' }, pl);
  G.Companions.recordHit(actor.ownership, 99, true);
  assert.equal(G.Companions.snapshot()[0].kills, 0); assert.equal(G.Projectiles.count, 0);
});
test('real enemy damage clamps shield absorption and overkill; viewer hits bypass streamer rewards', () => {
  const { G } = setup();
  Object.assign(G, { Coop: {}, Judgment: { noteDmg() {} }, FX: { dmgText() {}, sp() {}, burst() {} },
    World: { projectileBlock() { return false; }, propsInCircle() { return []; } },
    U: { dist2: (x, y, a, b) => (x-a)**2 + (y-b)**2 } });
  const ctx = vm.createContext({ G });
  for (const f of ['js/entities/enemy.js', 'js/systems/combat.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx);
  const e = Object.assign(Object.create(G.Enemy.prototype), { id: 1, x: 0, y: 0, r: 10, hp: 10, shield: 8, bodyH: 20,
    showHurt() {}, die() { this.dead = true; } });
  assert.equal(e.hurt(5), 0); assert.equal(e.hp, 10); assert.equal(e.shield, 3);
  const pl = { x: 100, y: 100, r: 10, dead: true, critChance: 1, dmgDealt: 0, onDealt() { throw Error('viewer lifesteal'); } };
  G.Companions.startRun('run'); const a = G.Companions.spawn({ viewerId: 'one' }, pl);
  G.EnemyMgr.queryCircle = () => [e];
  G.Projectiles.spawn({ x: 0, y: 0, dmg: 50, audience: a.ownership, owner: a });
  G.Combat.resolve(0.016, pl, 1);
  assert.equal(G.Companions.snapshot()[0].damage, 10); assert.equal(G.Companions.snapshot()[0].kills, 1);
  assert.equal(pl.dmgDealt, 0); assert.equal(e.hurt(50), 0);
  G.Projectiles.spawn({ x: 0, y: 0, dmg: 50, audience: a.ownership, owner: a });
  G.Combat.resolve(0.016, pl, 2); assert.equal(G.Companions.snapshot()[0].kills, 1);
});
