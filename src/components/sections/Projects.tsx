"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { projects, type Project } from "@/data/mock";
import ImageDistortion from "@/components/ui/ImageDistortion";
import MagneticButton from "@/components/ui/MagneticButton";
import ProjectDetailModal from "@/components/ui/ProjectDetailModal";
import {
  animateHeadingReveal,
  animateSectionLabel,
} from "@/lib/animations";

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const currentNumRef = useRef<HTMLSpanElement>(null);
  const currentProjectRef = useRef(1);
  const [currentProject, setCurrentProject] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section label — line grow + text fade
      animateSectionLabel(labelRef.current, sectionRef.current, {
        start: "top 80%",
      });

      // Heading — clip-path reveal
      animateHeadingReveal(headingRef.current, sectionRef.current, {
        start: "top 75%",
      });

      // Description fade
      const desc = headingRef.current?.parentElement?.querySelector(".proj-desc");
      if (desc) {
        gsap.fromTo(
          desc,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.4,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Desktop-only: horizontal scroll animation
      const horizontal = horizontalRef.current;
      const trigger = triggerRef.current;
      if (!horizontal || !trigger || window.innerWidth < 1024) return;

      const scrollWidth = horizontal.scrollWidth - window.innerWidth;

      const horizontalScroll = gsap.to(horizontal, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const totalProjects = projects.length;
            const newProject = Math.min(
              Math.floor(progress * totalProjects) + 1,
              totalProjects
            );
            if (newProject !== currentProjectRef.current) {
              currentProjectRef.current = newProject;
              setCurrentProject(newProject);
              if (currentNumRef.current) {
                gsap.fromTo(
                  currentNumRef.current,
                  { y: 10, opacity: 0 },
                  { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
                );
              }
            }
          },
          onEnter: () => {
            gsap.to([progressContainerRef.current, counterRef.current], {
              opacity: 1,
              duration: 0.3,
            });
          },
          onLeave: () => {
            gsap.to([progressContainerRef.current, counterRef.current], {
              opacity: 0,
              duration: 0.3,
            });
          },
          onEnterBack: () => {
            gsap.to([progressContainerRef.current, counterRef.current], {
              opacity: 1,
              duration: 0.3,
            });
          },
          onLeaveBack: () => {
            gsap.to([progressContainerRef.current, counterRef.current], {
              opacity: 0,
              duration: 0.3,
            });
          },
        },
      });

      // Progress bar animation
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: trigger,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 0.3,
        },
      });

      // Animate each project card
      const cards = horizontal.querySelectorAll(".project-card");
      cards.forEach((card) => {
        const content = card.querySelector(".card-content");
        const visual = card.querySelector(".card-visual");
        const number = card.querySelector(".card-number");

        gsap.set([content, visual, number], { opacity: 0, y: 30 });

        ScrollTrigger.create({
          trigger: card,
          containerAnimation: horizontalScroll,
          start: "left 80%",
          end: "left 20%",
          onEnter: () => {
            gsap.to(number, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
            });
            gsap.to(visual, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              delay: 0.1,
            });
            gsap.to(content, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              delay: 0.2,
            });
          },
          onLeaveBack: () => {
            gsap.to([content, visual, number], {
              opacity: 0,
              y: 30,
              duration: 0.4,
            });
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
    <section ref={sectionRef} id="projects" className="relative bg-bg-primary">

      {/* Section intro — shared between mobile & desktop */}
      <div className="relative pt-16 pb-6 lg:pt-20 lg:pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div ref={labelRef} className="mb-6 flex items-center gap-4">
            <div className="label-line h-[1px] w-12 bg-gradient-to-r from-walnut to-transparent" />
            <span className="label-text text-xs font-medium uppercase tracking-[0.3em] text-walnut-light opacity-0">
              Portfolio
            </span>
          </div>
          <h2 ref={headingRef} className="mb-8 font-display text-[clamp(2.5rem,8vw,5rem)] font-semibold leading-[0.9] tracking-tight opacity-0">
            <span className="text-text-primary">Featured</span>
            <br />
            <span className="gradient-text">Projects</span>
          </h2>
          <p className="proj-desc max-w-md text-base font-light leading-relaxed text-text-secondary opacity-0">
            A selection of work I&apos;m proud of — scroll to explore
          </p>
        </div>

        {/* Scroll hint — desktop only */}
        <div className="absolute bottom-12 right-12 hidden items-center gap-4 lg:flex">
          <span className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Keep scrolling
          </span>
          <svg
            className="h-6 w-6 animate-pulse text-walnut"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>

      {/* ============ MOBILE: vertical card layout ============ */}
      <div className="mx-auto max-w-6xl px-6 pb-24 lg:hidden">
        <div className="space-y-8">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="overflow-hidden rounded-2xl p-6"
              style={{
                background: `linear-gradient(135deg, ${project.color}10 0%, ${project.color}05 100%)`,
              }}
            >
              <div
                className="mb-4 text-6xl font-bold opacity-20"
                style={{ color: project.color }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1"
                style={{ backgroundColor: `${project.color}15` }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: project.color }}
                >
                  {project.subtitle}
                </span>
              </div>

              <h3 className="mb-3 text-2xl font-bold text-text-primary">
                {project.title}
              </h3>

              <p className="mb-4 text-sm text-text-secondary">
                {project.description}
              </p>

              <div className="mb-6 flex flex-wrap gap-2">
                {project.tech.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="glass-pill px-3 py-1 text-xs text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                {project.caseStudy && (
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 rounded-full py-3 text-center text-sm font-medium text-white"
                    style={{ backgroundColor: project.color }}
                  >
                    Case Study
                  </button>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-text-tertiary/30 px-6 py-3 text-sm font-medium text-text-primary"
                  >
                    Code
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ DESKTOP: horizontal scroll layout ============ */}
      <div className="hidden lg:block">
        {/* Progress indicator - fixed position during horizontal scroll */}
        <div
          ref={progressContainerRef}
          className="fixed left-0 top-20 z-40 w-full opacity-0"
        >
          <div className="h-[1px] w-full bg-white/[0.06]">
            <div
              ref={progressRef}
              className="h-full origin-left bg-gradient-to-r from-accent via-walnut to-walnut-light"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        {/* Project counter */}
        <div
          ref={counterRef}
          className="fixed right-8 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-3 opacity-0"
        >
          <div className="flex items-baseline gap-2 font-mono">
            <span
              ref={currentNumRef}
              className="text-4xl font-bold tabular-nums text-text-primary"
            >
              {String(currentProject).padStart(2, "0")}
            </span>
            <span className="text-sm text-text-tertiary">/</span>
            <span className="text-sm tabular-nums text-text-tertiary">
              {String(projects.length).padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {projects.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index + 1 === currentProject
                    ? "scale-125 bg-accent"
                    : index + 1 < currentProject
                    ? "bg-walnut"
                    : "bg-text-tertiary/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div ref={triggerRef} className="relative">
          <div
            ref={horizontalRef}
            className="flex h-screen items-center gap-8 pl-[10vw]"
            style={{ width: `${projects.length * 80 + 60}vw` }}
          >
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="project-card relative flex h-auto min-h-[60vh] w-[70vw] flex-shrink-0 items-center gap-16 rounded-[2rem] border border-white/[0.04] px-16 py-12"
                style={{
                  background: `linear-gradient(135deg, ${project.color}08 0%, ${project.color}03 100%)`,
                }}
              >
                {/* Large background number */}
                <div
                  className="card-number pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 select-none text-[20vw] font-bold leading-none opacity-0"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: `1px ${project.color}15`,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Visual */}
                <div className="card-visual relative w-1/2 flex-shrink-0 opacity-0">
                  <ImageDistortion
                    color={project.color}
                    className="aspect-[4/3] rounded-3xl"
                  >
                    <div
                      className="relative h-full w-full overflow-hidden rounded-3xl"
                      style={{
                        background: `linear-gradient(135deg, ${project.color}15, ${project.color}05)`,
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `
                            linear-gradient(${project.color}20 1px, transparent 1px),
                            linear-gradient(90deg, ${project.color}20 1px, transparent 1px)
                          `,
                          backgroundSize: "50px 50px",
                        }}
                      />

                      <div
                        className="absolute right-8 top-8 h-24 w-24 rounded-3xl"
                        style={{ backgroundColor: `${project.color}25` }}
                      />
                      <div
                        className="absolute bottom-16 left-16 h-20 w-40 rounded-2xl"
                        style={{ backgroundColor: `${project.color}20` }}
                      />

                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div
                          className="relative h-full w-full max-w-lg rounded-2xl border shadow-2xl"
                          style={{
                            backgroundColor: "#0a0a0a",
                            borderColor: `${project.color}30`,
                            boxShadow: `0 50px 100px -20px ${project.color}30`,
                          }}
                        >
                          <div className="flex items-center gap-2 border-b border-text-tertiary/10 px-5 py-4">
                            <div className="h-3 w-3 rounded-full bg-red-500/60" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                            <div className="h-3 w-3 rounded-full bg-green-500/60" />
                            <div className="ml-4 h-6 flex-1 rounded-md bg-bg-card" />
                          </div>

                          <div className="space-y-4 p-6">
                            <div
                              className="h-6 w-2/3 rounded-lg"
                              style={{ backgroundColor: `${project.color}40` }}
                            />
                            <div className="space-y-2">
                              <div className="h-3 w-full rounded bg-text-tertiary/15" />
                              <div className="h-3 w-5/6 rounded bg-text-tertiary/10" />
                              <div className="h-3 w-4/6 rounded bg-text-tertiary/10" />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <div
                                className="h-10 w-24 rounded-lg"
                                style={{ backgroundColor: `${project.color}30` }}
                              />
                              <div className="h-10 w-20 rounded-lg bg-text-tertiary/10" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl"
                        style={{ backgroundColor: project.color, opacity: 0.15 }}
                      />
                      <div
                        className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl"
                        style={{ backgroundColor: project.color, opacity: 0.1 }}
                      />
                    </div>
                  </ImageDistortion>
                </div>

                {/* Content */}
                <div className="card-content relative z-10 flex-1 opacity-0">
                  <div className="glass-pill mb-6 inline-flex items-center gap-2 px-4 py-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{ color: project.color }}
                    >
                      {project.subtitle}
                    </span>
                  </div>

                  <h3 className="mb-6 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-text-primary">
                    {project.title}
                  </h3>

                  <p className="mb-8 max-w-lg text-lg leading-relaxed text-text-secondary">
                    {project.description}
                  </p>

                  <div className="mb-10 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="glass-pill px-4 py-2 text-sm text-text-secondary transition-all hover:border-white/[0.12]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-6">
                    {project.caseStudy && (
                      <MagneticButton strength={0.3}>
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-medium text-white transition-all hover:scale-105"
                          style={{ backgroundColor: project.color }}
                          data-cursor-text="Read"
                          data-cursor-color={project.color}
                        >
                          <span>Case Study</span>
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
                        </button>
                      </MagneticButton>
                    )}

                    {project.github && (
                      <MagneticButton strength={0.3}>
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-3 rounded-full border border-text-tertiary/30 px-8 py-4 text-sm font-medium text-text-primary transition-all hover:border-text-tertiary hover:bg-bg-card"
                          data-cursor-text="Code"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          <span>Source Code</span>
                        </a>
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* End card - CTA */}
            <div className="flex h-auto min-h-[60vh] w-[50vw] flex-shrink-0 flex-col items-center justify-center rounded-[2rem] border border-white/[0.04] bg-gradient-to-br from-walnut/5 to-accent/5 p-12">
              <div className="text-center">
                <span className="mb-4 inline-block text-sm font-medium uppercase tracking-widest text-walnut-light">
                  Interested in working together?
                </span>
                <h3 className="mb-8 text-[clamp(2rem,4vw,3.5rem)] font-bold text-text-primary">
                  Let&apos;s build something
                  <br />
                  <span className="text-walnut">amazing</span>
                </h3>
                <MagneticButton strength={0.4}>
                  <a
                    href="#contact"
                    className="group inline-flex items-center gap-3 rounded-full bg-accent px-10 py-5 text-base font-medium text-white transition-all hover:scale-105 hover:bg-accent-dark"
                    data-cursor-text="Contact"
                    data-cursor-color="#2997FF"
                  >
                    <span>Get in Touch</span>
                    <svg
                      className="h-5 w-5 transition-transform group-hover:translate-x-1"
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
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacer for scroll */}
        <div className="h-16 bg-bg-primary" />
      </div>
    </section>
    <ProjectDetailModal
      project={selectedProject}
      onClose={() => setSelectedProject(null)}
    />
    </>
  );
}
