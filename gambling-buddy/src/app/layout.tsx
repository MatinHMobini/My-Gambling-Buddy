// src/app/layout.tsx
import "./globals.css";
import "./theme.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Gambling Buddy",
    template: "%s • Gambling Buddy",
  },
  description: "Sports betting buddy (entertainment only).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
