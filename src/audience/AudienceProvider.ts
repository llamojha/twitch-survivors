/** Stable provider identity: display names are labels, never deduplication keys. */
export interface ViewerIdentity {
  id: string;
  displayName: string;
}

export type AudienceEvent = { type: 'viewer_join'; viewer: ViewerIdentity };
export interface AudienceStatus {
  state: 'disconnected' | 'connecting' | 'connected' | 'error';
  message: string;
}

/** Providers translate transport-specific input into generic audience events. */
export interface AudienceProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onEvent(handler: (event: AudienceEvent) => void): () => void;
  onStatus(handler: (status: AudienceStatus) => void): () => void;
}
