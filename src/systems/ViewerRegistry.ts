import type { ViewerIdentity } from '../audience/AudienceProvider';

/** Run-local FIFO registry, deduplicated exclusively by provider identity. */
export class ViewerRegistry {
  private readonly viewers = new Map<string, ViewerIdentity>();

  private readonly active = new Set<string>();

  add(viewer: ViewerIdentity): boolean {
    if (this.viewers.has(viewer.id)) return false;
    this.viewers.set(viewer.id, { ...viewer });
    return true;
  }

  /** Defensive snapshot: callers cannot mutate queue identities or ordering. */
  getViewers(): ViewerIdentity[] {
    return Array.from(this.viewers.values()).filter(viewer => !this.active.has(viewer.id)).map(viewer => ({ ...viewer }));
  }

  getActiveViewers(): ViewerIdentity[] {
    return Array.from(this.viewers.values()).filter(viewer => this.active.has(viewer.id)).map(viewer => ({ ...viewer }));
  }

  admit(id: string): boolean {
    if (!this.viewers.has(id) || this.active.has(id)) return false;
    this.active.add(id);
    return true;
  }

  reset(): void {
    this.active.clear();
    this.viewers.clear();
  }
}
