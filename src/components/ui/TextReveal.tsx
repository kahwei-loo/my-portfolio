"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  trigger?: "load" | "scroll";
}

export default function TextReveal({
  children,
  className = "",
  delay = 0,
  stagger = 0.03,
  trigger = "scroll",
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return;

    const container = containerRef.current;
    const text = container.textContent || "";

    // Clear and rebuild with spans
    container.innerHTML = "";

    // Split text into words
    const words = text.split(" ");

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "inline-block overflow-hidden";

      // Split word into characters
      const chars = word.split("");
      chars.forEach((char) => {
        const charSpan = document.createElement("span");
        charSpan.className = "inline-block translate-y-full opacity-0";
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });

      container.appendChild(wordSpan);

      // Add space between words (except last)
      if (wordIndex < words.length - 1) {
        const spaceSpan = document.createElement("span");
        spaceSpan.innerHTML = "&nbsp;";
        container.appendChild(spaceSpan);
      }
    });

    // Get all character spans
    const charSpans = container.querySelectorAll("span > span");

    const animate = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      gsap.to(charSpans, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: stagger,
        delay: delay,
        ease: "power3.out",
      });
    };

    if (trigger === "load") {
      animate();
    } else {
      ScrollTrigger.create({
        trigger: container,
        start: "top 85%",
        onEnter: animate,
        once: true,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === container) st.kill();
      });
    };
  }, [delay, stagger, trigger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
