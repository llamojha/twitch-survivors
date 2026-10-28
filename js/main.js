/* ============ main.js — arranque ============ */
(() => {
  // Si un archivo no llega a cargarse (conexión móvil que se corta), mejor
  // avisar que arrancar a medias.
  const NEED = ['U', 'Features', 'I18n', 'Settings', 'DB', 'Audio', 'Input', 'Touch', 'Sprites', 'Camera', 'Moves', 'Enemies', 'Upgrades', 'Items',
                'World', 'FX', 'Projectiles', 'EnemyMgr', 'Pickups', 'Player', 'Combat', 'Spawner', 'LevelUp', 'Gacha',
                'Rift', 'Weather', 'Progress', 'Hazards', 'Social', 'Net', 'Coop', 'Ranking', 'Icons', 'UI', 'HUD',
                'AudienceProvider', 'AudienceSession', 'TwitchAudienceProvider', 'Companions',
                'MenuUI', 'RunUI', 'AudienceUI', 'SettingsUI', 'Funding', 'Game', 'Flow'];
  if (G.Features && G.Features.mockAudience) NEED.push('MockAudienceProvider');
  function broken() {
    // (En la versión publicada G no está en window: va encerrado, ver tools/build.js.)
    const miss = NEED.filter(k => typeof G !== 'object' || !G[k]);
    if (!miss.length) return false;
    const el = document.getElementById('boot');
    el.innerHTML = 'The game could not finish loading. Check your connection and try again.<br><button class="btn gold" style="margin-top:12px" onclick="location.reload()">Reload</button>';
    console.warn('[Boot] missing:', miss.join(', '));
    return true;
  }

  // Mantenimiento (mudanza a servidores nuevos): no se entra ni se inicia
  // sesión, así no se escribe nada mientras se copian las cuentas y partidas.
  // Para probar en local: añade ?dev a la dirección.
  const MAINTENANCE = false;
  function maintenance() {
    if (!MAINTENANCE || /[?&]dev\b/.test(location.search)) return false;
    const el = document.getElementById('boot');
    el.setAttribute('translate', 'no');
    el.innerHTML = '<div class="boot-in"><h1>Twitch Survivors</h1><p><b>We are under maintenance.</b></p>' +
      '<p>We are moving the game to new servers so it can stay free for everyone. Your local profile and progress are safe. Please come back in a few hours!</p>' +
      '<button class="btn gold" style="margin-top:12px" onclick="location.reload()">Try again</button></div>';
    return true;
  }

  function boot() {
    if (maintenance()) return;
    if (broken()) return;
    G.I18n.startDom();
    // Espera a la fuente pixel para que la UI no salte al cargarla.
    const ready = document.fonts && document.fonts.load ? document.fonts.load('16px Pixelify') : Promise.resolve();
    ready.catch(() => {}).then(() => G.Flow.boot());
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();

  // Remove the inherited service worker only when its script and scope belong to
  // this app. Other same-origin applications must keep their registrations.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const legacyScript = new URL('sw.js', document.baseURI).href;
    const appScope = new URL('./', document.baseURI).href;
    navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs
      .filter(reg => reg.scope === appScope && [reg.active, reg.installing, reg.waiting]
        .some(worker => worker && worker.scriptURL === legacyScript))
      .map(reg => reg.unregister()))).catch(() => {});
  }
  if ('caches' in window) caches.keys().then(keys => Promise.all(keys
    .filter(key => /^ps-(code|art)-/.test(key))
    .map(key => caches.delete(key)))).catch(() => {});
})();
