/* ════════════════════════════════════════════════════════
   splash.js — Cinematic opening sequence
   Orchestrates particles → text reveals → progress bar → exit
════════════════════════════════════════════════════════ */

'use strict';

class SplashSequence {
  /**
   * @param {Function} onComplete  - called when splash finishes exiting
   */
  constructor(onComplete) {
    this.onComplete    = onComplete;
    this.el            = document.getElementById('splash');
    this.progressEl    = document.getElementById('splash-progress');

    /* Particle system for the opening canvas */
    this.particles = new ParticleSystem('splash-canvas', {
      count:      55,
      maxRadius:  1.1,
      speed:      0.18,
      maxOpacity: 0.38,
      connectDist: 95,
    });
  }

  /* ── Run the full opening sequence ── */
  run() {
    /* Start ambient particles immediately */
    this.particles.start();

    /* ── Timeline ──────────────────────────────────────────
       0.0s  progress bar begins
       0.5s  eyebrow text fades in
       1.0s  HELLO slides up
       1.35s WORLD slides up
       1.9s  tagline fades in
       2.2s  progress completes
       2.4s  exit begins
    ─────────────────────────────────────────────────────── */
    const tl = gsap.timeline({ onComplete: () => this._exit() });

    /* Progress bar — slightly faster than the sequence so it finishes with text */
    tl.to(this.progressEl, {
      width: '100%',
      duration: 3.8,
      ease: 'power1.inOut',
    }, 0);

    /* Top eyebrow */
    tl.to('#splash-eyebrow', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    }, 0.5);

    /* HELLO reveal */
    tl.to('#sw-hello', {
      y: '0%',
      duration: 1.5,
      ease: 'expo.out',
    }, 1.0);

    /* WORLD reveal (staggered) */
    tl.to('#sw-world', {
      y: '0%',
      duration: 1.5,
      ease: 'expo.out',
    }, 1.35);

    /* Bottom tagline */
    tl.to('#splash-tagline', {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    }, 1.9);

    /* Hold before exit */
    tl.to({}, { duration: 0.9 });
  }

  /* ── Dramatic exit ── */
  _exit() {
    const tl = gsap.timeline({
      onComplete: () => {
        /* Remove splash from DOM entirely */
        this.el.style.display = 'none';
        this.particles.destroy();

        if (typeof this.onComplete === 'function') {
          this.onComplete();
        }
      }
    });

    this.el.classList.add('is-exiting');

    /* Fade & scale out words */
    tl.to(['.splash-word'], {
      y: '-8%',
      opacity: 0,
      duration: 0.9,
      ease: 'power2.inOut',
      stagger: 0.1,
    }, 0);

    tl.to(['#splash-eyebrow', '#splash-tagline'], {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
    }, 0.05);

    /* Fade progress bar */
    tl.to(this.progressEl, {
      opacity: 0,
      duration: 0.4,
    }, 0.1);

    /* Darken, then fade entire splash */
    tl.to(this.el, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    }, 0.5);
  }
}

window.SplashSequence = SplashSequence;
