import type { Metadata } from "next";
import { Poppins, Geist, Inter, Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { EmployeeShell } from "@/components/dashboard/employee-shell";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// Wordmark / display font for the Magmos logotype.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.magmos.xyz";
const TITLE = "Magmos Portal | Your USDC Stream on Arc";
const OG_DESC =
  "Claim your streamed pay per second and bridge it home via Circle CCTP, on Arc.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: OG_DESC,
  applicationName: "Magmos Portal",
  // Employee portal is a private, wallet-gated app — keep it out of search indexes.
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    siteName: "Magmos Portal",
    url: SITE_URL,
    locale: "en_US",
    title: TITLE,
    description: OG_DESC,
    images: [{ url: "/sweem-thumbnail.png", width: 1920, height: 1080, alt: "Magmos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: OG_DESC,
    images: ["/sweem-thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        poppins.variable,
        "font-sans",
        geist.variable,
        inter.variable,
        spaceGrotesk.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <EmployeeShell>{children}</EmployeeShell>
        </SmoothScroll>
      </body>
    </html>
  );
}
