import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "../src/styles/print.css";

export const metadata: Metadata = {
  title: "Jack F. Portfolio",
  description: "Personal engineering portfolio and live project playground."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-text antialiased dark:bg-dark-background dark:text-dark-text">
        {children}
      </body>
    </html>
  );
}
