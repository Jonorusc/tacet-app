import type { Metadata } from "next";
import { Syne, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthListener } from "@/src/components/auth-listener";
import ClerkProviderWrapper from "@/src/components/clerk-provider-wrapper";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tacet | Silence as a Service",
  description: "Advanced notification filtering for deep work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${geist.variable} ${geistMono.variable} antialiased bg-void text-starlight selection:bg-starlight selection:text-void`}
      >
        <ClerkProviderWrapper>
          <AuthListener />
          {children}
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
