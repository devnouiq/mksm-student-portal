import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

// Serif display + sans body per the MKSM brand contract (PRD §7).
const display = Playfair_Display({
  variable: "--font-display-src",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MKSM Student Portal",
    template: "%s · MKSM",
  },
  description:
    "Mahesh Kale School of Music — learn, teach, and practice. Student, Teacher and Admin portal.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
