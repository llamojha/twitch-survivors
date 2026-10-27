/* Original code-drawn fantasy presentation. Stable gameplay ids stay internal. */
G.Presentation = (() => {
  const archetypes = ['Slime', 'Skeleton', 'Goblin', 'Wisp', 'Mushroom', 'Imp', 'Wolf', 'Sentinel'];
  const palette = {
    hero: ['#f6d6a8', '#3f2b56', '#7b4ab8', '#c7d8ff', '#6d3a2c'],
    scout: ['#e8bd8e', '#203d32', '#3f8f62', '#d8ebbf', '#5b3527'],
    volley: ['#d8aa7d', '#4b3025', '#9a6339', '#efd06a', '#37251d'],
    piercer: ['#e4c39b', '#182c55', '#357bd1', '#9eeaff', '#52336c'],
    slime: ['#69d88a', '#2d8f57', '#baf7c8', '#173e38', '#efffff'],
    skeleton: ['#e9e1c3', '#968e7b', '#443f46', '#5f8cc9', '#ffffff'],
    goblin: ['#9ac45a', '#587a38', '#5b3527', '#d9bd55', '#1e3426'],
    wisp: ['#87d7ff', '#4966c2', '#d7f7ff', '#312d78', '#ffffff'],
    mushroom: ['#e7d6b4', '#aa4252', '#f2a0a0', '#51343a', '#ffffff'],
    imp: ['#d45b5b', '#783242', '#f0aa58', '#352238', '#fff0c7'],
    wolf: ['#8da1ad', '#4e5c6a', '#d7e4e8', '#26313b', '#8de6ff'],
    sentinel: ['#8a789c', '#453f58', '#d1bd73', '#282538', '#ffda79'],
    boss: ['#5a486d', '#241d32', '#bc4c66', '#d6b86c', '#fff0c7']
  };
  const actorSheet = new Image();
  actorSheet.src = 'assets/fantasy/kenney-tiny-dungeon/tilemap_packed.png';
  const actorTile = { hero: 87, scout: 112, volley: 98, piercer: 100, slime: 108, skeleton: 122,
    goblin: 112, wisp: 121, mushroom: 124, imp: 110, wolf: 123, sentinel: 96, boss: 110 };
  // Save/combat keys remain unchanged; only their player-facing labels become fantasy affinities.
  const traitNames = {
    normal: 'Vanguardia', fire: 'Ascua', water: 'Marea', grass: 'Salvaje', electric: 'Tormenta',
    psychic: 'Arcano', poison: 'Veneno', ground: 'Tierra', flying: 'Vendaval', bug: 'Enjambre',
    rock: 'Piedra', ice: 'Escarcha', fighting: 'Valor', ghost: 'Espíritu', dragon: 'Dracónico',
    fairy: 'Luz', steel: 'Hierro', dark: 'Sombra'
  };

  function enemyKind(dex) { return ['slime', 'skeleton', 'goblin', 'wisp', 'mushroom', 'imp', 'wolf', 'sentinel'][Math.abs(dex | 0) % 8]; }
  function kind(dex, context) {
    if (context === 'hero') return 'hero';
    if (context === 'boss') return 'boss';
    if (context === 'scout' || context === 'volley' || context === 'piercer') return context;
    return enemyKind(dex);
  }
  function displayName(dex, context) {
    if (context === 'hero') return 'Host Survivor';
    if (context === 'boss') return 'Rift Warden';
    return archetypes[Math.abs(dex | 0) % archetypes.length] + ' ' + String(Math.abs(dex | 0)).padStart(3, '0');
  }

  function applyCopy() {
    Object.assign(G.U.TYPE_NAME, traitNames);
    // Stable combat ids remain internal; every player-facing move uses original fantasy copy.
    const moveNames = {
      'tackle': 'Blade Arc', 'quick-attack': 'Dash Cut', 'swords-dance': 'War Tempo', 'agility': 'Windstep',
      'harden': 'Iron Stance', 'ember': 'Firebolt', 'flamethrower': 'Flame Lance', 'fire-spin': 'Flame Orbit',
      'heat-wave': 'Inferno Nova', 'water-gun': 'Frost Dart', 'bubble': 'Tidal Burst', 'hydro-pump': 'Tidal Lance',
      'aqua-ring': 'Mending Tide', 'vine-whip': 'Thorn Lash', 'razor-leaf': 'Leaf Knives', 'leaf-storm': 'Verdant Orbit',
      'giga-drain': 'Soul Siphon', 'thunder-shock': 'Storm Needle', 'discharge': 'Storm Field', 'thunderbolt': 'Chain Spark',
      'confusion': 'Seeker Orb', 'psybeam': 'Astral Ray', 'psychic': 'Mind Burst', 'sludge': 'Blight Pool',
      'mud-shot': 'Stone Needle', 'gust': 'Wind Burst', 'wing-attack': 'Gale Cut', 'body-slam': 'Groundbreaker',
      'hyper-voice': 'War Cry', 'poison-sting': 'Venom Dart', 'toxic': 'Venom Curse', 'bulldoze': 'Seismic Rush',
      'bug-bite': 'Swarm Fang', 'string-shot': 'Binding Thread', 'bug-buzz': 'Swarm Pulse', 'rock-throw': 'Stone Shot',
      'rock-slide': 'Rockfall', 'ice-beam': 'Frost Channel', 'powder-snow': 'Snowburst', 'karate-chop': 'Power Slash',
      'aura-sphere': 'Spirit Orb', 'lick': 'Spirit Lash', 'shadow-ball': 'Void Orb', 'dragon-rage': 'Wyrmfire',
      'dragon-dance': 'Wyrm Tempo', 'fairy-wind': 'Faelight Gale', 'dazzling-gleam': 'Radiant Nova',
      'metal-claw': 'Iron Talon', 'flash-cannon': 'Sunsteel Beam', 'bite': 'Shadow Fang', 'dark-pulse': 'Night Wave',
      'night-shade': 'Dusk Field', 'bonemerang': 'Runeblade', 'psycho-cut': 'Mindblade', 'spikes': 'Rune Traps',
      'toxic-spikes': 'Blight Traps', 'hail': 'Hailstorm', 'meteor-mash': 'Starfall Fist', 'will-o-wisp': 'Wispfire',
      'substitute': 'Mirror Decoy', 'aerial-ace': 'Sky Dash', 'flame-wheel': 'Cinder Wheel',
      'bubble-beam': 'Tidal Ray', 'hex': 'Rift Hex'
    };
    const evolvedMoveNames = {
      'tackle': 'Crescent Breaker', 'quick-attack': 'Blink Strike', 'body-slam': 'Titanfall', 'hyper-voice': 'Battle Roar',
      'ember': 'Starfire', 'flamethrower': 'Dragonflame', 'fire-spin': 'Solar Ward', 'heat-wave': 'Caldera',
      'water-gun': 'Rime Lance', 'bubble': 'Tidal Surge', 'hydro-pump': 'Maelstrom', 'vine-whip': 'Briar Rend',
      'razor-leaf': 'Leaf Tempest', 'leaf-storm': 'Verdant Dance', 'giga-drain': 'Worldroot',
      'thunder-shock': 'Storm Spear', 'discharge': 'Tempest Field', 'thunderbolt': 'Skybreaker',
      'confusion': 'Mindlance', 'psybeam': 'Foresight Ray', 'psychic': 'Astral Force', 'sludge': 'Blight Bomb',
      'poison-sting': 'Venom Lance', 'toxic': 'Plague Cloud', 'mud-shot': 'Earth Pulse', 'bulldoze': 'Earthshatter',
      'gust': 'Gale Force', 'wing-attack': 'Skybreaker Dive', 'bug-bite': 'Crossfang', 'string-shot': 'Snaring Web',
      'bug-buzz': 'Swarmstorm', 'rock-throw': 'Obsidian Spear', 'rock-slide': 'Stone Prison',
      'ice-beam': 'Whiteout', 'powder-snow': 'Winter Wind', 'karate-chop': 'Final Slash', 'aura-sphere': 'Soul Cannon',
      'lick': 'Phantom Fist', 'shadow-ball': 'Rift Strike', 'dragon-rage': 'Falling Star', 'fairy-wind': 'Moonforce',
      'dazzling-gleam': 'Mist Sanctuary', 'metal-claw': 'Iron Crown', 'flash-cannon': 'Quicksilver Ray',
      'bite': 'Ravenous Fang', 'dark-pulse': 'Dread Howl', 'night-shade': 'Nightmare Field',
      'bonemerang': 'Runebreaker', 'psycho-cut': 'Mindfang', 'spikes': 'Faultline', 'toxic-spikes': 'Blight Lance',
      'hail': 'Avalanche', 'meteor-mash': 'Magnetar Fist', 'will-o-wisp': 'Hellfire', 'substitute': 'Mirror Legion',
      'aerial-ace': 'Cloudstep', 'flame-wheel': 'Phoenix Wheel', 'bubble-beam': 'Tidal Tail', 'hex': 'Poltergeist'
    };
    if (G.Moves) for (const move of G.Moves.ALL) if (moveNames[move.id]) move.name = moveNames[move.id];
    if (G.Moves && G.Moves.EVO) for (const id of Object.keys(evolvedMoveNames)) {
      if (G.Moves.EVO[id]) G.Moves.EVO[id][0] = evolvedMoveNames[id];
    }
    const itemNames = { leftovers: 'Regrowth Charm', choiceband: 'Berserker Band', quickclaw: 'Wind Claw', focussash: 'Last Stand Sash',
      shellbell: 'Mending Bell', amuletcoin: 'Crown Talisman', luckyegg: 'Scholar Stone', lifeorb: 'Blood Orb',
      choicescarf: 'Windrunner Scarf', rockyhelmet: 'Thorn Helm', assaultvest: 'Warden Vest' };
    if (G.Items) for (const item of G.Items.LIST) if (itemNames[item.id]) item.name = itemNames[item.id];
    if (G.AchDefs) for (const achievement of G.AchDefs.LIST) {
      achievement.name = achievement.name.replace(/Pokémon|Poké/gi, 'Hero').replace(/Arceus/gi, 'Rift Tyrant');
      achievement.desc = achievement.desc.replace(/Pokémon|Poké/gi, 'foes').replace(/Arceus/gi, 'Rift Tyrant').replace(/shiny/gi, 'rare');
    }
  }

  function rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function drawActor(ctx, dex, x, y, scale, dir, anim, frame, opts, context) {
    const type = kind(dex, context), c = palette[type], px = Math.max(1, Math.round(2 * scale));
    const bob = anim === 'Walk' ? (frame % 2) * px : anim === 'Hurt' ? px : 0;
    const attack = ['Attack', 'Shoot', 'Charge'].includes(anim) ? Math.min(2, frame) * px : 0;
    const faceRight = dir > 0 && dir < 4, faceLeft = dir > 4 && dir < 8;
    const sx = faceLeft ? -1 : 1;
    ctx.save();
    ctx.globalAlpha *= opts.alpha == null ? 1 : opts.alpha;
    ctx.translate(Math.round(x + sx * attack), Math.round(y - bob));
    if (faceLeft) ctx.scale(-1, 1);
    if (actorSheet.complete && actorSheet.naturalWidth) {
      const tile = actorTile[type], sx0 = (tile % 12) * 16, sy0 = Math.floor(tile / 12) * 16;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(actorSheet, sx0, sy0, 16, 16, -8 * px, -16 * px, 16 * px, 16 * px);
    } else if (type === 'slime' || type === 'wisp') drawBlob(ctx, c, px, type === 'wisp');
    else if (type === 'wolf') drawWolf(ctx, c, px);
    else if (type === 'mushroom') drawMushroom(ctx, c, px);
    else drawBiped(ctx, c, px, type, faceRight || faceLeft, anim);
    if (opts.flash) { ctx.globalCompositeOperation = 'source-atop'; ctx.globalAlpha *= opts.softFlash ? .55 : .9; rect(ctx, -16 * px, -24 * px, 32 * px, 25 * px, '#ffffff'); }
    ctx.restore();
  }

  function drawBlob(ctx, c, p, floating) {
    const lift = floating ? 4 * p : 0;
    rect(ctx, -6*p, -7*p-lift, 12*p, 6*p, c[1]); rect(ctx, -8*p, -5*p-lift, 16*p, 5*p, c[0]);
    rect(ctx, -5*p, -8*p-lift, 10*p, 2*p, c[2]); rect(ctx, -4*p, -4*p-lift, 2*p, 2*p, c[3]); rect(ctx, 3*p, -4*p-lift, 2*p, 2*p, c[3]);
    rect(ctx, -1*p, -2*p-lift, 3*p, p, c[4]);
  }
  function drawWolf(ctx, c, p) {
    rect(ctx, -8*p, -7*p, 14*p, 6*p, c[1]); rect(ctx, 3*p, -11*p, 7*p, 8*p, c[0]);
    rect(ctx, 4*p, -14*p, 2*p, 4*p, c[2]); rect(ctx, 8*p, -14*p, 2*p, 4*p, c[2]); rect(ctx, 8*p, -9*p, 2*p, 2*p, c[4]);
    rect(ctx, -6*p, -2*p, 3*p, 3*p, c[3]); rect(ctx, 3*p, -2*p, 3*p, 3*p, c[3]); rect(ctx, -11*p, -9*p, 4*p, 2*p, c[0]);
  }
  function drawMushroom(ctx, c, p) {
    rect(ctx, -4*p, -8*p, 8*p, 8*p, c[0]); rect(ctx, -8*p, -13*p, 16*p, 6*p, c[1]); rect(ctx, -5*p, -16*p, 10*p, 4*p, c[2]);
    rect(ctx, -4*p, -14*p, 2*p, 2*p, c[4]); rect(ctx, 3*p, -12*p, 2*p, 2*p, c[4]); rect(ctx, -2*p, -5*p, p, 2*p, c[3]); rect(ctx, 2*p, -5*p, p, 2*p, c[3]);
  }
  function drawBiped(ctx, c, p, type, side, anim) {
    const tall = type === 'boss' ? 1.35 : 1, h = Math.round(7*p*tall);
    rect(ctx, -5*p, -h-8*p, 10*p, 8*p, c[0]); rect(ctx, -6*p, -h, 12*p, h, c[1]);
    rect(ctx, -4*p, -h+2*p, 8*p, Math.max(3*p, h-3*p), c[2]);
    rect(ctx, -5*p, -2*p, 4*p, 3*p, c[3]); rect(ctx, 2*p, -2*p, 4*p, 3*p, c[3]);
    rect(ctx, side ? 2*p : -3*p, -h-5*p, 2*p, 2*p, c[4]);
    if (['hero', 'scout', 'volley', 'piercer', 'sentinel', 'boss'].includes(type)) {
      rect(ctx, -6*p, -h-10*p, 12*p, 3*p, c[1]); rect(ctx, -5*p, -h-12*p, 10*p, 3*p, c[2]);
    }
    if (type === 'hero' || type === 'sentinel' || type === 'boss') {
      rect(ctx, 7*p, -h-5*p, 2*p, 10*p, c[3]); rect(ctx, 6*p, -h-7*p, 4*p, 3*p, c[4]);
    } else if (type === 'volley') {
      ctx.strokeStyle = c[3]; ctx.lineWidth = p; ctx.beginPath(); ctx.arc(7*p, -h, 5*p, -1.3, 1.3); ctx.stroke();
    } else if (type === 'piercer' || type === 'wisp') {
      rect(ctx, 7*p, -h-5*p, p, 12*p, c[4]); rect(ctx, 5*p, -h-8*p, 5*p, 5*p, c[3]);
    }
    if (anim === 'Faint') ctx.globalAlpha *= .55;
  }

  // Replace every inherited species label while keeping save-compatible ids.
  for (const entry of G.DEX || []) entry.name = displayName(entry.dex, entry.dex === 25 ? 'hero' : 'enemy');
  return { enabled: true, kind, displayName, drawActor, applyCopy, traitNames };
})();
