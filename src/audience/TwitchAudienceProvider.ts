import type { AudienceEvent, AudienceProvider, AudienceStatus } from './AudienceProvider';

export interface TwitchAudienceConfig {
  channel: string;
  username: string;
  token: string;
}

export type TwitchSocket = Pick<WebSocket, 'onopen' | 'onmessage' | 'onerror' | 'onclose' | 'send' | 'close'>;
export type TwitchSocketFactory = (url: string) => TwitchSocket;
export type TwitchTokenValidator = (token: string, signal: AbortSignal) => Promise<unknown>;

const validateToken: TwitchTokenValidator = async (token, signal) => {
  const response = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: { Authorization: `OAuth ${token}` }, signal,
  });
  if (!response.ok) throw new Error('Token validation failed');
  return response.json();
};

interface IrcMessage {
  tags: Record<string, string>;
  prefix: string;
  command: string;
  params: string[];
  text: string;
}

function parseMessage(line: string): IrcMessage | undefined {
  const match = /^(?:@([^ ]+) )?(?::([^ ]+) )?([^ ]+)(.*)$/.exec(line);
  if (!match) return;
  const tags: Record<string, string> = {};
  for (const item of (match[1] ?? '').split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) continue;
    tags[item.slice(0, separator)] = item.slice(separator + 1).replace(/\\([s:nr\\])/g, (_, escaped: string) =>
      ({ s: ' ', ':': ';', n: '\n', r: '\r', '\\': '\\' })[escaped] ?? escaped);
  }
  const rest = match[4].trimStart();
  const trailing = rest.indexOf(' :');
  const text = rest.startsWith(':') ? rest.slice(1) : trailing >= 0 ? rest.slice(trailing + 2) : '';
  const middle = rest.startsWith(':') ? '' : trailing >= 0 ? rest.slice(0, trailing) : rest;
  return { tags, prefix: match[2] ?? '', command: match[3], params: middle.split(' ').filter(Boolean), text };
}

/** Read-only authenticated Twitch IRC transport. Tokens never leave memory except authentication. */
export class TwitchAudienceProvider implements AudienceProvider {
  private readonly events = new Set<(event: AudienceEvent) => void>();
  private readonly statuses = new Set<(status: AudienceStatus) => void>();
  private socket?: TwitchSocket;
  private generation = 0;
  private validationTimer?: ReturnType<typeof setTimeout>;
  private validationController?: AbortController;
  private timeout?: ReturnType<typeof setTimeout>;
  private status: AudienceStatus = { state: 'disconnected', message: 'Twitch disconnected.' };
  private readonly channel: string;
  private readonly username: string;
  private token: string;

  constructor(config: TwitchAudienceConfig, private readonly createSocket: TwitchSocketFactory = url => new WebSocket(url), private readonly validate: TwitchTokenValidator = validateToken) {
    this.channel = config.channel.trim().replace(/^#/, '').toLowerCase();
    this.username = config.username.trim().toLowerCase();
    this.token = config.token.trim().replace(/^oauth:/i, '');
  }

  onEvent(handler: (event: AudienceEvent) => void): () => void {
    this.events.add(handler);
    return () => this.events.delete(handler);
  }

  onStatus(handler: (status: AudienceStatus) => void): () => void {
    this.statuses.add(handler);
    handler(this.status);
    return () => this.statuses.delete(handler);
  }

  async connect(): Promise<void> {
    this.closeSocket();
    if (!/^[a-z0-9_]{1,25}$/.test(this.channel) || !/^[a-z0-9_]{1,25}$/.test(this.username) || !/^[a-zA-Z0-9]+$/.test(this.token)) {
      this.setStatus('error', 'Enter a valid channel, token-owner username, and Twitch user access token.');
      return;
    }
    const generation = this.generation;
    this.setStatus('connecting', `Connecting to #${this.channel}…`);
    if (!await this.checkToken(generation)) return;
    let socket: TwitchSocket;
    try {
      socket = this.createSocket('wss://irc-ws.chat.twitch.tv:443');
    } catch {
      this.fail('Unable to open Twitch connection.');
      return;
    }
    this.socket = socket;
    this.timeout = setTimeout(() => this.fail('Twitch did not confirm the channel. Check credentials and channel, then reconnect.'), 15000);
    socket.onopen = () => {
      if (this.socket !== socket) return;
      socket.send(`PASS oauth:${this.token}\r\n`);
      socket.send(`NICK ${this.username}\r\n`);
      socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership\r\n');
    };
    socket.onmessage = event => {
      if (this.socket !== socket || typeof event.data !== 'string') return;
      for (const line of event.data.split('\r\n')) {
        if (this.socket !== socket) break;
        const message = parseMessage(line);
        if (message) this.receive(message, socket);
      }
    };
    socket.onerror = () => {
      if (this.socket === socket) this.fail('Twitch connection failed. Check your connection and reconnect.');
    };
    socket.onclose = () => {
      if (this.socket === socket) this.fail('Twitch connection closed. Reconnect to resume receiving viewers.');
    };
  }

  async disconnect(): Promise<void> {
    this.closeSocket();
    this.token = '';
    this.setStatus('disconnected', 'Twitch disconnected.');
  }

  private receive(message: IrcMessage, socket: TwitchSocket): void {
    const { command, params, text, tags, prefix } = message;
    if (command === 'PING') {
      socket.send(`PONG :${text || params[0] || ''}\r\n`);
    } else if (command === '001') {
      socket.send(`JOIN #${this.channel}\r\n`);
    } else if (command === 'RECONNECT') {
      this.fail('Twitch requested a reconnect. Reconnect to resume receiving viewers.');
    } else if (command === 'NOTICE' && (params[0] === '*' || params[0]?.toLowerCase() === `#${this.channel}`) &&
      (['msg_banned', 'msg_channel_suspended', 'no_permission'].includes(tags['msg-id']) ||
        /^(Login authentication failed|Improperly formatted auth|Invalid NICK|Login unsuccessful)/i.test(text))) {
      this.fail('Twitch rejected authentication or channel access. Check your token, its chat:read scope, username, and channel.');
    } else if (command === 'CAP' && params.includes('NAK')) {
      this.fail('Twitch rejected required chat capabilities. Reconnect to try again.');
    } else if (['403', '404', '464', '465', '471', '473', '474', '475'].includes(command)) {
      this.fail('Twitch rejected authentication or channel access. Check your settings.');
    } else if ((command === 'ROOMSTATE' && params[0]?.toLowerCase() === `#${this.channel}`) ||
      (command === 'JOIN' && prefix.split('!')[0].toLowerCase() === this.username && (params[0] || text).toLowerCase() === `#${this.channel}`)) {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = undefined;
      this.setStatus('connected', `Listening to #${this.channel}. Viewers can type !join.`);
    } else if (command === 'PRIVMSG' && params[0]?.toLowerCase() === `#${this.channel}` && text.trim().toLowerCase() === '!join' && /^\d+$/.test(tags['user-id'] ?? '')) {
      const event: AudienceEvent = { type: 'viewer_join', viewer: { id: `twitch:${tags['user-id']}`, displayName: tags['display-name'] || prefix.split('!')[0] || 'Twitch viewer' } };
      this.events.forEach(handler => handler(event));
    }
  }

  private async checkToken(generation: number): Promise<boolean> {
    if (generation !== this.generation) return false;
    const controller = new AbortController();
    this.validationController = controller;
    const timeout = setTimeout(() => {
      if (generation === this.generation) this.fail('Twitch token validation timed out. Reconnect to try again.');
    }, 15000);
    try {
      const result = await this.validate(this.token, controller.signal);
      if (generation !== this.generation) return false;
      if (typeof result !== 'object' || result === null) throw new Error('Invalid token');
      const data = result as Record<string, unknown>;
      if (typeof data.login !== 'string' || data.login.toLowerCase() !== this.username ||
        !Array.isArray(data.scopes) || !data.scopes.includes('chat:read') ||
        typeof data.expires_in !== 'number' || !Number.isFinite(data.expires_in) || data.expires_in <= 0 ||
        typeof data.user_id !== 'string' || !/^\d+$/.test(data.user_id)) throw new Error('Invalid token');
      this.validationTimer = setTimeout(() => { void this.checkToken(generation); }, Math.min(3600000, data.expires_in * 1000));
      return true;
    } catch {
      if (generation === this.generation) this.fail('Twitch token validation failed. Check the token owner, chat:read scope, and expiry, then reconnect.');
      return false;
    } finally {
      clearTimeout(timeout);
      if (this.validationController === controller) this.validationController = undefined;
    }
  }

  private closeSocket(): void {
    this.generation += 1;
    this.validationController?.abort();
    this.validationController = undefined;
    if (this.validationTimer) clearTimeout(this.validationTimer);
    this.validationTimer = undefined;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = undefined;
    const socket = this.socket;
    this.socket = undefined;
    if (socket) {
      socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
      socket.close();
    }
  }

  private fail(message: string): void {
    this.closeSocket();
    this.setStatus('error', message);
  }

  private setStatus(state: AudienceStatus['state'], message: string): void {
    this.status = { state, message };
    this.statuses.forEach(handler => handler(this.status));
  }
}
