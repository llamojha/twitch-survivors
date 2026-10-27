'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');

function runScript(file, context) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file });
}

test('fixed host is neutral and does not mutate the matching enemy roster entry', () => {
  const context = { G: {} };
  runScript('js/data/roster.js', context);

  assert.equal(context.G.HOST_DEX, 25);
  assert.equal(context.G.HOST.dex, 25);
  assert.equal(context.G.HOST.host, true);
  assert.equal(context.G.HOST.start, 'tackle');
  assert.deepEqual(Array.from(context.G.HOST.types), []);
  assert.notEqual(context.G.HOST, context.G.DEX_BY[25]);
  assert.ok(context.G.DEX_BY[25].types.length > 0);
});

test('host level rewards contain only run-stat upgrades', () => {
  const context = {
    Math,
    G: {
      U: { pickN: values => values.slice() },
      Moves: {
        poolFor: () => ['ember'],
        BY_ID: { ember: { type: 'fire', name: 'Ember', desc: 'Special attack', kind: 'ranged' } },
        evoInfo: () => null,
        nextUpText: () => '+damage',
        levelUp: () => true,
        evolve: () => true
      },
      FX: { ring() {}, burst() {} },
      Audio: { sfx() {} },
      Progress: { event() {} },
      U_TYPE_COLOR: {},
      U_TYPE_NAME: {}
    }
  };
  context.G.U.TYPE_COLOR = { fire: '#f00', normal: '#fff' };
  context.G.U.TYPE_NAME = { fire: 'Ember', normal: 'Vanguard' };
  runScript('js/systems/levelup.js', context);

  const host = {
    mon: { host: true }, slots: [{}], maxMoves: 1,
    moves: [{ id: 'tackle', name: 'Tackle', type: 'normal', lvl: 1 }],
    banned: new Set(), statsTaken: {}
  };
  const offer = context.G.LevelUp.offer(host, 3);

  assert.equal(offer.length, 3);
  assert.ok(offer.every(card => card.type === 'stat'));
});

test('saved reroll levels also power audience companions', () => {
  const context = { G: {} };
  runScript('js/data/upgrades.js', context);

  const perks = context.G.Upgrades.perks({ reroll: 2 });
  assert.equal(perks.rerolls, 2);
  assert.equal(perks.audienceDamageMul, 1.1);
});
