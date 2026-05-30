# HELLO WORLD — Farid Alfiyansah

> A cinematic digital experience. Not a webpage. An event.

---

## ✦ Overview

A dramatic, minimalist web experience built around the simplest phrase in programming — *Hello World* — and elevated into something cinematic, emotional, and memorable.

**Stack:** Vanilla HTML · CSS · JavaScript · GSAP 3 · Web Audio API

**Aesthetic:** Black & white · Cormorant Garamond typography · Particle depth field

---

## ✦ Features

| Feature | Details |
|---|---|
| **Cinematic Splash** | Particle canvas, staggered type reveal, progress bar |
| **Generative Audio** | Web Audio API drone — no external audio files |
| **Scroll Animations** | GSAP ScrollTrigger on every section |
| **3-D Card Tilt** | Mouse-follow perspective tilt with specular shine |
| **Custom Cursor** | Dot + lagged ring, blend-mode: difference |
| **Particle System** | Dual canvas — splash + ambient background |
| **Easter Egg** | Konami code → secret mode (↑ ↑ ↓ ↓ ← → ← → B A) |
| **Responsive** | Mobile-first, touch-friendly |
| **Performance** | Lightweight — zero heavy assets, CDN-only deps |

---

## ✦ Project Structure

```
hello-world/
├── index.html          ← Entry point
├── vercel.json         ← Vercel deployment config
├── README.md
│
├── css/
│   ├── base.css        ← Reset, variables, cursor, utilities
│   ├── splash.css      ← Opening cinematic screen
│   └── sections.css    ← All content sections + components
│
└── js/
    ├── particles.js    ← Canvas particle system (reusable)
    ├── audio.js        ← Generative ambient drone
    ├── splash.js       ← Opening sequence orchestration
    ├── easter-egg.js   ← Konami code secret mode
    └── app.js          ← Main orchestrator & scroll animations
```

---

## ✦ Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Framework preset: **Other** (it's static)
5. Click **Deploy**

Done. Vercel auto-detects `vercel.json` and serves everything statically.

### Option B — Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# From inside the project folder:
vercel

# Follow the prompts. For production:
vercel --prod
```

---

## ✦ Local Development

No build step required. Just open with any static server:

```bash
# Python (built-in)
python3 -m http.server 3000

# Node / npx
npx serve .

# VS Code — use the Live Server extension
```

Then open `http://localhost:3000`.

> **Note:** Do **not** open `index.html` directly as a `file://` URL — the Web Audio API and some font features require HTTP.

---

## ✦ Easter Egg

Type the **Konami Code** anywhere on the page:

```
↑  ↑  ↓  ↓  ←  →  ←  →  B  A
```

Secret mode activates — particle storm, purple aurora, hidden overlay.

Press `Escape` or click **CLOSE** to return.

---

## ✦ Audio

Ambient audio is **generative** — synthesized entirely with the Web Audio API using stacked sine/triangle oscillators, a convolution reverb, and slow LFOs. No audio files are loaded.

Audio starts automatically on your **first interaction** (click, scroll, or key press) due to browser autoplay policies. Toggle with the `♪` button in the bottom-right corner.

---

## ✦ Credits

Designed & Built by **Farid Alfiyansah**  
RLC Studio Inc. · 2025

Animation: [GSAP](https://greensock.com/gsap/) by GreenSock  
Typography: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) · [DM Mono](https://fonts.google.com/specimen/DM+Mono) via Google Fonts
