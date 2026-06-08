import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pooler | Premium Carpooling Platform",
  description: "Save travel costs, reduce traffic, and lower carbon emissions by sharing rides with verified community drivers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${plusJakarta.variable} min-h-full flex flex-col antialiased`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
