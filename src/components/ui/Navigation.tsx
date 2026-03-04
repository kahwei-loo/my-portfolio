"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { navItems, personalInfo } from "@/data/mock";
import { getMailtoHref } from "@/lib/email";

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    // Entrance animation — delayed for loading screen
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 3.3, ease: "power3.out" }
    );

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = navItems.map((item) =>
        document.querySelector(item.href)
      );
      sections.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(navItems[index].href);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    const target = document.querySelector(href);
    if (target) {
      const offset = 60;
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed left-0 right-0 top-0 z-50 opacity-0"
      >
        <div className="flex items-center justify-between px-5 py-3 md:px-8">
          {/* Logo — left */}
          <a
            href="#"
            className="text-sm font-bold text-text-primary transition-opacity hover:opacity-80"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {personalInfo.shortName}
            <span className="text-accent">.</span>
          </a>

          {/* ── Desktop: Floating Capsule ── */}
          <div
            className={`hidden items-center gap-0.5 rounded-full border px-1.5 py-1 transition-all duration-500 md:flex ${
              isScrolled
                ? "border-white/[0.08] bg-bg-primary/70 shadow-lg shadow-black/20 backdrop-blur-xl"
                : "border-white/[0.05] bg-white/[0.03] backdrop-blur-sm"
            }`}
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300 ${
                  activeSection === item.href
                    ? "bg-white/[0.12] text-text-primary"
                    : "text-text-secondary hover:bg-white/[0.06] hover:text-text-primary"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA — right (desktop) */}
          <a
            href={getMailtoHref()}
            className="hidden rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent-dark md:block"
          >
            Let&apos;s Talk
          </a>

          {/* ── Mobile: Hamburger capsule ── */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 md:hidden ${
              isScrolled
                ? "border-white/[0.08] bg-bg-primary/70 backdrop-blur-xl"
                : "border-white/[0.05] bg-white/[0.04] backdrop-blur-sm"
            }`}
            aria-label="Toggle menu"
          >
            <div className="flex h-3 w-3.5 flex-col justify-between">
              <span
                className={`h-[1.5px] w-full bg-current text-text-primary transition-all duration-300 ${
                  isMobileMenuOpen ? "translate-y-[4.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-full bg-current text-text-primary transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-full bg-current text-text-primary transition-all duration-300 ${
                  isMobileMenuOpen ? "-translate-y-[4.5px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-bg-primary/95 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div className="relative flex h-full flex-col items-center justify-center">
          <nav className="flex flex-col items-center gap-6">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-2xl font-light text-text-primary transition-all hover:text-accent"
                style={{
                  transitionDelay: isMobileMenuOpen
                    ? `${index * 50}ms`
                    : "0ms",
                  transform: isMobileMenuOpen
                    ? "translateY(0)"
                    : "translateY(20px)",
                  opacity: isMobileMenuOpen ? 1 : 0,
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href={getMailtoHref()}
            className="mt-10 rounded-full bg-accent px-8 py-3 text-base font-medium text-white transition-all hover:bg-accent-dark"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              transitionDelay: isMobileMenuOpen ? "250ms" : "0ms",
              transform: isMobileMenuOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isMobileMenuOpen ? 1 : 0,
            }}
          >
            Get in Touch
          </a>
        </div>
      </div>
    </>
  );
}
