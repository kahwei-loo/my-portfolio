"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// ============================================
// Photo Data — Cloudflare R2 CDN
// ============================================
const R2_BASE = "https://cdn.itskw.dev/public/photos";

interface GalleryPhoto {
  src: string;
  caption: string;
  location: string;
  width: number;
  height: number;
  top: string;
  left: string;
  zIndex: number;
  parallaxSpeed: number;
}

// ── Editorial layout v3: Dramatic pyramidal narrative arc ──────────
// Track: 260vw. pinnedDistance ≈ 1760px (3.8× longer than v2).
// Entry buffer: 0–20vw (breathing room before Zone 1 appears).
// Zone 1 (20–52vw):  Small local — quiet intimate opening.
// Zone 2 (72–92vw):  Medium — build-up, transition away from home.
// Zone 3 (97–165vw): HERO scale — Xinjiang/Kenya, dominant main image.
// Zone 4 (200–225vw): Small — quiet wind-down close.
const galleryPhotos: GalleryPhoto[] = [
  // ── Zone 1: Home / Local (20–52vw) ─ small, intimate ────────────
  {
    src: `${R2_BASE}/IMG_5974.JPG`,
    caption: "Old Church",
    location: "MELAKA, 2024",
    width: 160,
    height: 200,
    top: "8%",
    left: "20vw",
    zIndex: 2,
    parallaxSpeed: -0.3,
  },
  {
    src: `${R2_BASE}/IMG_4380.JPG`,
    caption: "Game Day",
    location: "KUALA LUMPUR, 2024",
    width: 180,
    height: 132,
    top: "66%",
    left: "24vw",
    zIndex: 3,
    parallaxSpeed: 0.35,
  },
  {
    src: `${R2_BASE}/IMG_3780.JPG`,
    caption: "Street Art",
    location: "MELAKA, 2024",
    width: 122,
    height: 168,
    top: "10%",
    left: "36vw",
    zIndex: 2,
    parallaxSpeed: 0.25,
  },
  {
    src: `${R2_BASE}/IMG_4897.JPG`,
    caption: "Badminton",
    location: "KUALA LUMPUR, 2024",
    width: 140,
    height: 190,
    top: "57%",
    left: "44vw",
    zIndex: 3,
    parallaxSpeed: -0.35,
  },
  // ── Zone 2: Build-up (72–92vw) ─ medium, transitional ───────────
  {
    src: `${R2_BASE}/IMG_9724.JPG`,
    caption: "Kanas River",
    location: "XINJIANG, 2024",
    width: 265,
    height: 195,
    top: "8%",
    left: "72vw",
    zIndex: 4,
    parallaxSpeed: -0.5,
  },
  {
    src: `${R2_BASE}/IMG_6007.JPG`,
    caption: "Horizon",
    location: "MALAYSIA, 2024",
    width: 210,
    height: 262,
    top: "52%",
    left: "82vw",
    zIndex: 2,
    parallaxSpeed: 0.4,
  },
  // ── Zone 3: CLIMAX (97–165vw) ─ hero scale, dominant ────────────
  // Frozen Lake is THE main image — portrait, fills ~32% of viewport.
  // Snowy Trails pairs as the wide complement below it.
  {
    src: `${R2_BASE}/CEVV8333.JPG`,
    caption: "Frozen Lake",
    location: "XINJIANG, 2024",
    width: 460,
    height: 610,
    top: "3%",
    left: "97vw",
    zIndex: 5,
    parallaxSpeed: -0.55,
  },
  {
    src: `${R2_BASE}/IMG_9660.JPG`,
    caption: "Snowy Trails",
    location: "XINJIANG, 2024",
    width: 490,
    height: 362,
    top: "52%",
    left: "120vw",
    zIndex: 3,
    parallaxSpeed: 0.6,
  },
  {
    src: `${R2_BASE}/IMG_6118.JPG`,
    caption: "Countdown",
    location: "KUALA LUMPUR, 2024",
    width: 290,
    height: 395,
    top: "3%",
    left: "154vw",
    zIndex: 3,
    parallaxSpeed: 0.5,
  },
  {
    src: `${R2_BASE}/IMG_7097.JPG`,
    caption: "Hippos",
    location: "KENYA, 2023",
    width: 395,
    height: 328,
    top: "50%",
    left: "161vw",
    zIndex: 4,
    parallaxSpeed: -0.6,
  },
  // ── Zone 4: Wind-down (200–225vw) ─ small, quiet close ──────────
  {
    src: `${R2_BASE}/IMG_8732.JPG`,
    caption: "Golden Hour",
    location: "KENYA, 2023",
    width: 218,
    height: 164,
    top: "8%",
    left: "200vw",
    zIndex: 2,
    parallaxSpeed: -0.35,
  },
  {
    src: `${R2_BASE}/IMG_6014.JPG`,
    caption: "River Walk",
    location: "MELAKA, 2024",
    width: 195,
    height: 146,
    top: "62%",
    left: "212vw",
    zIndex: 3,
    parallaxSpeed: 0.3,
  },
];

// ============================================
// Desktop: Two-Phase Horizontal Scroll
// Phase 1: Approach (no pin) — photos slide as section scrolls up
// Phase 2: Pinned at top top — full viewport, horizontal scroll
// ============================================
function DesktopGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const ctx = gsap.context(() => {
      // ── Calculate scroll distance from actual DOM positions ────
      const photoEls = track.querySelectorAll<HTMLElement>(".gallery-photo");
      let maxRight = 0;
      const trackRect = track.getBoundingClientRect();
      photoEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        maxRight = Math.max(maxRight, rect.right - trackRect.left);
      });
      const scrollNeeded = Math.max(maxRight - container.offsetWidth + 40, 0);
      const APPROACH_SHIFT = Math.min(scrollNeeded * 0.18, 300);

      // ── Section label entrance ─────────────────────────────────
      const labelEl = track.querySelector(".section-label");
      if (labelEl) {
        const line = labelEl.querySelector(".label-line");
        const text = labelEl.querySelector(".label-text");
        if (line) {
          gsap.fromTo(
            line,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: 0.8,
              ease: "power3.inOut",
              scrollTrigger: {
                trigger: container,
                start: "top 85%",
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
                trigger: container,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      }

      // ── First bio entrance ─────────────────────────────────────
      const firstBio = track.querySelector(".bio-first");
      if (firstBio) {
        gsap.fromTo(
          firstBio,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // ── Phase 1: Approach — horizontal shift before pin ────────
      // Photos start sliding while the section scrolls up into view.
      // No pin here — natural vertical scroll + horizontal shift.
      gsap.to(track, {
        x: -APPROACH_SHIFT,
        ease: "power1.in",
        scrollTrigger: {
          trigger: container,
          start: "top 50%",
          end: "top top",
          scrub: 1,
        },
      });

      // ── Phase 2: Pinned scroll — full viewport ─────────────────
      // Pins at top top → gallery fills entire viewport (no gap).
      // Continues horizontal scroll from where Phase 1 left off.
      const pinnedDistance = scrollNeeded - APPROACH_SHIFT;
      const scrollTween = gsap.fromTo(
        track,
        { x: -APPROACH_SHIFT },
        {
          x: -scrollNeeded,
          immediateRender: false,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${pinnedDistance}`,
            invalidateOnRefresh: true,
          },
        }
      );

      // ── Second bio — reveals during horizontal scroll ──────────
      const secondBio = track.querySelector(".bio-second");
      if (secondBio) {
        gsap.fromTo(
          secondBio,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: secondBio,
              containerAnimation: scrollTween,
              start: "left 100%",
              end: "left 75%",
              scrub: true,
            },
          }
        );
      }

      // ── Parallax-in-frame (pinned phase only) ──────────────────
      const PARALLAX_RANGE = 40;
      track
        .querySelectorAll<HTMLElement>(".photo-inner")
        .forEach((inner) => {
          const speed = parseFloat(inner.dataset.parallax || "0");
          if (speed === 0) return;
          gsap.fromTo(
            inner,
            { x: speed * -PARALLAX_RANGE, y: speed * -8 },
            {
              x: speed * PARALLAX_RANGE,
              y: speed * 8,
              ease: "none",
              scrollTrigger: {
                trigger: container,
                scrub: 1,
                start: "top top",
                end: () => `+=${pinnedDistance}`,
              },
            }
          );
        });

      // ── Photo entrance — subtle reveal on enter ────────────────
      track
        .querySelectorAll<HTMLElement>(".gallery-photo")
        .forEach((photo) => {
          gsap.fromTo(
            photo,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: photo,
                containerAnimation: scrollTween,
                start: "left 100%",
                end: "left 85%",
                scrub: true,
              },
            }
          );
        });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      <div
        ref={trackRef}
        className="relative h-full will-change-transform"
        style={{ width: "260vw" }}
      >
        {/* ── Section label ─────────────────────────────────────── */}
        <div
          className="section-label absolute z-10 flex items-center gap-4"
          style={{ top: "5%", left: "3vw" }}
        >
          <div className="label-line h-[1px] w-12 bg-gradient-to-r from-walnut to-transparent" />
          <span className="label-text text-xs font-medium uppercase tracking-[0.3em] text-walnut-light opacity-0">
            About
          </span>
        </div>

        {/* ── Decorative: travel hint between Zone 1 and Bio 1 ─── */}
        <div
          className="pointer-events-none absolute select-none"
          style={{ top: "16%", left: "53vw", zIndex: 1, opacity: 0.22 }}
        >
          <span className="font-display text-[11px] uppercase tracking-[0.35em] text-walnut-light">
            ✈ &nbsp; travels
          </span>
        </div>

        {/* ── Decorative: camera icon near Bio 2 ───────────────── */}
        <div
          className="pointer-events-none absolute select-none"
          style={{ top: "62%", left: "184vw", zIndex: 1, opacity: 0.25 }}
        >
          <span className="font-display text-[11px] uppercase tracking-[0.35em] text-walnut-light">
            ◉ &nbsp; with a camera
          </span>
        </div>

        {/* ── First bio — central in first scene ───────────────── */}
        <div
          className="bio-first absolute z-10"
          style={{ top: "30%", left: "57vw", width: "min(17vw, 260px)" }}
        >
          <p className="text-lg italic leading-[1.8] text-text-secondary/80">
            I build software &mdash; from{" "}
            <span className="not-italic font-medium text-text-primary">
              backend systems
            </span>{" "}
            to{" "}
            <span className="not-italic font-medium text-text-primary">
              AI-powered products
            </span>
            . I like learning how things work, and I believe good software is
            built with intention.
          </p>
          <p className="mt-4 font-display text-sm tracking-[0.15em] text-walnut-light/60">
            &mdash; KW
          </p>
        </div>

        {/* ── Second bio — further in the gallery ──────────────── */}
        <div
          className="bio-second absolute z-10"
          style={{ top: "28%", left: "178vw", width: "min(17vw, 260px)" }}
        >
          <p className="text-lg italic leading-[1.8] text-text-secondary/80">
            Outside of code, you&apos;ll probably find me hunting for{" "}
            <span className="not-italic font-medium text-text-primary">
              good food
            </span>{" "}
            or somewhere far from home with a camera.
          </p>
          <p className="mt-4 font-display text-sm tracking-[0.15em] text-walnut-light/60">
            &mdash; KW
          </p>
        </div>

        {/* ── Photos ───────────────────────────────────────────── */}
        {galleryPhotos.map((photo) => (
          <div
            key={photo.src}
            className="gallery-photo absolute"
            style={{
              top: photo.top,
              left: photo.left,
              zIndex: photo.zIndex,
            }}
          >
            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
              {photo.location}
            </p>
            <div
              className="overflow-hidden shadow-xl shadow-black/10"
              style={{ width: photo.width, height: photo.height }}
            >
              <div
                className="photo-inner relative h-full w-full"
                data-parallax={photo.parallaxSpeed}
              >
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  sizes={`${Math.max(photo.width, 300)}px`}
                  className="scale-[1.2] object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edge vignettes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-bg-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-bg-primary to-transparent" />
    </div>
  );
}

// ============================================
// Mobile: Vertical Masonry Gallery
// ============================================
function MobileGallery() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      container
        .querySelectorAll<HTMLElement>(".gallery-item")
        .forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 85%" },
            }
          );
        });
    }, container);

    return () => ctx.revert();
  }, []);

  const mobilePhotos = galleryPhotos.filter(
    (_, i) =>
      i === 0 ||
      i === 2 ||
      i === 4 ||
      i === 5 ||
      i === 8 ||
      i === 9 ||
      i === 10 ||
      i === 11
  );

  return (
    <div ref={containerRef} className="px-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-[1px] w-12 bg-gradient-to-r from-walnut to-transparent" />
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-walnut-light">
          About
        </span>
      </div>

      <div className="mb-10 space-y-5">
        <p className="text-base leading-[1.8] text-text-secondary">
          I build software &mdash; from{" "}
          <span className="font-medium text-text-primary">
            backend systems
          </span>{" "}
          to{" "}
          <span className="font-medium text-text-primary">
            AI-powered products
          </span>
          . I like learning how things work, and I believe good software is
          built with intention &mdash; not just making it work, but making it
          work well for the people who use it.
        </p>
        <p className="text-base leading-[1.8] text-text-secondary">
          Outside of code, you&apos;ll probably find me hunting for good food
          or somewhere far from home with a camera.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {mobilePhotos.map((photo, i) => (
          <div
            key={photo.src}
            className="gallery-item"
            style={{ marginTop: i % 2 === 1 ? "1.5rem" : 0 }}
          >
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.15em] text-text-tertiary">
              {photo.location}
            </p>
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: `${photo.width}/${photo.height}` }}
            >
              <Image
                src={photo.src}
                alt={photo.caption}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PhotoGallery — Responsive Wrapper
// ============================================
export default function PhotoGallery() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
  }, []);

  return isDesktop ? <DesktopGallery /> : <MobileGallery />;
}
