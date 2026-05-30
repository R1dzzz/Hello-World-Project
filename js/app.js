/* ════════════════════════════════════════════════════════
   app.js — Main orchestrator
   Wires together: splash → cursor → audio → particles →
   scroll animations → card tilt → easter egg
════════════════════════════════════════════════════════ */

'use strict';

(function App() {

  /* Register GSAP plugins */
  gsap.registerPlugin(ScrollTrigger);

  /* Module references */
  let mainParticles = null;
  let audio         = null;
  let easterEgg     = null;

  /* ══════════════════════════════════════════════════════
     CURSOR
  ══════════════════════════════════════════════════════ */
  const cursorDot  = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Dot follows instantly */
    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    }
  }, { passive: true });

  /* Ring lags behind via lerp */
  (function lerpCursor() {
    ringX += (mouseX - ringX) * 0.09;
    ringY += (mouseY - ringY) * 0.09;

    if (cursorRing) {
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
    }

    requestAnimationFrame(lerpCursor);
  })();

  /* Hover enlargement */
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .profile-card, [data-hover]')) {
      cursorDot?.classList.add('is-hover');
      cursorRing?.classList.add('is-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .profile-card, [data-hover]')) {
      cursorDot?.classList.remove('is-hover');
      cursorRing?.classList.remove('is-hover');
    }
  });

  /* ══════════════════════════════════════════════════════
     AUDIO
  ══════════════════════════════════════════════════════ */
  function setupAudio() {
    audio = new AmbientAudio();

    const btn    = document.getElementById('audio-btn');
    const symbol = document.getElementById('audio-symbol');
    const label  = document.getElementById('audio-label');

    btn?.addEventListener('click', () => {
      const playing = audio.toggle();
      symbol.textContent = playing ? '♬' : '♪';
      label.textContent  = playing ? 'AMBIENT' : 'MUTED';
      btn.classList.toggle('is-playing', playing);
    });

    /* Auto-start on first ANY interaction (browser policy requires gesture) */
    const startOnce = () => {
      if (audio.isPlaying) return;
      audio.play();
      symbol.textContent = '♬';
      label.textContent  = 'AMBIENT';
      btn.classList.add('is-playing');
      document.removeEventListener('click',   startOnce);
      document.removeEventListener('keydown', startOnce);
      document.removeEventListener('scroll',  startOnce);
      document.removeEventListener('touchstart', startOnce);
    };

    document.addEventListener('click',      startOnce);
    document.addEventListener('keydown',    startOnce);
    document.addEventListener('scroll',     startOnce, { passive: true });
    document.addEventListener('touchstart', startOnce, { passive: true });
  }

  /* ══════════════════════════════════════════════════════
     PROFILE CARD — 3-D TILT
  ══════════════════════════════════════════════════════ */
  function setupCardTilt() {
    const card  = document.getElementById('profile-card');
    const shine = document.getElementById('card-shine');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);  /* -1 … +1 */
      const dy   = (e.clientY - cy) / (rect.height / 2);

      gsap.to(card, {
        rotateY:             dx * 9,
        rotateX:             -dy * 6,
        transformPerspective: 900,
        duration: 0.45,
        ease: 'power2.out',
      });

      /* Shine follows mouse */
      const px = ((e.clientX - rect.left) / rect.width)  * 100;
      const py = ((e.clientY - rect.top)  / rect.height) * 100;
      if (shine) {
        shine.style.setProperty('--shine-x', px + '%');
        shine.style.setProperty('--shine-y', py + '%');
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 1.0,
        ease: 'elastic.out(1, 0.6)',
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     SCROLL ANIMATIONS
  ══════════════════════════════════════════════════════ */
  function setupScrollAnimations() {

    /* ── HERO immediate reveal (no scroll needed) ── */
    gsap.timeline({ delay: 0.15 })
      .to('.eyebrow', {
        opacity: 1, y: 0,
        duration: 1.0, ease: 'power3.out',
      })
      .to('#h-hello', {
        y: '0%',
        duration: 1.6, ease: 'expo.out',
      }, '-=0.7')
      .to('#h-world', {
        y: '0%',
        duration: 1.6, ease: 'expo.out',
      }, '-=1.2')
      .to('.hero-sub', {
        opacity: 1, y: 0,
        duration: 1.1, ease: 'power3.out',
      }, '-=0.9')
      .to('.scroll-cue', {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'power3.out',
      }, '-=0.6');

    /* ── Hero parallax ── */
    gsap.to('.hero-title', {
      y: '-10%',
      scrollTrigger: {
        trigger: '#hero',
        start:  'top top',
        end:    'bottom top',
        scrub: 1.8,
      }
    });

    gsap.to('.hero-sub', {
      y: '-5%',
      opacity: 0,
      scrollTrigger: {
        trigger: '#hero',
        start:  '40% top',
        end:    'bottom top',
        scrub: 1.2,
      }
    });

    /* ── ABOUT section ── */
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 72%',
      once: true,
      onEnter() {
        gsap.timeline()
          .to('#about .section-num', {
            opacity: 1, y: 0,
            duration: 0.7, ease: 'power3.out',
          })
          .to('#about .reveal-up', {
            y: '0%',
            duration: 1.3,
            ease: 'expo.out',
            stagger: 0.14,
          }, '-=0.3')
          .to('.about-body', {
            opacity: 1, y: 0,
            duration: 1.1, ease: 'power3.out',
          }, '-=0.7')
          .to('.about-rule', {
            width: '100%',
            duration: 1.4,
            ease: 'power3.inOut',
          }, '-=0.5');
      }
    });

    /* ── GITHUB section ── */
    ScrollTrigger.create({
      trigger: '#github',
      start: 'top 72%',
      once: true,
      onEnter() {
        gsap.timeline()
          .to('#github .section-num', {
            opacity: 1, y: 0,
            duration: 0.7, ease: 'power3.out',
          })
          .to('#github .reveal-up', {
            y: '0%',
            duration: 1.3,
            ease: 'expo.out',
            stagger: 0.14,
          }, '-=0.3')
          .from('.profile-card', {
            opacity: 0, y: 36,
            duration: 1.1, ease: 'power3.out',
          }, '-=0.5');
      }
    });

    /* ── SIGNATURE section ── */
    ScrollTrigger.create({
      trigger: '#signature',
      start: 'top 82%',
      once: true,
      onEnter() {
        gsap.to('.sig-name', {
          opacity: 1,
          duration: 1.4,
          ease: 'power3.out',
          delay: 0.25,
        });
      }
    });
  }

  /* ══════════════════════════════════════════════════════
     MAIN INIT — called after splash finishes
  ══════════════════════════════════════════════════════ */
  function initMain() {
    const main = document.getElementById('main');

    /* Reveal main */
    main.classList.remove('main-hidden');
    gsap.to(main, { opacity: 1, duration: 0.01 }); /* instant (hidden was opacity:0) */

    /* Ambient particle canvas */
    mainParticles = new ParticleSystem('main-canvas', {
      count:      48,
      maxRadius:  1.0,
      speed:      0.18,
      maxOpacity: 0.22,
      connectDist: 95,
    });
    mainParticles.start();

    /* Audio */
    setupAudio();

    /* Card tilt */
    setupCardTilt();

    /* Scroll animations */
    setupScrollAnimations();

    /* Easter egg */
    easterEgg = new EasterEgg(mainParticles);
  }

  /* ══════════════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════════════ */
  function boot() {
    const splash = new SplashSequence(initMain);
    splash.run();
  }

  /* Start when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
