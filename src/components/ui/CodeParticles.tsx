"use client";

import { useEffect, useRef } from "react";

// ── Symbol pool ────────────────────────────────────────────────────────────────
// Only symbols with recognisable 2-D shapes at particle resolution (120×60 canvas).
// Rule: must look like something at ~30–42px. Flat horizontal-bar symbols removed.
const SYMBOLS = [
  // ── Code syntax (outline shapes — best readability) ────────────────────────
  "{}", "()", "[]", "</>",
  // ── Operators with distinct geometry ───────────────────────────────────────
  "=>", "&&", "??", "//",
  // ── Short keywords ──────────────────────────────────────────────────────────
  "fn", "if", "let", "for",
  // ── Developer easter eggs ───────────────────────────────────────────────────
  "404",   // HTTP Not Found
  "NaN",   // JavaScript's infamous Not-a-Number
  "null",  // the billion-dollar mistake
  "bug",   // it's always a feature
  "git",   // version control
  "npm",   // everyone's favourite install hell
  "AI",    // relevant to the role
  "API",   // what everything is
  "lol",   // when the build breaks at 11pm
];

// ── Glyph sampling — brunoimbrizi approach ────────────────────────────────────
// Source canvas is intentionally SMALL (120×60). At screen scale ~4px/source-px,
// adjacent step-2 samples are ~8px apart on screen. With a ~3px dot diameter,
// that gives ratio 2.7 → clearly distinct dots that trace the character shape.
//
// 120×60 (vs 80×40) gives enough resolution to capture curved strokes like {} ()
// while still keeping inter-particle spacing large enough for distinct dots.
// brunoimbrizi/interactive-particles uses the same principle with 320×180 images.
function sampleGlyph(symbol: string): { nx: number; ny: number }[] {
  const W = 120, H = 60;
  const off = document.createElement("canvas");
  off.width  = W;
  off.height = H;
  const ctx = off.getContext("2d");
  if (!ctx) return [];

  // Font size fills ~70% of canvas height; shorter symbols get bigger font
  const fontSize = Math.min(42, Math.floor(45 / Math.max(symbol.length * 0.5, 1)));
  ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle    = "#fff";
  ctx.fillText(symbol, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: { nx: number; ny: number }[] = [];

  // step=2: sample every other pixel → each sample is 2 source-px apart
  // On screen at ~4px/source-px scale: 8px between dot centres → clean gaps
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) {
        pts.push({ nx: x / W - 0.5, ny: y / H - 0.5 });
      }
    }
  }
  return pts;
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  tx: number; ty: number;
  baseVx: number; baseVy: number;
  size: number;
  baseOpacity: number;
  colorT: number;
  state: "ambient" | "forming" | "holding" | "dispersing";
}

type SysPhase = "ambient" | "forming" | "holding" | "dispersing";

// ── Config ─────────────────────────────────────────────────────────────────────
// Pool must exceed max expected pts.length (~80–100 for largest symbols)
const TOTAL_D = 400;
const TOTAL_M = 150;

const DURATIONS: Record<SysPhase, number> = {
  ambient:    2000,
  forming:    1800,
  holding:    2200,
  dispersing: 1000,
};

// Physics constants (Mamboleoo spring pattern)
const ATTRACT_STR = 0.10;
const FRICTION     = 0.85;
const DISPERSE_SPD = 2.5;

// ── Component ──────────────────────────────────────────────────────────────────
export default function CodeParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    const TOTAL = isMobile ? TOTAL_M : TOTAL_D;

    // Pre-compute glyph point clouds once at startup
    const glyphCache: Record<string, ReturnType<typeof sampleGlyph>> = {};
    for (const sym of SYMBOLS) {
      glyphCache[sym] = sampleGlyph(sym);
    }

    let rafId = 0;
    let particles: Particle[] = [];
    let sysPhase: SysPhase = "ambient";
    let phaseStart = performance.now();
    let formingIdx: number[] = [];
    const mountTime = performance.now();

    // ── Canvas sizing ──────────────────────────────────────────────────────────
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    // ── Particle init ──────────────────────────────────────────────────────────
    const initParticles = () => {
      const { width: W, height: H } = canvas.getBoundingClientRect();
      particles = Array.from({ length: TOTAL }, () => {
        const x  = Math.random() * W;
        const y  = Math.random() * H;
        const vx = (Math.random() - 0.5) * 0.35;
        const vy = (Math.random() - 0.5) * 0.35;
        return {
          x, y, vx, vy,
          tx: x, ty: y,
          baseVx: vx, baseVy: vy,
          size:        0.6 + Math.random() * 0.8,
          baseOpacity: 0.08 + Math.random() * 0.12,
          colorT: 0,
          state: "ambient" as const,
        };
      });
    };

    // ── Phase: begin formation ─────────────────────────────────────────────────
    const beginFormation = () => {
      const { width: W, height: H } = canvas.getBoundingClientRect();
      const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const pts = glyphCache[sym];
      if (!pts.length) return;

      // Place on left or right side, buffered from viewport edges
      const side = Math.random() < 0.5 ? "left" : "right";
      const cx = side === "left"
        ? (0.18 + Math.random() * 0.22) * W
        : (0.60 + Math.random() * 0.22) * W;
      const cy = (0.20 + Math.random() * 0.55) * H;

      // scale: maps nx [-0.5, 0.5] to screen pixels
      // 120px canvas at this scale → ~4px per source pixel (desktop)
      // step-2 sampling → ~8px between adjacent dot centres
      const scale = Math.min(W, H) * (isMobile ? 0.44 : 0.54);

      const shuffled = Array.from({ length: TOTAL }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
      // pts.length is the real particle count for this symbol — no fixed cap needed
      formingIdx = shuffled.slice(0, Math.min(pts.length, TOTAL - 1));

      for (let i = 0; i < formingIdx.length; i++) {
        const p  = particles[formingIdx[i]];
        const pt = pts[i];
        p.state  = "forming";
        p.tx = cx + pt.nx * scale;
        // H/W aspect correction: 60/120 = 0.50 so symbol has natural proportions
        p.ty = cy + pt.ny * scale * 0.50;
      }
    };

    // ── Phase: begin dispersing ────────────────────────────────────────────────
    const beginDispersing = () => {
      for (const i of formingIdx) {
        const p  = particles[i];
        p.state  = "dispersing";
        const angle = Math.random() * Math.PI * 2;
        const spd   = DISPERSE_SPD * (0.6 + Math.random());
        p.vx = Math.cos(angle) * spd;
        p.vy = Math.sin(angle) * spd;
      }
    };

    // ── Phase: end dispersing → back to ambient ────────────────────────────────
    const endDispersing = () => {
      const { width: W, height: H } = canvas.getBoundingClientRect();
      for (const i of formingIdx) {
        const p  = particles[i];
        p.state  = "ambient";
        p.colorT = 0;
        p.vx = (Math.random() - 0.5) * 0.35;
        p.vy = (Math.random() - 0.5) * 0.35;
        if (p.x < 0)  p.x = W;
        if (p.x > W)  p.x = 0;
        if (p.y < 0)  p.y = H;
        if (p.y > H)  p.y = 0;
      }
      formingIdx = [];
    };

    // ── Render loop ────────────────────────────────────────────────────────────
    setSize();
    initParticles();

    const tick = (now: number) => {
      const { width: W, height: H } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, W, H);

      const fadeIn = Math.min((now - mountTime) / 2000, 1);

      if (now - phaseStart >= DURATIONS[sysPhase]) {
        phaseStart = now;
        if (sysPhase === "ambient") {
          sysPhase = "forming";
          beginFormation();
        } else if (sysPhase === "forming") {
          sysPhase = "holding";
          for (const i of formingIdx) {
            particles[i].state  = "holding";
            particles[i].colorT = 1;
            particles[i].x      = particles[i].tx;
            particles[i].y      = particles[i].ty;
            particles[i].vx     = 0;
            particles[i].vy     = 0;
          }
        } else if (sysPhase === "holding") {
          sysPhase = "dispersing";
          beginDispersing();
        } else {
          sysPhase = "ambient";
          endDispersing();
        }
      }

      // ── Update + draw each particle ──────────────────────────────────────────
      for (const p of particles) {

        if (p.state === "ambient") {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -12) p.x = W + 12;
          if (p.x > W + 12) p.x = -12;
          if (p.y < -12) p.y = H + 12;
          if (p.y > H + 12) p.y = -12;

        } else if (p.state === "forming") {
          const ax = (p.tx - p.x) * ATTRACT_STR;
          const ay = (p.ty - p.y) * ATTRACT_STR;
          p.vx = (p.vx + ax) * FRICTION;
          p.vy = (p.vy + ay) * FRICTION;
          p.x += p.vx;
          p.y += p.vy;
          const dist = Math.hypot(p.tx - p.x, p.ty - p.y);
          p.colorT = Math.min(p.colorT + 0.03, 1 - dist / 200);
          p.colorT = Math.max(0, Math.min(1, p.colorT));

        } else if (p.state === "holding") {
          p.x = p.tx + (Math.random() - 0.5) * 0.7;
          p.y = p.ty + (Math.random() - 0.5) * 0.7;
          p.colorT = 1;

        } else if (p.state === "dispersing") {
          p.vx *= 0.92;
          p.vy *= 0.92;
          p.x  += p.vx;
          p.y  += p.vy;
          if (p.x < -30) p.x = W + 30;
          if (p.x > W + 30) p.x = -30;
          if (p.y < -30) p.y = H + 30;
          if (p.y > H + 30) p.y = -30;
          p.colorT = Math.max(p.colorT - 0.022, 0);
        }

        // ── Draw ────────────────────────────────────────────────────────────────
        const active  = p.state !== "ambient";
        // Active particles use higher opacity to stand out from ambient field
        const opacity = fadeIn * (p.baseOpacity + (active ? p.colorT * 0.88 : 0));
        // Dot radius: 0.6–1.4px base + 0.5px growth on formation = max ~1.9px
        // Diameter ~3.8px vs ~8px spacing → ratio 2.1 → clearly distinct dots
        const radius  = p.size + (active ? p.colorT * 0.5 : 0);

        // Lerp: walnut-light (212,196,176) → accent blue (41,151,255)
        const r = Math.round(212 + (41  - 212) * p.colorT);
        const g = Math.round(196 + (151 - 196) * p.colorT);
        const b = Math.round(176 + (255 - 176) * p.colorT);

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(radius, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onResize = () => { setSize(); initParticles(); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
