import { ImageResponse } from "next/og";

export const alt = "Kah Wei Loo — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0a",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #6d9cff, #3b82f6, #6d9cff)",
          }}
        />

        {/* Name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          Kah Wei Loo
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            color: "#a0a0a0",
            marginBottom: "40px",
          }}
        >
          Software Engineer
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 300,
            color: "#c4a47c",
            fontStyle: "italic",
          }}
        >
          Stay curious. The rest follows.
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            right: "80px",
            fontSize: 20,
            color: "#555555",
          }}
        >
          itskw.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
