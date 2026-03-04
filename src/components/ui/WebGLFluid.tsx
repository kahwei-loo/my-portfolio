"use client";

import { useEffect, useRef } from "react";

// ─── Shaders ─────────────────────────────────────────────────────────────────
// Single base vertex shader for ALL programs — matches reference baseVertexShader

const VS_BASE = `
precision highp float;
precision mediump sampler2D;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform vec2 texelSize;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

// Multiplies a texture by a scalar — used for pressure dissipation
const FS_CLEAR = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main() { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const FS_SPLAT = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

// Standard advection — requires linear texture filtering
const FS_ADVECTION = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity; uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt; uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = dissipation * texture2D(uSource, coord);
  gl_FragColor.a = 1.0;
}`;

// Manual bilinear filter advection — fallback when linear filtering is unavailable
const FS_ADVECTION_MANUAL = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity; uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt; uniform float dissipation;
vec4 bilerp(in sampler2D sam, in vec2 p) {
  vec4 st; st.xy = floor(p - 0.5) + 0.5; st.zw = st.xy + 1.0;
  vec4 uv = st * texelSize.xyxy;
  vec4 a = texture2D(sam, uv.xy); vec4 b = texture2D(sam, uv.zy);
  vec4 c = texture2D(sam, uv.xw); vec4 d = texture2D(sam, uv.zw);
  vec2 f = p - st.xy;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main() {
  vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;
  gl_FragColor = dissipation * bilerp(uSource, coord);
  gl_FragColor.a = 1.0;
}`;

// Divergence — with boundary velocity reflection
const FS_DIVERGENCE = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uVelocity;
vec2 sv(in vec2 uv) {
  vec2 m = vec2(1.0);
  if (uv.x < 0.0) { uv.x = 0.0; m.x = -1.0; }
  if (uv.x > 1.0) { uv.x = 1.0; m.x = -1.0; }
  if (uv.y < 0.0) { uv.y = 0.0; m.y = -1.0; }
  if (uv.y > 1.0) { uv.y = 1.0; m.y = -1.0; }
  return m * texture2D(uVelocity, uv).xy;
}
void main() {
  float L = sv(vL).x; float R = sv(vR).x;
  float T = sv(vT).y; float B = sv(vB).y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

// Curl (vorticity field) — the swirling force field
const FS_CURL = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
}`;

// Vorticity confinement — applies swirling force to keep eddies alive
const FS_VORTICITY = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vT; varying vec2 vB;
uniform sampler2D uVelocity; uniform sampler2D uCurl;
uniform float curl; uniform float dt;
void main() {
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = vec2(abs(T) - abs(B), 0.0);
  force *= 1.0 / length(force + 0.00001) * curl * C;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
}`;

// Pressure Jacobi iteration — with boundary clamping
const FS_PRESSURE = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main() {
  float L = texture2D(uPressure, clamp(vL, 0.0, 1.0)).x;
  float R = texture2D(uPressure, clamp(vR, 0.0, 1.0)).x;
  float T = texture2D(uPressure, clamp(vT, 0.0, 1.0)).x;
  float B = texture2D(uPressure, clamp(vB, 0.0, 1.0)).x;
  float C = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - C) * 0.25, 0.0, 0.0, 1.0);
}`;

// Gradient subtract — with boundary clamping
const FS_GRADIENT_SUBTRACT = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uPressure, clamp(vL, 0.0, 1.0)).x;
  float R = texture2D(uPressure, clamp(vR, 0.0, 1.0)).x;
  float T = texture2D(uPressure, clamp(vT, 0.0, 1.0)).x;
  float B = texture2D(uPressure, clamp(vB, 0.0, 1.0)).x;
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vel -= vec2(R - L, T - B);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`;

// Transparent display — alpha derived from color luminance for compositing over GradientBlob
const FS_DISPLAY = `
precision highp float; precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
void main() {
  vec3 c = texture2D(uTexture, vUv).rgb;
  float a = min(max(c.r, max(c.g, c.b)) * 0.7, 1.0);
  gl_FragColor = vec4(c, a);
}`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FBO {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  attach(unit: number): number;
}

interface DoubleFBO {
  read: FBO;
  write: FBO;
  swap(): void;
}

interface Prog {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  bind(): void;
}

// ─── Brand colors ─────────────────────────────────────────────────────────────

const COLORS = [
  { r: 0.08, g: 0.55, b: 0.90 }, // sky blue
  { r: 0.30, g: 0.18, b: 0.80 }, // soft violet
  { r: 0.05, g: 0.45, b: 0.85 }, // deep sky
  { r: 0.25, g: 0.15, b: 0.70 }, // muted indigo
];

// WebGL2 numeric constants (not available on WebGLRenderingContext type)
const RGBA16F = 0x881A;
const HALF_FLOAT_WEBGL2 = 0x140B;

// ─── Component ───────────────────────────────────────────────────────────────

export default function WebGLFluid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;

    // ── WebGL context — try WebGL2 first, fall back to WebGL1 ──────────────

    const ctxParams = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    type GL = WebGLRenderingContext;
    let gl: GL;
    let isWebGL2 = false;

    const gl2 = canvas.getContext("webgl2", ctxParams) as WebGLRenderingContext | null;
    if (gl2) {
      gl = gl2;
      isWebGL2 = true;
    } else {
      const gl1 = canvas.getContext("webgl", ctxParams) ||
                  canvas.getContext("experimental-webgl", ctxParams);
      if (!gl1) return;
      gl = gl1 as GL;
    }

    // ── Texture format detection ────────────────────────────────────────────

    let internalFormat: number;
    let floatType: number;
    let supportLinear: boolean;

    if (isWebGL2) {
      (gl as unknown as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
      supportLinear = !!(gl as unknown as WebGL2RenderingContext).getExtension("OES_texture_float_linear");
      internalFormat = RGBA16F;
      floatType = HALF_FLOAT_WEBGL2;
    } else {
      const hf = gl.getExtension("OES_texture_half_float");
      supportLinear = !!gl.getExtension("OES_texture_half_float_linear");
      internalFormat = gl.RGBA;
      floatType = hf ? (hf as unknown as Record<string, number>).HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    }

    const filterType = supportLinear ? gl.LINEAR : gl.NEAREST;

    // ── Simulation constants ────────────────────────────────────────────────

    const RES = 128;            // simulation grid resolution
    const SPLAT_R = 0.005;      // splat radius
    const VEL_DISS = 0.99;      // velocity dissipation
    const DYE_DISS = 0.96;      // density dissipation — faster fade (was 0.98)
    const PRESSURE_DISS = 0.8;  // pressure dissipation per frame
    const PRESSURE_ITERS = 25;  // Jacobi iterations
    const CURL = 18;             // vorticity confinement — less chaotic (was 30)
    const SPEED_THRESHOLD = 150; // min mouse speed (px/s) to trigger — intentional only (was 80)

    // ── Shader helpers ──────────────────────────────────────────────────────

    function compile(type: number, src: string): WebGLShader {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    function buildProg(vs: string, fs: string): Prog {
      const p = gl.createProgram()!;
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        if (info) uniforms[info.name] = gl.getUniformLocation(p, info.name);
      }
      return { program: p, uniforms, bind: () => gl.useProgram(p) };
    }

    // ── FBO helpers ─────────────────────────────────────────────────────────

    function mkFBO(w: number, h: number, filter: number): FBO {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, floatType, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        fbo, tex,
        attach(unit: number) {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          return unit;
        },
      };
    }

    function mkDouble(w: number, h: number, filter: number): DoubleFBO {
      let a = mkFBO(w, h, filter);
      let b = mkFBO(w, h, filter);
      return {
        get read() { return a; },
        get write() { return b; },
        swap() { [a, b] = [b, a]; },
      };
    }

    // ── Programs ────────────────────────────────────────────────────────────

    const clearProg  = buildProg(VS_BASE, FS_CLEAR);
    const splatProg  = buildProg(VS_BASE, FS_SPLAT);
    const advProg    = buildProg(VS_BASE, supportLinear ? FS_ADVECTION : FS_ADVECTION_MANUAL);
    const divProg    = buildProg(VS_BASE, FS_DIVERGENCE);
    const curlProg   = buildProg(VS_BASE, FS_CURL);
    const vortProg   = buildProg(VS_BASE, FS_VORTICITY);
    const presProg   = buildProg(VS_BASE, FS_PRESSURE);
    const gradProg   = buildProg(VS_BASE, FS_GRADIENT_SUBTRACT);
    const dispProg   = buildProg(VS_BASE, FS_DISPLAY);

    // ── Geometry (fullscreen quad) ──────────────────────────────────────────

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // ── FBOs ────────────────────────────────────────────────────────────────

    const velocity   = mkDouble(RES, RES, filterType);
    const dye        = mkDouble(RES, RES, filterType);
    const divFBO     = mkFBO(RES, RES, gl.NEAREST);
    const curlFBO    = mkFBO(RES, RES, gl.NEAREST);
    const pressure   = mkDouble(RES, RES, gl.NEAREST);

    // ── Blit helper ─────────────────────────────────────────────────────────

    function blit(fbo: WebGLFramebuffer | null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // ── Resize ──────────────────────────────────────────────────────────────

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    resize();

    // ── Splat ───────────────────────────────────────────────────────────────
    // px/py: screen pixel coords; dvx/dvy: velocity in (pixel_delta * 10) units, Y-flipped
    // col: brand color 0-1; scaled by 0.3 inside to control dye brightness

    let colorIdx = 0;

    function splat(
      px: number, py: number,
      dvx: number, dvy: number,
      col: { r: number; g: number; b: number }
    ) {
      const x = px / canvas.width;
      const y = 1.0 - py / canvas.height;

      gl.viewport(0, 0, RES, RES);

      splatProg.bind();
      gl.uniform2f(splatProg.uniforms.texelSize, 1 / RES, 1 / RES);
      gl.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProg.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProg.uniforms.point, x, y);
      gl.uniform3f(splatProg.uniforms.color, dvx, dvy, 0.0);
      gl.uniform1f(splatProg.uniforms.radius, SPLAT_R);
      blit(velocity.write.fbo);
      velocity.swap();

      gl.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProg.uniforms.color, col.r * 0.3, col.g * 0.3, col.b * 0.3);
      blit(dye.write.fbo);
      dye.swap();
    }

    // ── Initial splats — burst of brand-colored fluid on load ───────────────

    function multipleSplats(count: number) {
      for (let i = 0; i < count; i++) {
        const col = COLORS[i % COLORS.length];
        const px = canvas.width * Math.random();
        const py = canvas.height * Math.random();
        const dvx = 1000 * (Math.random() - 0.5);
        const dvy = 1000 * (Math.random() - 0.5);
        // Scale color * 10 so after the 0.3x internal scale → 0-3 brightness (matches reference)
        splat(px, py, dvx, dvy, { r: col.r * 10, g: col.g * 10, b: col.b * 10 });
      }
    }

    // ── Simulation step ─────────────────────────────────────────────────────

    function step(dt: number) {
      gl.viewport(0, 0, RES, RES);
      const sz: [number, number] = [1 / RES, 1 / RES];

      // 1. Advect velocity
      advProg.bind();
      gl.uniform2f(advProg.uniforms.texelSize, ...sz);
      gl.uniform1i(advProg.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advProg.uniforms.uSource, velocity.read.attach(0));
      gl.uniform1f(advProg.uniforms.dt, dt);
      gl.uniform1f(advProg.uniforms.dissipation, VEL_DISS);
      blit(velocity.write.fbo);
      velocity.swap();

      // 2. Advect dye
      gl.uniform1i(advProg.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advProg.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(advProg.uniforms.dissipation, DYE_DISS);
      blit(dye.write.fbo);
      dye.swap();

      // 3. Curl (vorticity field)
      curlProg.bind();
      gl.uniform2f(curlProg.uniforms.texelSize, ...sz);
      gl.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFBO.fbo);

      // 4. Vorticity confinement — adds swirling force to prevent dissipation
      vortProg.bind();
      gl.uniform2f(vortProg.uniforms.texelSize, ...sz);
      gl.uniform1i(vortProg.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vortProg.uniforms.uCurl, curlFBO.attach(1));
      gl.uniform1f(vortProg.uniforms.curl, CURL);
      gl.uniform1f(vortProg.uniforms.dt, dt);
      blit(velocity.write.fbo);
      velocity.swap();

      // 5. Divergence
      divProg.bind();
      gl.uniform2f(divProg.uniforms.texelSize, ...sz);
      gl.uniform1i(divProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(divFBO.fbo);

      // 6. Clear pressure (dissipation prevents pressure buildup)
      clearProg.bind();
      gl.uniform2f(clearProg.uniforms.texelSize, ...sz);
      gl.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProg.uniforms.value, PRESSURE_DISS);
      blit(pressure.write.fbo);
      pressure.swap();

      // 7. Pressure Jacobi solve
      presProg.bind();
      gl.uniform2f(presProg.uniforms.texelSize, ...sz);
      gl.uniform1i(presProg.uniforms.uDivergence, divFBO.attach(0));
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        gl.uniform1i(presProg.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write.fbo);
        pressure.swap();
      }

      // 8. Gradient subtract — enforce incompressibility
      gradProg.bind();
      gl.uniform2f(gradProg.uniforms.texelSize, ...sz);
      gl.uniform1i(gradProg.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradProg.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write.fbo);
      velocity.swap();
    }

    // ── Render ──────────────────────────────────────────────────────────────

    function render() {
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.viewport(0, 0, canvas.width, canvas.height);
      dispProg.bind();
      gl.uniform2f(dispProg.uniforms.texelSize, 1 / canvas.width, 1 / canvas.height);
      gl.uniform1i(dispProg.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    // ── Mouse tracking (speed-based, no drag required) ───────────────────────
    // Velocity stored as pixel_delta * 10 — matches reference units

    let prevPx = -1;
    let prevPy = -1;
    let prevT = 0;

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const t = performance.now();

      if (prevPx < 0) { prevPx = px; prevPy = py; prevT = t; return; }

      const dt = Math.max((t - prevT) / 1000, 0.001);
      const dpx = px - prevPx;
      const dpy = py - prevPy;
      const speed = Math.sqrt(dpx * dpx + dpy * dpy) / dt; // px/s

      if (speed > SPEED_THRESHOLD) {
        const col = COLORS[colorIdx % COLORS.length];
        // velocity = pixel_delta * 10, Y flipped for UV space
        splat(px, py, dpx * 10.0, -dpy * 10.0, col);
        if (Math.random() < 0.25) colorIdx++;
      }

      prevPx = px; prevPy = py; prevT = t;
    }

    function onMouseLeave() { prevPx = -1; prevPy = -1; }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    // ── Animation loop ───────────────────────────────────────────────────────

    let lastT = performance.now();
    let animId: number;

    // No initial burst — fluid only reacts to intentional mouse movement

    function loop() {
      resize();
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.016);
      lastT = now;
      step(dt);
      render();
      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.22 }}
    />
  );
}
