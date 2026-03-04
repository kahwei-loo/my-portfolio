"use client";

import { useCallback } from "react";
import SmoothScroll from "@/components/ui/SmoothScroll";
import CustomCursor from "@/components/ui/CustomCursor";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ScrollBackground from "@/components/ui/ScrollBackground";
import Navigation from "@/components/ui/Navigation";
import CoffeeStatus from "@/components/ui/CoffeeStatus";

import Hero from "@/components/sections/Hero";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";

import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function AppWrapper() {
  const handleLoadingComplete = useCallback(() => {
    (window as unknown as Record<string, boolean>).__portfolioLoaded = true;
    window.dispatchEvent(new CustomEvent("portfolio-loaded"));
  }, []);

  return (
    <>
      <LoadingScreen onComplete={handleLoadingComplete} />
      <CustomCursor />
      <CoffeeStatus />
      <ScrollBackground />

      <SmoothScroll>
        <Navigation />
        <main className="relative z-10 overflow-x-hidden">
          <Hero />
          <Skills />
          <Projects />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
