import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AeroWake — Offshore Energy Research",
  description: "Wind-farm wake steering, icing, and power-flow research console",
};

export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-abyss font-sans text-foam antialiased">
        {children}
      </body>
    </html>
  );
}
