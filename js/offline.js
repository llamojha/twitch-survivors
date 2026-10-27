/* Explicit local adapters. Network modules are not loaded by dev.html. */
(() => {
  const noop = () => {};
  const disabled = async () => ({ ok: false, error: 'Online services are disabled in this build.' });
  const TZ = 'Europe/Madrid';
  function madridDate(date) {
    const p = {};
    for (const x of new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)) p[x.type] = x.value;
    return { y: +p.year, m: +p.month, d: +p.day };
  }

  /** Semana ISO (lunes a domingo) de una fecha y-m-d. */
  function isoWeek(y, m, d) {
    const t = new Date(Date.UTC(y, m - 1, d));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return { year: t.getUTCFullYear(), week: Math.ceil(((t - y0) / 86400000 + 1) / 7) };
  }

  const ALL = 'all2';                     // histórico (ver arriba)
  function periodIds(date = new Date()) {
    const { y, m, d } = madridDate(date);
    const w = isoWeek(y, m, d);
    const p2 = n => String(n).padStart(2, '0');
    return { d: 'd' + y + p2(m) + p2(d), w: 'w' + w.year + '-' + p2(w.week), m: 'm' + y + p2(m), y: 'y' + y, a: 'all2' };
  }

  function profileData() {
    const s = G.DB.save, st = s.stats, prof = s.profile || {};
    const unlocked = G.AchDefs.LIST.filter(a => s.ach && s.ach[a.id]);
    const medals = unlocked.slice().sort((a, b) => (b.tier - a.tier) || (s.ach[b.id] - s.ach[a.id])).slice(0, 8).map(a => a.id);
    return {
      name: G.DB.user,
      favs: (prof.favs || []).slice(0, 3).map(f => ({ dex: f.dex | 0, shiny: !!f.shiny })),
      title: prof.title || '',
      best: { solo: st.bestTime | 0, group: st.bestGroupTime | 0, level: st.bestLevel | 0, bosses: st.bossesTotal | 0,
              legends: Object.keys(s.legends || {}).length, kills: st.totalKills | 0, medals: unlocked.length },
      medals
    };
  }


  G.Social = {
    me: null, uid: null, room: null, friends: [], invites: [], started: false, MAX_PLAYERS: 1,
    on: noop, off: noop, start: disabled, publishProfile: noop, setPlaying: noop,
    setOpen: noop, profileData, getProfile: async () => null
  };
  G.Net = { open: disabled, close: noop, mode: 'offline', slow: false };
  G.Coop = {
    active: false, isHost: false, members: [], ANIMS: [], COLORS: [],
    players: () => G.Game && G.Game.player ? [G.Game.player] : [],
    puppets: () => [], mates: () => [], scaleHp: () => 1, scaleRate: () => 1, xpFactor: () => 1,
    begin: disabled, leave: noop, end: noop, tick: noop, cast: noop,
    broadcast: noop, toHost: noop, say: noop, hit: noop, status: noop,
    enemyAdded: noop, enemyGone: noop, enemyShot: noop, hurtShown: noop,
    pickupAdded: noop, pickupGone: noop, propBroken: noop, collected: noop,
    holdStart: noop, holdEnd: noop, levelStart: noop, localPicked: noop, shinyCaught: noop, over: noop
  };
  G.Ranking = { periodIds, runStarted: noop, submitSolo: async () => null, submitGroup: async () => null };
  G.InvitePop = { refresh: noop };
})();
