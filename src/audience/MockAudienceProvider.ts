import type { AudienceEvent, AudienceProvider, AudienceStatus } from './AudienceProvider';

/** Local-only audience input, using the same event path as remote providers. */
export class MockAudienceProvider implements AudienceProvider {
  private connected = false;
  private nextViewer = 1;
  private readonly events = new Set<(event: AudienceEvent) => void>();
  private readonly statuses = new Set<(status: AudienceStatus) => void>();

  async connect(): Promise<void> {
    this.connected = true;
    this.emitStatus({ state: 'connected', message: 'Mock audience connected' });
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.emitStatus({ state: 'disconnected', message: 'Mock audience disconnected' });
  }

  /** Returns false for blank names or disconnected input. Duplicates still emit. */
  join(displayName: string): boolean {
    const name = displayName.trim();
    if (!this.connected || !name) return false;
    const event: AudienceEvent = {
      type: 'viewer_join', viewer: { id: `mock:${name.toLowerCase()}`, displayName: name },
    };
    this.events.forEach(handler => handler(event));
    return true;
  }

  joinBatch(count: number): void {
    if (!Number.isFinite(count) || count <= 0) return;
    for (let index = 0; index < Math.floor(count); index++) {
      this.join(`Viewer ${this.nextViewer++}`);
    }
  }

  onEvent(handler: (event: AudienceEvent) => void): () => void {
    this.events.add(handler);
    return () => this.events.delete(handler);
  }

  onStatus(handler: (status: AudienceStatus) => void): () => void {
    this.statuses.add(handler);
    return () => this.statuses.delete(handler);
  }

  private emitStatus(status: AudienceStatus): void {
    this.statuses.forEach(handler => handler(status));
  }
}
