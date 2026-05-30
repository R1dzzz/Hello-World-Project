/* ════════════════════════════════════════════════════════
   easter-egg.js — Konami Code secret mode
   ↑ ↑ ↓ ↓ ← → ← → B A

   Activates:
   • Full-screen overlay with hidden message
   • Particle storm on the egg canvas
   • Main particle system secret mode (purple + fast)
════════════════════════════════════════════════════════ */

'use strict';

class EasterEgg {
  /**
   * @param {ParticleSystem|null} mainParticles - main ambient particle system
   */
  constructor(mainParticles) {
    this.mainParticles = mainParticles;
    this.eggParticles  = null;
    this.isActive      = false;
    this.inputBuffer   = [];

    this.KONAMI = [
      'ArrowUp','ArrowUp',
      'ArrowDown','ArrowDown',
      'ArrowLeft','ArrowRight',
      'ArrowLeft','ArrowRight',
      'b','a',
    ];

    this._listen();
  }

  /* ── Keyboard listener ── */
  _listen() {
    document.addEventListener('keydown', (e) => {
      this.inputBuffer.push(e.key);

      /* Keep only the last N inputs */
      if (this.inputBuffer.length > this.KONAMI.length) {
        this.inputBuffer.shift();
      }

      if (this._matchesKonami()) {
        this.activate();
      }
    });
  }

  _matchesKonami() {
    return JSON.stringify(this.inputBuffer) === JSON.stringify(this.KONAMI);
  }

  /* ── Activate secret mode ── */
  activate() {
    if (this.isActive) return;
    this.isActive = true;

    /* Main particles: go crazy */
    if (this.mainParticles) {
      this.mainParticles.activateSecret();
    }

    /* Start dedicated egg canvas particles */
    this.eggParticles = new ParticleSystem('egg-canvas', {
      count:      180,
      maxRadius:  2.0,
      speed:      0.6,
      maxOpacity: 0.7,
      connectDist: 80,
      color:      '100,60,220',
    });
    this.eggParticles.activateSecret();
    this.eggParticles.start();

    /* Show overlay */
    const overlay = document.getElementById('egg-overlay');
    const inner   = document.getElementById('egg-inner');

    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');

    const tl = gsap.timeline();

    tl.to(overlay, {
      opacity: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      duration: 0.65,
      ease: 'power2.out',
    });

    tl.to(inner, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: 'expo.out',
    }, '-=0.3');

    /* Wire up close button */
    document.getElementById('egg-close').addEventListener('click', () => {
      this.deactivate();
    }, { once: true });

    /* Also close on Escape */
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.deactivate();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /* ── Deactivate, return to normal ── */
  deactivate() {
    if (!this.isActive) return;

    const overlay = document.getElementById('egg-overlay');
    const inner   = document.getElementById('egg-inner');

    const tl = gsap.timeline({
      onComplete: () => {
        overlay.classList.remove('is-active');
        overlay.setAttribute('aria-hidden', 'true');

        /* Tear down egg particles */
        if (this.eggParticles) {
          this.eggParticles.destroy();
          this.eggParticles = null;
        }

        /* Restore main particles */
        if (this.mainParticles) {
          this.mainParticles.deactivateSecret();
        }

        this.isActive    = false;
        this.inputBuffer = [];
      }
    });

    tl.to(inner, {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power2.in',
    });

    tl.to(overlay, {
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
    }, '-=0.2');
  }
}

window.EasterEgg = EasterEgg;
