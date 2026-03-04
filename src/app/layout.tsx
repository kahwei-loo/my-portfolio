import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-M0SDWWV8BC";

export const metadata: Metadata = {
  title: "Kah Wei Loo | Software Engineer",
  description:
    "Software Engineer focused on AI engineering and full-stack development. Building RAG pipelines, multi-agent systems, and interactive web experiences.",
  keywords: [
    "software engineer",
    "AI engineer",
    "full-stack developer",
    "RAG",
    "LangGraph",
    "React",
    "Next.js",
    "portfolio",
    "kah wei loo",
  ],
  authors: [{ name: "Kah Wei Loo" }],
  metadataBase: new URL("https://itskw.dev"),
  openGraph: {
    title: "Kah Wei Loo | Software Engineer",
    description:
      "Software Engineer focused on AI engineering and full-stack development. Building RAG pipelines, multi-agent systems, and interactive web experiences.",
    type: "website",
    url: "https://itskw.dev",
    siteName: "Kah Wei Loo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kah Wei Loo | Software Engineer",
    description:
      "Software Engineer focused on AI engineering and full-stack development.",
    creator: "@KahWeiLoo_",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Clash Display - Premium Display Font from FontShare */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
