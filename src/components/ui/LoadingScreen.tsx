"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { personalInfo } from "@/data/mock";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();

    const nameParts = personalInfo.name.split(" ");
    const lastName = nameParts.pop()!;
    const firstName = nameParts.join(" ");
    const firstNameEl = nameRef.current?.querySelector(".loading-first");
    const lastNameEl = nameRef.current?.querySelector(".loading-last");

    // Name fades in (Apple-style centered reveal)
    tl.fromTo(
      [firstNameEl, lastNameEl],
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      }
    );

    // Thin progress line fills beneath name
    tl.to(
      progressRef.current,
      {
        scaleX: 1,
        duration: 1.4,
        ease: "power2.inOut",
      },
      0.3
    );

    // Name scales up + blurs as curtain opens
    tl.to(
      nameRef.current,
      {
        scale: 1.5,
        opacity: 0,
        filter: "blur(20px)",
        duration: 0.6,
        ease: "power3.in",
      },
      1.6
    );

    // Progress bar fades
    tl.to(
      progressRef.current?.parentElement!,
      {
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      },
      1.6
    );

    // Overlay fades out to reveal hero
    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          setIsComplete(true);
          onComplete();
        },
      },
      2.0
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  const nameParts = personalInfo.name.split(" ");
  const lastName = nameParts.pop()!;
  const firstName = nameParts.join(" ");

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] overflow-hidden"
      style={isComplete ? { display: "none" } : undefined}
    >
      {/* Full overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-bg-primary"
      />

      {/* Center content */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
        {/* Name */}
        <div ref={nameRef} className="mb-8 text-center">
          <span className="loading-first block font-display text-5xl font-bold tracking-[-0.03em] text-text-primary opacity-0 md:text-7xl">
            {firstName}
          </span>
          <span className="loading-last block font-display text-5xl font-bold tracking-[-0.03em] opacity-0 md:text-7xl"
            style={{
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.2)",
            }}
          >
            {lastName}
          </span>
        </div>

        {/* Thin progress line */}
        <div className="w-32 md:w-40">
          <div className="h-[1px] w-full overflow-hidden bg-text-tertiary/10">
            <div
              ref={progressRef}
              className="h-full origin-left bg-gradient-to-r from-walnut via-accent to-walnut-light"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-6 top-6 h-8 w-[1px] bg-walnut/20" />
        <div className="absolute left-6 top-6 h-[1px] w-8 bg-walnut/20" />
        <div className="absolute bottom-6 right-6 h-8 w-[1px] bg-accent/20" />
        <div className="absolute bottom-6 right-6 h-[1px] w-8 bg-accent/20" />
      </div>
    </div>
  );
}
