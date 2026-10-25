export type RecruitmentMode = 'level' | 'join-all';

/** Run-local reward ledger; input providers never choose recruitment policy. */
export class RecruitmentState {
  enabled = false;
  mode: RecruitmentMode = 'level';
  credits = 0;
  private lastLevel = 1;

  reset(level = 1): void { this.credits = 0; this.lastLevel = level; }

  setEnabled(enabled: boolean, level: number): void {
    if (enabled === this.enabled) return;
    this.enabled = enabled;
    this.lastLevel = level;
    if (enabled) this.mode = 'level';
  }

  recordLevel(level: number): void {
    if (level <= this.lastLevel) return;
    if (this.enabled && this.mode === 'level') this.credits += level - this.lastLevel;
    this.lastLevel = level;
  }

  canRecruit(): boolean { return this.enabled && (this.mode === 'join-all' || this.credits > 0); }
  consume(): void { if (this.mode === 'level') this.credits--; }
}
