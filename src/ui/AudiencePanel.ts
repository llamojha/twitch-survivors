import { localRunControls } from '../audience/LocalRunControls';
import { audiencePerformance } from '../audience/PerformanceMonitor';
import { STAGES } from '../config';
import { getCoins } from '../systems/SaveSystem';
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
      <p class="audience-note">Solo keeps normal upgrades. Audience levels recruit FIFO; empty-queue credits wait for future joins. Join all admits waiting and future viewers without earning credits. Switching to solo stops recruitment but keeps existing companions.</p>
      <label>Gameplay<select class="audience-enabled"><option value="solo">Solo upgrades</option><option value="audience">Audience companions</option></select></label>
      <label>Recruitment<select class="audience-recruitment"><option value="level">One per level (FIFO)</option><option value="join-all">Join all</option></select></label>
      <p class="audience-credits" role="status"></p>
      <label>Input source<select class="audience-mode"><option value="local">Local simulation</option><option value="twitch">Twitch chat</option></select></label>
      <form class="audience-local">
        <label>Display name<input class="audience-name" value="Alice" maxlength="64" autocomplete="off" required></label>
        <div class="audience-actions"><button type="submit">Join viewer</button><button type="button" class="audience-batch">Add 10 viewers</button></div>
        <button type="button" class="audience-level">Simulate level-up</button>
        <details class="audience-validation"><summary>Local validation controls</summary>
          <p class="audience-note">Simulation only: no progression rewards or unlocks. Start a fresh test run before measuring. Advancing the boss queue grants test-run invincibility but still requires real boss kills; forced endings test lifecycle only.</p>
          <label>Stage<select class="audience-stage"></select></label>
          <button type="button" class="audience-test-start">Start / restart test run</button>
          <div class="audience-actions"><button type="button" class="audience-defeat">Simulate defeat</button><button type="button" class="audience-victory">Simulate victory</button></div>
          <div class="audience-actions"><button type="button" class="audience-candy">Test rare candy</button><button type="button" class="audience-boss">Advance to next boss</button></div>
        </details>
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
      <p class="audience-run-state" role="status"></p>
      <p class="audience-benchmark audience-note"></p>
      <p class="audience-summary" role="status"></p>
      <ol class="audience-contributions" aria-label="Viewer contributions"></ol>
      <ol class="audience-queue" aria-label="Waiting viewer queue"></ol>
      <div class="audience-actions"><button type="button" class="audience-reset">Reset audience</button><button type="button" class="audience-disconnect">Disconnect</button></div>
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
  const stageSelect = find<HTMLSelectElement>('.audience-stage');
  for (const stage of Object.values(STAGES)) {
    const option = document.createElement('option'); option.value = stage.id; option.textContent = stage.name;
    stageSelect.append(option);
  }
  let mock = new MockAudienceProvider();
  let busy = false;
  let disposed = false;
  let nextViewer = 1;
  const controls = Array.from(content.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('input, button, select'));

  let lastContributionText = '';
  function renderTelemetry(): void {
    if (disposed || content.hidden) return;
    const runtime = localRunControls.runtime;
    const state = runtime?.state();
    find<HTMLElement>('.audience-run-state').textContent = state
      ? `${state.simulation ? 'SIMULATION · progression disabled' : 'Progression enabled'} · ${state.stage} · bosses queued ${state.bossIndex}/${state.bossTotal} · Saved coins: ${getCoins()}`
      : `Press Play to start a run. Saved coins: ${getCoins()}`;
    for (const selector of ['.audience-test-start', '.audience-defeat', '.audience-victory', '.audience-candy', '.audience-boss']) {
      find<HTMLButtonElement>(selector).disabled = busy || !runtime || (selector !== '.audience-test-start' && !!state?.finished);
    }
    const summary = audienceSession.getRunSummary();
    const entries = summary?.contributions ?? audienceSession.getContributions();
    find<HTMLElement>('.audience-summary').textContent = summary
      ? `Run ${summary.outcome} · ${entries.length} contributors · ${Math.round(entries.reduce((sum, entry) => sum + entry.damage, 0))} damage · ${entries.reduce((sum, entry) => sum + entry.kills, 0)} kills`
      : 'Live viewer contributions';
    const rows = entries.map(entry => `${entry.viewer.displayName} · ${entry.role.label} · ${Math.round(entry.damage)} damage · ${entry.kills} kills`);
    const signature = JSON.stringify(rows);
    if (signature !== lastContributionText) {
      lastContributionText = signature;
      find<HTMLOListElement>('.audience-contributions').replaceChildren(...rows.map(text => {
        const row = document.createElement('li'); row.textContent = text; return row;
      }));
    }
    const perf = audiencePerformance.snapshot();
    find<HTMLElement>('.audience-benchmark').textContent = `Game-loop timing (foreground only): ${perf.samples} samples · mean ${perf.meanFrameMs.toFixed(1)} ms · p95 ${perf.p95FrameMs.toFixed(1)} ms · max ${perf.maxFrameMs.toFixed(1)} ms · ${perf.activeViewers} viewers · ${perf.visibleLabels} labels · ${perf.activeEnemies} enemies · ${perf.activeProjectiles} shots · ${perf.droppedShots} dropped`;
  }

  function render(): void {
    if (disposed) return;
    find<HTMLSelectElement>('.audience-enabled').value = audienceSession.isEnabled() ? 'audience' : 'solo';
    const recruitment = find<HTMLSelectElement>('.audience-recruitment');
    recruitment.value = audienceSession.getRecruitmentMode();
    recruitment.disabled = busy || !audienceSession.isEnabled();
    find<HTMLButtonElement>('.audience-level').disabled = busy || !audienceSession.canSimulateLevel();
    find<HTMLElement>('.audience-credits').textContent = `${audienceSession.getRecruitmentCredits()} banked recruitment credits`;
    const viewers = audienceSession.getViewers();
    const active = audienceSession.getActiveViewers().length;
    toggle.textContent = `Audience · ${viewers.length} waiting · ${active} active`;
    find<HTMLElement>('.audience-count').textContent = `${viewers.length} waiting · ${active} active`;
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
    renderTelemetry();
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
    render();
  });
  find<HTMLSelectElement>('.audience-enabled').addEventListener('change', event => {
    audienceSession.setEnabled((event.target as HTMLSelectElement).value === 'audience');
  });
  find<HTMLSelectElement>('.audience-recruitment').addEventListener('change', event => {
    audienceSession.setRecruitmentMode((event.target as HTMLSelectElement).value === 'join-all' ? 'join-all' : 'level');
  });
  find<HTMLButtonElement>('.audience-level').addEventListener('click', () => {
    if (!audienceSession.simulateLevel()) feedback.textContent = 'Start or resume a run to simulate a level.';
    render();
  });
  find<HTMLButtonElement>('.audience-test-start').addEventListener('click', () => {
    localRunControls.runtime?.restart(stageSelect.value); renderTelemetry();
  });
  for (const outcome of ['defeat', 'victory'] as const) find<HTMLButtonElement>(`.audience-${outcome}`).addEventListener('click', () => {
    localRunControls.runtime?.end(outcome); renderTelemetry();
  });
  find<HTMLButtonElement>('.audience-candy').addEventListener('click', () => { localRunControls.runtime?.reward(); renderTelemetry(); });
  find<HTMLButtonElement>('.audience-boss').addEventListener('click', () => {
    if (!localRunControls.runtime?.nextBoss()) feedback.textContent = 'Defeat the active boss before advancing.';
    renderTelemetry();
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
    const before = audienceSession.getViewers().length + audienceSession.getActiveViewers().length;
    localRunControls.runtime?.markSimulation();
    mock.join(displayName);
    feedback.textContent = audienceSession.getViewers().length + audienceSession.getActiveViewers().length > before
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
    const before = audienceSession.getViewers().length + audienceSession.getActiveViewers().length;
    localRunControls.runtime?.markSimulation();
    for (let index = 0; index < 10; index++) mock.join(`Viewer ${nextViewer++}`);
    feedback.textContent = `${audienceSession.getViewers().length + audienceSession.getActiveViewers().length - before} viewers added.`;
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
    feedback.textContent = 'Audience reset.';
  });
  find<HTMLButtonElement>('.audience-disconnect').addEventListener('click', () => {
    token.value = '';
    void run(async () => { await audienceSession.disconnect(); });
  });
  const telemetryTimer = window.setInterval(renderTelemetry, 1000);
  const unsubscribe = audienceSession.onChange(render);
  render();
  void run(async () => { await audienceSession.setProvider(mock); });
  return () => {
    disposed = true;
    window.clearInterval(telemetryTimer);
    unsubscribe();
    token.value = '';
    root.remove();
    void audienceSession.disconnect();
  };
}
