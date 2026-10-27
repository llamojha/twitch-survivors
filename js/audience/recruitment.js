/* ============ recruitment.js — política de reclutamiento por partida ============ */
(function (root) {
  'use strict';

  const G = root.G = root.G || {};

  class RecruitmentController {
    constructor() {
      this.enabled = false;
      this.mode = 'level';
      this.credits = 0;
      this.lastLevel = 1;
    }

    reset(level) {
      this.credits = 0;
      this.lastLevel = validLevel(level);
    }

    setEnabled(enabled, level) {
      enabled = !!enabled;
      if (enabled === this.enabled) return;
      this.enabled = enabled;
      this.lastLevel = validLevel(level);
      if (enabled) this.mode = 'level';
    }

    setMode(mode) {
      if (mode !== 'level' && mode !== 'join-all') throw new TypeError('Unknown recruitment mode');
      this.mode = mode;
    }

    recordLevel(level) {
      level = validLevel(level);
      if (level <= this.lastLevel) return 0;
      const earned = this.enabled && this.mode === 'level' ? level - this.lastLevel : 0;
      this.credits += earned;
      this.lastLevel = level;
      return earned;
    }

    canRecruit() {
      return this.enabled && (this.mode === 'join-all' || this.credits > 0);
    }

    consume() {
      if (!this.canRecruit()) return false;
      if (this.mode === 'level') this.credits -= 1;
      return true;
    }
  }

  function validLevel(level) {
    return Number.isFinite(level) && level >= 1 ? Math.floor(level) : 1;
  }

  G.RecruitmentController = RecruitmentController;
  if (typeof module === 'object' && module.exports) module.exports = { RecruitmentController };
})(typeof module === 'object' && module.exports ? globalThis : { G });
