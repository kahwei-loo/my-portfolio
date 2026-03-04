"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { skillsKeyboard, skillsLayout } from "@/data/skills-keyboard";
import {
  createTaperedKeycapGeometry,
  soundManager,
} from "@/lib/keycap-utils";
import { getKeycapLogoTexture } from "@/lib/keycap-logos";

// =================================================================
// CONSTANTS
// =================================================================
const UNIT_SIZE = 0.75;
const GAP = 0.05;
const KEY_DEPTH = 0.4;
const TOP_RATIO = 0.78;
const CORNER_RADIUS = 0.1;
const KEYBOARD_WIDTH = 4.8;
const KEYBOARD_HEIGHT = 3.15;
const PRESS_DEPTH = 0.1;

// Desk-view rotation: keyboard lies flat, tilted toward viewer + 3/4 angle
const DESK_ROTATION_X = -Math.PI / 2 + 0.45;
const DESK_ROTATION_Z = -0.15;

// Idle ambient animation parameters
const IDLE_BOB_AMPLITUDE = 0.06;   // Y-axis float range
const IDLE_BOB_SPEED = 0.4;        // Float cycle speed
const IDLE_ROT_X_AMP = 0.04;       // X-rotation oscillation
const IDLE_ROT_X_SPEED = 0.25;     // X-rotation cycle speed
const IDLE_ROT_Z_AMP = 0.03;       // Z-rotation oscillation
const IDLE_ROT_Z_SPEED = 0.18;     // Z-rotation cycle speed (different from X for organic feel)
const IDLE_SCALE_AMP = 0.008;      // Scale pulse amplitude
const IDLE_SCALE_SPEED = 0.3;      // Scale pulse speed
const BASE_Y = 0.45;
const BASE_SCALE = 0.82;

// =================================================================
// INDIVIDUAL KEYCAP
// =================================================================
function SkillKeycap({
  keyData,
  position,
  onRef,
}: {
  keyData: { key: string; width: number; x: number };
  position: [number, number, number];
  onRef?: (id: string, ref: THREE.Group | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const keyId = keyData.key;

  useEffect(() => {
    if (groupRef.current && onRef) onRef(keyId, groupRef.current);
    return () => {
      if (onRef) onRef(keyId, null);
    };
  }, [keyId, onRef]);

  const keyWidth = keyData.width * UNIT_SIZE - GAP;
  const keyHeight = UNIT_SIZE - GAP;
  const skill = skillsKeyboard[keyData.key];
  const keyColor = skill?.color || "#444444";

  const geometry = useMemo(
    () => createTaperedKeycapGeometry(keyWidth, keyHeight, TOP_RATIO, KEY_DEPTH, CORNER_RADIUS),
    [keyWidth, keyHeight]
  );
  const baseColor = useMemo(() => new THREE.Color(keyColor), [keyColor]);

  const logoTexture = useMemo(
    () => getKeycapLogoTexture(keyData.key, keyColor),
    [keyData.key, keyColor]
  );

  const logoSize = Math.min(keyWidth, keyHeight) * TOP_RATIO * 0.72;

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={baseColor}
          roughness={0.35}
          metalness={0.02}
          envMapIntensity={0.9}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh position={[0, 0, KEY_DEPTH + 0.005]}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial
          map={logoTexture}
          transparent
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    </group>
  );
}

// =================================================================
// MAIN 3D SCENE
// =================================================================
function MainScene({
  onHoveredSkillChange,
  isVisible,
}: {
  onHoveredSkillChange?: (key: string | null) => void;
  isVisible: boolean;
}) {
  const { camera, raycaster, gl } = useThree();

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Refs
  const keyboardGroupRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Mesh>(null);
  const keycapRefsMap = useRef<Map<string, THREE.Group>>(new Map());

  // State refs
  const entranceComplete = useRef(false);
  const entranceTriggered = useRef(false);

  // Hover scale lerp
  const hoverScaleOffset = useRef(0);

  // Mouse tracking
  const mouseNDC = useRef(new THREE.Vector2(0, 0));

  // Hover interaction refs
  const hoveredKeyRef = useRef<string | null>(null);
  const keyBaseZ = useRef<Map<string, number>>(new Map());
  const keyPressProgress = useRef<Map<string, number>>(new Map());

  // ---------------------------------------------------------------
  // MOUSE TRACKING
  // ---------------------------------------------------------------
  useEffect(() => {
    const canvas = gl.domElement;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        mouseNDC.current.set(0, -10);
        return;
      }

      mouseNDC.current.set(
        (x / rect.width) * 2 - 1,
        -(y / rect.height) * 2 + 1
      );
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [gl]);

  // ---------------------------------------------------------------
  // KEYCAP REF CALLBACK
  // ---------------------------------------------------------------
  const handleKeycapRef = useCallback((id: string, ref: THREE.Group | null) => {
    if (ref) keycapRefsMap.current.set(id, ref);
    else keycapRefsMap.current.delete(id);
  }, []);

  // ---------------------------------------------------------------
  // INITIAL KEYBOARD POSITION (desk angle)
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!keyboardGroupRef.current) return;
    keyboardGroupRef.current.rotation.set(DESK_ROTATION_X, 0, DESK_ROTATION_Z);
    keyboardGroupRef.current.position.set(0, -0.1, 0);
    keyboardGroupRef.current.scale.setScalar(0.86);
  }, []);

  // ---------------------------------------------------------------
  // ENTRANCE ANIMATION (triggered when section is visible)
  // ---------------------------------------------------------------
  const runEntrance = useCallback(() => {
    const keysArray = Array.from(keycapRefsMap.current.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, ref]) => ref);

    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        entranceComplete.current = true;
        keycapRefsMap.current.forEach((group, key) => {
          keyBaseZ.current.set(key, group.position.z);
        });
      },
    });

    keysArray.forEach((keyRef, index) => {
      if (!keyRef) return;
      const finalY = keyRef.position.y;
      const finalZ = keyRef.position.z;

      gsap.set(keyRef.position, { y: finalY - 0.5, z: finalZ - 0.2 });
      gsap.set(keyRef.scale, { x: 0.7, y: 0.7, z: 0.7 });

      const meshes = keyRef.children.filter((c) => (c as THREE.Mesh).isMesh) as THREE.Mesh[];
      meshes.forEach((m) => {
        if (m.material) {
          (m.material as THREE.Material).transparent = true;
          gsap.set(m.material, { opacity: 0 });
        }
      });

      tl.to(keyRef.position, { y: finalY, z: finalZ, duration: 0.6, ease: "back.out(1.7)" }, index * 0.04)
        .to(keyRef.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: "back.out(1.7)" }, index * 0.04);

      meshes.forEach((m) => {
        if (m.material) {
          tl.to(m.material, { opacity: 1, duration: 0.4 }, index * 0.04);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!isVisible || entranceTriggered.current || !keyboardGroupRef.current) return;

    const totalKeys = skillsLayout.reduce((sum, row) => sum + row.length, 0);
    const checkReady = setInterval(() => {
      if (keycapRefsMap.current.size >= totalKeys) {
        clearInterval(checkReady);
        entranceTriggered.current = true;
        runEntrance();
      }
    }, 50);

    return () => clearInterval(checkReady);
  }, [isVisible, runEntrance]);

  // ---------------------------------------------------------------
  // PER-FRAME UPDATES
  // ---------------------------------------------------------------
  useFrame(({ clock }) => {
    const group = keyboardGroupRef.current;
    if (!group || !entranceComplete.current) return;

    const time = clock.getElapsedTime();

    // Idle ambient animation — gentle floating, rotation sway, scale breathing
    const idleBobY = Math.sin(time * IDLE_BOB_SPEED) * IDLE_BOB_AMPLITUDE;
    const idleRotX = Math.sin(time * IDLE_ROT_X_SPEED) * IDLE_ROT_X_AMP;
    const idleRotZ = Math.cos(time * IDLE_ROT_Z_SPEED) * IDLE_ROT_Z_AMP;
    const idleScale = BASE_SCALE + Math.sin(time * IDLE_SCALE_SPEED) * IDLE_SCALE_AMP;

    // Apply Y floating
    group.position.y = BASE_Y + idleBobY;

    // Hover scale — smoothly grow when mouse is over canvas
    const isMouseInsideForScale = mouseNDC.current.y > -5;
    const targetHoverOffset = isMouseInsideForScale ? 0.06 : 0;
    hoverScaleOffset.current = THREE.MathUtils.lerp(hoverScaleOffset.current, targetHoverOffset, 0.05);

    // Apply scale breathing + hover boost
    group.scale.setScalar(idleScale + hoverScaleOffset.current);

    // Subtle mouse-follow tilt + idle rotation sway
    // mouseNDC.y = -10 is a sentinel for "mouse outside canvas" (raycasting use)
    // clamp to 0 when outside so keyboard holds base angle at rest
    const isMouseOutside = mouseNDC.current.y < -5;
    const rotInfluenceY = isMouseOutside ? 0 : mouseNDC.current.y;
    const rotInfluenceX = isMouseOutside ? 0 : mouseNDC.current.x;
    const targetRotX = DESK_ROTATION_X + idleRotX + rotInfluenceY * 0.16;
    const targetRotZ = DESK_ROTATION_Z + idleRotZ + rotInfluenceX * 0.16;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.03;
    group.rotation.z += (targetRotZ - group.rotation.z) * 0.03;

    // Base glow pulse
    if (baseRef.current) {
      const material = baseRef.current.material as THREE.MeshStandardMaterial;
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.06 + Math.sin(time * 0.3) * 0.02;
      }
    }

    // Hover raycasting
    raycaster.setFromCamera(mouseNDC.current, camera);
    const intersects = raycaster.intersectObject(group, true);
    let newHoveredKey: string | null = null;

    if (intersects.length > 0) {
      const parent = intersects[0].object.parent;
      if (parent) {
        keycapRefsMap.current.forEach((g, key) => {
          if (g === parent) newHoveredKey = key;
        });
      }
    }

    if (newHoveredKey !== hoveredKeyRef.current) {
      if (hoveredKeyRef.current) soundManager.playKeyUp();
      if (newHoveredKey) soundManager.playKeyDown();
      hoveredKeyRef.current = newHoveredKey;
      onHoveredSkillChange?.(newHoveredKey);
    }

    // Key press animation
    keycapRefsMap.current.forEach((g, key) => {
      const isHovered = key === hoveredKeyRef.current;
      const targetPress = isHovered ? 1 : 0;
      const currentPress = keyPressProgress.current.get(key) ?? 0;
      const newPress = THREE.MathUtils.lerp(currentPress, targetPress, 0.15);
      keyPressProgress.current.set(key, newPress);

      const baseZ = keyBaseZ.current.get(key) ?? 0.1;
      g.position.z = baseZ - newPress * PRESS_DEPTH;
    });
  });

  // ---------------------------------------------------------------
  // KEYCAP LAYOUT
  // ---------------------------------------------------------------
  const keycapElements = useMemo(() => {
    const allKeys: React.ReactElement[] = [];
    const KEYBOARD_START_X = -KEYBOARD_WIDTH / 2 + 0.15;
    const startY = (skillsLayout.length - 1) * UNIT_SIZE * 0.5;

    skillsLayout.forEach((row, rowIndex) => {
      row.forEach((keyData, keyIndex) => {
        const x = KEYBOARD_START_X + keyData.x * UNIT_SIZE + (keyData.width * UNIT_SIZE) / 2;
        const y = startY - rowIndex * UNIT_SIZE;
        const z = 0.1;

        allKeys.push(
          <SkillKeycap
            key={`${rowIndex}-${keyIndex}`}
            keyData={keyData}
            position={[x, y, z]}
            onRef={handleKeycapRef}
          />
        );
      });
    });
    return allKeys;
  }, [handleKeycapRef]);

  // ---------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[4, 10, 8]}
        intensity={2.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0003}
      />
      <directionalLight position={[-5, 6, 10]} intensity={1.5} color="#e8e0ff" />
      <pointLight position={[3, 8, 5]} intensity={0.8} color="#ffffff" decay={2} distance={20} />
      <pointLight position={[-3, 4, 8]} intensity={0.5} color="#aaccff" decay={2} distance={15} />
      <Environment preset="night" background={false} />

      <group ref={keyboardGroupRef}>
        {/* Keyboard base */}
        <RoundedBox
          ref={baseRef}
          args={[KEYBOARD_WIDTH + 0.35, KEYBOARD_HEIGHT + 0.3, 0.45]}
          radius={0.2}
          smoothness={6}
          position={[0, 0, -0.18]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#0d0d0d"
            emissive="#050505"
            emissiveIntensity={0.02}
            roughness={0.85}
            metalness={0.05}
            transparent
          />
        </RoundedBox>

        {/* Inner plate */}
        <RoundedBox
          args={[KEYBOARD_WIDTH + 0.15, KEYBOARD_HEIGHT + 0.1, 0.1]}
          radius={0.12}
          smoothness={4}
          position={[0, 0, 0.05]}
          receiveShadow
        >
          <meshStandardMaterial color="#0e0e0e" roughness={0.92} metalness={0.02} transparent />
        </RoundedBox>

        {keycapElements}
      </group>
    </>
  );
}

// =================================================================
// KEYBOARD JOURNEY - Embeddable Canvas component
// =================================================================
export default function KeyboardJourney({
  onHoveredSkillChange,
}: {
  onHoveredSkillChange?: (key: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    soundManager.init();
  }, []);

  // Trigger entrance when section scrolls into view
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 3.5, 4.5], fov: 42 }}
        style={{ background: "transparent" }}
      >
        <MainScene
          onHoveredSkillChange={onHoveredSkillChange}
          isVisible={isVisible}
        />
      </Canvas>
    </div>
  );
}
