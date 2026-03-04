"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";

// ============================================
// Data Types
// ============================================
interface BookData {
  title: string;
  author: string;
  color: string;
  isReading?: boolean;
  progress?: number;
  quote?: string;
}

interface MusicData {
  title: string;
  artist: string;
  color: string;
  audioUrl?: string;
}

interface GameData {
  title: string;
  platform: string;
  genre: string;
  hours: number;
  progress: number;
  iconColor: string;
}

interface MovieData {
  title: string;
  year: string;
  genre: string;
  rating: number;
  color: string;
  director?: string;
  review?: string;
}

interface PhotoData {
  title: string;
  location: string;
  date: string;
  imageUrl: string;
}

// ============================================
// Sample Data
// ============================================
const booksData: BookData[] = [
  { title: "Clean Code", author: "Robert C. Martin", color: "#8B7355", isReading: true, progress: 67, quote: "Clean code always looks like it was written by someone who cares." },
  { title: "System Design", author: "Alex Xu", color: "#2997FF", progress: 100, quote: "Design is not just what it looks like. Design is how it works." },
  { title: "Deep Work", author: "Cal Newport", color: "#5D4037", progress: 100, quote: "Focus is the new IQ in the knowledge economy." },
  { title: "Atomic Habits", author: "James Clear", color: "#E91E63", progress: 45, quote: "You do not rise to the level of your goals. You fall to the level of your systems." },
  { title: "The Pragmatic", author: "Hunt & Thomas", color: "#9C27B0", progress: 100, quote: "Care about your craft." },
  { title: "DDIA", author: "Martin Kleppmann", color: "#FF5722", progress: 82, quote: "Data is at the center of many challenges in system design today." },
];

const musicData: MusicData[] = [
  { title: "Chill Vibes", artist: "Lo-fi Beats", color: "#2997FF" },
  { title: "Synthwave", artist: "FM-84", color: "#E91E63" },
  { title: "Jazz Hop", artist: "Nujabes", color: "#8B7355" },
];

const gamesData: GameData[] = [
  { title: "Factorio", platform: "PC", genre: "Simulation", hours: 342, progress: 73, iconColor: "#F97316" },
  { title: "Elden Ring", platform: "PS5", genre: "Action RPG", hours: 156, progress: 45, iconColor: "#EAB308" },
  { title: "Satisfactory", platform: "PC", genre: "Factory", hours: 89, progress: 88, iconColor: "#22C55E" },
];

const moviesData: MovieData[] = [
  { title: "Interstellar", year: "2014", genre: "Sci-Fi", rating: 5, color: "#1a237e", director: "Christopher Nolan", review: "A breathtaking journey through space and time. The visuals are stunning and the emotional depth is remarkable." },
  { title: "The Matrix", year: "1999", genre: "Action", rating: 5, color: "#1b5e20", director: "Wachowskis", review: "Revolutionary cinema that redefined action movies. The philosophical undertones make it timeless." },
  { title: "Inception", year: "2010", genre: "Thriller", rating: 4, color: "#4a148c", director: "Christopher Nolan", review: "Mind-bending narrative with incredible set pieces. A masterclass in storytelling." },
  { title: "Blade Runner", year: "1982", genre: "Sci-Fi", rating: 5, color: "#FF6F00", director: "Ridley Scott", review: "A visual masterpiece that questions what it means to be human." },
  { title: "Parasite", year: "2019", genre: "Thriller", rating: 5, color: "#2E7D32", director: "Bong Joon-ho", review: "A masterful blend of dark comedy and social commentary." },
  { title: "Whiplash", year: "2014", genre: "Drama", rating: 5, color: "#B71C1C", director: "Damien Chazelle", review: "Intense, electrifying, and utterly gripping from start to finish." },
];

const photosData: PhotoData[] = [
  { title: "Tokyo Sunset", location: "Tokyo, Japan", date: "2024", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop" },
  { title: "Mountain Peak", location: "Swiss Alps", date: "2023", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=300&fit=crop" },
  { title: "City Lights", location: "New York", date: "2024", imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=300&fit=crop" },
  { title: "Ocean Waves", location: "Bali", date: "2023", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop" },
  { title: "Northern Lights", location: "Iceland", date: "2024", imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=300&fit=crop" },
  { title: "Cherry Blossoms", location: "Kyoto", date: "2024", imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=300&fit=crop" },
  { title: "Desert Dunes", location: "Sahara", date: "2023", imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop" },
  { title: "Aurora Night", location: "Norway", date: "2024", imageUrl: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&h=300&fit=crop" },
];

// Module configuration
const MODULES = [
  { id: "books", label: "Library", icon: "📚" },
  { id: "vinyl", label: "Music", icon: "🎵" },
  { id: "games", label: "Gaming", icon: "🎮" },
  { id: "movies", label: "Cinema", icon: "🎬" },
  { id: "photos", label: "Memories", icon: "📷" },
];

// ============================================
// Bookshelf Module - Book Spine View
// ============================================
function BookshelfModule({ books, isActive }: { books: BookData[]; isActive: boolean }) {
  const [pulledBook, setPulledBook] = useState<number | null>(null);
  const [fullscreenBook, setFullscreenBook] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStart, setAnimationStart] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const bookRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // For portal - need to wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBookClick = (index: number) => {
    if (isAnimating || !isActive) return;

    const bookEl = bookRefs.current[index];
    if (!bookEl) return;

    if (fullscreenBook === index) {
      closeFullscreen();
    } else if (fullscreenBook !== null) {
      closeFullscreen(() => {
        setAnimationStart(bookEl.getBoundingClientRect());
        setFullscreenBook(index);
        setShowModal(true);
      });
    } else {
      setAnimationStart(bookEl.getBoundingClientRect());
      setFullscreenBook(index);
      setShowModal(true);
    }
  };

  // Run animation after portal mounts
  useEffect(() => {
    if (!showModal || fullscreenBook === null || !animationStart) return;

    // Wait for next frame to ensure portal is mounted
    requestAnimationFrame(() => {
      const fullscreen = fullscreenRef.current;
      if (!fullscreen) return;

      setIsAnimating(true);

      // Calculate center position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const targetWidth = Math.min(600, window.innerWidth - 48);
      const targetHeight = Math.min(380, window.innerHeight - 100);

      // Kill any existing animations
      gsap.killTweensOf(fullscreen);

      // Set initial position at book location
      gsap.set(fullscreen, {
        left: animationStart.left + animationStart.width / 2,
        top: animationStart.top + animationStart.height / 2,
        width: animationStart.width,
        height: animationStart.height,
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        rotateY: -15,
      });

      // Animate to center
      gsap.to(fullscreen, {
        left: centerX,
        top: centerY,
        width: targetWidth,
        height: targetHeight,
        rotateY: 0,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => setIsAnimating(false),
      });
    });
  }, [showModal, fullscreenBook]);

  const closeFullscreen = (callback?: () => void) => {
    if (fullscreenBook === null || !animationStart) {
      callback?.();
      return;
    }

    const fullscreen = fullscreenRef.current;
    if (!fullscreen) return;

    setIsAnimating(true);

    // Animate back to book's center position
    gsap.to(fullscreen, {
      left: animationStart.left + animationStart.width / 2,
      top: animationStart.top + animationStart.height / 2,
      width: animationStart.width,
      height: animationStart.height,
      rotateY: -15,
      duration: 0.4,
      ease: "power3.inOut",
      onComplete: () => {
        setFullscreenBook(null);
        setAnimationStart(null);
        setIsAnimating(false);
        setShowModal(false);
        callback?.();
      },
    });
  };

  const activeBook = fullscreenBook !== null ? books[fullscreenBook] : null;

  // Portal content for fullscreen view (renders to body to escape transform context)
  const portalContent = mounted && showModal ? createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        style={{ pointerEvents: fullscreenBook !== null ? "auto" : "none" }}
        onClick={() => closeFullscreen()}
      />

      {/* Fullscreen Book View */}
      <div
        ref={fullscreenRef}
        className="fixed z-[10000] overflow-hidden rounded-2xl"
        style={{
          background: activeBook ? `linear-gradient(135deg, ${activeBook.color}20 0%, #0a0a0a 50%, #0a0a0a 100%)` : "#0a0a0a",
          boxShadow: activeBook ? `0 30px 80px ${activeBook.color}40, 0 0 0 1px rgba(255,255,255,0.1)` : "none",
        }}
      >
        {activeBook && (
          <div className="flex h-full">
            <div
              className="relative flex w-2/5 flex-col items-center justify-center p-6"
              style={{ background: `linear-gradient(180deg, ${activeBook.color} 0%, ${activeBook.color}99 100%)` }}
            >
              <div className="relative">
                <div
                  className="rounded-sm shadow-2xl"
                  style={{
                    width: "120px",
                    height: "170px",
                    background: `linear-gradient(135deg, ${activeBook.color}EE 0%, ${activeBook.color} 100%)`,
                    boxShadow: "8px 8px 25px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                    <div className="text-sm font-bold uppercase leading-tight text-white">{activeBook.title}</div>
                    <div className="mt-3 h-px w-8 bg-white/30" />
                    <div className="mt-3 text-[10px] text-white/70">{activeBook.author}</div>
                  </div>
                </div>
                <div className="absolute -right-1 top-2 h-[calc(100%-16px)] w-2 rounded-r-sm bg-gradient-to-r from-gray-200 to-gray-100" />
              </div>

              <div className="mt-5 w-full max-w-[120px]">
                <div className="flex justify-between text-[10px] text-white/70">
                  <span>Progress</span>
                  <span>{activeBook.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/20">
                  <div className="h-full rounded-full bg-white/80" style={{ width: `${activeBook.progress}%` }} />
                </div>
              </div>

              {activeBook.isReading && (
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-white/80">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  Currently Reading
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-center p-8">
              <div className="text-[10px] uppercase tracking-widest text-text-tertiary">Favorite Quote</div>
              <blockquote className="mt-4 text-lg font-light leading-relaxed text-text-primary">
                "{activeBook.quote}"
              </blockquote>
              <div className="mt-5 text-sm text-text-secondary">— {activeBook.author}</div>
              <div className="mt-8 text-[10px] text-text-tertiary/50">Click anywhere to close</div>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      {portalContent}

      {/* Bookshelf */}
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative" style={{ perspective: "1000px" }}>
          {/* Shelf back */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: "linear-gradient(180deg, #1a1512 0%, #0d0a08 100%)",
              transform: "translateZ(-80px) scaleX(1.15) scaleY(1.05)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)",
            }}
          />

          {/* Books container */}
          <div
            className="relative flex items-end gap-2 px-8 pb-6 pt-8"
            style={{ minHeight: "220px", transformStyle: "preserve-3d" }}
          >
            {books.map((book, index) => {
              const isPulled = pulledBook === index;
              const height = 140 + (index % 3) * 20;

              return (
                <div
                  key={index}
                  ref={(el) => { bookRefs.current[index] = el; }}
                  className="group relative cursor-pointer"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isPulled
                      ? "translateZ(60px) translateY(-15px) rotateY(-12deg)"
                      : "translateZ(0)",
                    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease",
                    filter: isPulled ? "brightness(1.2)" : "brightness(1)",
                    zIndex: isPulled ? 10 : 1,
                  }}
                  onMouseEnter={() => isActive && !isAnimating && setPulledBook(index)}
                  onMouseLeave={() => !isAnimating && setPulledBook(null)}
                  onClick={() => handleBookClick(index)}
                >
                  <div
                    className="relative"
                    style={{
                      width: "48px",
                      height: `${height}px`,
                      background: `linear-gradient(135deg, ${book.color} 0%, ${book.color}CC 50%, ${book.color}99 100%)`,
                      borderRadius: "2px 6px 6px 2px",
                      boxShadow: isPulled
                        ? `12px 12px 35px rgba(0,0,0,0.6), 0 0 30px ${book.color}50`
                        : "4px 4px 15px rgba(0,0,0,0.4)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Book spine text */}
                    <div
                      className="absolute inset-0 flex items-center justify-center overflow-hidden px-1"
                      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/90">
                        {book.title}
                      </span>
                    </div>

                    {/* Reading bookmark */}
                    {book.isReading && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                        style={{
                          width: "12px",
                          height: "24px",
                          background: "#EF4444",
                          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)",
                          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.5)",
                        }}
                      />
                    )}

                    {/* Page edges */}
                    <div
                      className="absolute right-0 top-[3px] h-[calc(100%-6px)]"
                      style={{
                        width: "8px",
                        background: "linear-gradient(90deg, #e8e8e3 0%, #f5f5f0 50%, #d4d4d0 100%)",
                        borderRadius: "0 3px 3px 0",
                        transform: "translateX(7px)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shelf front edge */}
          <div
            className="h-5"
            style={{
              background: "linear-gradient(180deg, #4a3c2e 0%, #2a2118 100%)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
              borderRadius: "0 0 6px 6px",
            }}
          />
        </div>

        <div className="mt-6 text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-walnut-light">Click a book to explore</div>
        </div>
      </div>
    </>
  );
}

// ============================================
// Vinyl Player Module
// ============================================
function VinylModule({ records, isActive }: { records: MusicData[]; isActive: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needleDropping, setNeedleDropping] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const recordRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  const frequencies = [220, 330, 277];

  useEffect(() => {
    const record = recordRef.current;
    if (!record || !isPlaying) return;

    const anim = gsap.to(record, {
      rotation: "+=360",
      duration: 2.5,
      ease: "none",
      repeat: -1,
    });

    return () => { anim.kill(); };
  }, [isPlaying]);

  useEffect(() => {
    const waveform = waveformRef.current;
    if (!waveform || !isPlaying) return;

    const bars = waveform.children;
    const anims = Array.from(bars).map((bar, i) => {
      const baseDelay = (i % 5) * 0.06;
      const frequency = 0.1 + (i % 4) * 0.03;

      return gsap.to(bar, {
        scaleY: 0.2 + (Math.sin(i * 0.4) * 0.3 + 0.5) * 0.8,
        duration: frequency,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: baseDelay,
      });
    });

    return () => { anims.forEach(a => a.kill()); };
  }, [isPlaying]);

  // Stop audio when module becomes inactive
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
      stopAudio();
    }
  }, [isActive]);

  const startAudio = () => {
    try {
      const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      const baseFreq = frequencies[activeIndex];
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.setValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.5);
      osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 1);
      osc.frequency.setValueAtTime(baseFreq * 1.25, ctx.currentTime + 1.5);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();

      setAudioContext(ctx);
      setOscillator(osc);
    } catch {
      // Audio API not available — fail silently
    }
  };

  const stopAudio = () => {
    if (oscillator) {
      oscillator.stop();
      setOscillator(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
  };

  const handlePlay = () => {
    if (!isActive) return;
    if (!isPlaying) {
      setNeedleDropping(true);
      setTimeout(() => {
        setIsPlaying(true);
        setNeedleDropping(false);
        startAudio();
      }, 500);
    } else {
      setIsPlaying(false);
      stopAudio();
    }
  };

  const handleChangeRecord = (direction: 'prev' | 'next') => {
    if (!isActive) return;
    setIsPlaying(false);
    stopAudio();
    setTimeout(() => {
      setActiveIndex(prev =>
        direction === 'prev'
          ? (prev - 1 + records.length) % records.length
          : (prev + 1) % records.length
      );
    }, 200);
  };

  const activeRecord = records[activeIndex];

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative">
        {/* Status indicator */}
        <div className="absolute -top-2 left-0 flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full transition-all duration-500"
            style={{
              background: isPlaying ? "#22C55E" : "#3f3f3f",
              boxShadow: isPlaying ? "0 0 15px #22C55E" : "none",
            }}
          />
          <span className="text-[9px] uppercase tracking-wider text-text-tertiary">
            {isPlaying ? "♪ Playing" : "Ready"}
          </span>
        </div>

        {/* Turntable */}
        <div className="relative h-[180px] w-[180px]">
          {/* Platter base */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, #1f1f1f 0%, #0a0a0a 100%)",
              boxShadow: "inset 0 4px 20px rgba(0,0,0,0.9)",
            }}
          />

          {/* Vinyl record */}
          <div
            ref={recordRef}
            className="absolute inset-4 rounded-full"
            style={{
              background: `
                radial-gradient(circle at center,
                  ${activeRecord.color} 0%, ${activeRecord.color} 18%,
                  #1a1a1a 18.5%, #151515 20%, #1a1a1a 22%, #151515 24%,
                  #1a1a1a 28%, #151515 35%, #1a1a1a 50%, #151515 70%,
                  #1a1a1a 85%, #151515 100%
                )
              `,
              boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${activeRecord.color}30`,
            }}
          >
            {/* Center label */}
            <div
              className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full"
              style={{
                background: `radial-gradient(circle, ${activeRecord.color} 0%, ${activeRecord.color}CC 100%)`,
                boxShadow: `0 0 25px ${activeRecord.color}60`,
              }}
            >
              <div className="text-[7px] font-bold uppercase text-white/90">{activeRecord.title.slice(0, 8)}</div>
              <div className="mt-1.5 h-2 w-2 rounded-full bg-black/60" />
            </div>
          </div>

          {/* Tonearm */}
          <div className="absolute -right-1 -top-2">
            <div
              className="relative h-6 w-6 rounded-full"
              style={{ background: "linear-gradient(145deg, #5a5a5a 0%, #2a2a2a 100%)" }}
            />
            <div
              className="absolute left-1/2 top-1/2 origin-top"
              style={{
                transform: `rotate(${isPlaying ? 30 : needleDropping ? 22 : 5}deg)`,
                transition: needleDropping ? "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)" : "transform 0.3s ease-out",
              }}
            >
              <div className="h-[80px] w-2 rounded-full bg-gradient-to-b from-zinc-500 to-zinc-700" />
              <div className="absolute -bottom-1 left-1/2 h-4 w-2.5 -translate-x-1/2 bg-zinc-600" style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }} />
              <div
                className="absolute -bottom-3 left-1/2 h-2.5 w-0.5 -translate-x-1/2"
                style={{
                  background: "linear-gradient(180deg, #666 0%, #2997FF 100%)",
                  boxShadow: isPlaying ? `0 0 12px ${activeRecord.color}` : "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Waveform visualizer */}
        <div ref={waveformRef} className="mt-4 flex h-8 items-end justify-center gap-[3px]">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full"
              style={{
                height: "100%",
                transform: "scaleY(0.2)",
                transformOrigin: "bottom",
                background: isPlaying ? `linear-gradient(180deg, ${activeRecord.color} 0%, ${activeRecord.color}80 100%)` : "#2a2a2a",
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <button onClick={() => handleChangeRecord('prev')} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text-tertiary transition-colors hover:bg-white/10">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button
            onClick={handlePlay}
            className="flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${activeRecord.color}, ${activeRecord.color}CC)`, boxShadow: `0 8px 30px ${activeRecord.color}50` }}
          >
            {isPlaying ? (
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            ) : (
              <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button onClick={() => handleChangeRecord('next')} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text-tertiary transition-colors hover:bg-white/10">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>
      </div>

      <div className="mt-5 text-center">
        <div className="text-sm font-medium text-text-primary">{activeRecord.title}</div>
        <div className="text-[11px] text-text-tertiary">{activeRecord.artist}</div>
      </div>
    </div>
  );
}

// ============================================
// Game Console Module - Bottom Slot with Click Feedback
// ============================================
function GameConsoleModule({ games, isActive }: { games: GameData[]; isActive: boolean }) {
  const [insertedGame, setInsertedGame] = useState<number | null>(null);
  const [hoveredGame, setHoveredGame] = useState<number | null>(null);
  const [screenOn, setScreenOn] = useState(false);
  const [showClickEffect, setShowClickEffect] = useState(false);
  const cartridgeRef = useRef<HTMLDivElement>(null);

  const handleInsertCartridge = (index: number) => {
    if (!isActive) return;

    if (insertedGame === index) {
      // Eject
      setScreenOn(false);
      gsap.to(cartridgeRef.current, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => setInsertedGame(null),
      });
    } else {
      // Insert new cartridge
      setInsertedGame(null);
      setScreenOn(false);

      setTimeout(() => {
        setInsertedGame(index);

        // Animate insertion with magnetic snap and damping
        gsap.fromTo(
          cartridgeRef.current,
          { y: -60, opacity: 0.8 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
            onComplete: () => {
              // Visual click effect
              setShowClickEffect(true);
              gsap.to(".console-body", {
                y: 2,
                duration: 0.05,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut",
              });

              setTimeout(() => {
                setShowClickEffect(false);
                setScreenOn(true);
              }, 150);
            },
          }
        );
      }, 100);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative">
        {/* Console body */}
        <div
          className="console-body relative overflow-hidden rounded-2xl"
          style={{
            width: "300px",
            height: "180px",
            background: "linear-gradient(180deg, #262626 0%, #1a1a1a 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Screen */}
          <div
            className="absolute left-4 right-4 top-4 overflow-hidden rounded-xl"
            style={{
              height: "110px",
              background: "#050505",
              boxShadow: "inset 0 3px 15px rgba(0,0,0,0.9)",
            }}
          >
            {/* Scanlines */}
            <div className="pointer-events-none absolute inset-0 opacity-10" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)" }} />

            {insertedGame !== null && screenOn ? (
              <div className="flex h-full flex-col justify-center p-4" style={{ background: `radial-gradient(ellipse at center, ${games[insertedGame].iconColor}15 0%, transparent 70%)` }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${games[insertedGame].iconColor}40` }}>
                    <svg className="h-6 w-6" style={{ color: games[insertedGame].iconColor }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-base font-bold text-text-primary">{games[insertedGame].title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
                      <span className="rounded bg-white/10 px-2 py-0.5">{games[insertedGame].platform}</span>
                      <span>{games[insertedGame].hours}h played</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${games[insertedGame].progress}%`, background: games[insertedGame].iconColor }} />
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-text-tertiary/30">
                <svg className="h-8 w-8 mb-2 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
                </svg>
                <span className="text-[11px] uppercase tracking-wider">Insert Cartridge</span>
              </div>
            )}
          </div>

          {/* Power LED */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: screenOn ? "#22C55E" : "#1a1a1a", boxShadow: screenOn ? "0 0 8px #22C55E" : "none" }} />
            <span className="text-[8px] uppercase text-text-tertiary/50">Power</span>
          </div>
        </div>

        {/* Cartridge slot at bottom */}
        <div
          className="relative mx-auto -mt-1"
          style={{
            width: "250px",
            height: "25px",
            background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
            borderRadius: "0 0 10px 10px",
            boxShadow: "inset 0 3px 10px rgba(0,0,0,0.8)",
          }}
        >
          {/* Inserted cartridge (half visible) */}
          {insertedGame !== null && (
            <div
              ref={cartridgeRef}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: "10px",
                width: "70px",
                height: "50px",
                background: `linear-gradient(180deg, ${games[insertedGame].iconColor}50 0%, #1a1a1a 60%)`,
                borderRadius: "8px 8px 0 0",
                boxShadow: `0 -6px 20px ${games[insertedGame].iconColor}25`,
              }}
            >
              <div className="flex h-full items-start justify-center pt-2">
                <span className="text-[9px] font-medium text-text-primary">{games[insertedGame].title.slice(0, 8)}</span>
              </div>
            </div>
          )}

          {/* Slot opening */}
          <div className="absolute left-1/2 top-2 h-3 w-16 -translate-x-1/2 rounded-sm bg-black/60" />

          {/* Click effect ring */}
          {showClickEffect && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "80px",
                height: "80px",
                border: `2px solid ${insertedGame !== null ? games[insertedGame].iconColor : "#fff"}`,
                borderRadius: "50%",
                animation: "clickRing 0.3s ease-out forwards",
              }}
            />
          )}
        </div>

        {/* Cartridges below */}
        <div className="mt-6 flex justify-center gap-3">
          {games.map((game, index) => {
            const isInserted = insertedGame === index;
            const isHovered = hoveredGame === index;

            return (
              <div
                key={index}
                className="cursor-pointer transition-all duration-200"
                style={{
                  transform: isHovered && !isInserted ? "translateY(-8px) scale(1.05)" : "translateY(0)",
                  opacity: isInserted ? 0.3 : 1,
                }}
                onMouseEnter={() => isActive && setHoveredGame(index)}
                onMouseLeave={() => setHoveredGame(null)}
                onClick={() => handleInsertCartridge(index)}
              >
                <div
                  className="relative overflow-hidden rounded-t-lg rounded-b"
                  style={{
                    width: "60px",
                    height: "75px",
                    background: `linear-gradient(180deg, ${game.iconColor}35 0%, #1a1a1a 45%, #222 100%)`,
                    boxShadow: isHovered ? `0 12px 30px ${game.iconColor}40` : "0 5px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="absolute left-1/2 top-0 h-3 w-8 -translate-x-1/2 rounded-b bg-black/30" />
                  <div className="flex h-full flex-col items-center justify-center pt-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${game.iconColor}50` }}>
                      <svg className="h-4 w-4" style={{ color: game.iconColor }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <div className="mt-2 text-[8px] font-medium text-text-primary">{game.title}</div>
                    <div className="text-[7px] text-text-tertiary">{game.hours}h</div>
                  </div>
                  {/* Bottom connectors */}
                  <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-[2px]">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-2 w-2 rounded-t-sm bg-zinc-500" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS for click effect */}
      <style jsx>{`
        @keyframes clickRing {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================
// Movies Module - Top-Down 3D Ring Carousel
// ============================================
function MoviesModule({ movies, isActive }: { movies: MovieData[]; isActive: boolean }) {
  const [rotation, setRotation] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);
  const autoRotateRef = useRef<gsap.core.Tween | null>(null);

  // Auto-rotate when not dragging and active
  useEffect(() => {
    if (!isActive || isDragging || selectedMovie !== null) {
      autoRotateRef.current?.kill();
      return;
    }

    autoRotateRef.current = gsap.to({}, {
      duration: 30,
      repeat: -1,
      onUpdate: function() {
        setRotation(prev => prev + 0.1);
      },
    });

    return () => { autoRotateRef.current?.kill(); };
  }, [isActive, isDragging, selectedMovie]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedMovie !== null || !isActive) return;
    setIsDragging(true);
    lastX.current = e.clientX;
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX.current;
    setRotation(prev => prev + deltaX * 0.5);
    lastX.current = e.clientX;
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTicketClick = (index: number) => {
    if (isDragging || !isActive) return;
    setSelectedMovie(selectedMovie === index ? null : index);
  };

  const anglePerTicket = 360 / movies.length;
  const radius = 120;

  return (
    <>
      {/* Detail overlay */}
      {selectedMovie !== null && (
        <div
          className="fixed inset-0 z-[99] flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="relative max-w-lg rounded-2xl p-8"
            style={{
              background: `linear-gradient(135deg, ${movies[selectedMovie].color}35 0%, #0a0a0a 50%)`,
              border: `1px solid ${movies[selectedMovie].color}50`,
              boxShadow: `0 40px 100px ${movies[selectedMovie].color}40`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-6">
              {/* Ticket visual */}
              <div
                className="relative flex-shrink-0 overflow-hidden rounded-lg"
                style={{
                  width: "120px",
                  height: "170px",
                  background: `linear-gradient(180deg, ${movies[selectedMovie].color} 0%, ${movies[selectedMovie].color}CC 100%)`,
                }}
              >
                <div className="absolute left-0 top-[70%] flex w-full items-center justify-between">
                  <div className="h-4 w-4 -translate-x-1/2 rounded-full bg-[#0a0a0a]" />
                  <div className="flex-1 border-t-2 border-dashed border-black/30" />
                  <div className="h-4 w-4 translate-x-1/2 rounded-full bg-[#0a0a0a]" />
                </div>
                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                  <svg className="h-10 w-10 text-white/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                  </svg>
                  <div className="mt-3 text-sm font-bold uppercase text-white">{movies[selectedMovie].title}</div>
                  <div className="mt-2 text-[10px] text-white/60">{movies[selectedMovie].year}</div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="text-xl font-bold text-text-primary">{movies[selectedMovie].title}</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-text-tertiary">
                  <span>{movies[selectedMovie].year}</span>
                  <span>•</span>
                  <span>{movies[selectedMovie].genre}</span>
                  <span>•</span>
                  <span>{movies[selectedMovie].director}</span>
                </div>

                <div className="mt-3 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5" fill={i < movies[selectedMovie].rating ? "#FFD700" : "#333"} viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  {movies[selectedMovie].review}
                </p>

                <div className="mt-6 text-[11px] text-text-tertiary/50">Click outside to close</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-full flex-col items-center justify-center">
        {/* Top-down 3D Carousel */}
        <div
          className="relative cursor-grab active:cursor-grabbing"
          style={{
            width: "320px",
            height: "240px",
            perspective: "800px",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Top-down view: rotateX for tilting down, rotateZ for spinning */}
          <div
            className="relative h-full w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(60deg) rotateZ(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
          >
            {movies.map((movie, index) => {
              const angle = index * anglePerTicket;

              return (
                <div
                  key={index}
                  className="absolute left-1/2 top-1/2 cursor-pointer"
                  style={{
                    transform: `
                      translateX(-50%) translateY(-50%)
                      rotateZ(${angle}deg)
                      translateY(-${radius}px)
                      rotateX(-60deg)
                      rotateZ(${-angle - rotation}deg)
                    `,
                    transformStyle: "preserve-3d",
                  }}
                  onClick={() => handleTicketClick(index)}
                >
                  {/* Ticket stub */}
                  <div
                    className="relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-110"
                    style={{
                      width: "80px",
                      height: "110px",
                      background: `linear-gradient(180deg, ${movie.color} 0%, ${movie.color}DD 100%)`,
                      boxShadow: `0 10px 30px ${movie.color}50`,
                    }}
                  >
                    {/* Perforated edge */}
                    <div className="absolute left-0 top-[65%] flex w-full items-center justify-between">
                      <div className="h-3 w-3 -translate-x-1/2 rounded-full bg-[#0a0a0a]" />
                      <div className="flex-1 border-t border-dashed border-black/20" />
                      <div className="h-3 w-3 translate-x-1/2 rounded-full bg-[#0a0a0a]" />
                    </div>

                    {/* Film strip decoration */}
                    <div className="absolute left-0 top-0 h-full w-3 bg-gradient-to-b from-black/20 via-black/10 to-black/20">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="mx-0.5 mt-2.5 h-2.5 rounded-sm bg-[#0a0a0a]/50" />
                      ))}
                    </div>

                    {/* Content */}
                    <div className="flex h-[65%] flex-col items-center justify-center pl-4 pr-2">
                      <svg className="h-7 w-7 text-white/25" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                      </svg>
                      <div className="mt-2 text-center text-[9px] font-bold uppercase text-white">
                        {movie.title}
                      </div>
                    </div>

                    {/* Bottom section */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 pl-4 text-center">
                      <div className="text-[8px] text-white/70">{movie.year}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Center decoration (ticket box) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "50px",
                height: "50px",
                background: "radial-gradient(circle, #2a2a2a 0%, #1a1a1a 100%)",
                boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
                transform: "translateX(-50%) translateY(-50%) rotateX(-60deg)",
              }}
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-walnut-light">Cinema Collection</div>
          <div className="mt-1.5 text-[10px] text-text-tertiary/60">Drag to rotate • Click for details</div>
        </div>
      </div>
    </>
  );
}

// ============================================
// Photos Module - Infinite Marquee with GSAP
// ============================================
function PhotosModule({ photos, isActive }: { photos: PhotoData[]; isActive: boolean }) {
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // GSAP infinite marquee animation
  useEffect(() => {
    if (!marqueeRef.current || !isActive) {
      tweenRef.current?.kill();
      return;
    }

    const marquee = marqueeRef.current;
    const totalWidth = marquee.scrollWidth / 2; // Half because we duplicated

    // Reset position
    gsap.set(marquee, { x: 0 });

    // Create infinite loop animation
    tweenRef.current = gsap.to(marquee, {
      x: -totalWidth,
      duration: 25,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [isActive]);

  // Pause/resume on hover
  useEffect(() => {
    if (!tweenRef.current) return;
    if (isPaused) {
      tweenRef.current.pause();
    } else {
      tweenRef.current.resume();
    }
  }, [isPaused]);

  // Duplicate photos for seamless loop
  const allPhotos = [...photos, ...photos];

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full overflow-hidden">
        {/* Gradient masks */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#1a1a1a] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#1a1a1a] to-transparent" />

        {/* Marquee container */}
        <div
          ref={marqueeRef}
          className="flex gap-5 py-4"
          style={{ width: "max-content" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setHoveredPhoto(null);
          }}
        >
          {allPhotos.map((photo, index) => {
            const isHovered = hoveredPhoto === index;

            return (
              <div
                key={index}
                className="relative flex-shrink-0 cursor-pointer transition-all duration-300"
                style={{
                  transform: isHovered ? "translateY(-12px) scale(1.08)" : "translateY(0) scale(1)",
                  zIndex: isHovered ? 20 : 1,
                }}
                onMouseEnter={() => isActive && setHoveredPhoto(index)}
                onMouseLeave={() => setHoveredPhoto(null)}
              >
                {/* Photo frame (polaroid style) */}
                <div
                  className="overflow-hidden rounded-xl bg-white p-1.5 pb-6"
                  style={{
                    width: "140px",
                    height: "180px",
                    boxShadow: isHovered
                      ? "0 20px 45px rgba(0,0,0,0.5)"
                      : "0 8px 25px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Image - no separate scale */}
                  <div
                    className="h-full w-full rounded-lg bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${photo.imageUrl})`,
                    }}
                  />

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-center">
                    <div className="text-[9px] font-medium text-zinc-600">
                      {photo.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-walnut-light">Travel Memories</div>
        <div className="mt-1.5 text-[10px] text-text-tertiary/60">Hover to pause</div>
      </div>
    </div>
  );
}

// ============================================
// Main Component - Horizontal Module Carousel
// ============================================
export default function PersonalInterests() {
  const [activeModule, setActiveModule] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const navigateModule = (direction: 'prev' | 'next') => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const newIndex = direction === 'prev'
      ? (activeModule - 1 + MODULES.length) % MODULES.length
      : (activeModule + 1) % MODULES.length;

    setActiveModule(newIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.from(".interests-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: container, start: "top 80%" },
      });

      gsap.from(".carousel-container", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: container, start: "top 75%" },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigateModule("prev");
      if (e.key === "ArrowRight") navigateModule("next");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModule, isTransitioning]);

  const renderModule = (moduleId: string, isActive: boolean) => {
    switch (moduleId) {
      case "books":
        return <BookshelfModule books={booksData} isActive={isActive} />;
      case "vinyl":
        return <VinylModule records={musicData} isActive={isActive} />;
      case "games":
        return <GameConsoleModule games={gamesData} isActive={isActive} />;
      case "movies":
        return <MoviesModule movies={moviesData} isActive={isActive} />;
      case "photos":
        return <PhotosModule photos={photosData} isActive={isActive} />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="mt-24 pt-16 border-t border-text-tertiary/10">
      <div className="interests-header mb-10 text-center">
        <span className="text-sm font-medium uppercase tracking-[0.3em] text-walnut-light">
          Beyond Code
        </span>
        <p className="mt-3 text-xs text-text-tertiary max-w-md mx-auto">
          When I'm not architecting systems, you'll find me exploring these worlds.
        </p>
      </div>

      {/* Module Carousel */}
      <div className="carousel-container relative mx-auto max-w-6xl px-4">
        {/* Navigation Arrows - Hidden on mobile */}
        <button
          onClick={() => navigateModule("prev")}
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full bg-white/5 text-text-secondary backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-110 md:flex"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => navigateModule("next")}
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full bg-white/5 text-text-secondary backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-110 md:flex"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Track - Simple slide approach */}
        <div ref={carouselRef} className="relative overflow-hidden py-8 px-2 md:px-16">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${activeModule * 100}%)`,
            }}
          >
            {MODULES.map((module, index) => {
              const isActive = index === activeModule;

              return (
                <div
                  key={module.id}
                  className="w-full flex-shrink-0 px-1 md:px-4"
                >
                  <div
                    className="relative mx-auto overflow-hidden rounded-3xl transition-all duration-500"
                    style={{
                      maxWidth: "900px",
                      height: "520px",
                      background: "linear-gradient(145deg, rgba(26, 26, 26, 0.95), rgba(13, 13, 13, 0.98))",
                      border: "1px solid rgba(139, 115, 85, 0.2)",
                      boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(139, 115, 85, 0.1), inset 0 1px 0 rgba(255,255,255,0.03)",
                      opacity: isActive ? 1 : 0.5,
                      transform: isActive ? "scale(1)" : "scale(0.95)",
                    }}
                  >
                    {renderModule(module.id, isActive)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Navigation Dots */}
        <div className="mt-6 flex items-center justify-center gap-6">
          {MODULES.map((module, index) => {
            const isActive = index === activeModule;

            return (
              <button
                key={module.id}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setActiveModule(index);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }
                }}
                className="group flex flex-col items-center gap-2 transition-all"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    background: isActive ? "rgba(139, 115, 85, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    border: isActive ? "2px solid rgba(139, 115, 85, 0.5)" : "2px solid transparent",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                    boxShadow: isActive ? "0 0 20px rgba(139, 115, 85, 0.3)" : "none",
                  }}
                >
                  <span className="text-lg">{module.icon}</span>
                </div>
                <span
                  className="text-[10px] uppercase tracking-wider transition-all duration-300"
                  style={{
                    color: isActive ? "#D4C4B0" : "rgba(255,255,255,0.3)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {module.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Keyboard hint */}
        <div className="mt-4 text-center text-[10px] text-text-tertiary/40">
          Use ← → arrow keys to navigate
        </div>
      </div>
    </div>
  );
}
