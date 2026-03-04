"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { experiences, education } from "@/data/mock";
import {
  animateHeadingReveal,
  animateSectionLabel,
  animateContentStagger,
} from "@/lib/animations";

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Combine work experience and education into a single timeline
  const timelineItems = [
    ...experiences.map((exp) => ({ ...exp, type: "work" as const })),
    ...education.map((edu) => ({
      ...edu,
      type: "education" as const,
      role: edu.degree,
      company: edu.school,
    })),
  ].sort((a, b) => {
    const getYear = (period: string) =>
      parseInt(period.split(" ")[1] || period.split("-")[0]);
    return getYear(b.period) - getYear(a.period);
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label — line grow + text fade
      animateSectionLabel(labelRef.current, sectionRef.current);

      // Heading — clip-path reveal
      animateHeadingReveal(headingRef.current, sectionRef.current);

      // Description fade
      animateContentStagger(
        descRef.current ? [descRef.current] : null,
        sectionRef.current,
        { start: "top 65%" }
      );

      // Timeline progress line
      gsap.fromTo(
        progressRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 60%",
            end: "bottom 60%",
            scrub: 0.5,
          },
        }
      );

      // Timeline items — alternating slide direction on desktop
      const items = timelineRef.current?.querySelectorAll(".timeline-item");
      if (items) {
        items.forEach((item, index) => {
          const card = item.querySelector(".timeline-card");
          const dot = item.querySelector(".timeline-dot");
          const connector = item.querySelector(".timeline-connector");

          // Card slides from alternating sides on desktop
          const fromX = index % 2 === 0 ? -60 : 60;
          gsap.fromTo(
            card,
            { opacity: 0, x: fromX, scale: 0.95 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            }
          );

          gsap.fromTo(
            dot,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.5,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: item,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            }
          );

          if (connector) {
            gsap.fromTo(
              connector,
              { scaleX: 0 },
              {
                scaleX: 1,
                duration: 0.5,
                delay: 0.2,
                scrollTrigger: {
                  trigger: item,
                  start: "top 70%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative bg-bg-primary px-6 py-12 lg:py-16"
    >

      <div className="relative mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <div
            ref={labelRef}
            className="mb-6 flex items-center justify-center gap-4"
          >
            <div className="label-line h-[1px] w-12 bg-gradient-to-r from-transparent to-walnut" />
            <span className="label-text text-xs font-medium uppercase tracking-[0.3em] text-walnut-light opacity-0">
              Journey
            </span>
            <div className="label-line h-[1px] w-12 bg-gradient-to-l from-transparent to-walnut" />
          </div>
          <h2
            ref={headingRef}
            className="font-display text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-[1] tracking-tight opacity-0"
          >
            <span className="text-text-primary">Experience &</span>
            <br />
            <span className="gradient-text">Education</span>
          </h2>
          <p
            ref={descRef}
            className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-text-secondary opacity-0"
          >
            My journey through education and professional development
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          <div className="absolute left-8 top-0 h-full w-[1px] bg-white/[0.06] md:left-1/2 md:-translate-x-1/2" />
          <div
            ref={progressRef}
            className="absolute left-8 top-0 h-full w-[1px] origin-top bg-gradient-to-b from-accent via-walnut to-walnut-light md:left-1/2 md:-translate-x-1/2"
            style={{ transform: "scaleY(0)" }}
          />

          <div className="relative space-y-10">
            {timelineItems.map((item, index) => {
              const isWork = item.type === "work";
              const glowColor = isWork
                ? "rgba(41, 151, 255, 0.08)"
                : "rgba(139, 115, 85, 0.08)";

              return (
                <div
                  key={item.id}
                  className={`timeline-item relative flex gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="timeline-dot absolute left-8 top-8 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center md:left-1/2">
                    <div
                      className="h-4 w-4 rounded-full border-4 border-bg-primary"
                      style={{
                        backgroundColor: isWork ? "#2997FF" : "#8B7355",
                      }}
                    />
                    <div
                      className="absolute h-4 w-4 animate-ping rounded-full opacity-20"
                      style={{
                        backgroundColor: isWork ? "#2997FF" : "#8B7355",
                        animationDuration: "3s",
                      }}
                    />
                  </div>

                  <div
                    className={`timeline-connector absolute top-9 hidden h-[1px] w-8 origin-left md:block ${
                      index % 2 === 0
                        ? "right-1/2 mr-2 origin-right"
                        : "left-1/2 ml-2"
                    }`}
                    style={{
                      transform: "scaleX(0)",
                      background: isWork
                        ? "linear-gradient(to right, #2997FF, transparent)"
                        : "linear-gradient(to right, #8B7355, transparent)",
                    }}
                  />

                  <div
                    className={`timeline-card ml-16 w-full rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-8 opacity-0 backdrop-blur-[20px] transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05] md:ml-0 md:w-[calc(50%-3rem)] ${
                      index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                    }`}
                    style={{ boxShadow: "0 0 0 0 transparent" }}
                    onMouseEnter={(e) => {
                      (
                        e.currentTarget as HTMLElement
                      ).style.boxShadow = `0 0 40px ${glowColor}`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 0 0 0 transparent";
                    }}
                  >
                    <div className="glass-pill mb-4 inline-flex items-center gap-2 px-4 py-1.5">
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: isWork ? "#2997FF" : "#8B7355",
                        }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: isWork ? "#2997FF" : "#D4C4B0" }}
                      >
                        {item.period}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                        {"categoryLabel" in item && item.categoryLabel
                          ? item.categoryLabel
                          : isWork
                          ? "Work Experience"
                          : "Education"}
                      </span>
                    </div>

                    <h3 className="mb-2 text-2xl font-bold text-text-primary">
                      {item.role}
                    </h3>
                    <p className="mb-4 flex items-center gap-2 text-walnut-light">
                      <span>{item.company}</span>
                      <span className="text-text-tertiary/40">|</span>
                      <span className="text-text-secondary">
                        {item.location}
                      </span>
                    </p>

                    <p className="mb-6 leading-relaxed text-text-secondary">
                      {item.description}
                    </p>

                    <div className="space-y-3">
                      {item.highlights.map((highlight, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-sm text-text-secondary"
                        >
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0"
                            style={{
                              color: isWork ? "#2997FF" : "#8B7355",
                            }}
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
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden w-[calc(50%-3rem)] md:block" />
                </div>
              );
            })}
          </div>

          <div className="relative mt-16 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] backdrop-blur-sm">
              <svg
                className="h-5 w-5 text-walnut-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
