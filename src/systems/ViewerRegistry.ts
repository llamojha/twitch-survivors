import type { ViewerIdentity } from '../audience/AudienceProvider';

/** Run-local FIFO registry, deduplicated exclusively by provider identity. */
export class ViewerRegistry {
  private readonly viewers = new Map<string, ViewerIdentity>();

  add(viewer: ViewerIdentity): boolean {
    if (this.viewers.has(viewer.id)) return false;
    this.viewers.set(viewer.id, { ...viewer });
    return true;
  }

  /** Defensive snapshot: callers cannot mutate queue identities or ordering. */
  getViewers(): ViewerIdentity[] {
    return Array.from(this.viewers.values(), viewer => ({ ...viewer }));
  }

  reset(): void {
    this.viewers.clear();
  }
}
