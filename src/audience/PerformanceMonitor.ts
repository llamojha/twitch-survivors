export interface PerformanceSnapshot {
  samples: number;
  meanFrameMs: number;
  p95FrameMs: number;
  maxFrameMs: number;
  activeViewers: number;
  activeEnemies: number;
  activeProjectiles: number;
  droppedShots: number;
  visibleLabels: number;
}

/** Bounded rolling game-loop timing; excludes paused frames and is not a GPU benchmark. */
export class PerformanceMonitor {
  private readonly frames: number[] = [];
  private cursor = 0;
  private activeViewers = 0;
  private activeEnemies = 0;
  private activeProjectiles = 0;
  private droppedShots = 0;
  private visibleLabels = 0;

  constructor(private readonly capacity = 600) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Frame capacity must be a positive integer');
  }

  record(deltaMs: number, activeViewers: number, activeEnemies: number,
    activeProjectiles = 0, droppedShots = 0, visibleLabels = 0): void {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
    if (this.frames.length < this.capacity) this.frames.push(deltaMs);
    else this.frames[this.cursor] = deltaMs;
    this.cursor = (this.cursor + 1) % this.capacity;
    this.activeViewers = activeViewers;
    this.activeEnemies = activeEnemies;
    this.activeProjectiles = activeProjectiles;
    this.droppedShots = droppedShots;
    this.visibleLabels = visibleLabels;
  }

  reset(): void {
    this.frames.length = 0;
    this.cursor = 0;
    this.activeViewers = this.activeEnemies = this.activeProjectiles = this.droppedShots = this.visibleLabels = 0;
  }

  snapshot(): PerformanceSnapshot {
    const sorted = [...this.frames].sort((a, b) => a - b);
    const samples = sorted.length;
    return {
      samples,
      meanFrameMs: samples ? sorted.reduce((sum, value) => sum + value, 0) / samples : 0,
      p95FrameMs: samples ? sorted[Math.ceil(samples * 0.95) - 1] : 0,
      maxFrameMs: samples ? sorted[samples - 1] : 0,
      activeViewers: this.activeViewers,
      activeEnemies: this.activeEnemies,
      activeProjectiles: this.activeProjectiles,
      droppedShots: this.droppedShots,
      visibleLabels: this.visibleLabels,
    };
  }
}

export const audiencePerformance = new PerformanceMonitor();
