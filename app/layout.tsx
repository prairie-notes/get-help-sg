import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://get-help-sg.qzhum1996.chatgpt.site"),
  title: "get help / sg — Find mental health support",
  description: "A private, guided way to find mental-health support and clinics in Singapore. No account and no diagnosis.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Get Help SG — Small steps. Right support.",
    description: "Find a practical next step and compare Singapore mental-health resources and clinics.",
    type: "website",
    locale: "en_SG",
    url: "/",
    images: [{ url: "/og.png", width: 1536, height: 899, alt: "Get Help SG — Small steps. Right support." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Help SG — Small steps. Right support.",
    description: "Find a practical next step and compare Singapore mental-health resources and clinics.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
