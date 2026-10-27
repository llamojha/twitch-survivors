/* ============ mock-provider.js — audiencia local determinista ============ */
(function (root) {
  'use strict';

  const G = root.G = root.G || {};
  const api = typeof require === 'function' ? require('./provider.js') : null;
  const BaseProvider = api ? api.AudienceProvider : G.AudienceProvider;
  const viewerJoin = api ? api.viewerJoin : G.AudienceEvent.viewerJoin;

  class MockAudienceProvider extends BaseProvider {
    constructor() {
      super();
      this.source = 'local';
      this.connected = false;
      this.nextViewer = 1;
    }

    async connect() {
      this.connected = true;
      this._setStatus('connected', 'Mock audience connected.');
    }

    async disconnect() {
      this.connected = false;
      this._setStatus('disconnected', 'Mock audience disconnected.');
    }

    join(displayName) {
      const name = typeof displayName === 'string' ? displayName.trim() : '';
      if (!this.connected || !name) return false;
      this._emitEvent(viewerJoin('mock:' + name.toLocaleLowerCase('en-US'), name));
      return true;
    }

    joinBatch(count) {
      if (!Number.isFinite(count) || count <= 0) return 0;
      let joined = 0;
      for (let index = 0; index < Math.floor(count); index += 1) {
        if (this.join('Viewer ' + this.nextViewer++)) joined += 1;
      }
      return joined;
    }
  }

  G.MockAudienceProvider = MockAudienceProvider;
  if (typeof module === 'object' && module.exports) module.exports = { MockAudienceProvider };
})(typeof module === 'object' && module.exports ? globalThis : { G });
