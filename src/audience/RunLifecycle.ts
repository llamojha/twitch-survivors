/** Per-run terminal guard; simulation can never be turned back into a saved run. */
export class RunLifecycle {
  private finished = false;
  constructor(private simulation = false) {}
  finish(): boolean {
    if (this.finished) return false;
    this.finished = true;
    return true;
  }
  isFinished(): boolean { return this.finished; }
  markSimulation(): void { this.simulation = true; }
  isSimulation(): boolean { return this.simulation; }
  canPersist(): boolean { return !this.simulation; }
}
