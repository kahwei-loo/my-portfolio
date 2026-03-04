"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { personalInfo } from "@/data/mock";
import { getEmail, getMailtoHref } from "@/lib/email";
import MagneticButton from "@/components/ui/MagneticButton";
import GradientBlob from "@/components/ui/GradientBlob";
import HoloCard from "@/components/ui/HoloCard";
import CodeParticles from "@/components/ui/CodeParticles";
import PhotoGallery from "@/components/sections/PhotoGallery";



const TITLES = [
  "Software Engineer",
  "Generative AI Engineer",
  "Full Stack Developer",
];

export default function Hero() {
  // ── Part 1 refs ────────────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);
  const partOneRef = useRef<HTMLDivElement>(null);  // scroll trigger scope for parallax
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLSpanElement>(null);
  const lastNameRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const [titleIndex, setTitleIndex] = useState(0);


  // ── Rotating title — starts after entrance animation (~5s) ─────────────────
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let mounted = true;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        const el = titleTextRef.current;
        if (!el) return;

        gsap.to(el, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (!mounted) return;
            setTitleIndex((prev) => (prev + 1) % TITLES.length);
            gsap.fromTo(
              titleTextRef.current,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
            );
          },
        });
      }, 3000);
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // ── GSAP: entrance + hover + scroll animations ─────────────────────────────
  useEffect(() => {
    const eventListeners: Array<{
      element: Element;
      event: string;
      handler: EventListener;
    }> = [];

    const ctx = gsap.context(() => {
      // ── Part 1: entrance timeline ──────────────────────────────────────────
      const masterTL = gsap.timeline({
        defaults: { ease: "power4.out" },
        delay: 2.8,
      });

      const firstNameChars = firstNameRef.current?.querySelectorAll(".char");
      const lastNameChars = lastNameRef.current?.querySelectorAll(".char");

      if (firstNameChars) {
        masterTL.fromTo(
          firstNameChars,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0, stagger: 0.04 },
          0
        );
      }

      if (lastNameChars) {
        masterTL.fromTo(
          lastNameChars,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0, stagger: 0.04 },
          0.15
        );
      }

      masterTL.fromTo(
        roleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.6
      );
      masterTL.fromTo(
        taglineRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        0.8
      );
      masterTL.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        1.0
      );
      masterTL.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        0.3
      );
      masterTL.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        1.2
      );

      // ── Part 1: liquid text hover effects ──────────────────────────────────
      masterTL.call(() => {
        const createLiquidEffect = (
          chars: NodeListOf<Element>,
          index: number,
          isOutlined: boolean = false
        ) => {
          const char = chars[index] as HTMLElement;
          if (!char) return;

          gsap.to(char, {
            y: -24,
            scaleY: 1.6,
            scaleX: 0.82,
            color: isOutlined ? undefined : "#D4C4B0",
            textShadow: "0 0 30px rgba(41, 151, 255, 0.3)",
            duration: 0.7,
            ease: "elastic.out(1, 0.4)",
            force3D: true,
            overwrite: "auto",
          });

          if (isOutlined) {
            gsap.to(char, {
              webkitTextStroke: "3px rgba(41, 151, 255, 0.8)",
              duration: 0.3,
              overwrite: "auto",
            });
          }

          [-2, -1, 1, 2].forEach((offset) => {
            const neighbor = chars[index + offset] as HTMLElement;
            if (!neighbor) return;
            const d = Math.abs(offset);
            gsap.to(neighbor, {
              y: d === 1 ? -12 : -5,
              scaleY: d === 1 ? 1.15 : 1.06,
              duration: 0.5,
              delay: 0.06 * d,
              ease: "power2.out",
              force3D: true,
              overwrite: "auto",
            });
          });
        };

        const resetLiquidEffect = (
          chars: NodeListOf<Element>,
          index: number,
          isOutlined: boolean = false
        ) => {
          [-2, -1, 0, 1, 2].forEach((offset) => {
            const char = chars[index + offset] as HTMLElement;
            if (!char) return;

            gsap.to(char, {
              y: 0,
              scaleY: 1,
              scaleX: 1,
              color: isOutlined ? undefined : "#FFFFFF",
              textShadow: "none",
              duration: 0.6,
              ease: "elastic.out(1, 0.6)",
              force3D: true,
              overwrite: "auto",
            });

            if (isOutlined) {
              gsap.to(char, {
                webkitTextStroke: "2px rgba(255, 255, 255, 0.45)",
                duration: 0.4,
                overwrite: "auto",
              });
            }
          });
        };

        const isTouchDevice =
          "ontouchstart" in window || navigator.maxTouchPoints > 0;

        firstNameChars?.forEach((char, index) => {
          const enter = () => createLiquidEffect(firstNameChars, index, false);
          const leave = () => resetLiquidEffect(firstNameChars, index, false);
          char.addEventListener("mouseenter", enter);
          char.addEventListener("mouseleave", leave);
          eventListeners.push(
            { element: char, event: "mouseenter", handler: enter },
            { element: char, event: "mouseleave", handler: leave }
          );
          if (isTouchDevice) {
            const touch = (e: Event) => {
              e.preventDefault();
              createLiquidEffect(firstNameChars, index, false);
              setTimeout(() => resetLiquidEffect(firstNameChars, index, false), 800);
            };
            char.addEventListener("touchstart", touch);
            eventListeners.push({ element: char, event: "touchstart", handler: touch });
          }
        });

        lastNameChars?.forEach((char, index) => {
          const enter = () => createLiquidEffect(lastNameChars, index, true);
          const leave = () => resetLiquidEffect(lastNameChars, index, true);
          char.addEventListener("mouseenter", enter);
          char.addEventListener("mouseleave", leave);
          eventListeners.push(
            { element: char, event: "mouseenter", handler: enter },
            { element: char, event: "mouseleave", handler: leave }
          );
          if (isTouchDevice) {
            const touch = (e: Event) => {
              e.preventDefault();
              createLiquidEffect(lastNameChars, index, true);
              setTimeout(() => resetLiquidEffect(lastNameChars, index, true), 800);
            };
            char.addEventListener("touchstart", touch);
            eventListeners.push({ element: char, event: "touchstart", handler: touch });
          }
        });
      });

      // ── Part 1: scroll parallax — scoped to Part 1 div ────────────────────
      ScrollTrigger.create({
        trigger: partOneRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          if (titleContainerRef.current) {
            gsap.set(titleContainerRef.current, {
              y: self.progress * -150,
              opacity: 1 - self.progress * 1.5,
            });
          }
        },
      });

      // Scroll indicator bounce
      const scrollLine = scrollIndicatorRef.current?.querySelector(".scroll-line");
      if (scrollLine) {
        gsap.to(scrollLine, {
          y: 20,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }

    }, sectionRef);

    return () => {
      eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      ctx.revert();
    };
  }, []);

  // ── Split text into per-character spans for liquid hover ───────────────────
  const splitText = (text: string) =>
    text.split("").map((char, i) => {
      const isSpace = char === " ";
      return (
        <span
          key={i}
          className="char inline-block cursor-default"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
            userSelect: "none",
            WebkitUserSelect: "none",
            ...(isSpace ? { minWidth: "0.3em" } : {}),
          }}
        >
          {isSpace ? "\u00A0" : char}
        </span>
      );
    });

  const nameParts = personalInfo.name.split(" ");
  const lastName = nameParts.pop()!;
  const firstName = nameParts.join(" ");

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full overflow-hidden bg-bg-primary"
    >
      {/* Gradient blob + film-grain overlay — covers entire section */}
      <div className="pointer-events-none absolute inset-0">
        <GradientBlob className="opacity-70" />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Part 1: Identity — full viewport ───────────────────────────────── */}
      <div
        ref={partOneRef}
        className="relative flex min-h-screen w-full items-center justify-center"
      >
        {/* Code symbol particle background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <CodeParticles />
        </div>

        {/* Centered card — the entire hero unit */}
        <div
          ref={titleContainerRef}
          className="relative z-30 w-full max-w-[400px] px-4 py-8"
          style={{ pointerEvents: "auto" }}
        >
          <div ref={cardRef} className="opacity-0">
            <HoloCard className="w-full">

              {/* Availability dot — absolute top-right */}
              <div className="absolute right-4 top-4 z-20">
                <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 p-1.5">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                </div>
              </div>

              {/* Avatar */}
              <div className="flex justify-center pt-7 pb-3">
                <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-white/10 ring-offset-1 ring-offset-transparent">
                  <Image
                    src={personalInfo.headshot}
                    alt={personalInfo.name}
                    fill
                    sizes="72px"
                    className="object-cover object-[30%_20%]"
                  />
                </div>
              </div>

              {/* Name — elastic hover preserved */}
              <div className="px-5 text-center mb-1">
                <h1>
                  <span
                    ref={firstNameRef}
                    className="block font-display text-[3rem] font-bold leading-[0.9] tracking-[-0.03em] text-text-primary"
                  >
                    {splitText(firstName)}
                  </span>
                  <span
                    ref={lastNameRef}
                    className="block font-display text-[3rem] font-bold leading-[0.9] tracking-[-0.03em]"
                    style={{
                      color: "transparent",
                      WebkitTextStroke: "2px rgba(255, 255, 255, 0.45)",
                    }}
                  >
                    {splitText(lastName)}
                  </span>
                </h1>
              </div>

              {/* Rotating role */}
              <div
                ref={roleRef}
                className="mb-5 flex items-center justify-center gap-3 px-5 opacity-0"
              >
                <span className="h-[1px] w-8 flex-shrink-0 bg-gradient-to-r from-transparent to-walnut" />
                <div className="overflow-hidden">
                  <span
                    ref={titleTextRef}
                    className="inline-block text-[0.6rem] font-medium uppercase tracking-[0.25em] text-walnut-light"
                  >
                    {TITLES[titleIndex]}
                  </span>
                </div>
                <span className="h-[1px] w-8 flex-shrink-0 bg-gradient-to-l from-transparent to-walnut" />
              </div>

              {/* Tagline */}
              <p
                ref={taglineRef}
                className="px-5 mb-5 text-center text-[0.8rem] font-light leading-relaxed text-text-secondary opacity-0"
              >
                {personalInfo.tagline}
              </p>

              {/* Divider */}
              <div className="mx-5 h-[1px] bg-white/[0.06] mb-4" />

              {/* Contact info */}
              <div className="px-5 space-y-2 mb-4">
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="h-3 w-3 flex-shrink-0 text-walnut-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[0.7rem]">{personalInfo.location}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="h-3 w-3 flex-shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate text-[0.7rem]">{getEmail()}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-5 h-[1px] bg-white/[0.06] mb-5" />

              {/* Social icons */}
              <div className="px-5 pb-6">
                <div className="flex items-center justify-center gap-2 mb-5">
                  <a href={personalInfo.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-secondary transition-all hover:border-white/[0.15] hover:text-text-primary">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a href={personalInfo.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-secondary transition-all hover:border-[#0077B5]/30 hover:text-[#0077B5]">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a href={personalInfo.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-secondary transition-all hover:border-white/[0.15] hover:text-text-primary">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>

              </div>

            </HoloCard>
          </div>

          {/* CTAs — outside the card, below it */}
          <div
            ref={ctaRef}
            className="mt-5 flex flex-col items-center gap-2.5 opacity-0 sm:flex-row sm:justify-center sm:gap-4"
          >
            <MagneticButton strength={0.3}>
              <a
                href="#projects"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-white transition-transform hover:scale-105"
                data-cursor-text="View"
                data-cursor-color="#2997FF"
              >
                <span className="relative z-10">View My Work</span>
                <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="absolute inset-0 origin-left scale-x-0 bg-accent-dark transition-transform duration-500 group-hover:scale-x-100" />
              </a>
            </MagneticButton>
            <MagneticButton strength={0.3}>
              <a
                href={getMailtoHref()}
                className="glass-pill group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium text-text-primary transition-all hover:border-walnut/30"
                data-cursor-text="Email"
              >
                <span>Get in Touch</span>
              </a>
            </MagneticButton>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-3 opacity-0"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-text-tertiary">
            Scroll
          </span>
          <div className="relative h-12 w-[1px] overflow-hidden">
            <div className="scroll-line absolute top-0 h-6 w-full bg-gradient-to-b from-walnut-light to-transparent" />
            <div className="absolute inset-0 bg-text-tertiary/20" />
          </div>
        </div>

        {/* Fade into About part */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
      </div>

      {/* ── Part 2: About — gallery has its own label inside the track ────── */}
      <div id="about" className="relative z-30">
        <PhotoGallery />
      </div>

      {/* Bottom fade into Skills section */}
      <div className="pointer-events-none relative z-30 h-20 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  );
}
