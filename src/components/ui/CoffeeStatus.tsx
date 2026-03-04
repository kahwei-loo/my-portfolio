"use client";

import { useState, useEffect } from "react";

export default function CoffeeStatus() {
  const [coffeeLevel, setCoffeeLevel] = useState(75);
  const [isHovered, setIsHovered] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  const [cupCount, setCupCount] = useState(3);

  // Slowly decrease coffee level over time
  useEffect(() => {
    const interval = setInterval(() => {
      setCoffeeLevel((prev) => {
        if (prev <= 0) return 0;
        return prev - 0.5;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefill = () => {
    if (coffeeLevel < 100) {
      setIsRefilling(true);
      setCupCount((prev) => prev + 1);

      // Animate refill
      const refillInterval = setInterval(() => {
        setCoffeeLevel((prev) => {
          if (prev >= 100) {
            clearInterval(refillInterval);
            setIsRefilling(false);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    }
  };

  const getStatusText = () => {
    if (coffeeLevel >= 75) return "Fully Caffeinated";
    if (coffeeLevel >= 50) return "Coding Mode";
    if (coffeeLevel >= 25) return "Need Refill";
    if (coffeeLevel > 0) return "Running Low";
    return "Empty!";
  };

  const getStatusColor = () => {
    if (coffeeLevel >= 75) return "#22C55E";
    if (coffeeLevel >= 50) return "#2997FF";
    if (coffeeLevel >= 25) return "#EAB308";
    return "#EF4444";
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRefill}
    >
      {/* Tooltip */}
      <div
        className="absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg bg-bg-primary/95 px-4 py-3 shadow-xl backdrop-blur-sm transition-all duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(8px)",
          pointerEvents: isHovered ? "auto" : "none",
          border: `1px solid ${getStatusColor()}30`,
        }}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs font-medium text-text-primary">
              {getStatusText()}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-bg-hover">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${coffeeLevel}%`,
                    background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}99)`,
                  }}
                />
              </div>
              <span className="text-[10px] text-text-tertiary">{Math.round(coffeeLevel)}%</span>
            </div>
            <div className="mt-1.5 text-[10px] text-text-tertiary">
              Cups today: {cupCount}
            </div>
          </div>
        </div>

        {coffeeLevel < 100 && (
          <div className="mt-2 text-center text-[9px] text-accent">
            Click to refill
          </div>
        )}

        {/* Tooltip arrow */}
        <div
          className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-bg-primary/95"
          style={{
            borderRight: `1px solid ${getStatusColor()}30`,
            borderBottom: `1px solid ${getStatusColor()}30`,
          }}
        />
      </div>

      {/* Coffee cup container */}
      <div
        className="relative transition-transform duration-300"
        style={{
          transform: isHovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        {/* Steam particles */}
        {coffeeLevel > 20 && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div
              className="relative h-8 w-8"
              style={{ opacity: coffeeLevel / 100 }}
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-3 w-1 rounded-full bg-text-tertiary/30"
                  style={{
                    left: `${8 + i * 8}px`,
                    animation: `steam 2s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cup body */}
        <div
          className="relative overflow-hidden rounded-b-xl rounded-t-sm transition-shadow duration-300"
          style={{
            width: "44px",
            height: "48px",
            background: "linear-gradient(180deg, #3a3a3a 0%, #252525 100%)",
            boxShadow: isHovered
              ? "0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(139, 115, 85, 0.3)"
              : "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {/* Cup rim */}
          <div
            className="absolute left-0 right-0 top-0 h-2 rounded-t-sm"
            style={{
              background: "linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%)",
            }}
          />

          {/* Coffee liquid */}
          <div
            className="absolute bottom-0 left-1 right-1 overflow-hidden rounded-b-lg transition-all duration-500"
            style={{
              height: `${(coffeeLevel / 100) * 38}px`,
              background: `linear-gradient(180deg,
                rgba(139, 115, 85, 0.9) 0%,
                rgba(93, 64, 55, 0.95) 50%,
                rgba(60, 40, 30, 1) 100%
              )`,
            }}
          >
            {/* Liquid surface shimmer */}
            <div
              className="absolute inset-x-0 top-0 h-2"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                animation: isRefilling ? "shimmer 0.5s linear infinite" : "none",
              }}
            />

            {/* Bubbles when refilling */}
            {isRefilling && (
              <div className="absolute inset-0">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-white/20"
                    style={{
                      left: `${20 + i * 12}%`,
                      bottom: "10%",
                      animation: `bubble 0.5s ease-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cup handle */}
          <div
            className="absolute -right-2.5 top-3 h-6 w-3 rounded-r-full border-2 border-l-0"
            style={{
              borderColor: "#4a4a4a",
              background: "transparent",
            }}
          />
        </div>

        {/* Status dot */}
        <div
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full transition-colors duration-500"
          style={{
            background: getStatusColor(),
            boxShadow: `0 0 8px ${getStatusColor()}80`,
          }}
        >
          {/* Pulse animation */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: getStatusColor(),
              opacity: 0.5,
              animationDuration: coffeeLevel < 25 ? "1s" : "3s",
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes steam {
          0%, 100% {
            transform: translateY(0) scaleY(1);
            opacity: 0;
          }
          50% {
            transform: translateY(-12px) scaleY(1.5);
            opacity: 0.6;
          }
        }

        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
