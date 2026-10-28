/* ============ settings-ui.js — pantalla de Ajustes (PC y móvil) ============
 * Se abre por encima de lo que haya (menú o pausa) y al cerrar vuelve ahí.
 * Pestañas: Sonido · Gráficos · Controles · Cuenta · Acerca de.
 * Los ajustes son de este dispositivo (G.Settings / G.Audio en el navegador).
 */
G.SettingsUI = (() => {
  const $ = G.UI.$;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VERSION = 'MVP · local';
  const REPO = 'https://github.com/llamojha/twitch-survivors';
  let tab = 'sound';

  function init() {
    document.querySelectorAll('#set-tabs .gen-tab').forEach(b => { b.onclick = () => { tab = b.dataset.t; render(); }; });
    $('set-close').onclick = close;
    $('btn-settings').innerHTML = G.Icons.html('gear', 20);
    $('btn-settings').onclick = () => open();
    $('btn-pause-settings').onclick = () => open('sound');
    // Pantalla completa (si el navegador la permite; en iPhone, cómo conseguirla).
    if (canFull() || iosTip()) {
      $('btn-full').classList.remove('hidden');
      $('btn-full').innerHTML = G.Icons.html('full', 20);
      $('btn-full').onclick = toggleFull;
    }
  }

  function open(t) {
    if (t) tab = t;
    $('scr-settings').classList.remove('hidden');
    render();
  }
  function close() { $('scr-settings').classList.add('hidden'); }
  const isOpen = () => !$('scr-settings').classList.contains('hidden');

  // ---------------- pantalla completa ----------------
  function canFull() { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); }
  function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  // iPhone: Safari no deja poner una web a pantalla completa (por eso a veces
  // no salía la opción). Sí se puede abriéndola desde la pantalla de inicio.
  const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => !!navigator.standalone || (window.matchMedia && matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches);
  function iosTip() { return IOS && !canFull() && !standalone(); }
  const IOS_TIP = 'On iPhone, Safari does not allow websites to enter fullscreen. Tap Share, then "Add to Home Screen", and open the game from that icon.';
  function toggleFull() {
    if (!canFull()) { if (iosTip()) G.UI.toast(IOS_TIP, 9000); return; }
    if (isFull()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else {
      const el = document.documentElement;
      const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      // En móvil, además se intenta fijar la pantalla en horizontal.
      if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* nada */ } }).catch(() => {});
    }
    setTimeout(() => { if (isOpen()) render(); }, 300);
  }

  // ---------------- piezas ----------------
  function section(title, sub) { return `<h3 class="set-h">${esc(title)}</h3>${sub ? `<p class="sub">${sub}</p>` : ''}`; }
  function toggle(key, label, desc) {
    const on = !!G.Settings.get(key);
    return `<div class="set-row"><div class="grow"><b>${esc(label)}</b><small>${esc(desc)}</small></div>
      <button class="btn small switch ${on ? 'gold' : ''}" data-k="${key}">${on ? 'Yes' : 'No'}</button></div>`;
  }
  function choice(key, opts) {
    const cur = G.Settings.get(key);
    return `<div class="chips set-chips">${opts.map(([v, l]) => `<button class="chip ${v === cur ? 'on' : ''}" data-k="${key}" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
  }

  function render() {
    document.querySelectorAll('#set-tabs .gen-tab').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    const box = $('set-body');
    box.scrollTop = 0;
    if (tab === 'sound') {
      box.innerHTML = section('Sound') + '<div id="set-sound" class="sound-inline"></div>';
      G.UI.soundControls($('set-sound'));
    } else if (tab === 'gfx') {
      const auto = ['low', 'medium', 'high'][G.Settings.autoLevel];
      box.innerHTML = section('Quality', 'Controls how many effects and particles are drawn. <b>Auto</b> lowers quality if the game starts stuttering (currently: ' + auto + ').')
        + choice('quality', [['auto', 'Auto'], ['high', 'High'], ['mid', 'Medium'], ['low', 'Low']])
        + section('Display')
        + toggle('dmgNumbers', 'Damage numbers', 'Numbers shown when dealing and receiving damage.')
        + toggle('calm', 'Reduced shake and flashes', 'Reduces camera shake and softens bright flashes.')
        + toggle('fps', 'Show FPS', 'Frames per second, shown in the bottom corner.')
        + (canFull() ? `<div class="set-row"><div class="grow"><b>Fullscreen</b><small>Hide browser controls.</small></div>
             <button class="btn small" id="set-full">${isFull() ? 'Exit' : 'Enable'}</button></div>`
           : iosTip() ? `<div class="set-row"><div class="grow"><b>Fullscreen</b><small>${esc(IOS_TIP)}</small></div></div>` : '');
    } else if (tab === 'ctl') {
      box.innerHTML = section('On mobile or tablet')
        + `<p class="sub">Touch and drag anywhere to move; the joystick appears under your finger. Tap an attack at the bottom to switch it, and use the top-right button to pause. Play in landscape.</p>`
        + `<div class="set-row"><div class="grow"><b>Joystick size</b><small>How far you need to drag.</small></div></div>`
        + choice('stick', [[0.8, 'Small'], [1, 'Normal'], [1.25, 'Large']])
        + section('On desktop')
        + `<div class="keys">
             <div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows</div><span>move</span>
             <div><kbd>1</kbd>–<kbd>4</kbd> or click an icon</div><span>choose attack</span>
             <div><kbd>Q</kbd> / <kbd>E</kbd></div><span>previous / next attack</span>
             <div><kbd>Esc</kbd> or <kbd>P</kbd></div><span>pause</span>
             <div><kbd>1</kbd>–<kbd>3</kbd></div><span>choose a level-up card</span>
           </div>`;
    } else if (tab === 'acc') {
      renderAccount(box);
    } else {
      box.innerHTML = `<div class="about-logo">Twitch Survivors</div><p class="sub center">Version ${esc(VERSION)}</p>`
        + `<p class="sub">Local hackathon build with original fantasy presentation and no ads or purchases.</p>`
        + section('Credits')
        + `<ul class="credits">
             <li><b>Fantasy character tiles:</b> Kenney Tiny Dungeon (CC0).</li>
             <li><b>Music and sound:</b> original and generated by the game.</li>
             <li><b>Font:</b> Pixelify Sans (OFL).</li>
           </ul>`
        + `<div class="row wrap" style="justify-content:center;gap:8px">
             ${window.PS_PAGES ? `<a class="btn small" href="en/guide/" target="_blank">Guide and FAQ</a>
             <a class="btn small" href="en/heroes/" target="_blank">Heroes</a>` : ''}
             <button class="btn small" data-legal>Legal notice and privacy</button>
             <a class="btn small" href="${REPO}" target="_blank" rel="noopener">Source code (GitHub)</a>
           </div>`;
    }
    wire(box);
  }

  function renderAccount(box) {
    box.innerHTML = section('Local profile', 'Progress is stored only in this browser.')
      + `<p class="sub">${G.DB.storageOk ? 'Local storage is available.' : 'Progress cannot be saved. Check your browser storage settings.'}</p>`;
  }

  function wire(box) {
    box.querySelectorAll('.switch[data-k]').forEach(b => { b.onclick = () => { G.Settings.set(b.dataset.k, !G.Settings.get(b.dataset.k)); render(); }; });
    box.querySelectorAll('.chip[data-k]').forEach(b => {
      b.onclick = () => { const v = b.dataset.v; G.Settings.set(b.dataset.k, isNaN(+v) ? v : +v); render(); };
    });
    const full = $('set-full'); if (full) full.onclick = toggleFull;
    const lo = $('set-login'); if (lo) lo.onclick = () => { close(); leave(); };
    const out = $('set-logout'); if (out) out.onclick = () => { close(); leave(); };
    const del = $('set-delete');
    if (del) del.onclick = async () => {
      const ok = await G.UI.confirmDelete();
      if (!ok) return;
      del.disabled = true;
      const r = await G.DB.deleteAccount(ok.pass);
      if (!r.ok) { $('set-msg').textContent = r.error; del.disabled = false; return; }
      close();
      G.UI.toast('Account deleted');
      G.Audio.music(null);
      G.Flow.toLogin();
    };
  }

  /** Cerrar sesión (si estás en una partida, se abandona). */
  function leave() {
    if (G.DB.guest && !confirm('You are playing as a guest. All progress will be lost. Leave anyway?')) return;
    if (G.Game.state !== 'ui') G.Game.quit && G.Game.quit();
    G.Audio.music(null);
    G.DB.logout().then(() => G.Flow.toLogin());
  }

  return { init, open, close, get isOpen() { return isOpen(); } };
})();
