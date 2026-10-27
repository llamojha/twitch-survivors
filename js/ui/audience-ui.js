/* Audience setup and compact in-run controls. Tokens stay only in provider memory. */
G.AudienceUI = (() => {
  const $ = G.UI.$;
  const session = G.audienceSession;
  let mock = null;
  let twitchHostName = '';

  const esc = value => String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[c]);

  function init() {
    $('aud-close').onclick = () => G.MenuUI.open();
    $('aud-enable').onchange = () => session.setEnabled($('aud-enable').checked);
    $('aud-mode').onchange = () => session.setRecruitmentMode($('aud-mode').value);
    $('aud-run-mode').onclick = () => {
      session.setRecruitmentMode(session.getRecruitmentMode() === 'level' ? 'join-all' : 'level');
    };
    $('aud-run-add').onclick = async () => { await ensureMock(); mock.joinBatch(1); };
    $('aud-mock-connect').onclick = connectMock;
    $('aud-mock-add').onclick = addMock;
    $('aud-mock-name').onkeydown = event => { if (event.key === 'Enter') addMock(); };
    $('aud-mock-ten').onclick = async () => { await ensureMock(); mock.joinBatch(10); };
    $('aud-twitch-connect').onclick = connectTwitch;
    $('aud-disconnect').onclick = () => { twitchHostName = ''; session.disconnect(); };
    session.onChange(render);
    session.setEnabled(true);
    connectMock();
  }

  async function ensureMock() {
    if (!mock) mock = new G.MockAudienceProvider();
    if (!mock.connected) await session.setProvider(mock);
    return mock;
  }

  async function connectMock() {
    twitchHostName = '';
    await ensureMock();
  }

  async function addMock() {
    await ensureMock();
    const input = $('aud-mock-name');
    const name = input.value.trim() || 'Alice';
    if (!mock.join(name)) return;
    input.value = '';
  }

  function connectTwitch() {
    const config = {
      channel: $('aud-channel').value,
      username: $('aud-username').value,
      token: $('aud-token').value
    };
    twitchHostName = config.channel.trim().replace(/^#/, '').slice(0, 25);
    $('aud-token').value = '';
    void session.setProvider(new G.TwitchAudienceProvider(config));
  }

  function open() {
    G.UI.show('scr-audience', true);
    render();
  }

  function statusClass(state) {
    return state === 'connected' ? 'ok' : state === 'error' ? 'bad' : 'wait';
  }

  function render() {
    const status = session.getStatus();
    const waiting = session.getViewers();
    const active = session.getActiveViewers();
    const mode = session.getRecruitmentMode();
    const enabled = session.isEnabled();
    const inRun = G.Game && G.Game.player && !['ui', 'over'].includes(G.Game.state);
    $('aud-enable').checked = enabled;
    $('aud-mode').value = mode;
    $('aud-status').className = 'aud-status ' + statusClass(status.state);
    $('aud-status').textContent = status.message;
    $('aud-counts').textContent = `${active.length} active · ${waiting.length} waiting`;
    $('aud-queue').innerHTML = waiting.length
      ? waiting.slice(0, 20).map((v, i) => `<li><b>${i + 1}</b><span>${esc(v.displayName)}</span></li>`).join('')
      : '<li class="empty">No viewers waiting. Add a mock viewer or ask chat to type !join during the run.</li>';
    $('aud-run').classList.toggle('hidden', !inRun || !enabled);
    $('aud-run-mode').textContent = mode === 'join-all' ? 'Join all: on' : `Level mode${session.getRecruitmentCredits() ? ` · ${session.getRecruitmentCredits()} credit` : ''}`;
    $('aud-run-count').textContent = `${active.length} active · ${waiting.length} waiting`;
    const leaders = G.Companions ? G.Companions.snapshot().sort((a, b) => b.damage - a.damage).slice(0, 3) : [];
    $('aud-run-leaders').textContent = leaders.map(v => `${v.displayName} ${Math.round(v.damage)}`).join(' · ');
  }

  function runChanged() { render(); }

  function hostDisplayName() {
    return twitchHostName || (G.DB && G.DB.user) || 'Streamer';
  }

  return { init, open, render, runChanged, hostDisplayName };
})();
