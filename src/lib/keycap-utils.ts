import * as THREE from "three";

// =================================================================
// SOUND EFFECT MANAGER - Uses MP3 audio files
// =================================================================
export class KeySoundManager {
  private pressSound: HTMLAudioElement | null = null;
  private releaseSound: HTMLAudioElement | null = null;
  private volume: number = 0.3;

  init() {
    if (typeof window !== "undefined") {
      this.pressSound = new Audio("/sounds/press.mp3");
      this.pressSound.volume = this.volume;
      this.pressSound.preload = "auto";
      this.releaseSound = new Audio("/sounds/release.mp3");
      this.releaseSound.volume = this.volume;
      this.releaseSound.preload = "auto";
    }
  }

  playKeyDown() {
    if (this.pressSound) {
      const sound = this.pressSound.cloneNode() as HTMLAudioElement;
      sound.volume = this.volume;
      sound.play().catch(() => {});
    }
  }

  playKeyUp() {
    if (this.releaseSound) {
      const sound = this.releaseSound.cloneNode() as HTMLAudioElement;
      sound.volume = this.volume;
      sound.play().catch(() => {});
    }
  }
}

export const soundManager = new KeySoundManager();

// =================================================================
// TAPERED KEYCAP GEOMETRY (inverted trapezoid shape)
// =================================================================
export function createTaperedKeycapGeometry(
  bottomWidth: number,
  bottomHeight: number,
  topRatio: number,
  depth: number,
  cornerRadius: number
): THREE.BufferGeometry {
  const topWidth = bottomWidth * topRatio;
  const topHeight = bottomHeight * topRatio;
  const segments = 10;
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  function generateRoundedRectPoints(w: number, h: number, r: number): [number, number][] {
    const points: [number, number][] = [];
    const hw = w / 2;
    const hh = h / 2;
    const cr = Math.min(r, hw, hh);

    for (let i = 0; i <= segments; i++) {
      const angle = (Math.PI / 2) * (i / segments);
      points.push([hw - cr + Math.cos(angle) * cr, hh - cr + Math.sin(angle) * cr]);
    }
    for (let i = 0; i <= segments; i++) {
      const angle = Math.PI / 2 + (Math.PI / 2) * (i / segments);
      points.push([-hw + cr + Math.cos(angle) * cr, hh - cr + Math.sin(angle) * cr]);
    }
    for (let i = 0; i <= segments; i++) {
      const angle = Math.PI + (Math.PI / 2) * (i / segments);
      points.push([-hw + cr + Math.cos(angle) * cr, -hh + cr + Math.sin(angle) * cr]);
    }
    for (let i = 0; i <= segments; i++) {
      const angle = (3 * Math.PI) / 2 + (Math.PI / 2) * (i / segments);
      points.push([hw - cr + Math.cos(angle) * cr, -hh + cr + Math.sin(angle) * cr]);
    }
    return points;
  }

  const bottomPoints = generateRoundedRectPoints(bottomWidth, bottomHeight, cornerRadius);
  const topPoints = generateRoundedRectPoints(topWidth, topHeight, cornerRadius);
  const numPoints = bottomPoints.length;

  // Bottom face vertices
  for (const [x, y] of bottomPoints) {
    vertices.push(x, y, 0);
    normals.push(0, 0, -1);
    uvs.push((x + bottomWidth / 2) / bottomWidth, (y + bottomHeight / 2) / bottomHeight);
  }

  // Top face vertices
  for (const [x, y] of topPoints) {
    vertices.push(x, y, depth);
    normals.push(0, 0, 1);
    uvs.push((x + topWidth / 2) / topWidth, (y + topHeight / 2) / topHeight);
  }

  // Side vertices with vertical edge rounding
  const verticalBevelRadius = cornerRadius * 0.2;
  const bevelLayers = 2;
  const sideSegments = 4;

  for (let i = 0; i < numPoints; i++) {
    const [bx, by] = bottomPoints[i];
    const [tx, ty] = topPoints[i];
    const nextI = (i + 1) % numPoints;
    const [nbx, nby] = bottomPoints[nextI];
    const dx = nbx - bx;
    const dy = nby - by;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dy / len;
    const ny = -dx / len;

    // Bottom bevel
    for (let layer = 0; layer <= bevelLayers; layer++) {
      const t = layer / bevelLayers;
      const bevelZ = verticalBevelRadius * t * t;
      const bevelScale = 1 - (verticalBevelRadius * t * t) / Math.max(bottomWidth, bottomHeight) * 0.3;
      vertices.push(bx * bevelScale, by * bevelScale, bevelZ);
      const normalZ = THREE.MathUtils.lerp(0.5, 0.3, t);
      normals.push(nx, ny, normalZ);
      uvs.push(i / numPoints, t * 0.15);
    }

    // Side body
    for (let seg = 1; seg < sideSegments; seg++) {
      const t = seg / sideSegments;
      const z = verticalBevelRadius + (depth - verticalBevelRadius * 2) * t;
      const lerpX = THREE.MathUtils.lerp(bx, tx, t);
      const lerpY = THREE.MathUtils.lerp(by, ty, t);
      vertices.push(lerpX, lerpY, z);
      normals.push(nx, ny, 0.3);
      uvs.push(i / numPoints, 0.15 + t * 0.7);
    }

    // Top bevel
    for (let layer = 0; layer <= bevelLayers; layer++) {
      const t = layer / bevelLayers;
      const bevelZ = depth - verticalBevelRadius * t * t;
      const bevelScale = topRatio + (1 - topRatio) * (1 - (verticalBevelRadius * t * t) / Math.max(topWidth, topHeight) * 0.3);
      vertices.push(tx * bevelScale, ty * bevelScale, bevelZ);
      const normalZ = THREE.MathUtils.lerp(0.3, 0.5, t);
      normals.push(nx, ny, normalZ);
      uvs.push(i / numPoints, 0.85 + t * 0.15);
    }
  }

  // Bottom face indices
  const bottomCenter = vertices.length / 3;
  vertices.push(0, 0, 0);
  normals.push(0, 0, -1);
  uvs.push(0.5, 0.5);
  for (let i = 0; i < numPoints; i++) {
    indices.push(bottomCenter, (i + 1) % numPoints, i);
  }

  // Top face indices
  const topCenter = vertices.length / 3;
  vertices.push(0, 0, depth);
  normals.push(0, 0, 1);
  uvs.push(0.5, 0.5);
  for (let i = 0; i < numPoints; i++) {
    indices.push(topCenter, numPoints + i, numPoints + ((i + 1) % numPoints));
  }

  // Side face indices
  const sideStart = numPoints * 2;
  const verticesPerSidePoint = (bevelLayers + 1) + (sideSegments - 1) + (bevelLayers + 1);
  for (let i = 0; i < numPoints; i++) {
    const next = (i + 1) % numPoints;
    const iStart = sideStart + i * verticesPerSidePoint;
    const nextStart = sideStart + next * verticesPerSidePoint;
    for (let layer = 0; layer < verticesPerSidePoint - 1; layer++) {
      const currBottom = iStart + layer;
      const currTop = iStart + layer + 1;
      const nextBottom = nextStart + layer;
      const nextTop = nextStart + layer + 1;
      indices.push(currBottom, nextBottom, currTop);
      indices.push(currTop, nextBottom, nextTop);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// =================================================================
// UTILITY: Get contrasting text color for a background
// =================================================================
export function getTextColor(hexColor: string): string {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#1a1a1a" : "#ffffff";
}
