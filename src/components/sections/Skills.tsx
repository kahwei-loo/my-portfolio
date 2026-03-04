"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "@/lib/gsap";
import { skills } from "@/data/mock";
import { skillsKeyboard } from "@/data/skills-keyboard";
import GlassCard from "@/components/ui/GlassCard";
import {
  animateHeadingReveal,
  animateSectionLabel,
} from "@/lib/animations";

const KeyboardJourney = dynamic(
  () => import("@/components/ui/KeyboardJourney"),
  { ssr: false }
);

// SkillInfoPanel — horizontal strip below keyboard
function SkillInfoPanel({ hoveredSkill }: { hoveredSkill: string | null }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prevSkillRef = useRef<string | null>(null);

  useEffect(() => {
    // Animate entrance only — never touch empty state
    if (hoveredSkill && hoveredSkill !== prevSkillRef.current && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
      );
    }
    prevSkillRef.current = hoveredSkill;
  }, [hoveredSkill]);

  const skill = hoveredSkill ? skillsKeyboard[hoveredSkill] : null;

  return (
    <div className="flex h-16 items-center">
      {skill ? (
        <GlassCard glow="accent" padding="sm" className="w-full">
          <div ref={contentRef} className="flex items-center gap-5">
            {/* Color dot + name */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: skill.color,
                  boxShadow: `0 0 10px ${skill.color}50`,
                }}
              />
              <h3 className="font-display text-base font-semibold text-text-primary">
                {skill.label}
              </h3>
            </div>
            {/* Category pill */}
            {skill.category && (
              <span className="glass-pill flex-shrink-0 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-walnut-light">
                {skill.category}
              </span>
            )}
            {/* Description */}
            {skill.description && (
              <p className="line-clamp-1 flex-1 text-sm leading-relaxed text-text-secondary">
                {skill.description}
              </p>
            )}
          </div>
        </GlassCard>
      ) : (
        // No ref — empty state must never be touched by GSAP
        <p className="w-full text-center text-sm font-medium text-text-tertiary/35">
          Hover a key to explore
        </p>
      )}
    </div>
  );
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      animateSectionLabel(labelRef.current, sectionRef.current);
      animateHeadingReveal(headingRef.current, sectionRef.current);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Build marquee items — repeat source until one loop-unit > any viewport,
  // then duplicate for the seamless translateX(-50%) loop.
  const buildMarquee = (arr: string[]) => {
    const reps = Math.ceil(20 / arr.length); // ≥20 items per half ≈ ≥2600px
    const half = Array.from({ length: reps }, () => arr).flat();
    return [...half, ...half]; // double → -50% lands on identical content
  };

  const row1Items = buildMarquee([
    ...skills.find((c) => c.category === "AI & LLM")!.items.map((s) => s.name),
    ...skills.find((c) => c.category === "Frontend")!.items.map((s) => s.name),
  ]);

  const row2Items = buildMarquee([
    ...skills.find((c) => c.category === "Backend")!.items.map((s) => s.name),
    ...skills.find((c) => c.category === "Tools & Infra")!.items.map((s) => s.name),
  ]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative bg-bg-primary px-6 py-12 lg:py-16"
    >

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-8 text-center">
          <div ref={labelRef} className="mb-4 flex items-center justify-center gap-4">
            <div className="label-line h-[1px] w-12 bg-gradient-to-r from-transparent to-walnut" />
            <span className="label-text text-xs font-medium uppercase tracking-[0.3em] text-walnut-light opacity-0">
              Expertise
            </span>
            <div className="label-line h-[1px] w-12 bg-gradient-to-l from-transparent to-walnut" />
          </div>
          <h2 ref={headingRef} className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.1] tracking-tight opacity-0">
            <span className="text-text-primary">Skills & </span>
            <span className="gradient-text">Technologies</span>
          </h2>
        </div>

        {/* Keyboard — full width */}
        <div className="relative h-[380px] lg:h-[440px]">
          <KeyboardJourney onHoveredSkillChange={setHoveredSkill} />
        </div>

        {/* Info panel — below keyboard, full width horizontal strip */}
        <SkillInfoPanel hoveredSkill={hoveredSkill} />

      </div>

      {/* Skills marquee — full-bleed, two rows, opposite directions */}
      <div className="relative -mx-6 mt-12 overflow-hidden">
        {/* Left fade — solid bg overlay hides partial words entering from right */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[15%] bg-gradient-to-r from-bg-primary to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[15%] bg-gradient-to-l from-bg-primary to-transparent" />

        {/* Row 1 — scrolls left */}
        <div className="animate-marquee-left flex items-center">
          {row1Items.map((name, i) => (
            <span key={i} className="flex shrink-0 items-center">
              <span className="px-5 text-sm font-light tracking-wide text-walnut-light/50">
                {name}
              </span>
              <span className="text-walnut/50">·</span>
            </span>
          ))}
        </div>

        {/* Row 2 — scrolls right */}
        <div className="animate-marquee-right mt-4 flex items-center">
          {row2Items.map((name, i) => (
            <span key={i} className="flex shrink-0 items-center">
              <span className="px-5 text-sm font-light tracking-wide text-walnut-light/50">
                {name}
              </span>
              <span className="text-walnut/50">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
