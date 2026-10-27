'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const test = require('node:test');
const path = require('node:path');
const {
  auditReleaseAssets,
  collectJavaScriptStrings,
  extractRuntimeScripts,
  isApprovedRemoteUrl,
  servedHtmlFiles,
  stripHtmlComments,
  verifyRequiredLicenses
} = require('../tools/audit-release-assets.js');

const ROOT = path.join(__dirname, '..');

test('extractRuntimeScripts follows the build script block only', () => {
  const html = `
    <script src="js/ignored.js"></script>
    <!-- scripts:begin -->
    <script defer src="js/core/util.js"></script>
    <script defer src="js/game.js?v=1"></script>
    <!-- scripts:end -->`;
  assert.deepEqual(extractRuntimeScripts(html), ['js/core/util.js', 'js/game.js']);
});

test('collectJavaScriptStrings ignores comments but keeps visible strings and paths', () => {
  const source = `
    // "Pokémon" in a developer comment is not visible.
    /* 'assets/pokemon/25/Idle.png' is also only a comment. */
    const title = "Pokémon";
    const sprite = \`assets/pokemon/\${dex}/Idle.png\`;
  `;
  assert.deepEqual(collectJavaScriptStrings(source), [
    'Pokémon',
    'assets/pokemon/${}/Idle.png'
  ]);
});

test('collectJavaScriptStrings follows nested template expressions', () => {
  const source = 'const result = `safe ${ready ? `Ante Arceus ${name}` : "fallback"}`;';
  assert.deepEqual(collectJavaScriptStrings(source), ['Ante Arceus ${}', 'fallback', 'safe ${}']);
});

test('stripHtmlComments excludes development notes from visible-copy checks', () => {
  assert.equal(stripHtmlComments('before<!-- Pokémon migration note -->after'), 'beforeafter');
});

test('remote URL policy permits only required runtime services and project links', () => {
  assert.equal(isApprovedRemoteUrl('https://id.twitch.tv/oauth2/validate'), true);
  assert.equal(isApprovedRemoteUrl('wss://irc-ws.chat.twitch.tv:443'), true);
  assert.equal(isApprovedRemoteUrl('https://github.com/llamojha/twitch-survivors'), true);
  assert.equal(isApprovedRemoteUrl('http://127.0.0.1:9099'), true);
  assert.equal(isApprovedRemoteUrl('https://example.com/tracker'), false);
  assert.equal(isApprovedRemoteUrl('https://www.gstatic.com/firebasejs/13.0.0/'), false);
});

test('release-cleared fantasy assets retain their license files', () => {
  assert.deepEqual(verifyRequiredLicenses(ROOT), []);
});

test('servedHtmlFiles recursively inventories browser-visible documents', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'twitch-survivors-html-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'nested'));
  fs.mkdirSync(path.join(root, 'node_modules'));
  fs.writeFileSync(path.join(root, 'index.html'), 'ok');
  fs.writeFileSync(path.join(root, 'nested', 'page.html'), 'ok');
  fs.writeFileSync(path.join(root, 'node_modules', 'ignored.html'), 'ignored');
  assert.deepEqual(servedHtmlFiles(root), ['index.html', path.join('nested', 'page.html')]);
});

test('audit reports release-tree assets, visible identity, and remote services', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'twitch-survivors-audit-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'js'), { recursive: true });
  fs.mkdirSync(path.join(root, 'assets', 'pokemon'), { recursive: true });
  fs.mkdirSync(path.join(root, 'pokedex'), { recursive: true });
  fs.mkdirSync(path.join(root, 'assets', 'fantasy', 'kenney-tiny-dungeon'), { recursive: true });
  fs.mkdirSync(path.join(root, 'assets', 'fonts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'dev.html'), '<!-- scripts:begin --><script src="js/game.js"></script><!-- scripts:end -->');
  fs.writeFileSync(path.join(root, 'pokedex', 'index.html'), '<p>Kanto collection</p>');
  fs.writeFileSync(path.join(root, 'js', 'game.js'), 'const title = "Pokémon"; const api = "https://example.com/api";');
  fs.writeFileSync(path.join(root, 'assets', 'fantasy', 'kenney-tiny-dungeon', 'LICENSE.txt'), 'Creative Commons Zero CC0');
  fs.writeFileSync(path.join(root, 'assets', 'fonts', 'OFL.txt'), 'SIL OPEN FONT LICENSE Version 1.1');

  const result = auditReleaseAssets(root);
  assert.equal(result.errors.some(error => error.includes('assets/pokemon')), true);
  assert.equal(result.errors.some(error => error.includes('pokedex')), true);
  assert.equal(result.errors.some(error => error.includes('legacy identity (Kanto)')), true);
  assert.equal(result.errors.some(error => error.includes('visible legacy identity (Pokémon)')), true);
  assert.equal(result.errors.some(error => error.includes('unapproved remote URL (https://example.com/api)')), true);
});
