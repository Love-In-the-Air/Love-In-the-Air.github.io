import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Be My Valentine? 💖 | Create a Personalized Valentine's Proposal",
  description:
    "Create a beautiful, personalized Valentine's Day proposal for your special someone. Surprise them with a cute animated experience they'll never forget! 💕",
  keywords:
    "valentine, be my valentine, valentine proposal, valentine surprise, love, romantic, valentine's day, personalized valentine",
  openGraph: {
    type: "website",
    title: "Be My Valentine? 💖",
    description:
      "Someone has a special message for you... Open it to find out! 💌✨",
    siteName: "Be My Valentine",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Be My Valentine? 💖",
    description:
      "Someone has a special message for you... Open it to find out! 💌✨",
  },
  other: {
    "theme-color": "#ff4b6e",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Quicksand:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💖</text></svg>"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
