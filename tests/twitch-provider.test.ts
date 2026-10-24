import assert from 'node:assert/strict';
import test from 'node:test';
import { TwitchAudienceProvider, type TwitchSocket } from '../src/audience/TwitchAudienceProvider';
import type { AudienceEvent, AudienceStatus } from '../src/audience/AudienceProvider';

function fixture() {
  const sent: string[] = [];
  let closed = false;
  const socket: TwitchSocket = {
    onopen: null, onmessage: null, onerror: null, onclose: null,
    send: data => { sent.push(String(data)); }, close: () => { closed = true; },
  };
  const provider = new TwitchAudienceProvider({ channel: '#Example', username: 'Reader', token: 'oauth:exampletoken' }, () => socket, async () => ({ login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 7200 }));
  const events: AudienceEvent[] = [];
  const statuses: AudienceStatus[] = [];
  provider.onEvent(event => events.push(event));
  provider.onStatus(status => statuses.push(status));
  const receive = (data: string) => socket.onmessage?.call(socket as WebSocket, { data } as MessageEvent);
  return { provider, socket, sent, events, statuses, receive, isClosed: () => closed };
}

test('authenticates, joins after welcome, answers ping and normalizes exact commands with stable IDs', async () => {
  const f = fixture();
  await f.provider.connect();
  f.socket.onopen?.call(f.socket as WebSocket, {} as Event);
  assert.deepEqual(f.sent.slice(0, 2), ['PASS oauth:exampletoken\r\n', 'NICK reader\r\n']);
  assert.ok(f.sent[2].includes('twitch.tv/tags'));
  f.receive(':tmi.twitch.tv 001 reader :Welcome\r\nPING :tmi.twitch.tv\r\n@room-id=42 :tmi.twitch.tv ROOMSTATE #example\r\n');
  assert.ok(f.sent.includes('JOIN #example\r\n'));
  assert.ok(f.sent.includes('PONG :tmi.twitch.tv\r\n'));
  assert.equal(f.statuses.at(-1)?.state, 'connected');
  f.receive('@display-name=Viewer\\sName;user-id=123 :viewer!viewer@host PRIVMSG #example :  !JoIn  \r\n');
  f.receive('@user-id=123 :viewer!viewer@host PRIVMSG #example :!join extra\r\n@user-id=123 :viewer!viewer@host PRIVMSG #another :!join\r\n:viewer!viewer@host PRIVMSG #example :!join\r\n');
  assert.deepEqual(f.events, [{ type: 'viewer_join', viewer: { id: 'twitch:123', displayName: 'Viewer Name' } }]);
  await f.provider.disconnect();
});

test('reports authentication failure without exposing server text or token', async () => {
  const f = fixture();
  await f.provider.connect();
  f.receive(':tmi.twitch.tv NOTICE * :Login authentication failed exampletoken\r\n');
  assert.equal(f.statuses.at(-1)?.state, 'error');
  assert.ok(f.isClosed());
  assert.ok(!f.statuses.at(-1)?.message.includes('exampletoken'));
});

test('disconnect ignores stale callbacks and removes listeners', async () => {
  const f = fixture();
  await f.provider.connect();
  const stale = f.socket.onmessage;
  await f.provider.disconnect();
  stale?.call(f.socket as WebSocket, { data: '@user-id=123 :viewer!viewer@host PRIVMSG #example :!join\r\n' } as MessageEvent);
  assert.equal(f.events.length, 0);
  assert.equal(f.statuses.at(-1)?.state, 'disconnected');
  assert.equal(f.socket.onmessage, null);
  assert.ok(f.isClosed());
});

test('rejects IRC injection before creating a socket', async () => {
  let created = false;
  const provider = new TwitchAudienceProvider({ channel: 'example', username: 'reader', token: 'token\r\nPRIVMSG #example :bad' }, () => { created = true; throw new Error(); });
  const statuses: AudienceStatus[] = [];
  provider.onStatus(status => statuses.push(status));
  await provider.connect();
  assert.equal(created, false);
  assert.equal(statuses.at(-1)?.state, 'error');
});

test('server reconnect request closes transport and requires explicit reconnect', async () => {
  const f = fixture();
  await f.provider.connect();
  f.receive(':tmi.twitch.tv RECONNECT\r\n');
  assert.equal(f.statuses.at(-1)?.state, 'error');
  assert.ok(f.isClosed());
});


test('harmless channel notices do not end the connection', async () => {
  const f = fixture();
  await f.provider.connect();
  f.receive('@msg-id=room_mods :tmi.twitch.tv NOTICE #example :The moderators are: someone\r\n');
  assert.equal(f.isClosed(), false);
  assert.equal(f.statuses.at(-1)?.state, 'connecting');
  f.receive('@msg-id=msg_channel_suspended :tmi.twitch.tv NOTICE #example :Channel unavailable\r\n');
  assert.equal(f.statuses.at(-1)?.state, 'error');
});

test('validates token ownership, scopes and expiry before opening a socket', async () => {
  for (const invalid of [
    { login: 'other', user_id: '1', scopes: ['chat:read'], expires_in: 100 },
    { login: 'reader', user_id: '1', scopes: [], expires_in: 100 },
    { login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 0 },
  ]) {
    let opened = false;
    const provider = new TwitchAudienceProvider({ channel: 'example', username: 'reader', token: 'secret' }, () => { opened = true; throw new Error(); }, async () => invalid);
    const statuses: AudienceStatus[] = [];
    provider.onStatus(status => statuses.push(status));
    await provider.connect();
    assert.equal(opened, false);
    assert.equal(statuses.at(-1)?.state, 'error');
    assert.ok(!statuses.at(-1)?.message.includes('secret'));
  }
});

test('disconnect during validation prevents stale socket creation', async () => {
  let resolve: (value: unknown) => void = () => {};
  let opened = false;
  const provider = new TwitchAudienceProvider({ channel: 'example', username: 'reader', token: 'secret' }, () => { opened = true; throw new Error(); }, () => new Promise(done => { resolve = done; }));
  const connecting = provider.connect();
  await provider.disconnect();
  resolve({ login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 7200 });
  await connecting;
  assert.equal(opened, false);
});

test('hourly token revalidation closes revoked sessions and cleans up timers', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const f = fixture();
  let validations = 0;
  const provider = new TwitchAudienceProvider({ channel: 'example', username: 'reader', token: 'secret' }, () => f.socket, async () => {
    validations += 1;
    if (validations > 1) throw new Error('Sensitive server detail');
    return { login: 'reader', user_id: '1', scopes: ['chat:read'], expires_in: 7200 };
  });
  const statuses: AudienceStatus[] = [];
  provider.onStatus(status => statuses.push(status));
  await provider.connect();
  f.receive('@room-id=42 :tmi.twitch.tv ROOMSTATE #example\r\n');
  context.mock.timers.tick(3600000);
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(validations, 2);
  assert.equal(statuses.at(-1)?.state, 'error');
  assert.ok(f.isClosed());
  assert.ok(!statuses.at(-1)?.message.includes('Sensitive'));
  await provider.disconnect();
  context.mock.timers.tick(3600000);
  assert.equal(validations, 2);
});
