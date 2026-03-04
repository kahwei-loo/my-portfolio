"use client";

interface SectionDividerProps {
  fromColor?: string;
  toColor?: string;
  height?: string;
  variant?: "gradient" | "line" | "wave";
}

export default function SectionDivider({
  fromColor = "bg-bg-primary",
  toColor = "bg-bg-secondary",
  height = "h-32",
  variant = "gradient",
}: SectionDividerProps) {
  if (variant === "line") {
    return (
      <div className={`relative ${height} ${toColor}`}>
        <div className="absolute left-1/2 top-1/2 h-[1px] w-1/3 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-text-tertiary/20 to-transparent" />
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={`relative ${height} overflow-hidden ${toColor}`}>
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z"
            className={fromColor.replace("bg-", "fill-")}
            fillOpacity="0.5"
          />
          <path
            d="M0,70 C480,20 960,80 1440,30 L1440,100 L0,100 Z"
            className={fromColor.replace("bg-", "fill-")}
            fillOpacity="0.3"
          />
        </svg>
      </div>
    );
  }

  // Default: gradient
  return (
    <div
      className={`${height} bg-gradient-to-b ${fromColor.replace("bg-", "from-")} ${toColor.replace("bg-", "to-")}`}
    />
  );
}
