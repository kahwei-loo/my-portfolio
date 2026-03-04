import * as THREE from "three";
import { getTextColor } from "./keycap-utils";
import {
  siReact, siDocker, siGit, siPython, siNextdotjs, siNodedotjs,
  siTailwindcss, siTypescript, siJavascript, siPostgresql, siMysql,
  siRedis, siPhp, siLaravel, siFastapi, siPostman,
  siGsap, siThreedotjs, siAnthropic, siN8n, siHuggingface,
} from "simple-icons";

const TEX_SIZE = 256;
const textureCache = new Map<string, THREE.CanvasTexture>();

// Map keycap key names → simple-icons objects (all 24×24 viewBox SVG paths)
const SIMPLE_ICONS: Record<string, { path: string }> = {
  React:       siReact,
  Docker:      siDocker,
  Git:         siGit,
  Python:      siPython,
  Next:        siNextdotjs,
  Node:        siNodedotjs,
  Tailwind:    siTailwindcss,
  TS:          siTypescript,
  JS:          siJavascript,
  Postgres:    siPostgresql,
  MySQL:       siMysql,
  Redis:       siRedis,
  PHP:         siPhp,
  Laravel:     siLaravel,
  FastAPI:     siFastapi,
  Postman:     siPostman,
  GSAP:        siGsap,
  Three:       siThreedotjs,
  Anthropic:   siAnthropic,
  n8n:         siN8n,
  HuggingFace: siHuggingface,
};

/**
 * Returns a cached THREE.CanvasTexture with the icon for the given keycap key.
 * Uses simple-icons SVG paths where available; falls back to custom drawing or text.
 */
export function getKeycapLogoTexture(key: string, bgColor: string): THREE.CanvasTexture {
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement("canvas");
  canvas.width  = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, TEX_SIZE, TEX_SIZE);

  const iconColor = getTextColor(bgColor);
  drawLogo(ctx, key, iconColor, TEX_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace  = THREE.SRGBColorSpace;
  textureCache.set(key, texture);
  return texture;
}

// ── Router ────────────────────────────────────────────────────────────────────

function drawLogo(ctx: CanvasRenderingContext2D, key: string, color: string, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  ctx.fillStyle   = color;
  ctx.strokeStyle = color;

  // simple-icons path available → use it
  if (SIMPLE_ICONS[key]) {
    drawSimpleIcon(ctx, SIMPLE_ICONS[key].path, cx, cy, size);
    return;
  }

  // Custom icons for brands not in simple-icons
  switch (key) {
    case "OpenAI":
      drawOpenAIBloom(ctx, cx, cy, size);
      break;
    default:
      drawTextLogo(ctx, cx, cy, size, key, color);
  }
}

// ── simple-icons renderer ─────────────────────────────────────────────────────

/**
 * Draw an SVG path (24×24 viewBox) centred and scaled onto the canvas.
 * Uses evenodd fill rule — required by most simple-icons paths.
 */
function drawSimpleIcon(
  ctx: CanvasRenderingContext2D,
  svgPath: string,
  cx: number,
  cy: number,
  size: number,
) {
  const viewBox = 24;
  const scale   = (size * 0.58) / viewBox;
  const offsetX = cx - (viewBox * scale) / 2;
  const offsetY = cy - (viewBox * scale) / 2;

  const p = new Path2D(svgPath);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  ctx.fill(p, "evenodd");
  ctx.restore();
}

// ── Custom icons ──────────────────────────────────────────────────────────────

/**
 * OpenAI "Bloom" logo — 4 overlapping ellipses at 45° increments
 * creating the characteristic 8-lobed floral shape.
 */
function drawOpenAIBloom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
) {
  const r = size * 0.29;
  ctx.lineWidth = size * 0.028;

  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i * Math.PI) / 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.36, r, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ── Text fallback ─────────────────────────────────────────────────────────────

function drawTextLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  key: string,
  color: string,
) {
  const label    = key.length <= 3 ? key : key.substring(0, 3);
  const fontSize = label.length <= 2 ? size * 0.45 : label.length <= 3 ? size * 0.35 : size * 0.28;

  ctx.font          = `bold ${fontSize}px "SF Pro Display", "Helvetica Neue", sans-serif`;
  ctx.textAlign     = "center";
  ctx.textBaseline  = "middle";
  ctx.fillStyle     = color;
  ctx.fillText(label, cx, cy);
}
