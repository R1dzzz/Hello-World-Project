/* ════════════════════════════════════════════════════════
   particles.js — Canvas particle system
   Supports: splash canvas + main ambient canvas + egg canvas
════════════════════════════════════════════════════════ */

'use strict';

class ParticleSystem {
  /**
   * @param {string}  canvasId  - id of <canvas> element
   * @param {object}  opts      - configuration overrides
   */
  constructor(canvasId, opts = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.raf = null;
    this.running = false;
    this.secretMode = false;
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };

    /* Configuration */
    this.cfg = Object.assign({
      count:           70,
      maxRadius:       1.4,
      speed:           0.28,
      connectDist:     115,
      maxOpacity:      0.55,
      color:           '255,255,255',   /* RGB string */
      mousePush:       false,
      pushStrength:    40,
    }, opts);

    this._resize();
    this._spawn();

    /* React to window resize */
    this._onResize = () => this._resize();
    window.addEventListener('resize', this._onResize, { passive: true });

    /* Track mouse for gentle parallax */
    this._onMouse = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', this._onMouse, { passive: true });
  }

  /* ── Internal: canvas sizing ── */
  _resize() {
    if (!this.canvas) return;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /* ── Internal: spawn one particle ── */
  _make(x, y) {
    const speed = this.cfg.speed;
    return {
      x:    x  ?? Math.random() * this.canvas.width,
      y:    y  ?? Math.random() * this.canvas.height,
      r:    Math.random() * this.cfg.maxRadius + 0.25,
      vx:   (Math.random() - 0.5) * speed,
      vy:   (Math.random() - 0.5) * speed,
      o:    Math.random() * this.cfg.maxOpacity * 0.6 + 0.05,
      od:   (Math.random() > 0.5 ? 1 : -1) * 0.0018,
      depth: Math.random(),   /* 0 = far, 1 = near */
    };
  }

  /* ── Internal: initial spawn ── */
  _spawn() {
    this.particles = [];
    for (let i = 0; i < this.cfg.count; i++) {
      this.particles.push(this._make());
    }
  }

  /* ── Public: activate secret / konami mode ── */
  activateSecret() {
    this.secretMode = true;
    /* Burst in extra particles */
    for (let i = 0; i < 140; i++) {
      this.particles.push(this._make(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height
      ));
    }
  }

  deactivateSecret() {
    this.secretMode = false;
    this.particles = this.particles.slice(0, this.cfg.count);
  }

  /* ── Render one frame ── */
  _tick() {
    if (!this.canvas) return;
    const { ctx, canvas, cfg, particles, mouse, secretMode } = this;
    const W = canvas.width;
    const H = canvas.height;
    const connectD = cfg.connectDist;

    ctx.clearRect(0, 0, W, H);

    const len = particles.length;

    for (let i = 0; i < len; i++) {
      const p = particles[i];

      /* Mouse push repulsion */
      if (cfg.mousePush) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < cfg.pushStrength) {
          const force = (cfg.pushStrength - d) / cfg.pushStrength;
          p.vx += (dx / d) * force * 0.4;
          p.vy += (dy / d) * force * 0.4;
        }
      }

      /* Velocity damping */
      p.vx *= 0.997;
      p.vy *= 0.997;

      /* Position */
      const spd = secretMode ? 1.9 : 1;
      p.x += p.vx * spd;
      p.y += p.vy * spd;

      /* Wrap at edges */
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;

      /* Breathe opacity */
      p.o += p.od;
      if (p.o <= 0.03 || p.o >= cfg.maxOpacity) p.od *= -1;

      /* Color: secret = purple-ish tint based on depth */
      let color = cfg.color;
      if (secretMode) {
        const r = Math.floor(80  + p.depth * 100);
        const g = Math.floor(20  + p.depth * 40);
        const b = Math.floor(180 + p.depth * 75);
        color = `${r},${g},${b}`;
      }

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${p.o})`;
      ctx.fill();

      /* Draw connecting lines to nearby particles */
      for (let j = i + 1; j < len; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectD) {
          const alpha = (1 - dist / connectD) * 0.13;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${color},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ── Public: start animation loop ── */
  start() {
    if (this.running) return;
    this.running = true;

    const loop = () => {
      if (!this.running) return;
      this._tick();
      this.raf = requestAnimationFrame(loop);
    };

    loop();
  }

  /* ── Public: stop animation loop ── */
  stop() {
    this.running = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  /* ── Public: clean up event listeners ── */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMouse);
  }
}

/* Expose globally for other modules */
window.ParticleSystem = ParticleSystem;
