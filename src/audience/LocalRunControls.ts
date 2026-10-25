interface LocalRunRuntime {
  state(): { simulation: boolean; finished: boolean; stage: string; bossIndex: number; bossTotal: number };
  markSimulation(): void;
  end(outcome: 'defeat' | 'victory'): void;
  restart(stage?: string): void;
  reward(): void;
  nextBoss(): boolean;
}
/** Explicit local UI bridge, bound only while the game scene exists. */
export const localRunControls = {
  runtime: null as LocalRunRuntime | null,
  bind(runtime: LocalRunRuntime): () => void {
    this.runtime = runtime;
    return () => { if (this.runtime === runtime) this.runtime = null; };
  },
};
