/* Run-scoped audience combat roles. The host never draws from this catalog. */
G.AudienceRoles = (() => {
  const role = def => Object.freeze(def);
  const catalog = Object.freeze([
    role({ id: 'firebolt', name: 'Firebolt', moveId: 'ember', pattern: 'projectile',
      dex: 110, context: 'scout', scale: 0.85, type: 'fire', color: '#ff8b4d',
      interval: 1.10, damage: 15, range: 340, speed: 310, count: 1, spread: 0, pierce: 0, life: 1.35, size: 7 }),
    role({ id: 'storm-needle', name: 'Storm Needle', moveId: 'thunder-shock', pattern: 'projectile',
      dex: 112, context: 'scout', scale: 0.82, type: 'electric', color: '#ffe16a',
      interval: 0.80, damage: 10, range: 370, speed: 480, count: 1, spread: 0, pierce: 2, life: 1.05, size: 5 }),
    role({ id: 'seeker', name: 'Seeker', moveId: 'confusion', pattern: 'projectile',
      dex: 121, context: 'piercer', scale: 0.84, type: 'psychic', color: '#d58cff',
      interval: 1.25, damage: 13, range: 360, speed: 280, count: 1, spread: 0, pierce: 0, life: 2.0, size: 8, homing: 2.0 }),
    role({ id: 'stoneguard', name: 'Stoneguard', moveId: 'rock-throw', pattern: 'projectile',
      dex: 96, context: 'piercer', scale: 0.90, type: 'rock', color: '#c7aa78',
      interval: 1.65, damage: 23, range: 320, speed: 260, count: 1, spread: 0, pierce: 0, life: 1.35, size: 9, knock: 80 }),
    role({ id: 'flame-fan', name: 'Flame Fan', moveId: 'flamethrower', pattern: 'cone',
      dex: 110, context: 'volley', scale: 0.85, type: 'fire', color: '#ff7043',
      interval: 2.00, damage: 5, range: 220, speed: 380, count: 5, arc: 0.82, pierce: 1, life: 0.44, size: 6 }),
    role({ id: 'starburst', name: 'Starburst', moveId: 'heat-wave', pattern: 'nova',
      dex: 98, context: 'volley', scale: 0.85, type: 'fire', color: '#ffb04d',
      interval: 2.50, damage: 7, range: 230, speed: 250, count: 8, pierce: 1, life: 1.0, size: 7 }),
    role({ id: 'runeblade', name: 'Runeblade', moveId: 'razor-leaf', pattern: 'boomerang',
      dex: 112, context: 'scout', scale: 0.85, type: 'grass', color: '#85e3a4',
      interval: 1.80, damage: 9, range: 300, speed: 330, count: 2, spread: 0.42, radius: 190, size: 6 }),
    role({ id: 'flame-orbit', name: 'Flame Orbit', moveId: 'fire-spin', pattern: 'orbit',
      dex: 100, context: 'piercer', scale: 0.86, type: 'fire', color: '#ff6f61',
      interval: 3.00, damage: 8, range: 250, speed: 2.4, count: 3, radius: 58, duration: 2.4, size: 8 }),
    role({ id: 'chain-spark', name: 'Chain Spark', moveId: 'thunderbolt', pattern: 'chain',
      dex: 121, context: 'scout', scale: 0.84, type: 'electric', color: '#fff176',
      interval: 1.80, damage: 14, range: 340, count: 3, radius: 125, size: 6 }),
    role({ id: 'meteorist', name: 'Meteorist', moveId: 'rock-slide', pattern: 'meteor',
      dex: 96, context: 'volley', scale: 0.90, type: 'rock', color: '#d2b48c',
      interval: 2.50, damage: 15, range: 340, count: 3, radius: 42, knock: 45, size: 10 }),
    role({ id: 'rune-trapper', name: 'Rune Trapper', moveId: 'string-shot', pattern: 'mine',
      dex: 98, context: 'volley', scale: 0.84, type: 'bug', color: '#b9df78',
      interval: 2.80, damage: 9, range: 260, count: 2, radius: 45, duration: 5.0, slow: 0.55, size: 9 }),
    role({ id: 'frost-channeler', name: 'Frost Channeler', moveId: 'ice-beam', pattern: 'beam',
      dex: 100, context: 'piercer', scale: 0.86, type: 'ice', color: '#9eeaff',
      interval: 2.20, damage: 19, range: 340, radius: 220, width: 24, slow: 0.65 })
  ]);

  const byId = new Map(catalog.map(entry => [entry.id, entry]));
  const overrideAliases = Object.freeze({
    scout: 'storm-needle',
    volley: 'flame-fan',
    piercer: 'frost-channeler'
  });

  function hash(value) {
    let n = 2166136261;
    for (const c of String(value)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
    return n >>> 0;
  }

  function choose(viewerId, runId, overrideId) {
    const resolvedOverride = overrideAliases[overrideId] || overrideId;
    const override = resolvedOverride && byId.get(resolvedOverride);
    if (override) return override;
    return catalog[hash(String(runId) + ':' + String(viewerId)) % catalog.length];
  }

  return Object.freeze({ catalog, choose });
})();
