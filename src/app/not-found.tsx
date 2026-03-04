"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <h1 className="font-display text-8xl font-bold text-text-primary">404</h1>
      <p className="mt-4 text-lg text-text-secondary">
        This page doesn&apos;t exist — but the portfolio does.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-all hover:bg-accent-dark"
      >
        Back to Home
      </Link>
    </div>
  );
}
