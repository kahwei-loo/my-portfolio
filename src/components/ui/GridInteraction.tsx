"use client";

import { useEffect, useRef, useState } from "react";

interface GridInteractionProps {
  className?: string;
  gridSizeLarge?: number;
  gridSizeSmall?: number;
  glowColorLarge?: string;
  glowColorSmall?: string;
  glowRadius?: number;
  glowIntensity?: number;
}

export default function GridInteraction({
  className = "",
  gridSizeLarge = 80,
  gridSizeSmall = 20,
  glowColorLarge = "rgba(139, 115, 85, 0.6)", // walnut
  glowColorSmall = "rgba(139, 115, 85, 0.4)", // walnut lighter
  glowRadius = 200,
  glowIntensity = 0.8,
}: GridInteractionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 1024px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Mouse move listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is within canvas bounds
      const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      
      if (isInside) {
        mouseRef.current = { x, y };
      } else {
        mouseRef.current = { x: -1000, y: -1000 };
      }
    };

    // Listen on document since canvas has pointer-events-none
    if (!isMobile) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    // Calculate point-to-line-segment distance
    const distanceToLine = (
      px: number,
      py: number,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): number => {
      const A = px - x1;
      const B = py - y1;
      const C = x2 - x1;
      const D = y2 - y1;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;

      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;

      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      const dx = px - xx;
      const dy = py - yy;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Animation loop (only draw highlighted lines near cursor)
    const animate = () => {
      if (!canvas || !ctx) {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Only draw on desktop when mouse is inside canvas
      if (!isMobile && mouseX > -500 && mouseY > -500) {
        // Calculate intersection with circular glow region
        const calculateCircleIntersection = (linePos: number, isVertical: boolean) => {
          let start: number, end: number;
          
          if (isVertical) {
            // Vertical line: calculate y-axis intersection with circle
            const dx = Math.abs(linePos - mouseX);
            if (dx > glowRadius) return null;
            const dy = Math.sqrt(glowRadius * glowRadius - dx * dx);
            start = Math.max(0, mouseY - dy);
            end = Math.min(rect.height, mouseY + dy);
          } else {
            // Horizontal line: calculate x-axis intersection with circle
            const dy = Math.abs(linePos - mouseY);
            if (dy > glowRadius) return null;
            const dx = Math.sqrt(glowRadius * glowRadius - dy * dy);
            start = Math.max(0, mouseX - dx);
            end = Math.min(rect.width, mouseX + dx);
          }
          
          return { start, end };
        };

        // Draw small grid (20px) — only within circle, with gradient fade
        for (let x = 0; x <= rect.width; x += gridSizeSmall) {
          const intersection = calculateCircleIntersection(x, true);
          if (!intersection) continue;

          const distance = Math.abs(x - mouseX);
          const effect = 1 - distance / glowRadius;
          const opacity = effect * glowIntensity * 0.5;
          const lineWidth = 0.5 + effect * 1;

          // Linear gradient fading from center to edge
          const gradient = ctx.createLinearGradient(x, intersection.start, x, intersection.end);
          
          const distToStart = Math.abs(intersection.start - mouseY);
          const distToEnd = Math.abs(intersection.end - mouseY);
          const fadeStart = Math.max(0, 1 - (distToStart / glowRadius) * 1.5);
          const fadeEnd = Math.max(0, 1 - (distToEnd / glowRadius) * 1.5);
          
          const baseColor = glowColorSmall.replace(/[\d.]+\)$/g, `${opacity * fadeStart})`);
          const edgeColor = glowColorSmall.replace(/[\d.]+\)$/g, `0)`);
          
          gradient.addColorStop(0, fadeStart < 0.1 ? edgeColor : baseColor);
          gradient.addColorStop(0.5, glowColorSmall.replace(/[\d.]+\)$/g, `${opacity})`));
          gradient.addColorStop(1, fadeEnd < 0.1 ? edgeColor : baseColor);

          ctx.beginPath();
          ctx.moveTo(x, intersection.start);
          ctx.lineTo(x, intersection.end);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }

        for (let y = 0; y <= rect.height; y += gridSizeSmall) {
          const intersection = calculateCircleIntersection(y, false);
          if (!intersection) continue;

          const distance = Math.abs(y - mouseY);
          const effect = 1 - distance / glowRadius;
          const opacity = effect * glowIntensity * 0.5;
          const lineWidth = 0.5 + effect * 1;

          // Linear gradient fading from center to edge
          const gradient = ctx.createLinearGradient(intersection.start, y, intersection.end, y);
          
          const distToStart = Math.abs(intersection.start - mouseX);
          const distToEnd = Math.abs(intersection.end - mouseX);
          const fadeStart = Math.max(0, 1 - (distToStart / glowRadius) * 1.5);
          const fadeEnd = Math.max(0, 1 - (distToEnd / glowRadius) * 1.5);
          
          const baseColor = glowColorSmall.replace(/[\d.]+\)$/g, `${opacity * fadeStart})`);
          const edgeColor = glowColorSmall.replace(/[\d.]+\)$/g, `0)`);
          
          gradient.addColorStop(0, fadeStart < 0.1 ? edgeColor : baseColor);
          gradient.addColorStop(0.5, glowColorSmall.replace(/[\d.]+\)$/g, `${opacity})`));
          gradient.addColorStop(1, fadeEnd < 0.1 ? edgeColor : baseColor);

          ctx.beginPath();
          ctx.moveTo(intersection.start, y);
          ctx.lineTo(intersection.end, y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }

        // Draw large grid (80px) — only within circle, with gradient fade
        for (let x = 0; x <= rect.width; x += gridSizeLarge) {
          const intersection = calculateCircleIntersection(x, true);
          if (!intersection) continue;

          const distance = Math.abs(x - mouseX);
          const effect = 1 - distance / glowRadius;
          const opacity = effect * glowIntensity;
          const lineWidth = 1.5 + effect * 2.5;

          // Linear gradient fading from center to edge
          const gradient = ctx.createLinearGradient(x, intersection.start, x, intersection.end);
          
          const distToStart = Math.abs(intersection.start - mouseY);
          const distToEnd = Math.abs(intersection.end - mouseY);
          const fadeStart = Math.max(0, 1 - (distToStart / glowRadius) * 1.5);
          const fadeEnd = Math.max(0, 1 - (distToEnd / glowRadius) * 1.5);
          
          const baseColor = glowColorLarge.replace(/[\d.]+\)$/g, `${opacity * fadeStart})`);
          const edgeColor = glowColorLarge.replace(/[\d.]+\)$/g, `0)`);
          
          gradient.addColorStop(0, fadeStart < 0.1 ? edgeColor : baseColor);
          gradient.addColorStop(0.5, glowColorLarge.replace(/[\d.]+\)$/g, `${opacity})`));
          gradient.addColorStop(1, fadeEnd < 0.1 ? edgeColor : baseColor);

          ctx.beginPath();
          ctx.moveTo(x, intersection.start);
          ctx.lineTo(x, intersection.end);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }

        for (let y = 0; y <= rect.height; y += gridSizeLarge) {
          const intersection = calculateCircleIntersection(y, false);
          if (!intersection) continue;

          const distance = Math.abs(y - mouseY);
          const effect = 1 - distance / glowRadius;
          const opacity = effect * glowIntensity;
          const lineWidth = 1.5 + effect * 2.5;

          // Linear gradient fading from center to edge
          const gradient = ctx.createLinearGradient(intersection.start, y, intersection.end, y);
          
          const distToStart = Math.abs(intersection.start - mouseX);
          const distToEnd = Math.abs(intersection.end - mouseX);
          const fadeStart = Math.max(0, 1 - (distToStart / glowRadius) * 1.5);
          const fadeEnd = Math.max(0, 1 - (distToEnd / glowRadius) * 1.5);
          
          const baseColor = glowColorLarge.replace(/[\d.]+\)$/g, `${opacity * fadeStart})`);
          const edgeColor = glowColorLarge.replace(/[\d.]+\)$/g, `0)`);
          
          gradient.addColorStop(0, fadeStart < 0.1 ? edgeColor : baseColor);
          gradient.addColorStop(0.5, glowColorLarge.replace(/[\d.]+\)$/g, `${opacity})`));
          gradient.addColorStop(1, fadeEnd < 0.1 ? edgeColor : baseColor);

          ctx.beginPath();
          ctx.moveTo(intersection.start, y);
          ctx.lineTo(intersection.end, y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (!isMobile) {
        document.removeEventListener("mousemove", handleMouseMove);
      }
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gridSizeLarge, gridSizeSmall, glowColorLarge, glowColorSmall, glowRadius, glowIntensity, isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        width: "100%",
        height: "100%",
        zIndex: 10, // Above the CSS grid
      }}
    />
  );
}
