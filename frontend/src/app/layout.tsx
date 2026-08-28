import type { Metadata } from "next";
import {
  Playfair_Display,
  Manrope,
  Fraunces,
  Mukta,
  Inter,
} from "next/font/google";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/config/theme";

// Classic — serif display + sans body per the MKSM brand contract (PRD §7).
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

// Raga — warm editorial serif + a humanist body that carries Indic diacritics.
const ragaDisplay = Fraunces({
  variable: "--font-raga-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const ragaBody = Mukta({
  variable: "--font-raga-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Studio — one crisp neutral grotesk for both display and body (Apple-clean).
const studio = Inter({
  variable: "--font-studio",
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
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${ragaDisplay.variable} ${ragaBody.variable} ${studio.variable} h-full antialiased`}
    >
      <head>
        {/* Apply the saved theme before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
