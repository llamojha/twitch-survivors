/* ============ session.js — cola y ciclo de vida de audiencia ============ */
(function (root) {
  'use strict';

  const G = root.G = root.G || {};
  const providerApi = typeof require === 'function' ? require('./provider.js') : null;
  const recruitmentApi = typeof require === 'function' ? require('./recruitment.js') : null;
  const copyViewer = providerApi ? providerApi.copyViewer : viewer => ({ id: viewer.id, displayName: viewer.displayName });
  const RecruitmentController = recruitmentApi ? recruitmentApi.RecruitmentController : G.RecruitmentController;

  class ViewerRegistry {
    constructor() { this.reset(); }

    add(viewer) {
      if (!viewer || typeof viewer.id !== 'string' || typeof viewer.displayName !== 'string') return false;
      const id = viewer.id.trim();
      const displayName = viewer.displayName.trim();
      const key = id.toLocaleLowerCase('en-US');
      if (!id || !displayName || this._known.has(key)) return false;
      const owned = { id, displayName };
      this._known.add(key);
      this._waiting.push(owned);
      return true;
    }

    admit(id) {
      if (!this._waiting.length || this._waiting[0].id !== id) return false;
      this._active.push(this._waiting.shift());
      return true;
    }

    waiting() { return this._waiting.map(copyViewer); }
    active() { return this._active.map(copyViewer); }

    reset() {
      this._known = new Set();
      this._waiting = [];
      this._active = [];
    }
  }

  class AudienceSession {
    constructor() {
      this._registry = new ViewerRegistry();
      this._recruitment = new RecruitmentController();
      this._runtime = null;
      this._provider = null;
      this._generation = 0;
      this._subscriptions = [];
      this._status = { state: 'disconnected', message: 'Audience disconnected.' };
      this._changes = new Set();
      this._queues = new Set();
      this._statuses = new Set();
    }

    getViewers() { return this._registry.waiting(); }
    getActiveViewers() { return this._registry.active(); }
    getStatus() { return { state: this._status.state, message: this._status.message }; }
    isEnabled() { return this._recruitment.enabled; }
    getRecruitmentMode() { return this._recruitment.mode; }
    getRecruitmentCredits() { return this._recruitment.credits; }

    setEnabled(enabled) {
      this._recruitment.setEnabled(enabled, this._level());
      this._emitQueue();
    }

    setRecruitmentMode(mode) {
      this._recruitment.setMode(mode);
      this._emitQueue();
    }

    bindRuntime(runtime) {
      this._runtime = runtime;
      this._recruitment.reset(this._level());
      this._emitQueue();
      return () => {
        if (this._runtime === runtime) {
          this._runtime = null;
          this._emitQueue();
        }
      };
    }

    refreshRuntime() { this._emitQueue(); }
    recordLevel(level) { this._recruitment.recordLevel(level); this._emitQueue(); }
    canRecruit() { return this._running() && this._recruitment.canRecruit(); }
    canSimulateLevel() { return this._running(); }

    simulateLevel() {
      if (!this.canSimulateLevel()) return false;
      this._runtime.simulateLevel();
      return true;
    }

    admit(id) {
      if (!this.canRecruit() || this.getViewers()[0]?.id !== id) return false;
      if (!this._registry.admit(id) || !this._recruitment.consume()) return false;
      this._emitQueue();
      return true;
    }

    onChange(handler) {
      this._changes.add(handler);
      handler();
      return () => this._changes.delete(handler);
    }

    onQueue(handler) {
      this._queues.add(handler);
      handler(this.getViewers());
      return () => this._queues.delete(handler);
    }

    onStatus(handler) {
      this._statuses.add(handler);
      handler(this.getStatus());
      return () => this._statuses.delete(handler);
    }

    /** Inicia una partida limpia sin desconectar la fuente elegida. */
    reset() {
      this._registry.reset();
      this._recruitment.reset(this._level());
      this._emitQueue();
    }

    /** Cambia de fuente y descarta cualquier callback o rechazo de generaciones anteriores. */
    async setProvider(provider) {
      const generation = ++this._generation;
      const previous = this._provider;
      this._provider = provider || null;
      this._subscriptions.forEach(unsubscribe => unsubscribe());
      this._subscriptions = [];
      this.reset();
      this._setStatus(provider ? 'connecting' : 'disconnected', provider ? 'Connecting audience…' : 'Audience disconnected.');

      if (previous) {
        try { await previous.disconnect(); }
        catch (_) {
          if (generation === this._generation) this._setStatus('error', 'Audience disconnection failed.');
          return;
        }
      }
      if (generation !== this._generation || !provider) return;

      this._subscriptions = [
        provider.onEvent(event => {
          if (generation !== this._generation || event.type !== 'viewer_join') return;
          if (this._registry.add(event.viewer)) this._emitQueue();
        }),
        provider.onStatus(status => {
          if (generation === this._generation) this._setStatus(status.state, status.message);
        })
      ];

      try { await provider.connect(); }
      catch (_) {
        if (generation === this._generation) this._setStatus('error', 'Audience connection failed.');
      }
    }

    disconnect() { return this.setProvider(null); }
    _level() { return this._runtime && Number.isFinite(this._runtime.level()) ? this._runtime.level() : 1; }
    _running() { return !!(this._runtime && this._runtime.running()); }

    _emitQueue() {
      this._queues.forEach(handler => handler(this.getViewers()));
      this._changes.forEach(handler => handler());
    }

    _setStatus(state, message) {
      this._status = { state, message };
      this._statuses.forEach(handler => handler(this.getStatus()));
      this._changes.forEach(handler => handler());
    }
  }

  G.ViewerRegistry = ViewerRegistry;
  G.AudienceSession = AudienceSession;
  G.audienceSession = G.audienceSession || new AudienceSession();
  if (typeof module === 'object' && module.exports) module.exports = { ViewerRegistry, AudienceSession };
})(typeof module === 'object' && module.exports ? globalThis : { G });
