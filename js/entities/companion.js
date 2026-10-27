/* Audience companions are lightweight actors, never co-op players or enemy targets. */
G.Companions = (() => {
  const roles = G.AudienceRoles.catalog;
  const castLimit = 32, directHitLimit = 96, teleportDistance = 1200;
  let actors = [], runId = null, lastNow = 0, deferredCasts = 0, droppedDirectHits = 0, directHitsRemaining = 0;

  function hash(id) { let n = 2166136261; for (const c of String(id)) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
  function clear() { actors = []; runId = null; lastNow = 0; deferredCasts = 0; droppedDirectHits = 0; directHitsRemaining = 0; G.Projectiles.clearAudience(); }
  function startRun(id) { clear(); runId = id; }
  function visual(role) {
    const move = G.Moves && G.Moves.BY_ID && G.Moves.BY_ID[role.moveId];
    return move && G.VFX.forMove ? G.VFX.forMove(move) : G.VFX.forType(role.type);
  }
  function targetRange(role) {
    if (role.pattern === 'beam' || role.pattern === 'boomerang') return role.radius;
    if (role.pattern === 'cone') return Math.min(role.range || Infinity, role.speed * role.life);
    return role.range || 340;
  }
  function scaledDamage(actor, amount) { return amount * (actor.damageMul || 1); }
  function nearest(actor, role) {
    const range = targetRange(role);
    let target = null, best = range * range;
    for (const e of G.EnemyMgr.queryCircle(actor.x, actor.y, range)) {
      if (e.dead) continue;
      const d = (e.x - actor.x) ** 2 + (e.y - actor.y) ** 2;
      if (d < best) { best = d; target = e; }
    }
    return target;
  }
  function shot(actor, role, angle, extra = {}) {
    return G.Projectiles.spawn(Object.assign({
      x: actor.x + Math.cos(angle) * 3, y: actor.y + Math.sin(angle) * 3,
      vx: Math.cos(angle) * (role.speed || 0), vy: Math.sin(angle) * (role.speed || 0),
      dmg: scaledDamage(actor, role.damage), r: role.size || 6, life: role.life || 1.4,
      pierce: role.pierce | 0, color: role.color, homing: role.homing || 0,
      slow: role.slow || 0, knock: role.knock || 0, vis: visual(role),
      owner: actor, audience: actor.ownership
    }, extra));
  }
  function spread(actor, role, aim, radial) {
    const count = Math.max(1, role.count | 0);
    for (let i = 0; i < count; i++) {
      const angle = radial
        ? aim + i / count * Math.PI * 2
        : aim + (count === 1 ? 0 : (i / (count - 1) - 0.5) * (role.arc || role.spread || 0));
      shot(actor, role, angle);
    }
  }
  function boomerang(actor, role, aim) {
    const count = Math.max(1, role.count | 0), out = role.radius / role.speed;
    for (let i = 0; i < count; i++) {
      const angle = aim + (count === 1 ? 0 : (i / (count - 1) - 0.5) * (role.spread || 0.5));
      shot(actor, role, angle, { life: out * 4 + 1.5, pierce: 999, boom: out, bsp: role.speed * 1.1 });
    }
  }
  function orbit(actor, role) {
    const count = Math.max(1, role.count | 0);
    for (let i = 0; i < count; i++) G.Projectiles.spawnOrb({
      owner: actor, audience: actor.ownership, x: actor.x, y: actor.y,
      dmg: scaledDamage(actor, role.damage), r: role.size || 7, life: role.duration || 2.5,
      oa: i / count * Math.PI * 2, ospeed: role.speed, orad: role.radius,
      rehit: 0.65, color: role.color, vis: visual(role), slow: role.slow || 0
    });
  }
  function hitDirect(actor, target, damage, opts) {
    if (directHitsRemaining <= 0) { droppedDirectHits++; return null; }
    directHitsRemaining--;
    return G.Combat.audienceHit(actor, target, damage, opts);
  }
  function chain(actor, role, first) {
    const hit = new Set(); let target = first, fromX = actor.x, fromY = actor.y;
    for (let i = 0; i < role.count && target; i++) {
      if (hitDirect(actor, target, scaledDamage(actor, role.damage * Math.pow(0.85, i)), { color: role.color }) == null) break;
      if (G.FX && G.FX.beam) G.FX.beam(fromX, fromY - G.LIFT, Math.atan2(target.y - fromY, target.x - fromX), Math.hypot(target.x - fromX, target.y - fromY), 5, role.color, visual(role));
      hit.add(target.id); fromX = target.x; fromY = target.y;
      let next = null, best = role.radius * role.radius;
      for (const e of G.EnemyMgr.queryCircle(target.x, target.y, role.radius)) {
        if (e.dead || hit.has(e.id)) continue;
        const d = (e.x - target.x) ** 2 + (e.y - target.y) ** 2;
        if (d < best) { best = d; next = e; }
      }
      target = next;
    }
  }
  function meteor(actor, role, first) {
    const candidates = G.EnemyMgr.queryCircle(actor.x, actor.y, role.range)
      .filter(e => !e.dead).sort((a, b) => ((a.x - first.x) ** 2 + (a.y - first.y) ** 2) - ((b.x - first.x) ** 2 + (b.y - first.y) ** 2));
    for (const target of candidates.slice(0, role.count)) {
      if (hitDirect(actor, target, scaledDamage(actor, role.damage), { color: role.color, knock: role.knock }) == null) break;
      if (G.FX && G.FX.ring) G.FX.ring(target.x, target.y, 5, role.radius, role.color, 0.35, 3);
      if (G.FX && G.FX.sp) G.FX.sp('meteor', visual(role).pal, target.x, target.y - G.LIFT, { life: 0.35, scale: 1.3 });
    }
  }
  function mines(actor, role, target) {
    const count = Math.max(1, role.count | 0);
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2, distance = count === 1 ? 0 : 18;
      shot(actor, role, 0, { x: target.x + Math.cos(angle) * distance, y: target.y + Math.sin(angle) * distance,
        vx: 0, vy: 0, r: Math.min(16, role.radius), life: role.duration, pierce: 99 });
    }
  }
  function segDist2(ax, ay, bx, by, px, py) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
    const x = ax + dx * t, y = ay + dy * t;
    return (px - x) ** 2 + (py - y) ** 2;
  }
  function beam(actor, role, aim) {
    const ca = Math.cos(aim), sa = Math.sin(aim);
    let length = role.radius;
    if (G.World && G.World.isWall) for (let d = 8; d < role.radius; d += 8) {
      if (G.World.isWall(actor.x + ca * d, actor.y + sa * d)) { length = d; break; }
    }
    const bx = actor.x + ca * length, by = actor.y + sa * length;
    for (const e of G.EnemyMgr.queryCircle((actor.x + bx) / 2, (actor.y + by) / 2, length / 2 + role.width)) {
      if (!e.dead && segDist2(actor.x, actor.y, bx, by, e.x, e.y) <= (role.width / 2 + e.r) ** 2)
        if (hitDirect(actor, e, scaledDamage(actor, role.damage), { color: role.color, slow: role.slow, dx: ca, dy: sa }) == null) break;
    }
    if (G.FX && G.FX.beam) G.FX.beam(actor.x, actor.y - G.LIFT, aim, length, role.width, role.color, visual(role));
  }
  function cast(actor, role, target) {
    const aim = Math.atan2(target.y - actor.y, target.x - actor.x);
    if (role.pattern === 'projectile' || role.pattern === 'cone') spread(actor, role, aim, false);
    else if (role.pattern === 'nova') spread(actor, role, actor.attackCount * 0.31, true);
    else if (role.pattern === 'boomerang') boomerang(actor, role, aim);
    else if (role.pattern === 'orbit') orbit(actor, role);
    else if (role.pattern === 'chain') chain(actor, role, target);
    else if (role.pattern === 'meteor') meteor(actor, role, target);
    else if (role.pattern === 'mine') mines(actor, role, target);
    else if (role.pattern === 'beam') beam(actor, role, aim);
  }
  function spawn(viewer, player, now = 0, roleId) {
    const id = viewer.viewerId || viewer.id;
    if (!id || runId == null) return null;
    const old = actors.find(a => a.viewerId === id);
    if (old) return old;
    const role = G.AudienceRoles.choose(id, runId, roleId), phase = hash(runId + ':' + id + ':phase') / 4294967296;
    const slot = actors.length;
    const a = { viewerId: id, displayName: viewer.displayName || viewer.name || String(id), role: role.id,
      x: player.x, y: player.y, r: 8, slot, damage: 0, kills: 0, attackCount: 0,
      damageMul: Math.max(0, Number(player.audienceDamageMul) || 1),
      joinedAt: now,
      nextAttack: now + 0.1 + phase * role.interval,
      ownership: Object.freeze({ viewerId: id, runId }), anim: new G.Sprites.Animator(role.dex, role.scale || 0.85, false, role.context), def: role,
      draw(ctx) {
        G.Sprites.drawShadow(ctx, this.def.dex, this.x, this.y);
        this.anim.draw(ctx, this.x, this.y);
      } };
    actors.push(a); return a;
  }
  function update(dt, player, now) {
    lastNow = Math.max(lastNow, Number(now) || 0);
    if (!player || player.dead) return;
    let castAttempts = 0;
    directHitsRemaining = directHitLimit;
    for (const a of actors) {
      const angle = a.slot * 2.3999632297, radius = 42 + Math.sqrt(a.slot) * 17;
      const tx = player.x + Math.cos(angle) * radius, ty = player.y + Math.sin(angle) * radius * 0.7;
      let dx = tx - a.x, dy = ty - a.y, distance = Math.hypot(dx, dy);
      if (distance > teleportDistance) {
        a.x = tx; a.y = ty;
        dx = 0; dy = 0; distance = 0;
      }
      const step = Math.min(distance, (distance > 240 ? 500 : 155) * dt);
      if (distance > 1) { a.x += dx / distance * step; a.y += dy / distance * step; a.anim.dir = G.Sprites.dirFromAngle(Math.atan2(dy, dx)); }
      a.anim.loop(distance > 3 ? 'Walk' : 'Idle'); a.anim.update(dt);
      if (now < a.nextAttack) continue;
      if (castAttempts >= castLimit) { deferredCasts++; continue; }
      castAttempts++;
      const role = a.def;
      a.nextAttack = now + role.interval;
      const target = nearest(a, role);
      if (!target) continue;
      const aim = Math.atan2(target.y - a.y, target.x - a.x);
      a.anim.dir = G.Sprites.dirFromAngle(aim); a.anim.play('Shoot'); a.attackCount++;
      cast(a, role, target);
    }
  }
  function draw(ctx) { for (const a of actors) if (G.Camera.sees(a.x, a.y, 60)) a.draw(ctx); }
  function labels(ctx) {
    ctx.save(); ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 3;
    for (const a of actors) {
      if (!G.Camera.sees(a.x, a.y, 60)) continue;
      const name = a.displayName.length > 16 ? a.displayName.slice(0, 15) + '…' : a.displayName;
      ctx.strokeStyle = '#15232b'; ctx.fillStyle = a.def.color;
      ctx.strokeText(name, a.x, a.y - 32); ctx.fillText(name, a.x, a.y - 32);
    }
    ctx.restore();
  }
  function recordHit(owner, damage, killed) {
    if (owner.runId !== runId) return;
    const a = actors.find(a => a.viewerId === owner.viewerId);
    if (!a) return;
    a.damage += Number.isFinite(damage) ? Math.max(0, damage) : 0;
    if (killed) a.kills++;
  }
  function snapshot() { return actors.map(a => {
    const activeSeconds = Math.max(0, lastNow - a.joinedAt);
    return { viewerId: a.viewerId, displayName: a.displayName, role: a.def.name,
      roleId: a.role, moveId: a.def.moveId, damage: a.damage,
      dps: a.damage / Math.max(1, activeSeconds), activeSeconds, kills: a.kills };
  }); }
  function metrics() { const p = G.Projectiles.audienceStats(); return { count: actors.length, activeShots: p.active, droppedShots: p.dropped,
    projectileLimit: p.limit, deferredCasts, droppedDirectHits, castLimit, directHitLimit }; }
  return { startRun, clear, spawn, update, draw, labels, snapshot, recordHit, metrics, roles, all: () => actors };
})();
