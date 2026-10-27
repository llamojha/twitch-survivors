/* Compact original fantasy roster. IDs remain numeric for save and combat compatibility. */
(() => {
  const TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'psychic', 'poison', 'ground', 'flying',
    'bug', 'rock', 'ice', 'fighting', 'ghost', 'dragon', 'fairy', 'steel', 'dark'];
  const KIN = ['Slime', 'Skeleton', 'Goblin', 'Wisp', 'Mushroom', 'Imp', 'Wolf', 'Sentinel'];
  const REALM = ['Verdant', 'Iron', 'Sun', 'Moon', 'Frost', 'Storm', 'Ember', 'Star', 'Rift'];
  const STARTERS = new Set([1, 9, 17, 25, 33, 41, 49, 57, 65]);
  G.HOST_DEX = 25;
  G.DEX = [];
  for (let id = 1; id <= 72; id++) {
    const tier = (id - 1) % 8, gen = Math.floor((id - 1) / 8) + 1;
    const power = tier / 7;
    G.DEX.push({
      dex: id,
      name: id === 25 ? 'Host Survivor' : `${REALM[gen - 1]} ${KIN[tier]}`,
      types: [TYPES[(id * 5 + gen) % TYPES.length], TYPES[(id * 7 + tier) % TYPES.length]].filter((v, i, a) => a.indexOf(v) === i),
      hp: Math.round(84 + power * 38 + gen * 1.5),
      spd: Math.round(92 + ((id * 11) % 36)),
      atk: +(0.92 + power * 0.5).toFixed(2),
      rarity: Math.min(5, 1 + Math.floor(tier / 2)),
      bst: Math.round(220 + power * 420),
      starter: STARTERS.has(id),
      gen,
      leg: tier === 7
    });
  }
  G.DEX.push({ dex: 493, name: 'Rift Tyrant', types: ['dark', 'dragon'], hp: 145, spd: 128, atk: 1.55,
    rarity: 5, bst: 680, starter: false, gen: 9, leg: true });
  G.DEX_BY = {};
  G.SPRITE_META = {};
  for (const actor of G.DEX) { G.DEX_BY[actor.dex] = actor; G.SPRITE_META[actor.dex] = {}; }
  // The host is deliberately separate from the roster entry with the same
  // sprite ID: enemies keep their affinities while the player stays neutral.
  G.HOST = Object.freeze(Object.assign({}, G.DEX_BY[G.HOST_DEX], {
    name: 'Host Survivor', types: [], host: true, start: 'tackle', rarity: 0
  }));
  G.getPokemon = dex => G.DEX_BY[dex];
})();
