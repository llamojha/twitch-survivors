#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SCRIPT_BEGIN = '<!-- scripts:begin -->';
const SCRIPT_END = '<!-- scripts:end -->';
const LEGACY_IDENTITY = /(?:pok(?:e|\u00e9)mon|pok(?:e|\u00e9)survivor|pok(?:e|\u00e9)dex|pok(?:e|\u00e9)coin|pikachu|arceus|spritecollab|nintendo|game\s*freak|the\s+pok(?:e|\u00e9)mon\s+company|kanto|johto|hoenn|sinnoh|teselia|unova|kalos|alola|galar|paldea)/iu;
const LEGACY_ASSET_PATH = /(?:^|[\\/])assets[\\/]pokemon(?:[\\/]|$)/iu;
const FORBIDDEN_RELEASE_PATHS = ['assets/pokemon', 'apoyar', 'contacto', 'en', 'guia', 'legendarios', 'logros',
  'movimientos', 'novedades', 'objetos', 'pokedex', 'shinies', 'tipos', 'CREDITS.md', 'sw.js', 'CNAME', 'sitemap.xml',
  '.github/FUNDING.yml', '.firebaserc', 'firebase.json', 'database.rules.json', 'firestore.indexes.json', 'firestore.rules',
  'functions', 'cloudflare', 'js/core/firebase-config.js'];
const RELEASE_METADATA = ['robots.txt', 'manifest.webmanifest'];

const REQUIRED_LICENSES = [
  {
    file: 'assets/fantasy/kenney-tiny-dungeon/LICENSE.txt',
    contains: /creative commons zero|\bCC0\b/iu,
    label: 'Kenney Tiny Dungeon CC0 license'
  },
  {
    file: 'assets/fonts/OFL.txt',
    contains: /SIL OPEN FONT LICENSE Version 1\.1/iu,
    label: 'Pixelify Sans OFL license'
  }
];

const APPROVED_REMOTE_URLS = [
  /^https:\/\/id\.twitch\.tv\/oauth2\/validate(?:$|[/?#])/iu,
  /^wss:\/\/irc-ws\.chat\.twitch\.tv(?::443)?(?:$|[/?#])/iu,
  /^https:\/\/github\.com\/llamojha\/twitch-survivors(?:$|[/?#])/iu,
  /^http:\/\/www\.w3\.org\/2000\/svg$/iu
];

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function extractRuntimeScripts(html) {
  const start = html.indexOf(SCRIPT_BEGIN);
  const end = html.indexOf(SCRIPT_END);
  if (start < 0 || end < start) throw new Error('dev.html is missing the runtime script markers');
  const block = html.slice(start, end + SCRIPT_END.length);
  return [...block.matchAll(/<script\b[^>]*\bsrc=["'](js\/[^"'?]+\.js)(?:\?[^"']*)?["'][^>]*>/giu)]
    .map(match => match[1]);
}

function collectJavaScriptStrings(source) {
  const strings = [];
  let i = 0;

  function skipComment() {
    const next = source[i + 1];
    if (source[i] === '/' && next === '/') {
      i += 2;
      while (i < source.length && source[i] !== '\n') i++;
      return true;
    }
    if (source[i] === '/' && next === '*') {
      const close = source.indexOf('*/', i + 2);
      i = close < 0 ? source.length : close + 2;
      return true;
    }
    return false;
  }

  function readQuoted(quote) {
    let value = '';
    i++;
    while (i < source.length) {
      const current = source[i++];
      if (current === '\\') {
        if (i < source.length) value += current + source[i++];
      } else if (current === quote) {
        break;
      } else {
        value += current;
      }
    }
    strings.push(value);
  }

  function scanExpression() {
    let depth = 1;
    while (i < source.length && depth > 0) {
      if (skipComment()) continue;
      const ch = source[i];
      if (ch === "'" || ch === '"') readQuoted(ch);
      else if (ch === '`') readTemplate();
      else if (ch === '{') { depth++; i++; }
      else if (ch === '}') { depth--; i++; }
      else i++;
    }
  }

  function readTemplate() {
    let value = '';
    i++;
    while (i < source.length) {
      const current = source[i++];
      if (current === '\\') {
        if (i < source.length) value += current + source[i++];
      } else if (current === '`') {
        break;
      } else if (current === '$' && source[i] === '{') {
        value += '${}';
        i++;
        scanExpression();
      } else {
        value += current;
      }
    }
    strings.push(value);
  }

  while (i < source.length) {
    if (skipComment()) continue;
    const ch = source[i];
    if (ch === "'" || ch === '"') readQuoted(ch);
    else if (ch === '`') readTemplate();
    else i++;
  }
  return strings;
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/gu, '');
}

function urlsIn(text) {
  return text.match(/(?:https?|wss):\/\/[^\s'"`<>\\)]+/giu) || [];
}

function isApprovedRemoteUrl(url) {
  if (/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:$|[/?#])/iu.test(url)) return true;
  return APPROVED_REMOTE_URLS.some(rule => rule.test(url));
}

function verifyRequiredLicenses(root) {
  const errors = [];
  for (const license of REQUIRED_LICENSES) {
    const absolute = path.join(root, license.file);
    if (!fs.existsSync(absolute)) {
      errors.push(`${license.file}: missing ${license.label}`);
      continue;
    }
    if (!license.contains.test(read(absolute))) {
      errors.push(`${license.file}: does not identify the expected ${license.label}`);
    }
  }
  return errors;
}

function servedHtmlFiles(root) {
  const files = [];
  const ignored = new Set(['.git', 'node_modules', 'tools']);
  function visit(directory, relative = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const childRelative = path.join(relative, entry.name);
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute, childRelative);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(childRelative);
    }
  }
  visit(root);
  return files.sort();
}

function auditReleaseAssets(root = path.join(__dirname, '..')) {
  const errors = [];
  const devFile = path.join(root, 'dev.html');
  if (!fs.existsSync(devFile)) return { errors: ['dev.html: missing release source document'], scripts: [] };

  const html = read(devFile);
  let scripts;
  try {
    scripts = extractRuntimeScripts(html);
  } catch (error) {
    return { errors: [error.message], scripts: [] };
  }

  const sources = servedHtmlFiles(root).map(file => ({ file, strings: [stripHtmlComments(read(path.join(root, file)))] }));
  for (const file of RELEASE_METADATA) {
    const absolute = path.join(root, file);
    if (fs.existsSync(absolute)) sources.push({ file, strings: [read(absolute)] });
  }
  for (const relative of scripts) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) {
      errors.push(`${relative}: runtime script is missing`);
      continue;
    }
    sources.push({ file: relative, strings: collectJavaScriptStrings(read(absolute)) });
  }

  for (const source of sources) {
    for (const value of source.strings) {
      if (LEGACY_ASSET_PATH.test(value)) {
        errors.push(`${source.file}: ships a legacy asset path (${value.slice(0, 120)})`);
      }
      if (LEGACY_IDENTITY.test(value)) {
        const match = value.match(LEGACY_IDENTITY);
        errors.push(`${source.file}: ships visible legacy identity (${match[0]})`);
      }
      for (const url of urlsIn(value)) {
        if (!isApprovedRemoteUrl(url)) errors.push(`${source.file}: unapproved remote URL (${url})`);
      }
    }
  }

  for (const relative of FORBIDDEN_RELEASE_PATHS) {
    if (fs.existsSync(path.join(root, relative))) errors.push(`${relative}: inherited path is present in the release tree`);
  }

  errors.push(...verifyRequiredLicenses(root));
  return { errors: [...new Set(errors)].sort(), scripts };
}

function main() {
  const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
  const result = auditReleaseAssets(root);
  if (result.errors.length) {
    console.error(`Release asset audit failed with ${result.errors.length} issue(s):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Release asset audit passed: ${result.scripts.length} runtime scripts, served HTML, forbidden paths, remote URLs, and ${REQUIRED_LICENSES.length} required licenses checked.`);
}

if (require.main === module) main();

module.exports = {
  auditReleaseAssets,
  collectJavaScriptStrings,
  extractRuntimeScripts,
  isApprovedRemoteUrl,
  servedHtmlFiles,
  stripHtmlComments,
  verifyRequiredLicenses
};
