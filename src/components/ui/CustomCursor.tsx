"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";

// Section-aware cursor accent colors
const SECTION_COLORS: Record<string, string> = {
  hero: "#2997FF",
  about: "#8B7355",
  skills: "#2997FF",
  projects: "#2997FF",
  experience: "#8B7355",
  contact: "#2997FF",
};

function getSectionColor(): string {
  const sections = document.querySelectorAll("section[id]");
  const scrollY = window.scrollY + window.innerHeight / 2;

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i] as HTMLElement;
    if (section.offsetTop <= scrollY) {
      return SECTION_COLORS[section.id] || "#2997FF";
    }
  }
  return "#2997FF";
}

const TRAIL_COUNT = 3;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLSpanElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [cursorColor, setCursorColor] = useState("#2997FF");
  const sectionColorRef = useRef("#2997FF");

  const setTrailRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      trailRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;

    if (!cursor || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;
    let animationFrameId: number | null = null;

    // Trail positions — each progressively laggier
    const trailPositions = Array.from({ length: TRAIL_COUNT }, () => ({
      x: 0,
      y: 0,
    }));
    const trailSpeeds = [0.1, 0.07, 0.04]; // Progressively slower

    // Section color polling
    let sectionColorInterval: ReturnType<typeof setInterval>;
    sectionColorInterval = setInterval(() => {
      const newColor = getSectionColor();
      if (newColor !== sectionColorRef.current) {
        sectionColorRef.current = newColor;
        // Only update section-based color when not hovering an element with custom color
        if (!cursorRef.current?.dataset.hoverActive) {
          setCursorColor(newColor);
        }
      }
    }, 300);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Animation loop for smooth following
    const animateCursor = () => {
      if (!cursor || !cursorDot) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        return;
      }

      // Cursor ring follows with lag
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate(${cursorX - 24}px, ${cursorY - 24}px)`;

      // Dot follows more closely
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      cursorDot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

      // Trail circles follow progressively slower
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const target =
          i === 0
            ? { x: cursorX, y: cursorY }
            : trailPositions[i - 1];
        trailPositions[i].x += (target.x - trailPositions[i].x) * trailSpeeds[i];
        trailPositions[i].y += (target.y - trailPositions[i].y) * trailSpeeds[i];

        const trailEl = trailRefs.current[i];
        if (trailEl) {
          const size = 48 - i * 8; // 48, 40, 32 px
          trailEl.style.transform = `translate(${trailPositions[i].x - size / 2}px, ${trailPositions[i].y - size / 2}px)`;
        }
      }

      animationFrameId = requestAnimationFrame(animateCursor);
    };

    // Hover handlers
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      const text = target.dataset.cursorText || "";
      const color = target.dataset.cursorColor || sectionColorRef.current;

      setCursorText(text);
      setCursorColor(color);
      setIsHovering(true);
      if (cursor) cursor.dataset.hoverActive = "1";

      if (cursor) {
        gsap.to(cursor, {
          scale: text ? 2.5 : 1.5,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorText("");
      setCursorColor(sectionColorRef.current);
      if (cursor) delete cursor.dataset.hoverActive;

      if (cursor) {
        gsap.to(cursor, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);

    // Query all interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor="pointer"]'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    // Start animation
    animateCursor();

    // Hide default cursor
    document.body.style.cursor = "none";

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      clearInterval(sectionColorInterval);

      window.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });

      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      {/* Trail ghost circles — fading, progressively laggier */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={setTrailRef(i)}
          className="pointer-events-none fixed left-0 top-0 z-[99998] hidden rounded-full md:block"
          style={{
            width: `${48 - i * 8}px`,
            height: `${48 - i * 8}px`,
            border: `1px solid ${cursorColor}`,
            opacity: 0.12 - i * 0.03, // 0.12, 0.09, 0.06
          }}
        />
      ))}

      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] hidden h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300 mix-blend-difference md:flex"
        style={{
          borderColor: isHovering ? cursorColor : "rgba(255,255,255,0.5)",
          backgroundColor: isHovering ? `${cursorColor}20` : "transparent",
        }}
      >
        <span
          ref={cursorTextRef}
          className="text-[10px] font-medium uppercase tracking-wider text-white opacity-0 transition-opacity duration-200"
          style={{ opacity: cursorText ? 1 : 0 }}
        >
          {cursorText}
        </span>
      </div>

      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] hidden h-2 w-2 rounded-full bg-white mix-blend-difference md:block"
      />
    </>
  );
}
