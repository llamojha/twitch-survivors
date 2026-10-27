/* Fantasy actor animation facade. The public API stays compatible with the inherited
 * combat code while rendering only the project's licensed fantasy presentation.
 */
G.Sprites = (() => {
  const PX = 2;
  const ANIMS = ['Idle', 'Walk', 'Attack', 'Shoot', 'Charge', 'Hurt', 'Faint'];
  const META = Object.freeze({ w: 24, h: 28, ax: 12, ay: 26, n: 4, r: 8, d: [8, 8, 8, 8] });
  const whiteImages = new WeakMap();

  function meta(dex) { return G.SPRITE_META[dex] || {}; }
  function hasShiny() { return false; }
  function hovers(dex) {
    return !!(G.Presentation && G.Presentation.kind(dex, 'enemy') === 'wisp');
  }
  function animName(dex, anim) { return ANIMS.includes(anim) ? anim : 'Idle'; }
  function animMeta() { return META; }
  function sheet() { return null; }
  function preload() { return Promise.resolve(); }
  /** Cached white silhouette used by hit flashes on props and actors. */
  function white(image) {
    let canvas = whiteImages.get(image);
    if (canvas) return canvas;
    canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    whiteImages.set(image, canvas);
    return canvas;
  }
  function dirFromAngle(a) {
    return ((Math.round((Math.PI / 2 - a) / (Math.PI / 4)) % 8) + 8) % 8;
  }
  function bodyRadius(dex, scale = 1) { return 12 * scale; }
  function bodyHeight(dex, scale = 1) { return 34 * scale; }
  function drawShadow(ctx, dex, x, y, scale = 1) {
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath();
    ctx.ellipse(x, y, 16 * scale, 6.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  class Animator {
    constructor(dex, scale = 1, shiny = false, context = null) {
      this.dex = dex;
      this.context = context;
      this.shiny = false;
      this.scale = scale;
      this.base = 'Idle';
      this.cur = 'Idle';
      this.frame = 0;
      this.t = 0;
      this.speed = 1;
      this.once = false;
      this.hold = false;
      this.done = false;
      this.dir = 0;
    }
    loop(anim, speed = 1) {
      this.base = animName(this.dex, anim);
      if (!this.once && this.cur !== this.base) this._start(this.base, false);
      if (!this.once) this.speed = speed;
    }
    play(anim, opts = {}) {
      this._start(anim, true);
      this.speed = opts.speed || 1;
      this.hold = !!opts.hold;
    }
    busy() { return this.once && !this.done; }
    progress() {
      const total = META.d.reduce((sum, d) => sum + d, 0);
      const before = META.d.slice(0, this.frame).reduce((sum, d) => sum + d, 0);
      return total ? (before + this.t) / total : 1;
    }
    _start(anim, once) {
      this.cur = animName(this.dex, anim);
      this.frame = 0;
      this.t = 0;
      this.once = once;
      this.done = false;
    }
    update(dt) {
      if (this.done) return;
      this.t += dt * 60 * this.speed;
      while (this.t >= META.d[this.frame]) {
        this.t -= META.d[this.frame];
        this.frame++;
        if (this.frame >= META.n) {
          if (this.once) {
            if (this.hold) {
              this.frame = META.n - 1;
              this.done = true;
              return;
            }
            this._start(this.base, false);
            this.speed = 1;
            return;
          }
          this.frame = 0;
        }
      }
    }
    draw(ctx, x, y, opts = {}) {
      G.Presentation.drawActor(ctx, this.dex, x, y, this.scale, this.dir, this.cur, this.frame, opts, this.context);
    }
  }

  return {
    PX, meta, hasShiny, hovers, white, animName, animMeta, sheet, preload, dirFromAngle,
    bodyRadius, bodyHeight, drawShadow, Animator, ANIMS, get sheetCount() { return 0; }
  };
})();
