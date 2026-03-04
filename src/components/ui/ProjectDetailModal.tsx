"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import type { Project } from "@/data/mock";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);

  // SSR guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set isOpen when project changes (portal will render on next commit)
  useEffect(() => {
    if (!project || !mounted) return;
    setIsOpen(true);
    setActiveScreenshot(0);
  }, [project, mounted]);

  // Animate in AFTER portal has mounted (isOpen triggers render, then this effect runs)
  useEffect(() => {
    if (!isOpen || !project) return;

    // Lock scroll
    const lenis = (window as unknown as Record<string, unknown>).__lenis as {
      stop: () => void;
      start: () => void;
    } | null;
    lenis?.stop();
    document.body.style.overflow = "hidden";

    // Refs are now guaranteed to exist since the portal has rendered
    requestAnimationFrame(() => {
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, scale: 0.95, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            delay: 0.1,
          }
        );
      }
    });
  }, [isOpen, project]);

  // Close handler
  const handleClose = useCallback(() => {
    if (closing) return;
    setClosing(true);

    if (panelRef.current) {
      gsap.to(panelRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.3,
        ease: "power3.inOut",
      });
    }
    if (backdropRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.05,
        onComplete: () => {
          setIsOpen(false);
          setClosing(false);

          // Unlock scroll
          const lenis = (window as unknown as Record<string, unknown>).__lenis as {
            stop: () => void;
            start: () => void;
          } | null;
          lenis?.start();
          document.body.style.overflow = "";

          onClose();
        },
      });
    }
  }, [closing, onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  // Screenshot swap with crossfade
  const handleScreenshotChange = useCallback(
    (index: number) => {
      if (index === activeScreenshot || !mainImageRef.current) return;
      gsap.to(mainImageRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setActiveScreenshot(index);
          gsap.to(mainImageRef.current, { opacity: 1, duration: 0.3 });
        },
      });
    },
    [activeScreenshot]
  );

  if (!mounted || !project || !isOpen) return null;

  const cs = project.caseStudy;
  const screenshots = cs?.screenshots ?? [];
  const hasScreenshots = screenshots.length > 0;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} case study`}
        data-lenis-prevent
        className="fixed inset-2 z-[9999] overflow-y-auto overscroll-contain rounded-[20px] border border-white/[0.06] bg-bg-primary/95 backdrop-blur-xl md:inset-x-8 md:inset-y-6 lg:inset-x-16 lg:inset-y-8"
        style={{ opacity: 0, transform: "scale(0.95) translateY(20px)" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-secondary transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-text-primary"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-16">
          {/* Header */}
          <div className="mb-10">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{ backgroundColor: `${project.color}15` }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: project.color }}
              >
                {project.subtitle}
              </span>
            </div>

            <h2 className="mb-4 font-display text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-text-primary">
              {project.title}
            </h2>

            {cs?.role && (
              <p className="mb-6 text-sm text-text-tertiary">
                Role: <span className="text-text-secondary">{cs.role}</span>
              </p>
            )}

            {/* Tech pills */}
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-text-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Screenshot viewer */}
          {hasScreenshots && (
            <div className="mb-12">
              {/* Main image */}
              <div
                ref={mainImageRef}
                className="relative mb-4 aspect-video overflow-hidden rounded-2xl border border-white/[0.06]"
              >
                <Image
                  src={screenshots[activeScreenshot].src}
                  alt={screenshots[activeScreenshot].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                  className="object-cover"
                />
              </div>

              {/* Thumbnail strip */}
              {screenshots.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {screenshots.map((shot, i) => (
                    <button
                      key={i}
                      onClick={() => handleScreenshotChange(i)}
                      className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border transition-all ${
                        i === activeScreenshot
                          ? "border-white/20 ring-1 ring-white/10"
                          : "border-white/[0.06] opacity-50 hover:opacity-80"
                      }`}
                    >
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {screenshots[activeScreenshot].caption && (
                <p className="mt-3 text-center text-xs text-text-tertiary">
                  {screenshots[activeScreenshot].caption}
                </p>
              )}
            </div>
          )}

          {/* Case study content */}
          {cs ? (
            <div className="space-y-10">
              {/* The Problem */}
              <div>
                <h3 className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                  <div
                    className="h-[1px] w-8"
                    style={{ backgroundColor: project.color }}
                  />
                  The Problem
                </h3>
                <p className="text-lg leading-relaxed text-text-secondary">
                  {cs.problem}
                </p>
              </div>

              {/* The Solution */}
              <div>
                <h3 className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                  <div
                    className="h-[1px] w-8"
                    style={{ backgroundColor: project.color }}
                  />
                  The Solution
                </h3>
                <p className="text-lg leading-relaxed text-text-secondary">
                  {cs.solution}
                </p>
              </div>

              {/* Technical Highlights */}
              <div>
                <h3 className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                  <div
                    className="h-[1px] w-8"
                    style={{ backgroundColor: project.color }}
                  />
                  Technical Highlights
                </h3>
                <div className="space-y-4">
                  {cs.highlights.map((highlight, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 text-text-secondary"
                    >
                      <svg
                        className="mt-1 h-4 w-4 flex-shrink-0"
                        style={{ color: project.color }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4"
                        />
                      </svg>
                      <span className="leading-relaxed">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Fallback for projects without case study */
            <p className="text-lg leading-relaxed text-text-secondary">
              {project.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-8">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-medium text-white transition-all hover:scale-105"
                style={{ backgroundColor: project.color }}
              >
                <span>View Project</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
            )}

            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-text-tertiary/30 px-8 py-4 text-sm font-medium text-text-primary transition-all hover:border-text-tertiary hover:bg-white/[0.03]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>Source Code</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
