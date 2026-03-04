import { gsap } from "@/lib/gsap";

/**
 * Clip-path horizontal wipe reveal for section headings.
 * Reveals from left to right using inset clip-path.
 */
export function animateHeadingReveal(
  element: Element | null,
  trigger: Element | null,
  opts?: { start?: string; delay?: number }
) {
  if (!element || !trigger) return;

  // Set opacity:1 (element should start with CSS opacity-0 to prevent flash)
  // then hide with clipPath for the reveal animation
  gsap.set(element, { clipPath: "inset(0 100% 0 0)", opacity: 1 });
  gsap.to(element, {
    clipPath: "inset(0 0% 0 0)",
    duration: 1.2,
    delay: opts?.delay ?? 0,
    ease: "power3.inOut",
    scrollTrigger: {
      trigger,
      start: opts?.start ?? "top 70%",
      toggleActions: "play none none reverse",
    },
  });
}

/**
 * Section label animation: line scales in from left, then text fades.
 */
export function animateSectionLabel(
  container: Element | null,
  trigger: Element | null,
  opts?: { start?: string }
) {
  if (!container || !trigger) return;

  const line = container.querySelector(".label-line");
  const text = container.querySelector(".label-text");

  if (line) {
    gsap.fromTo(
      line,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 0.8,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger,
          start: opts?.start ?? "top 70%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }

  if (text) {
    gsap.fromTo(
      text,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger,
          start: opts?.start ?? "top 70%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }
}

/**
 * Staggered content entrance with y offset.
 */
export function animateContentStagger(
  elements: NodeListOf<Element> | Element[] | null,
  trigger: Element | null,
  opts?: { start?: string; stagger?: number; fromY?: number }
) {
  if (!elements || !trigger) return;

  gsap.fromTo(
    elements,
    { opacity: 0, y: opts?.fromY ?? 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: opts?.stagger ?? 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger,
        start: opts?.start ?? "top 70%",
        toggleActions: "play none none reverse",
      },
    }
  );
}
