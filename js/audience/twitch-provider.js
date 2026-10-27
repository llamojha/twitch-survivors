/* ============ twitch-provider.js — entrada Twitch IRC de solo lectura ============ */
(function (root) {
  'use strict';

  const G = root.G = root.G || {};
  const api = typeof require === 'function' ? require('./provider.js') : null;
  const BaseProvider = api ? api.AudienceProvider : G.AudienceProvider;
  const viewerJoin = api ? api.viewerJoin : G.AudienceEvent.viewerJoin;

  const realTimers = {
    setTimeout: (handler, delay) => setTimeout(handler, delay),
    clearTimeout: handle => clearTimeout(handle)
  };

  async function defaultValidator(token, signal) {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: { Authorization: 'OAuth ' + token }, signal
    });
    if (!response.ok) throw new Error('Token validation failed');
    return response.json();
  }

  function parseMessage(line) {
    const match = /^(?:@([^ ]+) )?(?::([^ ]+) )?([^ ]+)(.*)$/.exec(line);
    if (!match) return null;
    const tags = {};
    (match[1] || '').split(';').forEach(item => {
      const separator = item.indexOf('=');
      if (separator < 0) return;
      tags[item.slice(0, separator)] = item.slice(separator + 1).replace(/\\([s:nr\\])/g, (_, escaped) =>
        ({ s: ' ', ':': ';', n: '\n', r: '\r', '\\': '\\' })[escaped] || escaped);
    });
    const rest = match[4].trimStart();
    const trailing = rest.indexOf(' :');
    const text = rest.startsWith(':') ? rest.slice(1) : trailing >= 0 ? rest.slice(trailing + 2) : '';
    const middle = rest.startsWith(':') ? '' : trailing >= 0 ? rest.slice(0, trailing) : rest;
    return { tags, prefix: match[2] || '', command: match[3], params: middle.split(' ').filter(Boolean), text };
  }

  class TwitchAudienceProvider extends BaseProvider {
    constructor(config, createSocket, validate, timers) {
      super();
      this.source = 'twitch';
      this.channel = String(config.channel || '').trim().replace(/^#/, '').toLowerCase();
      this.username = String(config.username || '').trim().toLowerCase();
      this.token = String(config.token || '').trim().replace(/^oauth:/i, '');
      this.createSocket = createSocket || (url => new WebSocket(url));
      this.validate = validate || defaultValidator;
      this.timers = timers || realTimers;
      this.socket = null;
      this.generation = 0;
      this.validationTimer = null;
      this.validationController = null;
      this.confirmTimer = null;
    }

    async connect() {
      this._closeSocket();
      if (!/^[a-z0-9_]{1,25}$/.test(this.channel) || !/^[a-z0-9_]{1,25}$/.test(this.username) ||
          !/^[a-zA-Z0-9]+$/.test(this.token)) {
        this._fail('Enter a valid channel, token-owner username, and Twitch user access token.');
        return;
      }

      const generation = this.generation;
      this._setStatus('connecting', 'Connecting to #' + this.channel + '…');
      if (!await this._checkToken(generation)) return;

      let socket;
      try { socket = this.createSocket('wss://irc-ws.chat.twitch.tv:443'); }
      catch (_) { this._fail('Unable to open Twitch connection.'); return; }
      if (generation !== this.generation) { socket.close(); return; }
      this.socket = socket;
      this.confirmTimer = this.timers.setTimeout(() => {
        if (this.socket === socket) this._fail('Twitch did not confirm the channel. Check credentials and channel, then reconnect.');
      }, 15000);

      socket.onopen = () => {
        if (this.socket !== socket) return;
        socket.send('PASS oauth:' + this.token + '\r\n');
        socket.send('NICK ' + this.username + '\r\n');
        socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership\r\n');
      };
      socket.onmessage = event => {
        if (this.socket !== socket || typeof event.data !== 'string') return;
        for (const line of event.data.split('\r\n')) {
          if (this.socket !== socket) break;
          const message = parseMessage(line);
          if (message) this._receive(message, socket);
        }
      };
      socket.onerror = () => {
        if (this.socket === socket) this._fail('Twitch connection failed. Check your connection and reconnect.');
      };
      socket.onclose = () => {
        if (this.socket === socket) this._fail('Twitch connection closed. Reconnect to resume receiving viewers.');
      };
    }

    async disconnect() {
      this._closeSocket();
      this.token = '';
      this._setStatus('disconnected', 'Twitch disconnected.');
    }

    _receive(message, socket) {
      const { command, params, text, tags, prefix } = message;
      if (command === 'PING') {
        socket.send('PONG :' + (text || params[0] || '') + '\r\n');
      } else if (command === '001') {
        socket.send('JOIN #' + this.channel + '\r\n');
      } else if (command === 'RECONNECT') {
        this._fail('Twitch requested a reconnect. Reconnect to resume receiving viewers.');
      } else if (command === 'NOTICE' && (params[0] === '*' || (params[0] || '').toLowerCase() === '#' + this.channel) &&
        (['msg_banned', 'msg_channel_suspended', 'no_permission'].includes(tags['msg-id']) ||
         /^(Login authentication failed|Improperly formatted auth|Invalid NICK|Login unsuccessful)/i.test(text))) {
        this._fail('Twitch rejected authentication or channel access. Check your token, its chat:read scope, username, and channel.');
      } else if (command === 'CAP' && params.includes('NAK')) {
        this._fail('Twitch rejected required chat capabilities. Reconnect to try again.');
      } else if (['403', '404', '464', '465', '471', '473', '474', '475'].includes(command)) {
        this._fail('Twitch rejected authentication or channel access. Check your settings.');
      } else if ((command === 'ROOMSTATE' && (params[0] || '').toLowerCase() === '#' + this.channel) ||
        (command === 'JOIN' && prefix.split('!')[0].toLowerCase() === this.username &&
         (params[0] || text).toLowerCase() === '#' + this.channel)) {
        if (this.confirmTimer !== null) this.timers.clearTimeout(this.confirmTimer);
        this.confirmTimer = null;
        this._setStatus('connected', 'Listening to #' + this.channel + '. Viewers can type !join.');
      } else if (command === 'PRIVMSG' && (params[0] || '').toLowerCase() === '#' + this.channel &&
        text.trim().toLowerCase() === '!join' && /^\d+$/.test(tags['user-id'] || '')) {
        this._emitEvent(viewerJoin('twitch:' + tags['user-id'], tags['display-name'] || prefix.split('!')[0] || 'Twitch viewer'));
      }
    }

    async _checkToken(generation) {
      if (generation !== this.generation) return false;
      const controller = new AbortController();
      this.validationController = controller;
      const timeout = this.timers.setTimeout(() => {
        if (generation === this.generation) this._fail('Twitch token validation timed out. Reconnect to try again.');
      }, 15000);
      try {
        const data = await this.validate(this.token, controller.signal);
        if (generation !== this.generation) return false;
        if (!data || typeof data !== 'object' || typeof data.login !== 'string' || data.login.toLowerCase() !== this.username ||
            !Array.isArray(data.scopes) || !data.scopes.includes('chat:read') ||
            typeof data.expires_in !== 'number' || !Number.isFinite(data.expires_in) || data.expires_in <= 0 ||
            typeof data.user_id !== 'string' || !/^\d+$/.test(data.user_id)) throw new Error('Invalid token');
        this.validationTimer = this.timers.setTimeout(() => { void this._checkToken(generation); }, Math.min(3600000, data.expires_in * 1000));
        return true;
      } catch (_) {
        if (generation === this.generation) this._fail('Twitch token validation failed. Check the token owner, chat:read scope, and expiry, then reconnect.');
        return false;
      } finally {
        this.timers.clearTimeout(timeout);
        if (this.validationController === controller) this.validationController = null;
      }
    }

    _closeSocket() {
      this.generation += 1;
      if (this.validationController) this.validationController.abort();
      this.validationController = null;
      if (this.validationTimer !== null) this.timers.clearTimeout(this.validationTimer);
      this.validationTimer = null;
      if (this.confirmTimer !== null) this.timers.clearTimeout(this.confirmTimer);
      this.confirmTimer = null;
      const socket = this.socket;
      this.socket = null;
      if (socket) {
        socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
        socket.close();
      }
    }

    _fail(message) {
      this._closeSocket();
      this.token = '';
      this._setStatus('error', message);
    }
  }

  G.TwitchAudienceProvider = TwitchAudienceProvider;
  G.parseTwitchMessage = parseMessage;
  if (typeof module === 'object' && module.exports) module.exports = { TwitchAudienceProvider, parseMessage, defaultValidator };
})(typeof module === 'object' && module.exports ? globalThis : { G });
