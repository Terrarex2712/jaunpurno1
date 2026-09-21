import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jaunpur-no1.example"),
  title: {
    default: "Jaunpur No.1 | Jaunpur Cricket Team Voting",
    template: "%s | Jaunpur No.1",
  },
  description:
    "Vote for your favorite cricket team from Jaunpur's 9 Vidhan Sabha regions and follow the Jaunpur No.1 tournament standings.",
  applicationName: "Jaunpur No.1",
  keywords: [
    "Jaunpur cricket",
    "Jaunpur No.1",
    "Vidhan Sabha cricket teams",
    "community cricket tournament",
    "Uttar Pradesh cricket",
  ],
  openGraph: {
    type: "website",
    siteName: "Jaunpur No.1",
    title: "Jaunpur No.1 | Jaunpur Cricket Team Voting",
    description:
      "9 Vidhan Sabha. Kai zabardast teams. Apni pasand ki team ko vote karein aur use tournament tak pahunchayein.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaunpur No.1 | Jaunpur Cricket Team Voting",
    description:
      "Vote for your favorite cricket team from Jaunpur's 9 Vidhan Sabha regions.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070c0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
