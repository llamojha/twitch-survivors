/* ============ provider.js — contrato común de audiencia ============ */
(function (root) {
  'use strict';

  const G = root.G = root.G || {};

  function copyViewer(viewer) {
    return { id: viewer.id, displayName: viewer.displayName };
  }

  function viewerJoin(id, displayName) {
    const stableId = typeof id === 'string' ? id.trim() : '';
    const name = typeof displayName === 'string' ? displayName.trim() : '';
    if (!stableId || !name) return null;
    return { type: 'viewer_join', viewer: { id: stableId, displayName: name } };
  }

  function copyStatus(status) {
    return { state: status.state, message: status.message };
  }

  /** Pequeño emisor compartido por proveedores; no contiene lógica de transporte. */
  class AudienceProvider {
    constructor() {
      this._events = new Set();
      this._statuses = new Set();
      this._status = { state: 'disconnected', message: 'Audience disconnected.' };
    }

    onEvent(handler) {
      this._events.add(handler);
      return () => this._events.delete(handler);
    }

    onStatus(handler) {
      this._statuses.add(handler);
      handler(copyStatus(this._status));
      return () => this._statuses.delete(handler);
    }

    _emitEvent(event) {
      if (!event || event.type !== 'viewer_join') return;
      const normalized = viewerJoin(event.viewer && event.viewer.id, event.viewer && event.viewer.displayName);
      if (normalized) this._events.forEach(handler => handler(normalized));
    }

    _setStatus(state, message) {
      this._status = { state, message };
      this._statuses.forEach(handler => handler(copyStatus(this._status)));
    }
  }

  const api = { AudienceProvider, viewerJoin, copyViewer, copyStatus };
  G.AudienceProvider = AudienceProvider;
  G.AudienceEvent = { viewerJoin };
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof module === 'object' && module.exports ? globalThis : { G });
