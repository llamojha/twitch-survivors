import type { ViewerIdentity } from './AudienceProvider';
import type { CompanionRole } from './CompanionRoles';

export interface ViewerContribution {
  readonly viewer: ViewerIdentity;
  readonly role: CompanionRole;
  damage: number;
  kills: number;
}
export interface RunSummary {
  readonly outcome: 'defeat' | 'victory';
  readonly contributions: ViewerContribution[];
}

/** Run-local direct-hit ledger. Status damage has no viewer ownership yet. */
export class ContributionTracker {
  private readonly entries = new Map<string, ViewerContribution>();

  register(viewer: ViewerIdentity, role: CompanionRole): void {
    if (!this.entries.has(viewer.id)) {
      this.entries.set(viewer.id, { viewer: { ...viewer }, role, damage: 0, kills: 0 });
    }
  }

  record(id: string, damage: number, killed: boolean): void {
    const entry = this.entries.get(id);
    if (!entry || !Number.isFinite(damage) || damage <= 0) return;
    entry.damage += damage;
    if (killed) entry.kills++;
  }

  snapshot(): ViewerContribution[] {
    return Array.from(this.entries.values(), entry => ({ ...entry, viewer: { ...entry.viewer } }));
  }

  reset(): void { this.entries.clear(); }
}

/** Clamp overkill and ignore healing, shielding and already dead targets. */
export function actualHealthLost(before: number, after: number): number {
  return Math.max(0, Math.max(0, before) - Math.max(0, after));
}
