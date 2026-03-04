"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { personalInfo } from "@/data/mock";
import { getEmail } from "@/lib/email";
import GlassCard from "@/components/ui/GlassCard";
import TiltCard from "@/components/ui/TiltCard";
import {
  animateHeadingReveal,
  animateSectionLabel,
  animateContentStagger,
} from "@/lib/animations";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label — line grow + text fade
      animateSectionLabel(labelRef.current, sectionRef.current);

      // Heading — clip-path reveal
      animateHeadingReveal(headingRef.current, sectionRef.current, {
        start: "top 65%",
      });

      // Content text stagger
      const textElements =
        contentRef.current?.querySelectorAll(".animate-text");
      if (textElements) {
        animateContentStagger(textElements, contentRef.current, {
          start: "top 60%",
        });
      }

      // Stat cards with scale + subtle rotation
      const statCards = statsRef.current?.querySelectorAll(".stat-card");
      if (statCards) {
        gsap.fromTo(
          statCards,
          { opacity: 0, y: 30, scale: 0.95, rotation: -2, visibility: "hidden" },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            visibility: "visible",
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Stat number counters
      const statNumbers = statsRef.current?.querySelectorAll(".stat-number");
      if (statNumbers) {
        statNumbers.forEach((num) => {
          const target = parseInt(
            num.getAttribute("data-target") || "0",
            10
          );
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: statsRef.current,
            start: "top 80%",
            once: true,
            onEnter: () => {
              gsap.to(obj, {
                val: target,
                duration: 2,
                ease: "power2.out",
                onUpdate: () => {
                  num.textContent = Math.round(obj.val).toString();
                },
              });
            },
          });
        });
      }

      // Business card entrance
      gsap.fromTo(
        visualRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: visualRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative bg-bg-primary px-6 py-16 lg:py-20"
    >

      <div className="relative mx-auto max-w-6xl">
        {/* Section label — animated line + text */}
        <div ref={labelRef} className="mb-10 flex items-center gap-4">
          <div className="label-line h-[1px] w-12 bg-gradient-to-r from-walnut to-transparent" />
          <span className="label-text text-xs font-medium uppercase tracking-[0.3em] text-walnut-light opacity-0">
            About
          </span>
        </div>

        {/* Large statement heading — clip-path reveal */}
        <h2
          ref={headingRef}
          className="mb-10 max-w-4xl font-display text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-[1.05] tracking-tight opacity-0"
        >
          <span className="text-text-primary">I craft digital</span>
          <br />
          <span className="gradient-text">experiences</span>
        </h2>

        {/* Main grid */}
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Text content - spans 7 columns */}
          <div ref={contentRef} className="lg:col-span-7">
            <div className="space-y-6">
              <p className="animate-text text-lg leading-[1.8] text-text-secondary opacity-0">
                I started out building{" "}
                <span className="font-medium text-text-primary">
                  production backend systems
                </span>{" "}
                &mdash; tax logic, e-Invoice integrations, and the
                accounting workflows that SMEs depend on day-to-day. Along
                the way, I became curious about AI and decided to go deeper:
                I completed a comprehensive{" "}
                <span className="font-medium text-text-primary">
                  AI engineering curriculum
                </span>
                , built a{" "}
                <span className="font-medium text-text-primary">
                  document intelligence platform
                </span>{" "}
                from scratch, and picked up React, Three.js, and the tools
                that let me work across the full stack.
              </p>
              <p className="animate-text text-lg leading-[1.8] text-text-secondary opacity-0">
                I like getting the details right&mdash;whether that means
                making sure an{" "}
                <span className="font-medium text-text-primary">
                  LLM output is reliable
                </span>{" "}
                enough for production, or tweaking an{" "}
                <span className="font-medium text-text-primary">
                  animation until it feels smooth
                </span>
                . Good software should work correctly, and it should{" "}
                <span className="font-medium text-text-primary">
                  feel thoughtful
                </span>
                .
              </p>
            </div>

            {/* Stats — glass cards */}
            <div
              ref={statsRef}
              className="mt-10 grid grid-cols-3 gap-4 md:gap-6"
            >
              <GlassCard
                hover
                glow="accent"
                padding="md"
                className="stat-card text-center"
              >
                <div className="text-4xl font-bold text-text-primary lg:text-5xl">
                  <span className="stat-number" data-target="2">
                    0
                  </span>
                  <span className="text-accent">+</span>
                </div>
                <div className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                  Years Experience
                </div>
              </GlassCard>

              <GlassCard
                hover
                glow="walnut"
                padding="md"
                className="stat-card text-center"
              >
                <div className="text-4xl font-bold text-text-primary lg:text-5xl">
                  <span className="stat-number" data-target="5">
                    0
                  </span>
                  <span className="text-walnut-light">+</span>
                </div>
                <div className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                  Projects Built
                </div>
              </GlassCard>

              <GlassCard
                hover
                glow="accent"
                padding="md"
                className="stat-card text-center"
              >
                <div className="text-4xl font-bold text-text-primary lg:text-5xl">
                  <span className="stat-number" data-target="10">
                    0
                  </span>
                  <span className="text-accent">+</span>
                </div>
                <div className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                  Technologies
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Digital Business Card — spans 5 columns */}
          <div ref={visualRef} className="relative opacity-0 lg:col-span-5">
            <TiltCard className="overflow-hidden">
              <div className="flex flex-col">
                {/* Accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-walnut via-accent to-walnut-light" />

                {/* Status badge + Identity */}
                <div className="flex flex-col items-center px-8 pt-8 pb-5">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                    <span className="text-xs font-medium text-emerald-300">
                      Open to opportunities
                    </span>
                  </div>

                  <div className="mb-5 h-24 w-24 overflow-hidden rounded-full ring-2 ring-white/10">
                    <Image
                      src={personalInfo.headshot}
                      alt={personalInfo.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover object-[30%_25%]"
                      priority
                    />
                  </div>

                  <h3 className="font-display text-2xl font-semibold text-text-primary">
                    {personalInfo.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {personalInfo.title}
                  </p>
                </div>

                {/* Divider */}
                <div className="mx-8 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                {/* Contact details */}
                <div className="flex flex-col items-center px-8 pt-5 pb-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                      <svg
                        className="h-4 w-4 shrink-0 text-walnut-light"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{personalInfo.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                      <svg
                        className="h-4 w-4 shrink-0 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{getEmail()}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-8 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                {/* Currently building with */}
                <div className="flex flex-col items-center px-8 pt-5 pb-5">
                  <span className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-text-tertiary">
                    Currently building with
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {["React", "Next.js", "Python", "Three.js", "TypeScript"].map(
                      (tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[0.7rem] text-text-secondary"
                        >
                          {tech}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-8 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                {/* Social links */}
                <div className="flex items-center justify-center gap-3 px-8 pt-5 pb-8">
                  <a
                    href={personalInfo.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-secondary transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-text-primary"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a
                    href={personalInfo.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-secondary transition-all hover:border-[#0077B5]/30 hover:bg-[#0077B5]/10 hover:text-[#0077B5]"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  <a
                    href={personalInfo.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter) profile"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-text-secondary transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-text-primary"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
