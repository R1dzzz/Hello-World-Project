/* ════════════════════════════════════════════════════════
   audio.js — Generative ambient drone
   Uses Web Audio API oscillators + reverb convolution.
   Zero external audio files. Starts on first interaction.
════════════════════════════════════════════════════════ */

'use strict';

class AmbientAudio {
  constructor() {
    this.actx         = null;
    this.masterGain   = null;
    this.reverbNode   = null;
    this.sources      = [];
    this.isPlaying    = false;
    this._initialized = false;
  }

  /* ── Bootstrap the AudioContext (must be called from user gesture) ── */
  _init() {
    if (this._initialized) return;

    this.actx       = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.actx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.actx.currentTime);
    this.masterGain.connect(this.actx.destination);

    /* Build a lush reverb from a noise-based impulse response */
    this.reverbNode = this._buildReverb(4.5);
    this.reverbNode.connect(this.masterGain);

    /* Dry path for sub bass (no reverb) */
    this.dryPath = this.actx.createGain();
    this.dryPath.gain.setValueAtTime(0.06, this.actx.currentTime);
    this.dryPath.connect(this.masterGain);

    this._buildDrone();
    this._initialized = true;
  }

  /* ── Create impulse-response reverb ── */
  _buildReverb(duration) {
    const convolver = this.actx.createConvolver();
    const sampleRate = this.actx.sampleRate;
    const length     = Math.floor(sampleRate * duration);
    const impulse    = this.actx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        /* Exponential decay noise */
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.2);
      }
    }

    convolver.buffer = impulse;
    return convolver;
  }

  /* ── Build the layered drone sound ── */
  _buildDrone() {
    /*
      Pitch set: A minor pentatonic drone
      A1=55  E2=82.5  A2=110  C3=130.8  E3=164.8
      Each oscillator gets its own LFO for slow pitch wobble.
    */
    const layers = [
      { freq: 55,    type: 'sine',     gain: 0.07, lfoRate: 0.04, lfoDepth: 0.3  },
      { freq: 82.5,  type: 'sine',     gain: 0.05, lfoRate: 0.06, lfoDepth: 0.5  },
      { freq: 110,   type: 'triangle', gain: 0.04, lfoRate: 0.05, lfoDepth: 0.8  },
      { freq: 130.8, type: 'triangle', gain: 0.025,lfoRate: 0.07, lfoDepth: 0.6  },
      { freq: 164.8, type: 'sine',     gain: 0.018,lfoRate: 0.09, lfoDepth: 1.0  },
    ];

    layers.forEach(({ freq, type, gain: gainVal, lfoRate, lfoDepth }) => {
      const osc    = this.actx.createOscillator();
      const gain   = this.actx.createGain();
      const filter = this.actx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.actx.currentTime);

      /* Random detune for warmth */
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, this.actx.currentTime);

      /* Low-pass filter — keeps it soft */
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, this.actx.currentTime);
      filter.Q.setValueAtTime(0.6, this.actx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.actx.currentTime);

      /* LFO for vibrato */
      const lfo      = this.actx.createOscillator();
      const lfoGain  = this.actx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(lfoRate, this.actx.currentTime);
      lfoGain.gain.setValueAtTime(lfoDepth, this.actx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.reverbNode);

      osc.start();
      lfo.start();

      this.sources.push({ osc, gain, filter, lfo, lfoGain });
    });

    /* Deep sub-bass (straight to dry path) */
    const sub     = this.actx.createOscillator();
    const subGain = this.actx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(27.5, this.actx.currentTime); /* A0 */
    subGain.gain.setValueAtTime(0.05, this.actx.currentTime);
    sub.connect(subGain);
    subGain.connect(this.dryPath);
    sub.start();
    this.sources.push({ osc: sub, gain: subGain });
  }

  /* ── Fade master gain up ── */
  play() {
    this._init();

    if (this.actx.state === 'suspended') {
      this.actx.resume();
    }

    this.masterGain.gain.cancelScheduledValues(this.actx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.actx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.55, this.actx.currentTime + 3.5);

    this.isPlaying = true;
  }

  /* ── Fade master gain to silence ── */
  pause() {
    if (!this._initialized) return;

    this.masterGain.gain.cancelScheduledValues(this.actx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.actx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.actx.currentTime + 1.8);

    this.isPlaying = false;
  }

  /* ── Toggle play / pause, returns new playing state ── */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }
}

window.AmbientAudio = AmbientAudio;
