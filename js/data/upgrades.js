/* ============ upgrades.js — mejoras permanentes entre runs ============
 * Se compran con coronas en el menú. `per` es lo que da cada nivel.
 */
G.Upgrades = (() => {
  const LIST = [
    { id: 'hp',     school: 'ward',    icon: 'upgHeart',     name: 'Corazón guardián', unit: '+8 vida del host',   max: 10, base: 60,  grow: 1.35 },
    { id: 'atk',    school: 'arsenal', icon: 'upgBlade',     name: 'Filo arcano',       unit: '+4% daño del host',  max: 10, base: 80,  grow: 1.38 },
    { id: 'spd',    school: 'arcana',  icon: 'upgWind',      name: 'Paso del viento',   unit: '+3% velocidad del host', max: 8, base: 70, grow: 1.4 },
    { id: 'cd',     school: 'arcana',  icon: 'upgHourglass', name: 'Conjuro veloz',     unit: '-3% recarga del host', max: 8, base: 90, grow: 1.42 },
    { id: 'def',    school: 'ward',    icon: 'upgWard',      name: 'Guardia rúnica',    unit: '+2% defensa del host', max: 8, base: 80, grow: 1.4 },
    { id: 'regen',  school: 'ward',    icon: 'upgChalice',   name: 'Fuente vital',      unit: '+0.2 vida/s del host', max: 5, base: 120, grow: 1.5 },
    { id: 'magnet', school: 'arcana',  icon: 'upgCrystal',   name: 'Alcance de almas',  unit: '+12% radio de recogida', max: 6, base: 50, grow: 1.4 },
    { id: 'xp',     school: 'fortune', icon: 'upgTome',      name: 'Saber antiguo',     unit: '+5% XP · recluta antes por nivel', max: 8, base: 100, grow: 1.42 },
    { id: 'coins',  school: 'fortune', icon: 'upgCrown',     name: 'Tributo real',      unit: '+8% coronas al terminar la run', max: 8, base: 120, grow: 1.45 },
    { id: 'moves',  school: 'arsenal', icon: 'upgTwin',      name: 'Sigilos gemelos',   unit: 'Empiezas con 2 movimientos', max: 1, base: 1500, grow: 1 },
    { id: 'crit',   school: 'arsenal', icon: 'upgCrit',      name: 'Golpe del destino', unit: '+3% crítico del host (x1,5)', max: 10, base: 90, grow: 1.4 },
    // Conserva el ID `reroll` para no invalidar compras guardadas. En Audience
    // potencia a los viewers y en Solo mantiene su efecto anterior.
    { id: 'reroll', school: 'audience', icon: 'audience',    name: 'Impulso del chat',  unit: '+5% daño de viewers · +1 cambio en Solo', max: 5, base: 150, grow: 1.6 },
    { id: 'ban',    school: 'arcana',  icon: 'upgSeal',      name: 'Magia sellada',     unit: 'Bloquea 1 movimiento: no te sale en las cartas', max: 3, base: 300, grow: 1.9 }
  ];
  const BY = {};
  for (const u of LIST) BY[u.id] = u;

  function cost(id, lvl) {
    const u = BY[id];
    return Math.round(u.base * Math.pow(u.grow, lvl) / 10) * 10;
  }

  /** Niveles comprados -> modificadores para G.Player. */
  function perks(levels = {}) {
    // Nunca por encima del máximo (una partida editada a mano no da más poder).
    const L = id => Math.max(0, Math.min(BY[id].max, Math.floor(+levels[id] || 0)));
    return {
      hp: L('hp') * 8,
      atkMul: 1 + L('atk') * 0.04,
      spdMul: 1 + L('spd') * 0.03,
      cdMul: 1 - L('cd') * 0.03,
      dmgReduce: L('def') * 0.02,
      regen: L('regen') * 0.2,
      magnetMul: 1 + L('magnet') * 0.12,
      xpMul: 1 + L('xp') * 0.05,
      coinMul: 1 + L('coins') * 0.08,
      startMoves: 1 + L('moves'),
      crit: L('crit') * 0.03,
      audienceDamageMul: 1 + L('reroll') * 0.05,
      rerolls: L('reroll'),
      bans: L('ban')
    };
  }

  return { LIST, BY, cost, perks };
})();
