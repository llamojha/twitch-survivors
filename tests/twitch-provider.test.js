'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { TwitchAudienceProvider } = require('../js/audience/twitch-provider.js');

function fixture(overrides) {
  const sent = [];
  const socket = { onopen: null, onmessage: null, onerror: null, onclose: null,
    send: value => sent.push(String(value)), close: () => { socket.closed = true; }, closed: false };
  const timers = overrides?.timers || { setTimeout, clearTimeout };
  const validate = overrides?.validate || (async () => ({ login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 7200 }));
  const provider = new TwitchAudienceProvider(
    overrides?.config || { channel: '#Example', username: 'Reader', token: 'oauth:exampletoken' },
    overrides?.createSocket || (() => socket), validate, timers);
  const events = [];
  const statuses = [];
  provider.onEvent(event => events.push(event));
  provider.onStatus(status => statuses.push(status));
  const receive = data => socket.onmessage?.({ data });
  return { provider, socket, sent, events, statuses, receive };
}

test('validates, authenticates, joins, answers PING, and accepts exact !join', async () => {
  const f = fixture();
  await f.provider.connect();
  f.socket.onopen();
  assert.deepEqual(f.sent.slice(0, 2), ['PASS oauth:exampletoken\r\n', 'NICK reader\r\n']);
  f.receive(':tmi.twitch.tv 001 reader :Welcome\r\nPING :tmi.twitch.tv\r\n@room-id=42 :tmi.twitch.tv ROOMSTATE #example\r\n');
  assert.ok(f.sent.includes('JOIN #example\r\n'));
  assert.ok(f.sent.includes('PONG :tmi.twitch.tv\r\n'));
  assert.equal(f.statuses.at(-1).state, 'connected');
  f.receive('@display-name=Viewer\\sName;user-id=123 :viewer!viewer@host PRIVMSG #example :  !JoIn  \r\n');
  f.receive('@user-id=124 :other!other@host PRIVMSG #example :!join extra\r\n');
  f.receive(':missing!missing@host PRIVMSG #example :!join\r\n');
  assert.deepEqual(f.events, [{ type: 'viewer_join', viewer: { id: 'twitch:123', displayName: 'Viewer Name' } }]);
  await f.provider.disconnect();
});

test('rejects invalid owner, scope, expiry, and IRC injection before socket creation', async () => {
  const invalidTokens = [
    { login: 'other', user_id: '1', scopes: ['chat:read'], expires_in: 100 },
    { login: 'reader', user_id: '1', scopes: [], expires_in: 100 },
    { login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 0 }
  ];
  for (const data of invalidTokens) {
    let opened = false;
    const f = fixture({ validate: async () => data, createSocket: () => { opened = true; } });
    await f.provider.connect();
    assert.equal(opened, false);
    assert.equal(f.statuses.at(-1).state, 'error');
    assert.equal(f.statuses.at(-1).message.includes('exampletoken'), false);
    assert.equal(f.provider.token, '');
  }
  let opened = false;
  const injected = fixture({ config: { channel: 'example', username: 'reader', token: 'token\r\nPASS bad' },
    createSocket: () => { opened = true; } });
  await injected.provider.connect();
  assert.equal(opened, false);
  assert.equal(injected.provider.token, '');
});

test('disconnect aborts validation and stale socket callbacks; reconnect stays manual', async () => {
  let resolve;
  let opened = false;
  const slow = fixture({ validate: () => new Promise(done => { resolve = done; }), createSocket: () => { opened = true; } });
  const connecting = slow.provider.connect();
  await slow.provider.disconnect();
  resolve({ login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 100 });
  await connecting;
  assert.equal(opened, false);

  const f = fixture();
  await f.provider.connect();
  const stale = f.socket.onmessage;
  f.receive(':tmi.twitch.tv RECONNECT\r\n');
  assert.equal(f.statuses.at(-1).state, 'error');
  assert.equal(f.socket.closed, true);
  assert.equal(f.provider.token, '');
  stale({ data: '@user-id=9 :late!late@host PRIVMSG #example :!join\r\n' });
  assert.deepEqual(f.events, []);
});

test('injected timers revalidate at expiry cap and sanitize validator failures', async () => {
  const scheduled = [];
  const timers = {
    setTimeout(handler, delay) { const item = { handler, delay, cleared: false }; scheduled.push(item); return item; },
    clearTimeout(item) { item.cleared = true; }
  };
  let validations = 0;
  const f = fixture({ timers, validate: async () => {
    validations += 1;
    if (validations > 1) throw new Error('oauth:secret-server-detail');
    return { login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 7200 };
  } });
  await f.provider.connect();
  const revalidation = scheduled.find(item => item.delay === 3600000 && !item.cleared);
  assert.ok(revalidation);
  await revalidation.handler();
  await Promise.resolve();
  assert.equal(validations, 2);
  assert.equal(f.statuses.at(-1).state, 'error');
  assert.equal(f.statuses.at(-1).message.includes('secret'), false);
  assert.equal(f.provider.token, '');
});
