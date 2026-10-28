const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function run(file, context) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

test('the original score keeps every runtime track valid and loopable', () => {
  const context = { G: {} };
  run('js/data/music.js', context);

  assert.deepEqual(Object.keys(context.G.MUSIC).sort(),
    ['boss', 'cave', 'forest', 'judgment', 'rift', 'village', 'volcano']);
  assert.deepEqual(Array.from(context.G.BIOME_MUSIC), ['forest', 'cave', 'volcano']);

  for (const [name, song] of Object.entries(context.G.MUSIC)) {
    assert.ok(song.bpm >= 80 && song.bpm <= 180, `${name} has a usable tempo`);
    assert.ok(song.chords.length > 0, `${name} has chords`);
    for (const track of song.melody || []) {
      assert.equal(track.bars.length, song.chords.length, `${name} melody and chords align`);
      for (const bar of track.bars) {
        const steps = bar.trim().split(/\s+/).reduce((sum, token) => sum + Number(token.split(':')[1] || 1), 0);
        assert.equal(steps, 16, `${name} melody bar has 16 steps: ${bar}`);
      }
    }
    for (const part of song.parts || []) assert.equal(part.pattern.length, 16, `${name} part pattern has 16 steps`);
    for (const pattern of Object.values(song.drums || {})) assert.equal(pattern.length, 16, `${name} drum pattern has 16 steps`);
  }
});

test('every release-reachable attack has a bespoke pixel icon', () => {
  const context = { G: { U: { TYPE_COLOR: {} }, Moves: { BY_ID: {} } } };
  run('js/ui/icons.js', context);

  const expected = [
    'tackle', 'ember', 'thunder-shock', 'confusion', 'rock-throw', 'flamethrower',
    'heat-wave', 'razor-leaf', 'fire-spin', 'thunderbolt', 'rock-slide', 'string-shot', 'ice-beam'
  ];
  assert.deepEqual(Object.keys(context.G.Icons.MOVE_ICON).sort(), expected.sort());
  for (const id of expected) {
    const icon = context.G.Icons.UI[context.G.Icons.MOVE_ICON[id]];
    assert.ok(icon, `${id} icon exists`);
    assert.equal(icon.rows.length, 12, `${id} icon is 12 pixels high`);
    assert.ok(icon.rows.every(row => row.length === 12), `${id} icon is 12 pixels wide`);
  }
});

test('the release is locked to English', () => {
  const html = fs.readFileSync(path.join(root, 'dev.html'), 'utf8');
  const i18n = fs.readFileSync(path.join(root, 'js/core/i18n.js'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));

  assert.match(html, /<html lang="en" data-mock-audience="off">/);
  assert.doesNotMatch(html, /data-lang=/);
  assert.doesNotMatch(html, />Español</);
  assert.match(i18n, /const lang = 'en';/);
  assert.doesNotMatch(i18n, /navigator\.language|localStorage\.getItem\([^)]*lang/);
  assert.equal(manifest.lang, 'en');
});
