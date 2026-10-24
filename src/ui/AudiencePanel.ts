import { audienceSession } from '../audience/AudienceSession';
import { MockAudienceProvider } from '../audience/MockAudienceProvider';
import { TwitchAudienceProvider } from '../audience/TwitchAudienceProvider';
import './audience-panel.css';

/** DOM controls stay independent of scenes and never interpret chat as markup. */
export function mountAudiencePanel(): () => void {
  const root = document.createElement('aside');
  root.className = 'audience-panel';
  root.setAttribute('aria-label', 'Audience controls');
  root.innerHTML = `
    <button type="button" class="audience-toggle" aria-expanded="false" aria-controls="audience-content">Audience · 0</button>
    <section id="audience-content" hidden>
      <div class="audience-heading"><strong>Waiting viewers</strong><span class="audience-count">0 queued</span></div>
      <p class="audience-note">Send !join to enter the queue. Recruitment comes later. Each new run resets the queue.</p>
      <label>Input source<select class="audience-mode"><option value="local">Local simulation</option><option value="twitch">Twitch chat</option></select></label>
      <form class="audience-local">
        <label>Display name<input class="audience-name" value="Alice" maxlength="64" autocomplete="off" required></label>
        <div class="audience-actions"><button type="submit">Join viewer</button><button type="button" class="audience-batch">Add 10 viewers</button></div>
        <button type="button" class="audience-reconnect" hidden>Reconnect local simulation</button>
      </form>
      <form class="audience-twitch" hidden>
        <label>Channel<input class="audience-channel" placeholder="Channel name" maxlength="25" autocomplete="off" required></label>
        <label>Token owner's username<input class="audience-username" placeholder="Twitch username" maxlength="25" autocomplete="off" required></label>
        <label>User access token<input class="audience-token" type="password" autocomplete="off" spellcheck="false" required></label>
        <p class="audience-note">Use a Twitch user token with chat:read permission. Keep it out of chat. The token is used only for this connection and is never saved.</p>
        <button type="submit">Connect to Twitch</button>
      </form>
      <p class="audience-status" role="status" aria-live="polite"></p>
      <p class="audience-feedback" role="status" aria-live="polite"></p>
      <ol class="audience-queue" aria-label="Waiting viewer queue"></ol>
      <div class="audience-actions"><button type="button" class="audience-reset">Reset queue</button><button type="button" class="audience-disconnect">Disconnect</button></div>
    </section>`;
  document.body.append(root);
  function find<T extends HTMLElement>(selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error('Audience panel control is missing.');
    return element;
  }
  const toggle = find<HTMLButtonElement>('.audience-toggle');
  const content = find<HTMLElement>('#audience-content');
  const mode = find<HTMLSelectElement>('.audience-mode');
  const localForm = find<HTMLFormElement>('.audience-local');
  const twitchForm = find<HTMLFormElement>('.audience-twitch');
  const name = find<HTMLInputElement>('.audience-name');
  const channel = find<HTMLInputElement>('.audience-channel');
  const username = find<HTMLInputElement>('.audience-username');
  const token = find<HTMLInputElement>('.audience-token');
  const status = find<HTMLElement>('.audience-status');
  const feedback = find<HTMLElement>('.audience-feedback');
  const queue = find<HTMLOListElement>('.audience-queue');
  let mock = new MockAudienceProvider();
  let busy = false;
  let disposed = false;
  let nextViewer = 1;
  const controls = Array.from(content.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input, button, select'));

  function render(): void {
    if (disposed) return;
    const viewers = audienceSession.getViewers();
    toggle.textContent = `Audience · ${viewers.length}`;
    find<HTMLElement>('.audience-count').textContent = `${viewers.length} queued`;
    queue.replaceChildren();
    for (const viewer of viewers) {
      const item = document.createElement('li');
      item.textContent = viewer.displayName;
      item.title = viewer.displayName;
      queue.append(item);
    }
    if (!viewers.length) {
      const item = document.createElement('li');
      item.className = 'audience-empty';
      item.textContent = 'No viewers waiting yet.';
      queue.append(item);
    }
    const current = audienceSession.getStatus();
    status.textContent = current.message;
    find<HTMLButtonElement>('.audience-reconnect').hidden = mode.value !== 'local' || current.state !== 'disconnected';
  }

  async function run(operation: () => Promise<void>): Promise<void> {
    if (busy || disposed) return;
    busy = true;
    controls.forEach(control => { control.disabled = true; });
    feedback.textContent = '';
    try {
      await operation();
    } catch {
      // Never render a raw transport error: it may contain connection credentials.
      feedback.textContent = 'Unable to connect. Check the channel, username and token, then try again.';
    } finally {
      busy = false;
      controls.forEach(control => { control.disabled = false; });
      render();
    }
  }

  root.addEventListener('keydown', event => { event.stopPropagation(); });
  root.addEventListener('keyup', event => { event.stopPropagation(); });
  root.addEventListener('pointerdown', event => { event.stopPropagation(); });
  toggle.addEventListener('click', () => {
    content.hidden = !content.hidden;
    toggle.setAttribute('aria-expanded', String(!content.hidden));
  });
  mode.addEventListener('change', () => {
    localForm.hidden = mode.value !== 'local';
    twitchForm.hidden = mode.value !== 'twitch';
    token.value = '';
    void run(async () => {
      await audienceSession.disconnect();
      if (mode.value === 'local') {
        mock = new MockAudienceProvider();
        await audienceSession.setProvider(mock);
      }
    });
  });
  localForm.addEventListener('submit', event => {
    event.preventDefault();
    if (busy) return;
    const displayName = name.value.trim();
    if (!displayName) return;
    const before = audienceSession.getViewers().length;
    mock.join(displayName);
    feedback.textContent = audienceSession.getViewers().length > before
      ? `${displayName} joined the queue.`
      : 'No viewer added. Duplicate names are ignored; reconnect local simulation if disconnected.';
  });
  find<HTMLButtonElement>('.audience-reconnect').addEventListener('click', () => {
    void run(async () => {
      mock = new MockAudienceProvider();
      await audienceSession.setProvider(mock);
    });
  });
  find<HTMLButtonElement>('.audience-batch').addEventListener('click', () => {
    const before = audienceSession.getViewers().length;
    for (let index = 0; index < 10; index++) mock.join(`Viewer ${nextViewer++}`);
    feedback.textContent = `${audienceSession.getViewers().length - before} viewers added.`;
  });
  twitchForm.addEventListener('submit', event => {
    event.preventDefault();
    if (busy) return;
    const options = { channel: channel.value.trim(), username: username.value.trim(), token: token.value.trim() };
    token.value = '';
    void run(async () => { await audienceSession.setProvider(new TwitchAudienceProvider(options)); });
  });
  find<HTMLButtonElement>('.audience-reset').addEventListener('click', () => {
    audienceSession.reset();
    feedback.textContent = 'Queue reset.';
  });
  find<HTMLButtonElement>('.audience-disconnect').addEventListener('click', () => {
    token.value = '';
    void run(async () => { await audienceSession.disconnect(); });
  });
  const unsubscribe = audienceSession.onChange(render);
  render();
  void run(async () => { await audienceSession.setProvider(mock); });
  return () => {
    disposed = true;
    unsubscribe();
    token.value = '';
    root.remove();
    void audienceSession.disconnect();
  };
}
