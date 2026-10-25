/** Small projectile roles shared by every audience provider. Solo keeps its original attack. */
export interface CompanionRole {
  readonly id: 'scout' | 'volley' | 'piercer' | 'solo';
  readonly label: string;
  readonly cooldownMs: number;
  readonly damageMultiplier: number;
  readonly speed: number;
  readonly angles: readonly number[];
  readonly maxHits: number;
  readonly tint: number;
}

export const SOLO_ATTACK: CompanionRole = Object.freeze({
  id: 'solo', label: '', cooldownMs: 2000, damageMultiplier: 1,
  speed: 300, angles: Object.freeze([0]), maxHits: 1, tint: 0xffffff,
});
export const VIEWER_ROLES: readonly CompanionRole[] = Object.freeze([
  Object.freeze({ id: 'scout', label: 'Scout', cooldownMs: 1000, damageMultiplier: 0.7,
    speed: 400, angles: Object.freeze([0]), maxHits: 1, tint: 0x8eeaff }),
  Object.freeze({ id: 'volley', label: 'Volley', cooldownMs: 2400, damageMultiplier: 0.6,
    speed: 300, angles: Object.freeze([-0.24, 0, 0.24]), maxHits: 1, tint: 0xffdc83 }),
  Object.freeze({ id: 'piercer', label: 'Piercer', cooldownMs: 2200, damageMultiplier: 1,
    speed: 360, angles: Object.freeze([0]), maxHits: 3, tint: 0xd3a0ff }),
]);

export function pickCompanionRole(random: () => number = Math.random): CompanionRole {
  const index = Math.min(VIEWER_ROLES.length - 1, Math.max(0, Math.floor(random() * VIEWER_ROLES.length)));
  return VIEWER_ROLES[index];
}

/** Stable phase offset prevents Join all viewers from firing on the same frame. */
export function getViewerAttackPhase(viewerId: string, cooldownMs: number): number {
  let hash = 2166136261;
  for (let index = 0; index < viewerId.length; index++) {
    hash ^= viewerId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % Math.max(1, Math.floor(cooldownMs));
}

/** Per-shot state prevents repeated overlap frames from damaging the same target. */
export interface CompanionShotHits { remaining: number; targets: Set<object> }
export function createCompanionShotHits(role: CompanionRole): CompanionShotHits {
  return { remaining: role.maxHits, targets: new Set() };
}
export function registerCompanionHit(state: CompanionShotHits, target: object): boolean {
  if (state.remaining <= 0 || state.targets.has(target)) return false;
  state.targets.add(target);
  state.remaining--;
  return true;
}
