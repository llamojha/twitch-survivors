import type { AudienceProvider, AudienceStatus, ViewerIdentity } from './AudienceProvider';
import { ViewerRegistry } from '../systems/ViewerRegistry';

/** Owns provider lifetime and the shared run-local audience queue. */
export class AudienceSession {
  private readonly registry = new ViewerRegistry();
  private provider: AudienceProvider | null = null;
  private revision = 0;
  private subscriptions: (() => void)[] = [];
  private status: AudienceStatus = { state: 'disconnected', message: 'Audience disconnected' };
  private readonly changes = new Set<() => void>();
  private readonly queues = new Set<(viewers: ViewerIdentity[]) => void>();
  private readonly statuses = new Set<(status: AudienceStatus) => void>();

  getViewers(): ViewerIdentity[] { return this.registry.getViewers(); }
  getStatus(): AudienceStatus { return { ...this.status }; }

  onChange(handler: () => void): () => void {
    this.changes.add(handler);
    handler();
    return () => this.changes.delete(handler);
  }

  onQueue(handler: (viewers: ViewerIdentity[]) => void): () => void {
    this.queues.add(handler);
    handler(this.getViewers());
    return () => this.queues.delete(handler);
  }

  onStatus(handler: (status: AudienceStatus) => void): () => void {
    this.statuses.add(handler);
    handler(this.getStatus());
    return () => this.statuses.delete(handler);
  }

  /** Starts a fresh run without disconnecting its audience source. */
  reset(): void {
    this.registry.reset();
    this.emitQueue();
  }

  /** Switches sources, clears the queue, and ignores obsolete async callbacks. */
  async setProvider(provider: AudienceProvider | null): Promise<void> {
    const revision = ++this.revision;
    const previous = this.provider;
    this.provider = provider;
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    this.reset();
    this.setStatus({ state: provider ? 'connecting' : 'disconnected',
      message: provider ? 'Connecting audience…' : 'Audience disconnected' });
    if (previous) {
      try { await previous.disconnect(); }
      catch (error: unknown) {
        if (revision !== this.revision) return;
        this.setStatus({ state: 'error', message: this.errorMessage(error) });
        return;
      }
    }
    if (revision !== this.revision || !provider) return;
    this.subscriptions = [
      provider.onEvent(event => {
        if (revision !== this.revision) return;
        if (event.type === 'viewer_join' && this.registry.add(event.viewer)) this.emitQueue();
      }),
      provider.onStatus(status => {
        if (revision === this.revision) this.setStatus(status);
      }),
    ];
    try { await provider.connect(); }
    catch (error: unknown) {
      if (revision === this.revision) this.setStatus({ state: 'error', message: this.errorMessage(error) });
    }
  }

  disconnect(): Promise<void> { return this.setProvider(null); }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Audience connection failed';
  }

  private emitQueue(): void {
    this.queues.forEach(handler => handler(this.getViewers()));
    this.changes.forEach(handler => handler());
  }

  private setStatus(status: AudienceStatus): void {
    this.status = { ...status };
    this.statuses.forEach(handler => handler(this.getStatus()));
    this.changes.forEach(handler => handler());
  }
}

export const audienceSession = new AudienceSession();
