"use client";

import { personalInfo } from "@/data/mock";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-bg-primary px-6 py-12">
      {/* Glass separator line */}
      <div className="mx-auto mb-12 max-w-6xl">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Copyright */}
          <p className="text-sm text-text-tertiary">
            &copy; {currentYear} {personalInfo.name}. All rights reserved.
          </p>

          {/* Made with */}
          <p className="flex items-center gap-1 text-sm text-text-tertiary">
            Built with
            <span className="mx-1 text-accent">&hearts;</span>
            using Next.js & GSAP
          </p>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-text-secondary"
            data-cursor-text="Top"
          >
            <span>Back to top</span>
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
